import { describe, expect, test } from "vitest";

import { validateTransactionFields } from "./transaction-sheet";

describe("transaction edit validation", () => {
  test("does not require a destination when editing a transfer", () => {
    expect(
      validateTransactionFields({
        editing: true,
        direction: "transfer",
        sourceId: "source-1",
        destinationId: "",
        categoryId: "",
      }),
    ).toEqual({});
  });

  test("does not require a category when editing an adjustment", () => {
    expect(
      validateTransactionFields({
        editing: true,
        direction: "expense",
        sourceId: "source-1",
        destinationId: "",
        categoryId: "",
      }),
    ).toEqual({});
  });

  test("keeps destination validation for new transfers", () => {
    expect(
      validateTransactionFields({
        editing: false,
        direction: "transfer",
        sourceId: "source-1",
        destinationId: "",
        categoryId: "",
      }),
    ).toEqual({ destination_source_id: "Pilih tujuan transfer" });
  });
});
