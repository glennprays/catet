import { NextResponse } from "next/server";

import { forward } from "@/lib/api/proxy";

type Params = { params: Promise<{ metric: string }> };

// Explicit allowlist: only these analytics metrics are proxied — the
// rest of /api/analytics/* is refused at the edge.
const ALLOWED_METRICS: Record<string, true> = {
  "category-breakdown": true,
  "income-expense": true,
  "sts-trend": true,
  heatmap: true,
  "top-merchants": true,
  "essential-lifestyle": true,
};

export async function GET(request: Request, { params }: Params) {
  const { metric } = await params;
  if (ALLOWED_METRICS[metric] !== true) {
    return NextResponse.json(
      {
        error: { code: "NOT_FOUND", message: `unknown analytics metric: ${metric}` },
      },
      { status: 404 },
    );
  }

  return forward(request, `/api/v1/analytics/${metric}${new URL(request.url).search}`);
}
