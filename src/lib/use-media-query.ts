"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media query. The server snapshot is always false, so the
 * server and the first client frame agree; sheets are closed at mount,
 * so the desktop-first default never shows as a layout shift.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** The one phone breakpoint (DESIGN.md §8): Tailwind's `sm` boundary. */
export function useIsPhone(): boolean {
  return useMediaQuery("(max-width: 639px)");
}

/** True inside the installed app (home-screen launch), false in a tab. */
export function useIsStandalone(): boolean {
  return useMediaQuery("(display-mode: standalone)");
}
