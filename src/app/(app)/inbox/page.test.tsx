// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import InboxPage from "./page";
import { CaptureSheetProvider } from "@/components/capture-sheet-provider";
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
const makanan: Category = {
  id: "55555555-5555-4555-8555-555555555555",
  name: "Makanan",
  essential: true,
  archived_at: null,
};

/** A parked receipt that still needs its Source — the old dead-end row. */
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
      { n: 1, name: "Beras", amount_minor: 20000, category_id: null },
      { n: 2, name: "Gula", amount_minor: 20000, category_id: null },
      { n: 3, name: "Kopi", amount_minor: 20000, category_id: makanan.id },
    ],
    missing: ["source"],
    inconsistent: true,
    occurred_at: "2026-09-17T05:00:00Z",
    message_id: "m9",
  },
};

function envelope(data: unknown) {
  return new Response(JSON.stringify({ data, trace_id: "t" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function stubFetch() {
  const fetchMock = vi.fn(async (input: string) => {
    if (input.startsWith("/api/hold-queue")) {
      return envelope({ items: [hold] });
    }
    if (input.startsWith("/api/badges")) {
      return envelope({ hold_queue: 1, needs_review: 0, bills_due: 0 });
    }
    if (input.startsWith("/api/transactions")) {
      return envelope({ transactions: [] });
    }
    if (input.startsWith("/api/sources")) {
      return envelope({ sources: [bca], total_available_minor: 0, total_debt_minor: 0 });
    }
    if (input.startsWith("/api/categories")) {
      return envelope({ categories: [makanan] });
    }
    throw new Error(`unstubbed request: ${input}`);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function renderInbox() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <CaptureSheetProvider>
        <InboxPage />
      </CaptureSheetProvider>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Inbox hold row", () => {
  test("a receipt missing its Source is confirmable from the dashboard", async () => {
    stubFetch();
    renderInbox();

    const confirm = (await screen.findByRole("button", {
      name: "Konfirmasi",
    })) as HTMLButtonElement;
    expect(confirm.disabled).toBe(false);

    // The whole row is one target: tapping it opens the receipt sheet.
    fireEvent.click(screen.getByRole("button", { name: hold.summary }));

    await waitFor(() => expect(screen.getByText("Konfirmasi struk")).toBeDefined());
    expect(screen.getByText("Total struk")).toBeDefined();
  });
});
