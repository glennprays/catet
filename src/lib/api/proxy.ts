import "server-only";

import { NextResponse } from "next/server";

import { backendRequest } from "./backend-fetch";
import { getSessionToken, setSessionCookie } from "@/lib/session";

type VerifyData = { token?: string; expires_at?: string };

/**
 * forward is the BFF workhorse: it attaches the session token from the
 * httpOnly cookie, relays the request to the Go API, and passes the
 * envelope plus original status straight through.
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

  const { status, envelope } = await backendRequest(backendPath, {
    method,
    body,
    token,
  });
  return NextResponse.json(envelope, { status });
}

/**
 * forwardWithSession forwards like `forward` but intercepts the verify
 * response: the Go JWT is stored in the httpOnly cookie and stripped
 * from the payload so it never reaches the browser.
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
