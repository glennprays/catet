import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Small uppercase label above a group of rows (DESIGN.md §3 "Label").
 * The sticky variant is a 28px canvas-coloured divider so day headers
 * read as part of the page, not as another card.
 */
export function GroupLabel({
  children,
  sticky = false,
  className,
}: {
  children: ReactNode;
  sticky?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-label font-medium uppercase text-ash",
        sticky
          ? "sticky z-[5] flex h-7 items-center border-b border-border bg-canvas px-4"
          : "px-4 pt-3 pb-1",
        className,
      )}
    >
      {children}
    </p>
  );
}
