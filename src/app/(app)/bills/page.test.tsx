// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import type { Bill, Source } from "@/lib/api/hooks";
import BillsPage from "./page";

import type { components } from "@/lib/api/schema";

type Transaction = components["schemas"]["Transaction"];

const billId = "11111111-1111-4111-8111-111111111111";
const sourceId = "22222222-2222-4222-8222-222222222222";
const transactionId = "33333333-3333-4333-8333-333333333333";

const source: Source = {
  id: sourceId,
  name: "BCA",
  type: "bank",
  is_debt: false,
  currency: "IDR",
  balance_minor: 0,
  has_transactions: false,
  archived_at: null,
};

const activeBill: Bill = {
  id: billId,
  name: "Internet",
  amount_min_minor: 100_000,
  amount_max_minor: 125_000,
  cadence: "once",
  next_due_date: "2026-09-25",
  linked_source_id: sourceId,
  linked_source_name: "BCA",
  category_id: null,
  category_name: null,
  active: true,
  completed_at: null,
  remaining_count: null,
  reminder_offsets: [],
};

// The `Aktif` label renders only while the group is non-empty, so the
// paid bill must not be the last one leaving it: a second bill keeps the
// group on screen and proves the move rather than the group's exit.
const stayingBill: Bill = {
  ...activeBill,
  id: "55555555-5555-4555-8555-555555555555",
  name: "Listrik",
  cadence: "monthly",
  next_due_date: "2026-09-28",
  amount_min_minor: 80_000,
  amount_max_minor: 90_000,
};

const completedBill: Bill = {
  ...activeBill,
  active: false,
  completed_at: "2026-09-25T10:00:00Z",
};

function response(data: unknown): Response {
  return new Response(JSON.stringify({ data, trace_id: "trace-1" }), {
    headers: { "content-type": "application/json" },
  });
}

const transaction: Transaction = {
  id: transactionId,
  occurred_at: "2026-09-25T10:00:00Z",
  origin: "dashboard_manual",
  type: "expense",
  merchant: null,
  merchant_id: null,
  note: "Bill payment",
  amount_minor: 125_000,
  category_id: null,
  category_name: null,
  category_source: null,
  category_confidence: null,
  review_status: "clean",
  external_id: null,
  reverses_transaction_id: null,
  reverses_merchant: null,
  voided_at: null,
  edit_history: [],
  voided: false,
  legs: [],
  bill_id: billId,
  bill_name: activeBill.name,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * The list has no per-group wrapper: `GroupLabel` renders a `<p>` and its
 * rows are the following siblings. Collect those siblings up to the next
 * label so every assertion sees exactly one group's rows.
 */
function groupText(labelText: string): string {
  const label = screen.getByText(labelText, { selector: "p" });
  const parts: string[] = [];
  for (let node = label.nextElementSibling; node !== null; node = node.nextElementSibling) {
    if (node.tagName === "P") {
      break;
    }
    parts.push(node.textContent ?? "");
  }
  return parts.join(" ");
}

describe("BillsPage payment transition", () => {
  test("moves a completed bill to Selesai before list revalidation resolves", async () => {
    let billsGetCount = 0;
    let releaseRevalidation: (() => void) | undefined;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = String(input);
      if (path === "/api/bills" && (init?.method === undefined || init?.method === "GET")) {
        billsGetCount += 1;
        if (billsGetCount === 1) {
          return response({ bills: [activeBill, stayingBill] });
        }
        return new Promise<Response>((resolve) => {
          releaseRevalidation = () =>
            resolve(response({ bills: [completedBill, stayingBill] }));
        });
      }
      if (path === `/api/bills/${billId}/payments` && init?.method === "POST") {
        return response({ bill: completedBill, transaction });
      }
      if (path === "/api/sources") {
        return response({
          sources: [source],
          total_available_minor: 0,
          total_debt_minor: 0,
        });
      }
      if (path === "/api/categories") {
        return response({ categories: [] });
      }
      if (path.startsWith("/api/bills/payments?")) {
        return response({ payments: [] });
      }
      throw new Error(`unexpected request: ${path} ${init?.method ?? "GET"}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <BillsPage />
      </QueryClientProvider>,
    );

    try {
      await screen.findByText(activeBill.name);
      fireEvent.keyDown(screen.getByRole("button", { name: `Aksi ${activeBill.name}` }), {
        key: "Enter",
      });
      fireEvent.click(await screen.findByRole("menuitem", { name: "Tandai lunas" }));
      fireEvent.click(await screen.findByRole("button", { name: "Tandai lunas" }));

      await waitFor(() => expect(billsGetCount).toBe(2));

      // Both partitions are asserted while the revalidation GET is still
      // held, so only the confirmed write-through can satisfy them: the
      // paid bill left `Aktif`, the untouched bill stayed, and the
      // completed bill is the one row under `Selesai`.
      await waitFor(() => {
        expect(groupText("Aktif")).not.toContain(activeBill.name);
        expect(groupText("Aktif")).toContain(stayingBill.name);
        expect(groupText("Selesai")).toContain(activeBill.name);
        expect(groupText("Selesai")).not.toContain(stayingBill.name);
      });
    } finally {
      releaseRevalidation?.();
    }
  });
});
