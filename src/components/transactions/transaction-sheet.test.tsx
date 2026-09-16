// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { TransactionSheet } from "./transaction-sheet";
import type { Category, Source } from "@/lib/api/hooks";

const bca: Source = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "BCA",
  type: "bank",
  is_debt: false,
  currency: "IDR",
  archived_at: null,
  balance_minor: 0,
};
const gopay: Source = {
  ...bca,
  id: "22222222-2222-4222-8222-222222222222",
  name: "GoPay",
  type: "ewallet",
};
const sources = [bca, gopay];
const categories: Category[] = [
  { id: "c1", name: "Makanan", essential: false, archived_at: null },
];

function renderSheet() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TransactionSheet
        open
        onOpenChange={() => undefined}
        categories={categories}
        sources={sources}
      />
    </QueryClientProvider>,
  );
}

describe("TransactionSheet capture flow", () => {
  test("the footer button submits the field form, so Enter saves too", () => {
    renderSheet();

    const save = screen.getByRole("button", { name: "Simpan" });
    expect(save.getAttribute("type")).toBe("submit");
    expect(save.getAttribute("form")).toBe("tx-form");
    expect(document.getElementById("tx-form")?.tagName).toBe("FORM");
  });

  test("marks invalid fields and clears the mark as the user answers", () => {
    renderSheet();

    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

    const amount = screen.getByLabelText("Nominal");
    expect(amount.getAttribute("aria-invalid")).toBe("true");

    fireEvent.change(amount, { target: { value: "1000" } });

    expect(amount.getAttribute("aria-invalid")).toBeNull();
  });

  test("the note is opt-in", () => {
    renderSheet();

    expect(screen.queryByLabelText("Catatan")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Tambah catatan" }));

    expect(screen.getByLabelText("Catatan")).toBeDefined();
  });
});
