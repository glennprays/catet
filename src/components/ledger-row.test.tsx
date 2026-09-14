import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { LedgerRow } from "./ledger-row";
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

describe("LedgerRow mobile action layout", () => {
  test("reserves room for three actions beside the signed amount", () => {
    const markup = renderToStaticMarkup(
      <LedgerRow item={item} onEdit={() => undefined} onReverse={() => undefined} onVoid={() => undefined} />,
    );

    expect(markup).toContain("max-lg:pr-40");
  });
});
