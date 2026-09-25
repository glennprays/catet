// @vitest-environment jsdom
import type { CSSProperties } from "react";
import type { EChartsOption } from "echarts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import AnalyticsPage, { runwayChartValue } from "./page";
import type * as EchartModule from "@/components/charts/echart";
import { resolvePeriod } from "@/lib/period";

const MAKANAN = "55555555-5555-4555-8555-555555555555";
const JAJAN = "66666666-6666-4666-8666-666666666666";
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
      <div role="group" aria-label="chart">
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
        total_minor: 200_000,
        categories: [
          {
            category_id: MAKANAN,
            name: "Makanan",
            essential: true,
            amount_minor: 150_000,
            share: 0.75,
            children: [
              {
                category_id: JAJAN,
                name: "Jajan",
                essential: false,
                amount_minor: 50_000,
                share: 0.25,
              },
            ],
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
    // `include_descendants` rides along: the ledger the user lands on has
    // to count the same subtree the donut just added up.
    expect(link.getAttribute("href")).toBe(
      `/transactions?period=custom&from=2026-08-01&to=2026-08-31&category_id=${MAKANAN}&include_descendants=true`,
    );
  });
});

describe("Analytics category ranking", () => {
  /** The ranked list, which the mock chart's slice buttons also live beside. */
  async function rankedList() {
    return within(await screen.findByRole("list", { name: "Peringkat kategori" }));
  }

  test("ranks the categories with their share, biggest first", async () => {
    stubFetch();
    renderAnalytics("period=30d");

    const rows = Array.from(
      (await rankedList()).getAllByRole("listitem").map((row) => row.textContent ?? ""),
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]).toContain("Makanan");
    expect(rows[0]).toContain("75% dari total");
    expect(rows[1]).toContain("Jajan");
    expect(rows[1]).toContain("25% dari total");
  });

  test("drilling into a parent swaps the list for its children", async () => {
    stubFetch();
    renderAnalytics("period=30d");

    // The row's title is the drill button, so the chart is not the only
    // way in. That button is named by its title plus caption, hence the
    // prefix match.
    fireEvent.click((await rankedList()).getByRole("button", { name: /^Makanan/ }));

    await waitFor(() => {
      expect(screen.getByText("dalam Makanan")).toBeDefined();
    });
    const list = await rankedList();
    expect(list.queryByRole("button", { name: /^Makanan/ })).toBeNull();
    // Jajan is a leaf: it has no drill button, only its transactions link.
    expect(list.queryByRole("button", { name: /^Jajan/ })).toBeNull();
    expect(list.getByRole("link", { name: "Lihat transaksi Jajan" })).toBeDefined();
  });

  test("a leaf's link carries the subtree flag for the child", async () => {
    stubFetch();
    renderAnalytics("period=30d");

    fireEvent.click((await rankedList()).getByRole("button", { name: /^Makanan/ }));

    const link = (await rankedList()).getByRole("link", { name: "Lihat transaksi Jajan" });
    const href = link.getAttribute("href") ?? "";
    expect(href).toContain(`category_id=${JAJAN}`);
    expect(href).toContain("include_descendants=true");
  });

  test("a slice click drills by id, and kembali comes back", async () => {
    stubFetch();
    renderAnalytics("period=30d");

    // The mock chart hands back `params.data`, which carries the id. The
    // Kategori chart is the first one on the page.
    const chart = within((await screen.findAllByRole("group", { name: "chart" }))[0]);
    fireEvent.click(chart.getByRole("button", { name: "Makanan" }));
    await waitFor(() => {
      expect(screen.getByText("dalam Makanan")).toBeDefined();
    });

    fireEvent.click(screen.getByRole("button", { name: "← kembali" }));
    await waitFor(() => {
      expect(screen.getByText("klik irisan untuk detail")).toBeDefined();
    });
  });
});
