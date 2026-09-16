"use client";

import { createElement, type ReactNode } from "react";

import { MoneyText } from "@/components/money-text";
import { StatusBadge } from "@/components/status-badge";
import { formatSignedIDR } from "@/lib/money";
import { sourceGlyph } from "@/lib/source-glyph";
import { timeLabel } from "@/lib/time";
import type { LedgerItem, Source } from "@/lib/api/hooks";

/**
 * Ledger table geometry (DESIGN.md §4): one shared column template for
 * the header, the rows and the skeleton so they can never drift. Below
 * `md` the row folds into two lines — merchant + amount, then a meta
 * line — because a five-column table at 390px is a scrollbar.
 */
export const LEDGER_GRID =
  "grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[44px_minmax(0,1fr)_140px_120px_116px]";
const LEDGER_GRID_ACTIONS =
  "grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[44px_minmax(0,1fr)_140px_120px_116px_auto]";
const LEDGER_GRID_NO_CATEGORY =
  "grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[44px_minmax(0,1fr)_120px_116px]";
const LEDGER_GRID_NO_CATEGORY_ACTIONS =
  "grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[44px_minmax(0,1fr)_120px_116px_auto]";

function gridClass(showCategory: boolean, hasActions: boolean): string {
  if (showCategory) {
    return hasActions ? LEDGER_GRID_ACTIONS : LEDGER_GRID;
  }
  return hasActions ? LEDGER_GRID_NO_CATEGORY_ACTIONS : LEDGER_GRID_NO_CATEGORY;
}

/** Column header for a ledger table — 11px uppercase, one rule below. */
export function LedgerHead({ showCategory = true }: { showCategory?: boolean }) {
  return (
    <div
      className={`hidden h-8 items-center gap-x-3 border-b border-border px-4 text-label font-medium uppercase text-ash md:grid ${
        showCategory ? LEDGER_GRID : LEDGER_GRID_NO_CATEGORY
      }`}
    >
      <span>Jam</span>
      <span>Transaksi</span>
      {showCategory ? <span>Kategori</span> : null}
      <span>Sumber</span>
      <span className="text-right">Jumlah</span>
    </div>
  );
}

/**
 * Ledger row (DESIGN.md §4): 44px below md, 36px at md+, one line of
 * time, merchant, category, source and figure. Category and source are
 * plain text — a pill on 100% of rows carries zero information; badges
 * are reserved for the exceptional states (voided, needs review,
 * reversal).
 *
 * Reading and acting are not mutually exclusive: the whole row is one
 * button that opens the detail sheet, sitting *behind* the content, so
 * the amount is never covered. `trailing` keeps its own controls
 * clickable above it.
 */
export function LedgerRow({
  item,
  onOpen,
  trailing,
  showCategory = true,
  sourceType,
  flash = false,
}: {
  item: LedgerItem;
  onOpen?: (item: LedgerItem) => void;
  trailing?: ReactNode;
  showCategory?: boolean;
  sourceType?: Source["type"];
  flash?: boolean;
}) {
  const name = item.merchant ?? item.note ?? item.type;
  const categoryLabel =
    item.category_name ??
    (item.type === "transfer" ? "Transfer" : item.type === "adjustment" ? "Penyesuaian" : "");
  const time = timeLabel(item.occurred_at);

  return (
    <div
      className={`relative grid ${gridClass(showCategory, trailing !== undefined)} items-center gap-x-3 border-b border-border px-4 last:border-b-0 ${
        trailing === undefined ? "h-11 md:h-9" : "min-h-11 py-1.5"
      } ${flash ? "catet-flash" : ""}`}
    >
      {onOpen !== undefined ? (
        <button
          type="button"
          onClick={() => onOpen(item)}
          aria-label={`${name}, ${formatSignedIDR(item.amount_minor)}`}
          // `-bottom-px` reaches over this row's own hairline: without it the
          // overlay is the 43px padding box and the row misses 44px reach.
          className="absolute inset-0 -bottom-px hover:bg-surface-100 focus-visible:ring-[4px] focus-visible:ring-primary/10 focus-visible:outline-none"
        />
      ) : null}

      <span className="pointer-events-none relative hidden text-meta tabular-nums text-ash md:block">
        {time}
      </span>

      <span className="pointer-events-none relative min-w-0 leading-tight">
        <span className="block truncate">
          <span
            className={`text-body font-medium ${
              item.voided ? "text-ash line-through" : "text-ink"
            }`}
          >
            {name}
          </span>
          {item.note !== null && item.note !== undefined && item.merchant !== null ? (
            <span className="text-meta text-ash"> · {item.note}</span>
          ) : null}
          {item.voided ? (
            <StatusBadge tone="neutral" className="ml-1.5 align-middle">
              Di-void
            </StatusBadge>
          ) : item.review_status === "needs_review" ? (
            <StatusBadge tone="warn" className="ml-1.5 align-middle">
              Perlu review
            </StatusBadge>
          ) : null}
          {item.reverses_transaction_id !== null && item.reverses_transaction_id !== undefined ? (
            <StatusBadge tone="safe" className="ml-1.5 align-middle">
              Pembalikan
            </StatusBadge>
          ) : null}
        </span>
        <span className="block truncate text-meta text-ash md:hidden">
          {time} · {item.source_name}
          {categoryLabel === "" ? "" : ` · ${categoryLabel}`}
        </span>
      </span>

      {showCategory ? (
        <span className="pointer-events-none relative hidden min-w-0 truncate text-meta text-ash md:block">
          {categoryLabel}
        </span>
      ) : null}

      <span className="pointer-events-none relative hidden min-w-0 items-center gap-1.5 text-meta text-ink-soft md:flex">
        {sourceType === undefined
          ? null
          : createElement(sourceGlyph(sourceType), {
              className: "size-3.5 shrink-0 text-ash",
              strokeWidth: 1.75,
              "aria-hidden": true,
            })}
        <span className="truncate">{item.source_name}</span>
      </span>

      <span className="pointer-events-none relative text-right">
        <MoneyText
          minor={item.amount_minor}
          signed
          size="md"
          strike={item.voided}
          tone={
            item.voided || item.type === "transfer" || item.type === "adjustment"
              ? "muted"
              : "auto"
          }
        />
      </span>

      {trailing === undefined ? null : (
        <span className="relative z-10 col-span-full pb-1.5 md:col-span-1 md:pb-0">{trailing}</span>
      )}
    </div>
  );
}

/** Loading skeleton matching the row geometry (DESIGN.md skeleton rule). */
export function LedgerRowSkeleton() {
  return (
    <div
      className={`grid h-11 items-center gap-x-3 border-b border-border px-4 last:border-b-0 md:h-9 ${LEDGER_GRID}`}
    >
      <span className="catet-shimmer hidden h-3 w-7 rounded-md md:block" />
      <span className="catet-shimmer h-3 w-40 rounded-md" />
      <span className="catet-shimmer hidden h-3 w-20 rounded-md md:block" />
      <span className="catet-shimmer hidden h-3 w-16 rounded-md md:block" />
      <span className="catet-shimmer h-3 w-[72px] justify-self-end rounded-md" />
    </div>
  );
}
