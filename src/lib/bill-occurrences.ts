/**
 * Bill recurrence, client side. The calendar projects a whole month of
 * due dates, which the API does not enumerate — it returns one
 * `next_due_date` per bill. This mirrors the backend's
 * `internal/service/billcycle.go` so the dashboard and the ledger agree
 * on what "the next occurrence" means.
 *
 * Dates are Jakarta calendar days handled as `yyyy-MM-dd` keys: the
 * whole module stays off the browser's timezone, so a user in UTC+0
 * sees the same calendar as the ledger.
 */

import { jakartaDateKey } from "@/lib/time";
import type { Bill } from "@/lib/api/hooks";

/** A projection never walks further than this, whatever it is asked. */
const OCCURRENCE_CAP = 400;

type Ymd = { year: number; month: number; day: number };

function toYmd(key: string): Ymd {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month, day };
}

function toKey({ year, month, day }: Ymd): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Clamp a day-of-month to the month's real length: Feb 31 → Feb 28. */
function anchored(year: number, month: number, day: number): Ymd {
  const normalizedYear = year + Math.floor((month - 1) / 12);
  const normalizedMonth = ((((month - 1) % 12) + 12) % 12) + 1;
  const last = daysInMonth(normalizedYear, normalizedMonth);
  return { year: normalizedYear, month: normalizedMonth, day: Math.min(day, last) };
}

/**
 * The due date after `key` for a cadence, re-anchored to `anchorDay` so
 * a bill due the 31st survives February. `null` for `once`, which has
 * no next occurrence.
 */
export function nextOccurrence(cadence: Bill["cadence"], key: string, anchorDay: number): string | null {
  const { year, month, day } = toYmd(key);
  switch (cadence) {
    case "once":
      return null;
    case "weekly": {
      const next = new Date(Date.UTC(year, month - 1, day + 7));
      return toKey({ year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate() });
    }
    case "monthly":
      return toKey(anchored(year, month + 1, anchorDay));
    case "annual":
      return toKey(anchored(year + 1, month, anchorDay));
    default:
      return null;
  }
}

/**
 * A bill's due dates inside `[from, to)` as `yyyy-MM-dd` keys, walking
 * from its current `next_due_date`. A tenor caps how many occurrences
 * are left in total, so a 2-installment bill never projects a third.
 *
 * The anchor day comes from `next_due_date`, because the API does not
 * expose the stored `anchor_day`: after an advance through February the
 * client anchor reads 28 while the server still knows 31. The server's
 * value is authoritative for real advances; this only affects how far
 * ahead the calendar guesses.
 */
export function occurrencesInRange(bill: Bill, from: string, to: string): string[] {
  const out: string[] = [];
  if (to <= from) {
    return out;
  }
  let left = OCCURRENCE_CAP;
  if (bill.remaining_count !== null && bill.remaining_count !== undefined) {
    if (bill.remaining_count <= 0) {
      return out;
    }
    left = Math.min(left, bill.remaining_count);
  }

  let key = jakartaDateKey(bill.next_due_date);
  const anchor = toYmd(key).day;
  for (let i = 0; i < left; i += 1) {
    if (key >= to) {
      break;
    }
    if (key >= from) {
      out.push(key);
    }
    const next = nextOccurrence(bill.cadence, key, anchor);
    if (next === null) {
      break;
    }
    key = next;
  }
  return out;
}
