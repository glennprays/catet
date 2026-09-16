import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * L1-inset well (DESIGN.md §6): a tinted, border-less recess inside a
 * card. Secondary figures live here so they read as context to the one
 * number above them rather than as four peers.
 */
export function Well({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-md bg-surface-100 p-3", className)}>{children}</div>;
}
