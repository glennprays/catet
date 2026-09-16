import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Unit tests live beside the code; e2e/ belongs to Playwright.
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
