"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

/**
 * ShellRefresher: the accounts rail is server-rendered in the layout.
 * After a mutation settles successfully it re-runs the server
 * components so balances and badge counts never go stale.
 */
export function ShellRefresher() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      if (event.type === "updated" && event.action?.type === "success") {
        router.refresh();
      }
    });
    return unsubscribe;
  }, [queryClient, router]);

  return null;
}
