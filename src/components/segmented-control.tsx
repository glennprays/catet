"use client";

import { cn } from "@/lib/utils";

/**
 * Segmented control as a real radiogroup — Tabs without panels lies to
 * screen readers (WCAG 4.1.2).
 */
export function SegmentedControl({
  value,
  onValueChange,
  options,
  "aria-label": ariaLabel,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  "aria-label": string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md bg-surface-200 p-0.5",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "h-8 rounded-sm px-3 text-xs font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-safe-wash focus-visible:outline-none",
              selected ? "bg-sheet text-ink shadow-sm" : "text-muted-foreground hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
