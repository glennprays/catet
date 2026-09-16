// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { PendingActionParams } from "./pending-action-params";

/** A receipt the chat split across two Sources, as the bot parks it. */
const splitReceipt: Record<string, unknown> = {
  type: "expense",
  merchant: "Indomaret",
  total_minor: 38000,
  source_id: "00000000-0000-0000-0000-000000000001",
  source_name: "Cash",
  source_basis: "user",
  payments: [
    { source_id: "00000000-0000-0000-0000-000000000001", source_name: "Cash", amount_minor: 20000 },
    { source_id: "00000000-0000-0000-0000-000000000002", source_name: "BCA", amount_minor: 18000 },
  ],
  items: [
    { n: 3, part: "a", name: "Indomie", amount_minor: 1000, source_name: "Cash" },
    { n: 3, part: "b", name: "Indomie", amount_minor: 7000, source_name: "BCA" },
  ],
  chat: "628@s.whatsapp.net",
  from: "628:3@s.whatsapp.net",
};

describe("PendingActionParams", () => {
  test("a split payment is readable before confirming it", () => {
    render(<PendingActionParams params={splitReceipt} />);

    expect(screen.getByText("Dibayar dari")).toBeTruthy();
    expect(screen.getAllByText(/Cash/).length).toBeGreaterThan(0);
    expect(screen.getByText("\u2212Rp20.000")).toBeTruthy();
    expect(screen.getByText("\u2212Rp18.000")).toBeTruthy();
  });

  test("a cut line shows its half and the Source that paid it", () => {
    render(<PendingActionParams params={splitReceipt} />);

    expect(screen.getByText("3a. Indomie \u00b7 Cash")).toBeTruthy();
    expect(screen.getByText("3b. Indomie \u00b7 BCA")).toBeTruthy();
  });

  test("how the Source was decided is stated, not implied", () => {
    render(<PendingActionParams params={{ source_basis: "memory" }} />);

    expect(screen.getByText("Dasar sumber")).toBeTruthy();
    expect(screen.getByText("Kebiasaan merchant")).toBeTruthy();
  });

  test("chat addressing is the bot's business, not the user's", () => {
    render(<PendingActionParams params={splitReceipt} />);

    expect(screen.queryByText("chat")).toBeNull();
    expect(screen.queryByText("from")).toBeNull();
    expect(screen.queryByText("628@s.whatsapp.net")).toBeNull();
  });
});
