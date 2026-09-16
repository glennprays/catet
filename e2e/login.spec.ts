import { expect, test } from "playwright/test";

import { hasCredentials } from "./helpers";

/*
 * The landing-page-after-login glitch (prod build only, where the router
 * prefetches): `/` renders the marketing page for anonymous visitors, so a
 * soft navigation after sign-in could replay that payload. Both entry points
 * into the login form are covered because they prime different caches.
 */
const phone = process.env.E2E_PHONE;
const password = process.env.E2E_PASSWORD;

test.describe("login lands on Overview", () => {
  test.skip(
    () => !hasCredentials() || phone === undefined || password === undefined,
    "needs E2E_PHONE and E2E_PASSWORD",
  );

  async function submit(page: import("playwright/test").Page) {
    await page.getByLabel("Nomor WhatsApp").fill(phone as string);
    await page.getByLabel("Kata sandi").fill(password as string);
    await page.getByRole("button", { name: "Masuk" }).click();
    await page.waitForURL((url) => url.pathname === "/");
  }

  test("through the landing page", async ({ page }) => {
    await page.goto("/");
    const enter = page.getByRole("link", { name: "Masuk" }).first();
    await expect(enter).toBeVisible();
    await enter.click();
    await page.waitForURL(/\/login/);

    await submit(page);

    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Masuk" })).toHaveCount(0);
  });

  test("straight from /login", async ({ page }) => {
    await page.goto("/login");

    await submit(page);

    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Masuk" })).toHaveCount(0);
  });
});
