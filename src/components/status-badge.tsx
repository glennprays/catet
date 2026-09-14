import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Status pill in the semantic palette. */
export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: "safe" | "warn" | "over" | "neutral";
  children: ReactNode;
  className?: string;
}) {
  return (
    <Badge variant={tone === "neutral" ? "secondary" : tone} className={cn("shrink-0", className)}>
      {children}
    </Badge>
  );
}
