import { dayLabel } from "@/lib/time";
import type { LedgerItem } from "@/lib/api/hooks";

export type DayGroup = { day: string; items: LedgerItem[] };

/**
 * Groups an already date-sorted ledger list into Jakarta days. The list
 * arrives sorted by the API, so a single pass keeps order intact.
 */
export function groupByJakartaDay(items: LedgerItem[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const item of items) {
    const day = dayLabel(item.occurred_at);
    const last = groups[groups.length - 1];
    if (last !== undefined && last.day === day) {
      last.items.push(item);
    } else {
      groups.push({ day, items: [item] });
    }
  }
  return groups;
}
