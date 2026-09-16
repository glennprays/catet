import { MoneyText } from "@/components/money-text";
import type { Bill } from "@/lib/api/hooks";

/**
 * A bill's amount: one figure, or a min–max range when it varies. The
 * band needs two figures side by side, which a 360px row cannot spare —
 * phones show the ceiling ("s.d.") and desktop keeps the full range.
 */
export function BillAmount({
  bill,
}: {
  bill: Pick<Bill, "amount_min_minor" | "amount_max_minor">;
}) {
  if (bill.amount_min_minor === bill.amount_max_minor) {
    return <MoneyText minor={bill.amount_min_minor} size="sm" tone="neutral" />;
  }
  return (
    <>
      <span className="whitespace-nowrap sm:hidden">
        <span className="text-muted-foreground">s.d. </span>
        <MoneyText minor={bill.amount_max_minor} size="sm" tone="neutral" />
      </span>
      <span className="hidden whitespace-nowrap sm:inline">
        <MoneyText minor={bill.amount_min_minor} size="sm" tone="neutral" />
        <span className="text-muted-foreground">–</span>
        <MoneyText minor={bill.amount_max_minor} size="sm" tone="neutral" />
      </span>
    </>
  );
}
