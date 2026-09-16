import { defineConfig, devices } from "playwright/test";

/*
 * Phone-shaped e2e (ADR-0007): the suite exists to keep the installability
 * contract and the 44px/16px touch laws from rotting, so it runs against a
 * production build — the service worker and the manifest only exist there.
 *
 * Port 3101 keeps the dev server on 3001 untouched. Chromium comes from the
 * system (no `playwright install` on this box); `devices["iPhone 14"]` is
 * viewport/UA/touch emulation only — WebKit-specific behaviour (focus zoom,
 * cookie jar, status bar) lives in the manual device checklist.
 */
const launchOptions = {
  executablePath: process.env.PLAYWRIGHT_CHROMIUM ?? "/usr/bin/chromium-browser",
  args: ["--no-sandbox"],
};

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3101" },
  webServer: {
    command: "bun run build && bunx next start -p 3101",
    url: "http://localhost:3101/login",
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      CATET_BACKEND_URL: process.env.CATET_BACKEND_URL ?? "http://localhost:3000",
      NODE_ENV: "production",
    },
  },
  projects: [
    { name: "pixel7", use: { ...devices["Pixel 7"], launchOptions } },
    {
      name: "iphone14",
      use: { ...devices["iPhone 14"], defaultBrowserType: "chromium", launchOptions },
    },
  ],
});
