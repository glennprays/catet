"use client";

import type { ReactNode } from "react";

import { CategoryTile } from "@/components/category-tile";
import { useFormatIDR } from "@/components/privacy-provider";
import type { BudgetRow } from "@/lib/api/hooks";

const FILL = {
  safe: "bg-safe",
  warn: "bg-warn",
  over: "bg-over",
} as const;

/**
 * One budget as a single 36px line (DESIGN.md §4): name, 4px bar,
 * spent-of-limit, percentage. Shared by the Budgets screen and the
 * Overview card so the same ratio can never earn two different tones.
 * A caption (the rule state) stacks under the name and lets the row
 * grow; Overview passes none and keeps the strict 36px rhythm.
 */
export function BudgetProgressRow({
  row,
  caption,
  actions,
}: {
  row: Pick<BudgetRow, "category_id" | "category_name" | "spent_minor" | "amount_minor">;
  caption?: string;
  actions?: ReactNode;
}) {
  const format = useFormatIDR();
  const ratio = row.amount_minor === 0 ? 0 : row.spent_minor / row.amount_minor;
  const tone = ratio >= 1 ? "over" : ratio >= 0.8 ? "warn" : "safe";
  const pct = Math.round(ratio * 100);

  return (
    <div className="flex min-h-9 items-center gap-3 border-b border-border px-4 py-1 last:border-b-0">
      <CategoryTile category={{ id: row.category_id, name: row.category_name }} />

      <span className="w-24 shrink-0 @md:w-32">
        <span className="block truncate text-body font-medium text-ink">{row.category_name}</span>
        {caption === undefined ? null : (
          <span className="block truncate text-label text-ash">{caption}</span>
        )}
      </span>

      <span
        role="progressbar"
        aria-label={row.category_name}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1 flex-1 overflow-hidden rounded-full bg-surface-300 @md:max-w-[420px]"
      >
        <span
          className={`block h-full rounded-full ${FILL[tone]}`}
          style={{ width: `${Math.min(ratio, 1) * 100}%` }}
        />
      </span>
      <span className="ml-auto hidden w-40 shrink-0 text-right text-meta tabular-nums text-ash @md:block">
        {format(row.spent_minor)} / {format(row.amount_minor)}
      </span>

      <span
        className={`w-10 shrink-0 text-right text-meta font-medium tabular-nums ${
          ratio >= 1 ? "text-over-text" : "text-ink-soft"
        }`}
      >
        {pct}%
      </span>

      {actions}
    </div>
  );
}
