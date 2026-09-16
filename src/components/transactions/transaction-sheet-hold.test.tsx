// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { TransactionSheet } from "./transaction-sheet";
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
const gopay: Source = { ...bca, id: "22222222-2222-4222-8222-222222222222", name: "GoPay", type: "ewallet" };
const sources = [bca, gopay];
const categories: Category[] = [];

/** A parked transfer the bot could not finish: it never got a destination. */
const hold: PendingAction = {
  id: "33333333-3333-4333-8333-333333333333",
  kind: "capture",
  summary: "transfer Rp500.000",
  created_at: "2026-09-15T04:00:00Z",
  params: {
    type: "transfer",
    amount_minor: 500000,
    source_id: bca.id,
    source_name: "BCA",
    destination_source_id: gopay.id,
    occurred_at: "2026-09-15T04:00:00Z",
    message_id: "smoke-3",
    original_text: "pindah 500k dari bca",
    missing: ["destination"],
  },
};

function renderSheet() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TransactionSheet
        open
        onOpenChange={() => undefined}
        categories={categories}
        sources={sources}
        hold={hold}
      />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TransactionSheet in hold mode", () => {
  test("prefills the parked draft and confirms it through the resolve endpoint", async () => {
    const fetchMock = vi.fn<(input: string, init: RequestInit) => Promise<Response>>(
      async () =>
        new Response(JSON.stringify({ data: { resolved: true }, trace_id: "t" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderSheet();

    expect(screen.getByText("Konfirmasi draft")).toBeDefined();
    const amount = screen.getByLabelText("Nominal") as HTMLInputElement;
    expect(amount.value).toBe("500.000");
    // The Source select shows what the bot already resolved.
    expect(screen.getAllByText("BCA").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`/api/hold-queue/${hold.id}/resolve`);
    expect(init.method).toBe("POST");
    const body = JSON.parse(String(init.body)) as {
      action: string;
      overrides: Record<string, unknown>;
    };
    expect(body.action).toBe("confirm");
    expect(body.overrides.destination_source_id).toBe(gopay.id);
    expect(body.overrides.source_id).toBe(bca.id);
    expect(body.overrides.amount_minor).toBe(500000);
  });
});
