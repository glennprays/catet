import "server-only";

import { NextResponse } from "next/server";

import { backendRequest } from "./backend-fetch";
import { getSessionToken, setSessionCookie } from "@/lib/session";

type VerifyData = { token?: string; expires_at?: string };

/**
 * The Go API throttles per client IP, so the original address has to
 * survive the BFF hop. In production the chain is
 * Cloudflare → cloudflared → traefik → here: traefik does not trust
 * incoming X-Forwarded-* and overwrites x-forwarded-for with
 * cloudflared's address, so every user would share one bucket.
 * cf-connecting-ip is set by Cloudflare and passed through untouched.
 * The x-forwarded-for / x-real-ip fallbacks cover local dev and any
 * proxy that sets them instead.
 */
function clientIP(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    ""
  );
}

/**
 * forward is the BFF workhorse: it attaches the session token from the
 * httpOnly cookie, relays the request to the Go API, and passes the
 * envelope plus original status straight through.
 *
 * When the Go API answers with a renewed token (the presented one is at
 * least seven days old) the cookie is rewritten here, which is what
 * makes the session slide for a device that keeps using the dashboard.
 */
export async function forward(
  request: Request,
  backendPath: string,
  options: { method?: string; body?: unknown } = {},
): Promise<NextResponse> {
  const token = await getSessionToken();
  const method = options.method ?? request.method;

  let body = options.body;
  if (body === undefined && method !== "GET" && method !== "HEAD") {
    const raw = await request.text();
    body = raw === "" ? undefined : JSON.parse(raw);
  }

  const { status, envelope, renewedToken } = await backendRequest(backendPath, {
    method,
    body,
    token,
    clientIP: clientIP(request),
  });
  if (renewedToken !== undefined) {
    await setSessionCookie(renewedToken);
  }
  return NextResponse.json(envelope, { status });
}

/**
 * forwardWithSession forwards like `forward` but intercepts the
 * session-issuing responses (login, register, reset complete): the Go
 * JWT is stored in the httpOnly cookie and stripped from the payload
 * so it never reaches the browser.
 */
export async function forwardWithSession(
  request: Request,
  backendPath: string,
): Promise<NextResponse> {
  const raw = await request.text();
  const body = raw === "" ? undefined : JSON.parse(raw);
  const { status, envelope } = await backendRequest(backendPath, {
    method: "POST",
    body,
    clientIP: clientIP(request),
  });

  const data = envelope.data as VerifyData | undefined;
  if (status < 300 && typeof data?.token === "string") {
    await setSessionCookie(data.token);
    return NextResponse.json(
      { ...envelope, data: { expires_at: data.expires_at } },
      { status },
    );
  }

  return NextResponse.json(envelope, { status });
}
