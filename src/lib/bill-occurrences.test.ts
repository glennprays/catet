import { describe, expect, test } from "vitest";

import { nextOccurrence, occurrencesInRange } from "./bill-occurrences";
import type { Bill } from "./api/hooks";

function bill(partial: Partial<Bill> & Pick<Bill, "cadence" | "next_due_date">): Bill {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Listrik",
    amount_min_minor: 200_000,
    amount_max_minor: 250_000,
    active: true,
    reminder_offsets: [],
    ...partial,
  } as Bill;
}

// The calendar projects months the API never enumerates, so this table
// mirrors the backend's billcycle_test.go case for case: a divergence
// here shows up as a due date the dashboard draws and the ledger denies.
describe("nextOccurrence", () => {
  test.each([
    ["once has no next", "once", "2026-01-31", 31, null],
    ["weekly adds seven days", "weekly", "2026-01-28", 28, "2026-02-04"],
    ["monthly clamps to February", "monthly", "2026-01-31", 31, "2026-02-28"],
    ["monthly recovers the anchor", "monthly", "2026-02-28", 31, "2026-03-31"],
    ["monthly wraps the year", "monthly", "2026-12-15", 15, "2027-01-15"],
    ["annual keeps the month", "annual", "2026-03-10", 10, "2027-03-10"],
    ["annual clamps leap day", "annual", "2028-02-29", 29, "2029-02-28"],
  ] as const)("%s", (_name, cadence, from, anchor, want) => {
    expect(nextOccurrence(cadence as Bill["cadence"], from, anchor)).toBe(want);
  });
});

describe("occurrencesInRange", () => {
  test("monthly recovers its anchor across February", () => {
    expect(
      occurrencesInRange(bill({ cadence: "monthly", next_due_date: "2026-01-31" }), "2026-01-01", "2026-04-01"),
    ).toEqual(["2026-01-31", "2026-02-28", "2026-03-31"]);
  });

  test("weekly repeats inside one month", () => {
    expect(
      occurrencesInRange(bill({ cadence: "weekly", next_due_date: "2026-03-02" }), "2026-03-01", "2026-03-31"),
    ).toEqual(["2026-03-02", "2026-03-09", "2026-03-16", "2026-03-23", "2026-03-30"]);
  });

  test("once yields at most one", () => {
    expect(
      occurrencesInRange(bill({ cadence: "once", next_due_date: "2026-03-10" }), "2026-01-01", "2027-01-01"),
    ).toEqual(["2026-03-10"]);
  });

  test("a tenor caps the projection", () => {
    expect(
      occurrencesInRange(
        bill({ cadence: "monthly", next_due_date: "2026-01-10", remaining_count: 2 }),
        "2026-01-01",
        "2027-01-01",
      ),
    ).toEqual(["2026-01-10", "2026-02-10"]);
  });

  test("the window excludes its end and skips what is before it", () => {
    const monthly = bill({ cadence: "monthly", next_due_date: "2026-01-10" });
    expect(occurrencesInRange(monthly, "2026-01-01", "2026-01-10")).toEqual([]);
    expect(occurrencesInRange(monthly, "2026-02-01", "2026-03-01")).toEqual(["2026-02-10"]);
    expect(occurrencesInRange(monthly, "2026-01-01", "2026-01-01")).toEqual([]);
  });

  test("an overdue bill still projects from its own due date", () => {
    expect(
      occurrencesInRange(bill({ cadence: "monthly", next_due_date: "2026-01-05" }), "2026-03-01", "2026-04-01"),
    ).toEqual(["2026-03-05"]);
  });
});
