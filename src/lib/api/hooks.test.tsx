// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  useArchiveSource,
  usePayBill,
  type Bill,
  type BillPaymentResult,
  type Source,
  type SourcesData,
} from "./hooks";
import type { components } from "./schema";

type Transaction = components["schemas"]["Transaction"];

type Envelope = { data?: unknown; error?: { code: string; message: string }; trace_id: string };

const billId = "11111111-1111-4111-8111-111111111111";
const sourceId = "22222222-2222-4222-8222-222222222222";
const transactionId = "33333333-3333-4333-8333-333333333333";

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
  bill_id: billId,
  bill_name: "Internet",
  edit_history: [],
  voided: false,
  voided_at: null,
  legs: [
    {
      id: "44444444-4444-4444-8444-444444444444",
      source_id: sourceId,
      source_name: "BCA",
      category_id: null,
      category_name: null,
      signed_amount: -125_000,
    },
  ],
};

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

const baseBill: Bill = {
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

function response(envelope: Envelope): Response {
  return new Response(JSON.stringify(envelope), {
    headers: { "content-type": "application/json" },
  });
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function wrapperFor(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function seedBills(queryClient: QueryClient, bill: Bill) {
  queryClient.setQueryData<{ bills: Bill[] }>(["bills"], { bills: [bill] });
}

function seedSources(queryClient: QueryClient) {
  const data: SourcesData = {
    sources: [source],
    total_available_minor: 0,
    total_debt_minor: 0,
  };
  queryClient.setQueryData<SourcesData>(["sources", true], data);
  queryClient.setQueryData<SourcesData>(["sources", false], data);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("confirmed mutation cache transitions", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        throw new Error(`unexpected request: ${String(input)} ${init?.method ?? "GET"}`);
      }),
    );
  });

  test.each([
    {
      label: "a one-time bill",
      initial: baseBill,
      returned: {
        ...baseBill,
        active: false,
        completed_at: "2026-09-25T10:00:00Z",
      },
    },
    {
      label: "the final installment of a tenor",
      initial: { ...baseBill, cadence: "monthly" as const, remaining_count: 1 },
      returned: {
        ...baseBill,
        cadence: "monthly" as const,
        remaining_count: 1,
        active: false,
        completed_at: "2026-09-25T10:00:00Z",
      },
    },
  ])("writes the authoritative completed Bill for $label", async ({ initial, returned }) => {
    const queryClient = makeQueryClient();
    seedBills(queryClient, initial);
    const resultEnvelope: BillPaymentResult = { bill: returned, transaction };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        expect(String(input)).toBe(`/api/bills/${billId}/payments`);
        expect(init?.method).toBe("POST");
        return response({ data: resultEnvelope, trace_id: "payment-trace" });
      }),
    );

    const { result } = renderHook(() => usePayBill(), { wrapper: wrapperFor(queryClient) });
    await act(async () => {
      await result.current.mutateAsync({ id: billId, amount_minor: 125_000 });
    });

    expect(queryClient.getQueryData<{ bills: Bill[] }>(["bills"])).toEqual({
      bills: [returned],
    });
  });

  test("writes the server-returned next due date while a recurring Bill stays active", async () => {
    const initial = { ...baseBill, cadence: "monthly" as const, next_due_date: "2026-09-25" };
    const returned: Bill = {
      ...initial,
      active: true,
      next_due_date: "2026-10-25",
      completed_at: null,
      remaining_count: 4,
    };
    const queryClient = makeQueryClient();
    seedBills(queryClient, initial);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        expect(String(input)).toBe(`/api/bills/${billId}/payments`);
        return response({ data: { bill: returned, transaction }, trace_id: "payment-trace" });
      }),
    );

    const { result } = renderHook(() => usePayBill(), { wrapper: wrapperFor(queryClient) });
    await act(async () => {
      await result.current.mutateAsync({ id: billId, amount_minor: 125_000 });
    });

    const cached = queryClient.getQueryData<{ bills: Bill[] }>(["bills"]);
    expect(cached?.bills[0]).toMatchObject({
      id: billId,
      active: true,
      next_due_date: "2026-10-25",
    });
  });

  test("leaves the Bill cache unchanged when payment fails", async () => {
    const queryClient = makeQueryClient();
    seedBills(queryClient, baseBill);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => response({ error: { code: "PAYMENT_FAILED", message: "payment failed" }, trace_id: "error-trace" })),
    );

    const { result } = renderHook(() => usePayBill(), { wrapper: wrapperFor(queryClient) });
    await act(async () => {
      await expect(result.current.mutateAsync({ id: billId, amount_minor: 125_000 })).rejects.toThrow(
        "payment failed",
      );
    });

    expect(queryClient.getQueryData<{ bills: Bill[] }>(["bills"])).toEqual({ bills: [baseBill] });
  });

  test("moves an archived Source between both cached list memberships", async () => {
    const queryClient = makeQueryClient();
    seedSources(queryClient);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        expect(String(input)).toBe(`/api/sources/${sourceId}`);
        expect(init?.method).toBe("DELETE");
        return response({ data: { archived: true }, trace_id: "archive-trace" });
      }),
    );

    const { result } = renderHook(() => useArchiveSource(), { wrapper: wrapperFor(queryClient) });
    await act(async () => {
      await result.current.mutateAsync(sourceId);
    });

    const includeArchived = queryClient.getQueryData<SourcesData>(["sources", true]);
    const activeOnly = queryClient.getQueryData<SourcesData>(["sources", false]);
    expect(includeArchived).toMatchObject({
      total_available_minor: 0,
      total_debt_minor: 0,
      sources: [{ ...source, archived_at: expect.any(String) }],
    });
    expect(activeOnly).toEqual({
      sources: [],
      total_available_minor: 0,
      total_debt_minor: 0,
    });
  });

  test("leaves both Source caches unchanged when archive fails", async () => {
    const queryClient = makeQueryClient();
    seedSources(queryClient);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => response({ error: { code: "ARCHIVE_FAILED", message: "archive failed" }, trace_id: "error-trace" })),
    );

    const { result } = renderHook(() => useArchiveSource(), { wrapper: wrapperFor(queryClient) });
    await act(async () => {
      await expect(result.current.mutateAsync(sourceId)).rejects.toThrow("archive failed");
    });

    expect(queryClient.getQueryData<SourcesData>(["sources", true])).toEqual({
      sources: [source],
      total_available_minor: 0,
      total_debt_minor: 0,
    });
    expect(queryClient.getQueryData<SourcesData>(["sources", false])).toEqual({
      sources: [source],
      total_available_minor: 0,
      total_debt_minor: 0,
    });
  });
});
