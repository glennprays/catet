import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "catet_session";

/**
 * Session gate: pages without a cookie redirect to /login; API routes
 * without one get a 401 envelope. /login, /api/auth/*, /_next and the
 * favicon stay public.
 */
export function middleware(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "no session" } },
      { status: 401 },
    );
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico|api/auth).*)"],
};
