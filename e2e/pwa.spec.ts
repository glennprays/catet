import { expect, test } from "playwright/test";

/*
 * The installability contract (ADR-0007), all of it reachable anonymously:
 * manifest, icons, worker, offline page, and the head tags Android and iOS
 * read before they offer "install".
 */
test.describe("installable app", () => {
  test("manifest describes a standalone app with three icons", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);

    const manifest = (await response.json()) as {
      start_url: string;
      scope: string;
      display: string;
      theme_color: string;
      background_color: string;
      icons: { src: string; sizes: string; type: string; purpose?: string }[];
    };

    expect(manifest.start_url).toBe("/?source=pwa");
    expect(manifest.scope).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#f2f4f7");
    expect(manifest.background_color).toBe("#f2f4f7");
    expect(manifest.icons).toHaveLength(3);
    expect(manifest.icons.some((icon) => icon.purpose === "maskable")).toBe(true);
    expect(manifest.icons.map((icon) => icon.sizes).sort()).toEqual([
      "192x192",
      "512x512",
      "512x512",
    ]);
  });

  test("every declared icon is a real PNG", async ({ request }) => {
    const manifest = (await (await request.get("/manifest.webmanifest")).json()) as {
      icons: { src: string }[];
    };

    for (const icon of manifest.icons) {
      const response = await request.get(icon.src);
      expect(response.status(), icon.src).toBe(200);
      expect(response.headers()["content-type"], icon.src).toContain("image/png");
    }

    const appleIcon = await request.get("/apple-icon.png");
    expect(appleIcon.status()).toBe(200);
    expect(appleIcon.headers()["content-type"]).toContain("image/png");
  });

  test("the service worker is served uncached as JavaScript", async ({ request }) => {
    const response = await request.get("/sw.js");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/javascript/);
    expect(response.headers()["cache-control"]).toContain("no-store");
  });

  test("an anonymous home-screen launch lands on login", async ({ page }) => {
    await page.goto("/?source=pwa");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("an anonymous visit to / still gets the landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("link", { name: /Masuk/ }).first()).toBeVisible();
  });

  test("the offline page renders without a session", async ({ page }) => {
    await page.goto("/offline");
    await expect(page.getByRole("heading", { name: "Tidak ada koneksi" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Coba lagi" })).toBeVisible();
  });

  test("login head carries the install metadata", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      "href",
      "/manifest.webmanifest",
    );
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      "#f2f4f7",
    );
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      "content",
      /viewport-fit=cover/,
    );
    // Next emits the standard name; the Apple-prefixed one is added by hand
    // for iOS below 16.4. Both must be present.
    await expect(page.locator('meta[name="mobile-web-app-capable"]')).toHaveAttribute(
      "content",
      "yes",
    );
    await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute(
      "content",
      "yes",
    );
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  });

  test("login inputs are 16px so iOS does not zoom on focus", async ({ page }) => {
    await page.goto("/login");

    // The form sits behind a Suspense boundary (useSearchParams), so it only
    // exists after hydration — measure once it is there.
    await expect(page.getByLabel("Kata sandi")).toBeVisible();

    const sizes = await page.evaluate(() =>
      [...document.querySelectorAll("input")].map((input) =>
        Number.parseFloat(getComputedStyle(input).fontSize),
      ),
    );

    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) {
      expect(size).toBeGreaterThanOrEqual(16);
    }
  });
});
