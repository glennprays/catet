"use client";

import { BalanceHero } from "@/components/balance-hero";
import { DEMO_OVERVIEW, DEMO_TREND_POINTS } from "@/components/landing/demo-data";
import type { BoundaryQuery } from "@/components/query-boundary";
import type { StsTrendData } from "@/lib/api/hooks";

/**
 * The real `BalanceHero` on fixture data, for the landing page's hero visual.
 *
 * This exists as a client component for one reason: `BoundaryQuery` carries a
 * `refetch` function, and a function cannot be passed from a server component
 * to a client one. Built here, it never crosses the boundary.
 *
 * There is no `PrivacyProvider` above it, so the figures render as digits —
 * intended: a product page that masks its own screenshot says nothing.
 */
const DEMO_TREND: BoundaryQuery<StsTrendData> = {
  isPending: false,
  isError: false,
  refetch: () => undefined,
  data: { points: DEMO_TREND_POINTS },
};

export function DemoHero() {
  return (
    <BalanceHero overview={DEMO_OVERVIEW} trend={DEMO_TREND} updatedAt={0} stale={false} />
  );
}
