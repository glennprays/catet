import "server-only";

import { cookies } from "next/headers";

/**
 * Server-only session helpers. The browser never sees the Go JWT —
 * it lives in an httpOnly cookie and is attached server-side by the
 * BFF route handlers.
 */
const SESSION_COOKIE = "catet_session";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });
}
