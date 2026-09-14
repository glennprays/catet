import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Needs-Review and Hold Queue merged into Inbox; keep old links alive.
  async redirects() {
    return [
      { source: "/needs-review", destination: "/inbox", permanent: false },
      { source: "/hold-queue", destination: "/inbox", permanent: false },
    ];
  },
};

export default nextConfig;
