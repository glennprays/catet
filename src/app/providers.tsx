"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ApiError } from "@/lib/api/client";

/**
 * A dead session is a global condition, not a panel-level error: every
 * query would otherwise render "Gagal memuat" with no way back in.
 */
function redirectWhenSessionExpired(error: unknown) {
  if (!(error instanceof ApiError) || error.code !== "UNAUTHORIZED") {
    return;
  }
  if (window.location.pathname === "/login") {
    return;
  }
  // Full document navigation on purpose: it drops every cached query
  // and RSC payload that belonged to the dead session.
  window.location.assign(new URL("/login?expired=1", window.location.origin));
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: redirectWhenSessionExpired }),
        mutationCache: new MutationCache({ onError: redirectWhenSessionExpired }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            // The bot writes while the tab is hidden; a focus is the
            // cheapest signal that the view may be stale.
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
