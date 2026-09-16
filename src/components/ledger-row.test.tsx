// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { LedgerHead, LedgerRow } from "./ledger-row";
import type { LedgerItem } from "@/lib/api/hooks";

const item: LedgerItem = {
  transaction_id: "00000000-0000-0000-0000-000000000001",
  occurred_at: "2026-09-09T05:00:00Z",
  type: "expense",
  merchant: "Kopi Kenangan",
  note: null,
  amount_minor: -25000,
  category_id: "00000000-0000-0000-0000-000000000002",
  category_name: "Makanan & Minuman",
  source_id: "00000000-0000-0000-0000-000000000003",
  source_name: "GoPay",
  review_status: "clean",
  voided: false,
  reverses_transaction_id: null,
};

describe("LedgerRow", () => {
  test("the whole row opens the detail sheet", () => {
    const onOpen = vi.fn();
    render(<LedgerRow item={item} onOpen={onOpen} />);

    fireEvent.click(screen.getByRole("button", { name: "Kopi Kenangan, \u2212Rp25.000" }));

    expect(onOpen).toHaveBeenCalledWith(item);
  });

  test("the amount is never covered by the open button", () => {
    const { container } = render(<LedgerRow item={item} onOpen={() => undefined} />);
    const amount = screen.getByText("\u2212Rp25.000");

    // The overlay sits behind content; content cells opt out of hit testing.
    expect(container.querySelector("button")?.className).toContain("absolute inset-0");
    expect(amount.parentElement?.className).toContain("pointer-events-none");
  });

  test("status is exposed as text, not colour alone", () => {
    render(<LedgerRow item={{ ...item, review_status: "needs_review" }} />);
    expect(screen.getByText("Perlu review")).toBeDefined();
  });

  test("voided rows read as voided", () => {
    render(<LedgerRow item={{ ...item, voided: true }} />);
    expect(screen.getByText("Di-void")).toBeDefined();
    expect(screen.getByText("\u2212Rp25.000").className).toContain("line-through");
  });

  test("a missing category renders nothing, not an em dash pill", () => {
    render(<LedgerRow item={{ ...item, category_name: null }} />);
    expect(screen.queryByText("—")).toBeNull();
  });
});

describe("LedgerHead", () => {
  test("the header names every column", () => {
    render(<LedgerHead />);
    for (const label of ["Jam", "Transaksi", "Kategori", "Sumber", "Jumlah"]) {
      expect(screen.getByText(label)).toBeDefined();
    }
  });

  test("without a category column the header drops it", () => {
    render(<LedgerHead showCategory={false} />);
    for (const label of ["Jam", "Transaksi", "Sumber", "Jumlah"]) {
      expect(screen.getByText(label)).toBeDefined();
    }
    expect(screen.queryByText("Kategori")).toBeNull();
  });
});
