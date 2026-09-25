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
  amount_minor: 125_000,
  review_status: "clean",
  edit_history: [],
  voided: false,
  legs: [],
  bill_id: billId,
  bill_name: activeBill.name,
};

afterEach(() => {
  vi.unstubAllGlobals();
});
describe("BillsPage payment transition", () => {
  test("moves a completed bill to Selesai before list revalidation resolves", async () => {
    let billsGetCount = 0;
    let releaseRevalidation: (() => void) | undefined;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = String(input);
      if (path === "/api/bills" && (init?.method === undefined || init?.method === "GET")) {
        billsGetCount += 1;
        if (billsGetCount === 1) {
          return response({ bills: [activeBill] });
        }
        return new Promise<Response>((resolve) => {
          releaseRevalidation = () => resolve(response({ bills: [completedBill] }));
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
      const activeGroup = screen.getByText("Aktif", { selector: "p" });
      const completedGroup = screen.getByText("Selesai", { selector: "p" });
      expect(activeGroup.nextElementSibling?.textContent).not.toContain(activeBill.name);
      expect(completedGroup.nextElementSibling?.textContent).toContain(completedBill.name);
    } finally {
      releaseRevalidation?.();
    }
  });
});
