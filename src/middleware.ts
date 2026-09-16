import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "catet_session";

/**
 * Session gate: a visitor at `/` is served the landing page (an internal
 * rewrite, so the URL stays `/`); other pages without a cookie redirect to
 * /login; API routes without one get a 401 envelope. The unauthenticated
 * flows — /login, /register (invite signup), /reset (password reset),
 * /welcome, /api/auth/* — plus /_next, the brand icon and the installable-app
 * assets (manifest, service worker, icons, offline page) stay public.
 *
 * A logged-in request never reaches any of this — the cookie check returns
 * first, so `/` keeps rendering Overview.
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

  // Home-screen launch (manifest start_url) while signed out: the landing
  // page is pointless inside a standalone window, so go straight to login.
  if (pathname === "/" && request.nextUrl.searchParams.get("source") === "pwa") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/") {
    return NextResponse.rewrite(new URL("/welcome", request.url));
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!login|register|reset|welcome|offline|manifest.webmanifest|sw.js|icons/|apple-icon|icon.svg|_next/static|_next/image|api/auth).*)",
  ],
};
