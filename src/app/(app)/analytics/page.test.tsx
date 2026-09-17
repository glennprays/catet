// @vitest-environment jsdom
import type { CSSProperties } from "react";
import type { EChartsOption } from "echarts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import AnalyticsPage, { runwayChartValue } from "./page";
import type * as EchartModule from "@/components/charts/echart";
import { resolvePeriod } from "@/lib/period";

const MAKANAN = "55555555-5555-4555-8555-555555555555";
const KOPI = "77777777-7777-4777-8777-777777777777";

const push = vi.fn();
let search = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/analytics",
  useSearchParams: () => search,
}));

/**
 * The chart stands in for ECharts: a button per data item, handed back to
 * `onSelect` exactly as ECharts hands back `params.data`. That is the whole
 * path a click-through depends on — what the option puts on an item is what
 * the handler receives.
 */
vi.mock("@/components/charts/echart", async (importOriginal) => {
  const actual = await importOriginal<typeof EchartModule>();
  return {
    ...actual,
    EChart: ({
      option,
      onSelect,
    }: {
      option: EChartsOption;
      onSelect?: (name: string, item?: unknown) => void;
      className?: string;
      style?: CSSProperties;
    }) => (
      <div>
        {dataItems(option).map((item) => (
          <button key={item.name} type="button" onClick={() => onSelect?.(item.name, item)}>
            {item.name}
          </button>
        ))}
      </div>
    ),
  };
});

function dataItems(option: EChartsOption): { name: string }[] {
  const series = Array.isArray(option.series) ? option.series : [option.series];
  const out: { name: string }[] = [];
  for (const one of series) {
    if (one === undefined || !("data" in one) || !Array.isArray(one.data)) {
      continue;
    }
    for (const item of one.data) {
      if (typeof item === "object" && item !== null && "name" in item && typeof item.name === "string") {
        out.push({ ...item, name: item.name });
      }
    }
  }
  return out;
}

function envelope(data: unknown) {
  return new Response(JSON.stringify({ data, trace_id: "t" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function stubFetch() {
  const calls: string[] = [];
  const fetchMock = vi.fn(async (input: string) => {
    calls.push(input);
    if (input.startsWith("/api/analytics/category-breakdown")) {
      return envelope({
        total_minor: 100_000,
        categories: [
          {
            category_id: MAKANAN,
            name: "Makanan",
            essential: true,
            amount_minor: 100_000,
            share: 1,
          },
        ],
      });
    }
    if (input.startsWith("/api/analytics/income-expense")) {
      return envelope({ buckets: [] });
    }
    if (input.startsWith("/api/analytics/sts-trend")) {
      return envelope({ points: [] });
    }
    if (input.startsWith("/api/analytics/heatmap")) {
      return envelope({ days: [] });
    }
    if (input.startsWith("/api/analytics/top-merchants")) {
      return envelope({
        merchants: [
          { merchant_id: KOPI, name: "Kopi Kenangan", amount_minor: 60_000, tx_count: 3 },
        ],
      });
    }
    if (input.startsWith("/api/analytics/essential-lifestyle")) {
      return envelope({ essential_minor: 0, lifestyle_minor: 0 });
    }
    throw new Error(`unstubbed request: ${input}`);
  });
  vi.stubGlobal("fetch", fetchMock);
  return calls;
}

function renderAnalytics(query: string) {
  search = new URLSearchParams(query);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AnalyticsPage />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  push.mockReset();
});

describe("runwayChartValue", () => {
  test("maps the infinite runway sentinel to the capped axis", () => {
    expect(runwayChartValue(0)).toBe(90);
  });

  test("keeps finite runway values unchanged", () => {
    expect(runwayChartValue(42)).toBe(42);
  });
});

describe("Analytics window", () => {
  test("every chart asks for the window in the URL, sts-trend included", async () => {
    const calls = stubFetch();
    renderAnalytics("period=last_month");

    await waitFor(() => expect(calls.length).toBe(6));
    const { from, to } = resolvePeriod({ preset: "last_month" });
    for (const url of calls) {
      expect(url).toContain(`from=${from}`);
      expect(url).toContain(`to=${to}`);
    }
    // The old trailing-day parameter is gone: sts-trend takes a range like the rest.
    expect(calls.find((url) => url.startsWith("/api/analytics/sts-trend"))).not.toMatch(/[?&]days=/);
  });

  test("a merchant bar opens that merchant's transactions over the same window", async () => {
    stubFetch();
    renderAnalytics("period=last_month");

    fireEvent.click(await screen.findByRole("button", { name: "Kopi Kenangan" }));

    expect(push).toHaveBeenCalledWith(`/transactions?period=last_month&merchant_id=${KOPI}`);
  });

  test("a custom window carries both dates into a category link", async () => {
    stubFetch();
    renderAnalytics("period=custom&from=2026-08-01&to=2026-08-31");

    const link = await screen.findByRole("link", { name: "Lihat transaksi Makanan" });
    expect(link.getAttribute("href")).toBe(
      `/transactions?period=custom&from=2026-08-01&to=2026-08-31&category_id=${MAKANAN}`,
    );
  });
});
