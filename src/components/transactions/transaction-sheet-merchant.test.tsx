// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

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
  has_transactions: false,
};
const categories: Category[] = [{ id: "c1", name: "Makanan", essential: false, archived_at: null }];
const merchant = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  name: "Kopi Kenangan",
  tx_count: 3,
  total_minor: 90_000,
  last_used_at: null,
};

function stubFetch() {
  // Typed as the real fetch so the recorded calls keep their init
  // argument: the assertions below read the POST body out of it.
  const fetchMock = vi.fn<typeof fetch>(async (input) => {
    const body = String(input).startsWith("/api/merchants")
      ? { data: { merchants: [merchant] }, trace_id: "t" }
      : { data: { transaction_id: "tx1" }, trace_id: "t" };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function renderSheet() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <TransactionSheet
        open
        onOpenChange={() => undefined}
        categories={categories}
        sources={[bca]}
      />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("merchant datalist on the capture form", () => {
  test("a typed canonical name is written as merchant_id", async () => {
    const fetchMock = stubFetch();
    renderSheet();

    const field = screen.getByLabelText(/Merchant/) as HTMLInputElement;
    expect(field.getAttribute("list")).toBe("merchant-options");
    await waitFor(() =>
      expect(document.querySelector("#merchant-options option")?.getAttribute("value")).toBe(
        "Kopi Kenangan",
      ),
    );

    fireEvent.change(screen.getByLabelText("Nominal"), { target: { value: "25000" } });
    fireEvent.change(field, { target: { value: "  kopi   kenangan " } });
    fireEvent.keyDown(screen.getByLabelText("Sumber"), { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: "BCA" }));
    fireEvent.keyDown(screen.getByLabelText("Kategori"), { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: "Makanan" }));
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

    const post = await waitFor(() => {
      const call = fetchMock.mock.calls.find(([url]) => url === "/api/transactions");
      if (call === undefined) {
        throw new Error("no POST yet");
      }
      return call;
    });
    const sent = JSON.parse(String(post[1]?.body)) as Record<string, unknown>;
    expect(sent.merchant_id).toBe(merchant.id);
    expect("merchant" in sent).toBe(false);
  });

  test("an unknown name still travels as free text", async () => {
    const fetchMock = stubFetch();
    renderSheet();

    fireEvent.change(screen.getByLabelText("Nominal"), { target: { value: "25000" } });
    fireEvent.change(screen.getByLabelText(/Merchant/), {
      target: { value: "warung baru depan kos" },
    });
    fireEvent.keyDown(screen.getByLabelText("Sumber"), { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: "BCA" }));
    fireEvent.keyDown(screen.getByLabelText("Kategori"), { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: "Makanan" }));
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

    const post = await waitFor(() => {
      const call = fetchMock.mock.calls.find(([url]) => url === "/api/transactions");
      if (call === undefined) {
        throw new Error("no POST yet");
      }
      return call;
    });
    const sent = JSON.parse(String(post[1]?.body)) as Record<string, unknown>;
    expect(sent.merchant).toBe("warung baru depan kos");
    expect("merchant_id" in sent).toBe(false);
  });
});
