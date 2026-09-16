import { expect, type Page } from "playwright/test";

/*
 * Authentication for the suite. Two supported shapes, in order:
 *   E2E_PHONE + E2E_PASSWORD — posts the real login route, exercising the BFF.
 *   E2E_SESSION              — a session JWT, injected as the httpOnly cookie
 *                              (what a dev box has when no password is known).
 * Neither present: the authenticated specs skip instead of failing red.
 */
export function hasCredentials(): boolean {
  return (
    (process.env.E2E_PHONE !== undefined && process.env.E2E_PASSWORD !== undefined) ||
    process.env.E2E_SESSION !== undefined
  );
}

export async function login(page: Page): Promise<void> {
  const phone = process.env.E2E_PHONE;
  const password = process.env.E2E_PASSWORD;

  if (phone !== undefined && password !== undefined) {
    const response = await page.request.post("/api/auth/login", {
      data: { phone, password },
    });
    expect(response.status(), await response.text()).toBe(200);
    return;
  }

  const token = process.env.E2E_SESSION;
  if (token === undefined) {
    throw new Error("login() called without credentials; guard with hasCredentials()");
  }
  await page.context().addCookies([
    {
      name: "catet_session",
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

/**
 * Effective tap target: the rendered box grown by a transparent `::before`
 * expander, which is how the compact control sizes reach 44px (DESIGN.md §4).
 */
export const EFFECTIVE_SIZE_SCRIPT = `(selector) => {
  const results = [];
  for (const el of document.querySelectorAll(selector)) {
    if (el.closest("[hidden]") !== null) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") continue;
    let width = rect.width;
    let height = rect.height;
    const before = getComputedStyle(el, "::before");
    if (before.content !== "none" && before.position === "absolute") {
      const top = Number.parseFloat(before.top);
      const bottom = Number.parseFloat(before.bottom);
      const left = Number.parseFloat(before.left);
      const right = Number.parseFloat(before.right);
      if (Number.isFinite(top) && top < 0) height -= top;
      if (Number.isFinite(bottom) && bottom < 0) height -= bottom;
      if (Number.isFinite(left) && left < 0) width -= left;
      if (Number.isFinite(right) && right < 0) width -= right;
    }
    results.push({
      tag: el.tagName,
      name: (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 40),
      width: Math.round(width * 10) / 10,
      height: Math.round(height * 10) / 10,
    });
  }
  return results;
}`;

export const TAP_TARGET_SELECTOR =
  'button:not([aria-hidden="true"]), a[href]:not([href="#main"]), input:not([type="hidden"]), select, textarea, [role="radio"], [role="switch"], [role="checkbox"], [role="combobox"]';

export const AUTHED_ROUTES = [
  "/",
  "/transactions",
  "/inbox",
  "/sources",
  "/categories",
  "/bills",
  "/budgets",
  "/analytics",
  "/settings",
];
