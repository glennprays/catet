import { describe, expect, test } from "vitest";

import { budgetCaption, budgetTotals } from "./page";
import type { BudgetRow } from "@/lib/api/hooks";

function budget(over: Partial<BudgetRow> = {}): BudgetRow {
  return {
    id: "b1",
    category_id: "c1",
    category_name: "Makan",
    essential: false,
    amount_minor: 1_200_000,
    spent_minor: 0,
    from_period: "2026-09",
    to_period: null,
    since_period: "2026-09",
    previous_amount_minor: null,
    nested: false,
    ...over,
  };
}

describe("budgetCaption", () => {
  test("an open rule says since when it has been running", () => {
    expect(budgetCaption(budget({ since_period: "2026-07" }), "2026-09")).toBe(
      "Berulang · sejak Jul 2026",
    );
  });

  test("a one-off in its own month is not a rule", () => {
    const row = budget({ from_period: "2026-09", to_period: "2026-09", since_period: "2026-09" });

    expect(budgetCaption(row, "2026-09")).toBe("Hanya Sep 2026");
  });

  test("a stopped rule names both ends", () => {
    const row = budget({ from_period: "2026-07", to_period: "2026-09", since_period: "2026-07" });

    expect(budgetCaption(row, "2026-09")).toBe("Berulang · sejak Jul 2026 · sampai Sep 2026");
  });

  test("the month of a change carries the nominal it replaced", () => {
    const row = budget({
      from_period: "2026-09",
      since_period: "2026-07",
      previous_amount_minor: 1_200_000,
    });

    expect(budgetCaption(row, "2026-09")).toBe(
      "Berulang · sejak Jul 2026 · sebelumnya Rp1.200.000",
    );
  });

  test("a later month does not repeat the previous nominal", () => {
    const row = budget({
      from_period: "2026-09",
      since_period: "2026-07",
      previous_amount_minor: 1_200_000,
    });

    expect(budgetCaption(row, "2026-11")).toBe("Berulang · sejak Jul 2026");
  });
});

describe("budgetTotals", () => {
  test("a nested row is already inside its ancestor's, so it is skipped", () => {
    const rows = [
      budget({ id: "parent", amount_minor: 1_000_000, spent_minor: 300_000 }),
      budget({ id: "child", amount_minor: 200_000, spent_minor: 300_000, nested: true }),
    ];

    expect(budgetTotals(rows)).toEqual({ amount: 1_000_000, spent: 300_000 });
  });

  test("independent rows all count", () => {
    const rows = [
      budget({ id: "a", amount_minor: 1_000_000, spent_minor: 250_000 }),
      budget({ id: "b", amount_minor: 500_000, spent_minor: 100_000 }),
    ];

    expect(budgetTotals(rows)).toEqual({ amount: 1_500_000, spent: 350_000 });
  });
});
