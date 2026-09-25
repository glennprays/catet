// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import TransactionsPage from "./page";
import { resolvePeriod } from "@/lib/period";

let search = new URLSearchParams();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => search,
  usePathname: () => "/transactions",
  useRouter: () => ({ replace }),
}));

vi.mock("@/components/capture-sheet-provider", () => ({
  useCaptureSheet: () => ({ openCreate: () => undefined, openDetail: () => undefined }),
}));

const requests: string[] = [];

function envelopeFor(path: string) {
  if (path.startsWith("/api/transactions")) return { data: { transactions: [] }, page: {} };
  if (path.startsWith("/api/sources")) return { data: { sources: [] } };
  if (path.startsWith("/api/categories")) return { data: { categories: [] } };
  if (path.startsWith("/api/merchants")) return { data: { merchants: [] } };
  return { data: {} };
}

beforeEach(() => {
  requests.length = 0;
  replace.mockClear();
  vi.stubGlobal("fetch", (input: string) => {
    requests.push(String(input));
    return Promise.resolve({ json: () => Promise.resolve(envelopeFor(String(input))) });
  });
});

afterEach(() => vi.unstubAllGlobals());

/** The one request the ledger makes; its query string is the filter set. */
async function listQuery(url: string): Promise<URLSearchParams> {
  search = new URLSearchParams(url);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <TransactionsPage />
    </QueryClientProvider>,
  );
  await waitFor(() => {
    expect(requests.some((path) => path.startsWith("/api/transactions"))).toBe(true);
  });
  const path = requests.find((candidate) => candidate.startsWith("/api/transactions")) ?? "";
  return new URLSearchParams(path.split("?")[1] ?? "");
}

describe("Transactions filters live in the URL", () => {
  test("a bare visit asks for the default 30-day window and rewrites nothing", async () => {
    const query = await listQuery("");

    const range = resolvePeriod({ preset: "30d" });
    expect(query.get("from")).toBe(range.from);
    expect(query.get("to")).toBe(range.to);
    expect(query.get("limit")).toBe("50");
    expect(query.get("voided")).toBeNull();
    expect(query.get("review_status")).toBeNull();
    // Nothing was asked for, so the subtree flag is not sent either: a
    // bare visit must stay a plain list.
    expect(query.get("include_descendants")).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  test("a category deep link asks for that category's whole subtree", async () => {
    const id = "22222222-2222-4222-8222-222222222222";
    const query = await listQuery(`category_id=${id}`);

    // The Analytics link promises the subtree amount it just showed, so
    // the ledger must count the same rows.
    expect(query.get("category_id")).toBe(id);
    expect(query.get("include_descendants")).toBe("true");
  });

  test("?period=last_month narrows to last month", async () => {
    const query = await listQuery("period=last_month");

    const range = resolvePeriod({ preset: "last_month" });
    expect(query.get("from")).toBe(range.from);
    expect(query.get("to")).toBe(range.to);
  });

  test("?status=voided asks for the bin, not a review state", async () => {
    const query = await listQuery("status=voided");

    expect(query.get("voided")).toBe("only");
    expect(query.get("review_status")).toBeNull();
  });

  test("?status=needs_review stays a review state", async () => {
    const query = await listQuery("status=needs_review");

    expect(query.get("review_status")).toBe("needs_review");
    expect(query.get("voided")).toBeNull();
  });

  test("a merchant deep link with period=all drops the window", async () => {
    const id = "11111111-1111-4111-8111-111111111111";
    const query = await listQuery(`period=all&merchant_id=${id}`);

    expect(query.get("merchant_id")).toBe(id);
    expect(query.get("from")).toBeNull();
    expect(query.get("to")).toBeNull();
  });
});
