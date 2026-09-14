"use client";

import { useEffect, type ReactNode } from "react";

import { QueryErrorState } from "@/components/empty-state";
import { useAnnounce } from "@/components/live-region";

export type BoundaryQuery<T> = {
  isPending: boolean;
  isError: boolean;
  data: T | undefined;
  refetch: () => unknown;
};

/**
 * The truthfulness law as code (DESIGN.md §4): pending renders the
 * final geometry, an error says so and offers a retry, empty says
 * empty, and only real data renders as data. Never a fabricated zero.
 */
export function QueryBoundary<T>({
  query,
  isEmpty,
  skeleton,
  empty,
  errorMessage,
  children,
}: {
  query: BoundaryQuery<T>;
  isEmpty?: (data: T) => boolean;
  skeleton: ReactNode;
  empty: ReactNode;
  errorMessage?: string;
  children: (data: T) => ReactNode;
}) {
  const announce = useAnnounce();
  const state = query.isPending
    ? "pending"
    : query.isError || query.data === undefined
      ? "error"
      : "ready";

  useEffect(() => {
    if (state === "error") {
      announce(errorMessage ?? "Data gagal dimuat.");
    } else if (state === "ready") {
      announce("Data dimuat.");
    }
  }, [state, errorMessage, announce]);

  if (query.isPending) {
    return <>{skeleton}</>;
  }
  if (query.isError || query.data === undefined) {
    return <QueryErrorState message={errorMessage} onRetry={() => query.refetch()} />;
  }
  if (isEmpty !== undefined && isEmpty(query.data)) {
    return <>{empty}</>;
  }
  return <>{children(query.data)}</>;
}
