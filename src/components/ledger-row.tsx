"use client";

import type { ReactNode } from "react";

import { Chip } from "@/components/chip";
import { MoneyText } from "@/components/money-text";
import { SourceChip } from "@/components/source-chip";
import { formatSignedIDR } from "@/lib/money";
import { timeLabel } from "@/lib/time";
import type { LedgerItem, Source } from "@/lib/api/hooks";

/**
 * Ledger row (DESIGN.md §4): 48px below lg, 36px at lg+, grid of status
 * dot, merchant+time, category chip, source chip, signed figure.
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
  const dotClass = item.voided
    ? "bg-over"
    : item.review_status === "needs_review"
      ? "bg-warn"
      : "bg-ash";
  const statusLabel = item.voided
    ? "Di-void"
    : item.review_status === "needs_review"
      ? "Perlu review"
      : "";

  return (
    <div
      className={`relative grid grid-cols-[8px_minmax(0,1fr)_auto_auto] items-center gap-x-3 border-b border-border sm:grid-cols-[8px_minmax(0,1fr)_auto_auto_auto] ${
        trailing === undefined ? "h-12 lg:h-9" : "min-h-12 py-2"
      } ${flash ? "catet-flash" : ""}`}
    >
      {onOpen !== undefined ? (
        <button
          type="button"
          onClick={() => onOpen(item)}
          aria-label={`${name}, ${formatSignedIDR(item.amount_minor)}`}
          className="absolute inset-0 rounded-sm hover:bg-surface-100 focus-visible:ring-[3px] focus-visible:ring-safe-wash focus-visible:outline-none"
        />
      ) : null}

      <span className="pointer-events-none relative">
        <span aria-hidden className={`block size-2 rounded-full ${dotClass}`} />
        {statusLabel === "" ? null : <span className="sr-only">{statusLabel}</span>}
      </span>

      <span className="pointer-events-none relative min-w-0 leading-tight">
        <span
          className={`block truncate text-[13px] ${
            item.voided ? "text-muted-foreground line-through" : "text-ink"
          }`}
        >
          {name}
          {item.reverses_transaction_id !== null && item.reverses_transaction_id !== undefined ? (
            <span className="ml-1.5 rounded-full bg-safe-wash px-1.5 py-px text-xs text-safe-text">
              pembalikan
            </span>
          ) : null}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {timeLabel(item.occurred_at)}
          {item.note !== null && item.note !== undefined && item.merchant !== null
            ? ` · ${item.note}`
            : ""}
        </span>
      </span>

      {showCategory ? (
        <span className="pointer-events-none relative hidden sm:block">
          {item.category_name !== null && item.category_name !== undefined ? (
            <Chip>{item.category_name}</Chip>
          ) : null}
        </span>
      ) : null}

      <span className="pointer-events-none relative hidden sm:block">
        <SourceChip name={item.source_name} type={sourceType} />
      </span>

      <span className="pointer-events-none relative text-right">
        <MoneyText
          minor={item.amount_minor}
          signed
          strike={item.voided}
          tone={
            item.voided || item.type === "transfer" || item.type === "adjustment"
              ? "muted"
              : "auto"
          }
        />
      </span>

      {trailing === undefined ? null : (
        <span className="relative z-10 col-span-full pb-2 sm:col-span-1 sm:pb-0">{trailing}</span>
      )}
    </div>
  );
}

/** Loading skeleton matching the row geometry (DESIGN.md skeleton rule). */
export function LedgerRowSkeleton() {
  return (
    <div className="grid h-12 grid-cols-[8px_minmax(0,1fr)_auto_auto] items-center gap-x-3 border-b border-border sm:grid-cols-[8px_minmax(0,1fr)_auto_auto_auto] lg:h-9">
      <span className="catet-shimmer size-2 rounded-full" />
      <span className="catet-shimmer h-3.5 w-40 rounded-sm" />
      <span className="catet-shimmer hidden h-3.5 w-16 rounded-sm sm:block" />
      <span className="catet-shimmer hidden h-3.5 w-20 rounded-sm sm:block" />
      <span className="catet-shimmer h-3.5 w-20 justify-self-end rounded-sm" />
    </div>
  );
}
