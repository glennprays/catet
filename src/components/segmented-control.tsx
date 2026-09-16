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
  stretch = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  "aria-label": string;
  className?: string;
  /** Options share the track width instead of hugging their labels. */
  stretch?: boolean;
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
              "relative h-9 rounded-[6px] px-3 text-meta font-medium transition-colors focus-visible:ring-[4px] focus-visible:ring-primary/10 focus-visible:outline-none sm:h-7",
              // DESIGN.md §4: the track stays 36px on phone (a 44px slab reads
              // as a button bar); reach comes from an invisible expander.
              "max-sm:before:absolute max-sm:before:inset-x-0 max-sm:before:inset-y-[-4px] max-sm:before:content-['']",
              stretch && "flex-1",
              selected
                ? "bg-surface text-ink shadow-[0_1px_2px_rgba(5,15,26,0.08)]"
                : "text-muted-foreground hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
