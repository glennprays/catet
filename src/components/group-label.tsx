import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Small uppercase label above a group of rows. Sticky variant is opaque. */
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
        "py-1.5 text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground",
        sticky && "sticky z-[5] -mx-4 bg-canvas px-4 lg:-mx-6 lg:px-6",
        className,
      )}
    >
      {children}
    </p>
  );
}
