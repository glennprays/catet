"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ApiError } from "@/lib/api/client";

/**
 * Offline, a mutation must fail loudly instead of sitting in a paused queue
 * the user cannot see: `networkMode: "always"` runs it, the request fails,
 * and this is the one message that explains why.
 */
function reportWhenOffline(error: unknown) {
  redirectWhenSessionExpired(error);
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    toast.error("Tidak ada koneksi. Perubahan belum tersimpan.");
  }
}

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
        mutationCache: new MutationCache({ onError: reportWhenOffline }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            // The bot writes while the tab is hidden; a focus is the
            // cheapest signal that the view may be stale.
            refetchOnWindowFocus: true,
            // TanStack's default "online" mode would leave a query paused
            // forever in the installed app; the offline banner and the
            // panel error states are the honest answer.
            networkMode: "always",
          },
          mutations: { networkMode: "always" },
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
