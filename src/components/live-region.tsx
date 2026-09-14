"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

const AnnounceContext = createContext<((message: string) => void) | null>(null);

/** Announce a status change to screen readers (WCAG 4.1.3). */
export function useAnnounce(): (message: string) => void {
  return useContext(AnnounceContext) ?? noop;
}

function noop() {
  // No provider (unit tests, isolated renders): announcements are dropped.
}

export function LiveRegion({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const announce = useCallback((next: string) => setMessage(next), []);

  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      <p role="status" aria-live="polite" className="sr-only">
        {message}
      </p>
    </AnnounceContext.Provider>
  );
}
