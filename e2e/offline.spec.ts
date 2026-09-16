import { expect, test } from "playwright/test";

import { hasCredentials, login } from "./helpers";

/*
 * Offline behaviour of the installed app: a navigation with no network shows
 * the branded offline page (served by the worker), and an in-session drop
 * shows the shell banner instead of silently stale data.
 */
test.describe("offline", () => {
  test.skip(!hasCredentials(), "set E2E_PHONE+E2E_PASSWORD or E2E_SESSION");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("a navigation without network falls back to the offline page", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await page.waitForFunction(() =>
      navigator.serviceWorker.ready.then(() => navigator.serviceWorker.controller !== null),
    );

    await context.setOffline(true);
    try {
      await page.goto("/transactions");
      await expect(page.getByText("Tidak ada koneksi")).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });

  test("the shell banner tracks connectivity", async ({ page, context }) => {
    await page.goto("/");
    const banner = page.getByRole("status").filter({ hasText: "Tidak ada koneksi" });
    await expect(banner).toHaveCount(0);

    // Real connectivity, not a synthetic event: the banner reads
    // navigator.onLine, so only an actual drop may reveal it.
    await context.setOffline(true);
    try {
      await expect(banner).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
    await expect(banner).toHaveCount(0);
  });
});
