import { expect, test } from "playwright/test";

import {
  AUTHED_ROUTES,
  EFFECTIVE_SIZE_SCRIPT,
  TAP_TARGET_SELECTOR,
  hasCredentials,
  login,
} from "./helpers";

/*
 * The phone laws from DESIGN.md §3/§4/§8, asserted on every authenticated
 * screen: nothing scrolls sideways, every control can be hit with a thumb,
 * and no field is small enough to trigger iOS focus zoom.
 */
test.describe("phone layout", () => {
  test.skip(!hasCredentials(), "set E2E_PHONE+E2E_PASSWORD or E2E_SESSION");

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  for (const route of AUTHED_ROUTES) {
    test(`${route} fits the viewport and stays thumb-reachable`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      // Charts and lists settle after their queries resolve.
      await page.waitForLoadState("networkidle");

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(overflow.scrollWidth, route).toBeLessThanOrEqual(overflow.clientWidth);

      const targets = (await page.evaluate(
        `(${EFFECTIVE_SIZE_SCRIPT})(${JSON.stringify(TAP_TARGET_SELECTOR)})`,
      )) as { tag: string; name: string; width: number; height: number }[];
      expect(targets.length, route).toBeGreaterThan(0);

      const small = targets.filter((t) => t.height < 44 || t.width < 44);
      expect(small, `${route}: ${JSON.stringify(small)}`).toEqual([]);

      const fields = (await page.evaluate(() =>
        [
          ...document.querySelectorAll(
            'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]), textarea, select, [role="combobox"]',
          ),
        ]
          .filter((el) => el.getBoundingClientRect().height > 0)
          .map((el) => Number.parseFloat(getComputedStyle(el).fontSize)),
      )) as number[];
      for (const size of fields) {
        expect(size, route).toBeGreaterThanOrEqual(16);
      }
    });
  }

  test("bottom-nav labels stay readable", async ({ page }) => {
    await page.goto("/");
    const sizes = await page.evaluate(() =>
      [...document.querySelectorAll('nav[aria-label="Navigasi bawah"] a, nav[aria-label="Navigasi bawah"] button')].map(
        (el) => Number.parseFloat(getComputedStyle(el).fontSize),
      ),
    );
    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) {
      expect(size).toBeGreaterThanOrEqual(12);
    }
  });

  test("transactions filters live in a sheet, not the toolbar", async ({ page }) => {
    await page.goto("/transactions");
    await page.waitForLoadState("networkidle");

    // The three selects must not be crammed into the 360px toolbar.
    await expect(page.getByRole("combobox")).toHaveCount(0);

    await page.getByRole("button", { name: /^Filter/ }).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet.getByText("Filter", { exact: true })).toBeVisible();
    await expect(sheet.getByRole("combobox")).toHaveCount(3);
  });

  test("bills switches between list and calendar", async ({ page }) => {
    await page.goto("/bills");
    await page.waitForLoadState("networkidle");

    const list = page.getByRole("region", { name: /tagihan/i }).first();
    const tabs = page.getByRole("radiogroup", { name: "Tampilan" });
    await expect(tabs).toBeVisible();

    await expect(list).toBeVisible();

    await tabs.getByRole("radio", { name: "Kalender" }).click();
    await expect(page.getByRole("grid")).toBeVisible();
    await expect(list).toBeHidden();

    await tabs.getByRole("radio", { name: "Daftar" }).click();
    await expect(list).toBeVisible();
    await expect(page.getByRole("grid")).toBeHidden();
  });
});
