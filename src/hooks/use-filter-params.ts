"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Filter state lives in the URL so a filtered list is linkable, survives a
 * reload, and can be arrived at from a chart click-through.
 *
 * `useSearchParams` opts the tree into client-side bailout, so every caller
 * MUST render inside a `<Suspense>` boundary (see `src/app/reset/page.tsx`).
 */
export function useFilterParams(): {
  get(key: string): string | null;
  set(patch: Record<string, string | null>): void;
} {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Both callbacks are memoised on the params object itself, so they are
  // stable between URL changes and always read the current URL — a ref
  // written during render would be the same thing with a lie in it.
  const get = useCallback((key: string) => params.get(key), [params]);

  const set = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        // An empty filter is an absent filter: never leave `?q=` behind.
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      const query = next.toString();
      router.replace(query === "" ? pathname : `${pathname}?${query}`, { scroll: false });
    },
    [params, pathname, router],
  );

  return useMemo(() => ({ get, set }), [get, set]);
}
