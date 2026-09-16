import type { ReactNode } from "react";

import { BillAmount } from "@/components/bill-amount";
import { StatusBadge } from "@/components/status-badge";
import { formatJakartaDate } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { Bill } from "@/lib/api/hooks";

export const CADENCE_LABEL: Record<Bill["cadence"], string> = {
  once: "Sekali",
  weekly: "Mingguan",
  monthly: "Bulanan",
  annual: "Tahunan",
};

/**
 * One bill as a 40px row at 640px+ (DESIGN.md §4), folding into a
 * two-line 44px row below it: name over a meta line, because the name
 * and the figure cannot share 360px once the type scale steps up. The
 * date tile is the leading glyph — a bill's identity is *when* — and
 * the urgency badge appears only when the answer is "soon" or "late",
 * so a calm list stays calm.
 */
export function UpcomingBillRow({
  bill,
  days,
  trailing,
  muted = false,
}: {
  bill: Bill;
  days: number;
  trailing?: ReactNode;
  muted?: boolean;
}) {
  const completed = bill.completed_at !== null && bill.completed_at !== undefined;
  const late = !completed && bill.active && days < 0;
  const tenor = completed ? null : (bill.remaining_count ?? null);
  // Same sentence twice: inline after the name on desktop, its own
  // line under the name on phone where there is no room beside it.
  const meta = [
    CADENCE_LABEL[bill.cadence],
    tenor === null ? null : `sisa ${tenor}x`,
    bill.linked_source_name ? bill.linked_source_name : null,
  ]
    .filter((part) => part !== null)
    .join(" · ");

  return (
    <div className="flex min-h-11 items-center gap-3 border-b border-border px-4 py-1.5 last:border-b-0 sm:h-10 sm:min-h-0 sm:py-0">
      <span
        aria-hidden
        className={cn(
          "flex w-9 shrink-0 flex-col items-center justify-center rounded-[6px] py-0.5 leading-none",
          late ? "bg-over-wash" : "bg-surface-200",
        )}
      >
        <span className={cn("text-body font-semibold", late ? "text-over-text" : "text-ink")}>
          {formatJakartaDate(bill.next_due_date, { day: "numeric" })}
        </span>
        <span className={cn("text-[10px] uppercase", late ? "text-over-text" : "text-ink-soft")}>
          {formatJakartaDate(bill.next_due_date, { month: "short" })}
        </span>
      </span>

      <span
        className={cn(
          "flex min-w-0 flex-1 flex-col sm:flex-row sm:items-baseline",
          muted && "opacity-60",
        )}
      >
        <span className="break-words text-body font-medium text-ink sm:truncate">{bill.name}</span>
        <span className="block truncate text-meta text-ash sm:hidden">{meta}</span>
        <span className="ml-1.5 hidden truncate text-meta text-ash sm:@md:inline">· {meta}</span>
      </span>

      <span className="shrink-0 text-right leading-tight">
        <span className={cn("block", muted && "opacity-60")}>
          <BillAmount bill={bill} />
        </span>
        <span className="block text-label tabular-nums text-ash">
          {completed ? (
            "Selesai"
          ) : late ? (
            <StatusBadge tone="over">Terlambat</StatusBadge>
          ) : !bill.active ? (
            "Nonaktif"
          ) : days === 0 ? (
            <StatusBadge tone="warn">Hari ini</StatusBadge>
          ) : days <= 3 ? (
            <StatusBadge tone="warn">{days} hari</StatusBadge>
          ) : (
            `${days} hari`
          )}
        </span>
      </span>

      {trailing}
    </div>
  );
}
