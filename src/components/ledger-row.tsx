"use client";

import { Pencil, RotateCcw, Trash2 } from "lucide-react";

import { Chip } from "@/components/chip";
import { formatSignedIDR } from "@/lib/money";
import { timeLabel } from "@/lib/time";
import type { LedgerItem } from "@/lib/api/hooks";

/**
 * Ledger row (DESIGN.md §4): 48px below lg, 36px at lg+, grid of status dot,
 * merchant+time, category chip, source chip, signed figure. Actions reveal on
 * desktop hover and keyboard focus, and remain visible on touch viewports.
 */
export function LedgerRow({
  item,
  onEdit,
  onReverse,
  onVoid,
  showCategory = true,
}: {
  item: LedgerItem;
  onEdit?: (item: LedgerItem) => void;
  onReverse?: (item: LedgerItem) => void;
  onVoid?: (item: LedgerItem) => void;
  showCategory?: boolean;
}) {
  const name = item.merchant ?? item.note ?? item.type;
  const dotClass = item.voided
    ? "bg-over"
    : item.review_status === "needs_review"
      ? "bg-warn"
      : "bg-ash/40";
  const actionCount =
    (onEdit !== undefined ? 1 : 0) +
    (onReverse !== undefined ? 1 : 0) +
    (onVoid !== undefined ? 1 : 0);
  const mobileActionPadding =
    actionCount >= 3
      ? "max-lg:pr-40"
      : actionCount === 2
        ? "max-lg:pr-28"
        : actionCount === 1
          ? "max-lg:pr-14"
          : "";


  function handleRowClick() {
    if (window.innerWidth < 1024 && onEdit !== undefined && !item.voided) {
      onEdit(item);
    }
  }

  return (
    <div
      className={`group relative grid h-12 lg:h-9 grid-cols-[8px_minmax(0,1fr)_auto_auto] items-center gap-x-3 border-b border-border sm:grid-cols-[8px_minmax(0,1fr)_auto_auto_auto] ${mobileActionPadding} ${
        onEdit !== undefined && !item.voided ? "cursor-pointer lg:cursor-default" : ""
      }`}
      onClick={onEdit !== undefined && !item.voided ? handleRowClick : undefined}
    >
      <span aria-hidden className={`size-2 rounded-full ${dotClass}`} />

      <span className="min-w-0 leading-tight">
        <span
          className={`block truncate text-[13px] text-ink ${item.voided ? "line-through decoration-ink/50" : ""}`}
        >
          {name}
          {item.reverses_transaction_id !== null && item.reverses_transaction_id !== undefined ? (
            <span className="ml-1.5 rounded-full bg-safe-wash px-1.5 py-px text-xs text-safe-text">
              reversal
            </span>
          ) : null}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {timeLabel(item.occurred_at)}
          {item.note !== null && item.note !== undefined && item.merchant !== null ? ` · ${item.note}` : ""}
        </span>
      </span>

      {showCategory ? (
        <span className="hidden sm:block">
          {item.category_name ? <Chip>{item.category_name}</Chip> : <Chip>—</Chip>}
        </span>
      ) : null}

      <span className="hidden sm:block">
        <Chip>{item.source_name}</Chip>
      </span>

      <span
        className={`text-right text-[15px] font-medium tabular-nums ${
          item.voided ? "text-muted-foreground line-through" : "text-ink"
        }`}
      >
        {formatSignedIDR(item.amount_minor)}
      </span>

      {(onEdit !== undefined || onReverse !== undefined || onVoid !== undefined) && !item.voided ? (
        <div className="absolute right-0 top-0 flex h-12 translate-x-1 items-center gap-0.5 bg-canvas/95 pl-2 opacity-0 transition-opacity duration-100 focus-within:opacity-100 group-hover:opacity-100 max-lg:opacity-100 lg:h-9">
          {onEdit !== undefined ? (
            <button
              type="button"
              aria-label={`Ubah ${name}`}
              className="flex size-11 items-center justify-center rounded-sm text-ink-soft hover:bg-surface-200"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(item);
              }}
            >
              <Pencil className="size-4" strokeWidth={1.75} />
            </button>
          ) : null}
          {onReverse !== undefined ? (
            <button
              type="button"
              aria-label={`Balaskan ${name}`}
              className="flex size-11 items-center justify-center rounded-sm text-ink-soft hover:bg-surface-200"
              onClick={(event) => {
                event.stopPropagation();
                onReverse(item);
              }}
            >
              <RotateCcw className="size-4" strokeWidth={1.75} />
            </button>
          ) : null}
          {onVoid !== undefined ? (
            <button
              type="button"
              aria-label={`Hapus ${name}`}
              className="flex size-11 items-center justify-center rounded-sm text-over-text hover:bg-over-wash"
              onClick={(event) => {
                event.stopPropagation();
                onVoid(item);
              }}
            >
              <Trash2 className="size-4" strokeWidth={1.75} />
            </button>
          ) : null}
        </div>
      ) : null}
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
