import type { NextConfig } from "next";

/*
 * One id per build: it names the immutable `/_next/static/` cache the service
 * worker keeps (`sw.js?v=<id>`), so a deploy both invalidates the registration
 * URL and lets the worker drop the previous build's caches.
 */
const buildId = process.env.GIT_SHA ?? Date.now().toString(36);

const nextConfig: NextConfig = {
  // The container ships `.next/standalone` + `server.js`; without this
  // the image would need the whole node_modules tree.
  output: "standalone",

  env: { NEXT_PUBLIC_BUILD_ID: buildId },
  generateBuildId: () => buildId,

  // Client router cache: a tab the user just left repaints from memory
  // instead of round-tripping for its RSC payload. Live numbers still
  // arrive from TanStack Query on focus.
  experimental: { staleTimes: { dynamic: 60, static: 300 } },

  // Needs-Review and Hold Queue merged into Inbox; keep old links alive.
  async redirects() {
    return [
      { source: "/needs-review", destination: "/inbox", permanent: false },
      { source: "/hold-queue", destination: "/inbox", permanent: false },
    ];
  },

  // The worker script itself is never cached: a stale sw.js would pin the app
  // to an old shell for as long as the browser kept it.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
