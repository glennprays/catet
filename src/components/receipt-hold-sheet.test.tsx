// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { ReceiptHoldSheet } from "./receipt-hold-sheet";
import type { Category, PendingAction, Source } from "@/lib/api/hooks";

const bca: Source = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "BCA",
  type: "bank",
  is_debt: false,
  currency: "IDR",
  archived_at: null,
  balance_minor: 0,
  has_transactions: false,
};
const gopay: Source = {
  ...bca,
  id: "22222222-2222-4222-8222-222222222222",
  name: "GoPay",
  type: "ewallet",
};
const sources = [bca, gopay];

const rumah: Category = {
  id: "44444444-4444-4444-8444-444444444444",
  name: "Rumah Tangga",
  essential: true,
  archived_at: null,
};
const makanan: Category = {
  ...rumah,
  id: "55555555-5555-4555-8555-555555555555",
  name: "Makanan",
};
const categories = [rumah, makanan];

/** A parked receipt whose printed lines did not reconcile with the total. */
const hold: PendingAction = {
  id: "33333333-3333-4333-8333-333333333333",
  kind: "receipt",
  summary: "Struk Alfamart · 17 Sep · 3 item · Rp60.000 · rincian tidak konsisten",
  created_at: "2026-09-17T05:00:00Z",
  params: {
    type: "expense",
    document_type: "receipt",
    merchant: "Alfamart",
    total_minor: 60000,
    items: [
      { n: 1, name: "Beras", amount_minor: 20000, category_id: rumah.id, category_name: "Rumah Tangga" },
      { n: 2, name: "Gula", amount_minor: 20000, category_id: null },
      { n: 3, name: "Kopi", amount_minor: 20000, category_id: makanan.id, category_name: "Makanan" },
    ],
    missing: ["source"],
    inconsistent: true,
    occurred_at: "2026-09-17T05:00:00Z",
    message_id: "m9",
  },
};

function renderSheet() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ReceiptHoldSheet
        item={hold}
        onOpenChange={() => undefined}
        sources={sources}
        categories={categories}
      />
    </QueryClientProvider>,
  );
}

function stubFetch() {
  const fetchMock = vi.fn<(input: string, init: RequestInit) => Promise<Response>>(
    async () =>
      new Response(
        JSON.stringify({
          data: { resolved: true, transaction_ids: ["a", "b", "c"] },
          trace_id: "t",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** Radix opens a Select on pointerdown, which jsdom does not synthesise. */
function choose(triggerName: string | RegExp, option: string) {
  fireEvent.keyDown(screen.getByRole("combobox", { name: triggerName }), { key: "Enter" });
  fireEvent.click(screen.getByRole("option", { name: option }));
}

function overridesOf(fetchMock: ReturnType<typeof stubFetch>) {
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe(`/api/hold-queue/${hold.id}/resolve`);
  const body = JSON.parse(String(init.body)) as {
    action: string;
    overrides: Record<string, unknown>;
  };
  expect(body.action).toBe("confirm");
  return body.overrides;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ReceiptHoldSheet", () => {
  test("confirms with a chosen Source and per-line categories", async () => {
    const fetchMock = stubFetch();
    renderSheet();

    const confirm = screen.getByRole("button", { name: "Konfirmasi" }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);

    choose("Sumber", "GoPay");
    choose("Kategori baris 2", "Makanan");
    fireEvent.click(screen.getByRole("button", { name: "Konfirmasi" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const overrides = overridesOf(fetchMock);
    expect(overrides.source_id).toBe(gopay.id);
    expect(overrides.items).toEqual([{ n: 2, category_id: makanan.id }]);
    // The printed total is a money fact: the sheet never sends an amount.
    expect("amount_minor" in overrides).toBe(false);
    expect(overrides.collapse).toBeUndefined();
  });

  test("collapses to one line when Pecah per baris is off", async () => {
    const fetchMock = stubFetch();
    renderSheet();

    choose("Sumber", "GoPay");
    fireEvent.click(screen.getByRole("switch", { name: "Pecah per baris" }));
    expect(screen.getByText("Alfamart · 3 item")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Konfirmasi" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const overrides = overridesOf(fetchMock);
    expect(overrides.collapse).toBe(true);
    expect(overrides.items).toBeUndefined();
  });

  test("shows the inconsistency badge and the printed total", () => {
    stubFetch();
    renderSheet();

    expect(screen.getByText("Rincian tidak konsisten")).toBeDefined();
    expect(screen.getAllByText("Rp60.000").length).toBeGreaterThan(0);
  });
});
