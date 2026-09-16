import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Label-over-figure pair (DESIGN.md §4). One metric is never a card:
 * it is an 11px label and a 14px figure, grouped in a Well or a strip.
 */
export function Metric({
  label,
  value,
  hint,
  align = "left",
  inlineOnPhone = false,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  align?: "left" | "right";
  /**
   * Below 640px the pair collapses to one label–figure row, so a strip of
   * metrics stacks instead of squeezing three columns into 328px (§8).
   */
  inlineOnPhone?: boolean;
}) {
  return (
    <div
      className={cn(
        align === "right" && "text-right",
        inlineOnPhone && "flex items-baseline justify-between gap-3 sm:block",
      )}
    >
      <span
        className={cn(
          "text-label font-medium uppercase text-ash",
          inlineOnPhone ? "sm:block" : "block",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "block text-figure-md font-semibold tabular-nums text-ink",
          inlineOnPhone ? "sm:mt-0.5" : "mt-0.5",
        )}
      >
        {value}
      </span>
      {hint === undefined ? null : <span className="block text-meta text-ash">{hint}</span>}
    </div>
  );
}
