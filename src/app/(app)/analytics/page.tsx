"use client";

import { useCallback, useMemo, useState } from "react";
import type { EChartsOption } from "echarts";

import { CHART_COLORS, chartBase, jutaLabel, tokenPx } from "@/components/charts/echart";
import { ChartFrame } from "@/components/chart-frame";
import { FilterBar } from "@/components/filter-bar";
import { PageHeader } from "@/components/page-header";
import { SegmentedControl } from "@/components/segmented-control";
import { Button } from "@/components/ui/button";
import { useIsPhone, useMediaQuery } from "@/lib/use-media-query";
import {
  useAnalytics,
  type CategoryBreakdownData,
  type EssentialLifestyleData,
  type HeatmapData,
  type IncomeExpenseData,
  type StsTrendData,
  type TopMerchantsData,
} from "@/lib/api/hooks";
import { formatIDR } from "@/lib/money";

const RANGES = [
  { value: "7", label: "7 hari" },
  { value: "30", label: "30 hari" },
  { value: "90", label: "90 hari" },
];

const { INK, MUTED, BORDER, SAFE, WARN, OVER, SURFACE, CANVAS, SURFACE_300 } = CHART_COLORS;

export function runwayChartValue(runwayDays: number): number {
  return runwayDays === 0 ? 90 : runwayDays;
}

export default function AnalyticsPage() {
  const [rangeDays, setRangeDays] = useState<"7" | "30" | "90">("30");
  const [drilled, setDrilled] = useState<string | null>(null);
  // Column width, not the phone breakpoint: charts need ~768px to keep
  // their labels readable (DESIGN.md §8).
  const narrow = useMediaQuery("(max-width: 767px)");
  // The range control fills the toolbar on a phone; at ≥640px it hugs its
  // labels as before — stretching an auto-width track wraps them.
  const isPhone = useIsPhone();

  // Trailing-N-day window ending today, Asia/Jakarta.
  const range = useMemo(() => {
    const today = new Date();
    const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" });
    const to = fmt.format(today);
    const from = fmt.format(new Date(today.getTime() - (Number(rangeDays) - 1) * 86_400_000));
    return { from, to };
  }, [rangeDays]);

  const queryParams = { from: range.from, to: range.to };

  const breakdown = useAnalytics<CategoryBreakdownData>("category-breakdown", queryParams);
  const incomeExpense = useAnalytics<IncomeExpenseData>("income-expense", queryParams);
  const stsTrend = useAnalytics<StsTrendData>("sts-trend", { days: Number(rangeDays) });
  const heatmap = useAnalytics<HeatmapData>("heatmap", queryParams);
  const merchants = useAnalytics<TopMerchantsData>("top-merchants", { ...queryParams, limit: 8 });
  const essential = useAnalytics<EssentialLifestyleData>("essential-lifestyle", queryParams);

  const donutOption = useCallback(
    (data: CategoryBreakdownData) => categoryDonutOption(data, drilled, !narrow),
    [drilled, narrow],
  );
  const heatmapWindow = useCallback(
    (data: HeatmapData) => heatmapOption(data, narrow),
    [narrow],
  );
  const essentialPie = useCallback(
    (data: EssentialLifestyleData) => essentialOption(data, narrow),
    [narrow],
  );

  return (
    <>
      <PageHeader title="Analytics" />

      <FilterBar>
        <SegmentedControl
          aria-label="Rentang waktu"
          value={rangeDays}
          onValueChange={(value) => setRangeDays(value as "7" | "30" | "90")}
          options={RANGES}
          stretch={isPhone}
          className="w-full sm:w-auto"
        />
      </FilterBar>

      <div className="grid gap-2.5 py-2.5 md:grid-cols-2 xl:grid-cols-3">
        <ChartFrame
          title="Kategori"
          caption={drilled === null ? "klik irisan untuk detail" : undefined}
          action={
            drilled === null ? undefined : (
              <Button variant="ghost" size="sm" onClick={() => setDrilled(null)}>
                ← kembali
              </Button>
            )
          }
          query={breakdown}
          isEmpty={(data) => data.categories.length === 0}
          ariaSummary={(data) =>
            `Pengeluaran per kategori, total ${formatIDR(data.total_minor)}, terbesar ${
              data.categories[0]?.name ?? "—"
            }`
          }
          option={donutOption}
          onSelect={(name) => setDrilled((current) => (current === null ? name : null))}
        >
          {(data) => <CategoryLegend data={data} drilled={drilled} />}
        </ChartFrame>

        <ChartFrame
          title="Pemasukan vs Pengeluaran"
          caption="per minggu"
          query={incomeExpense}
          isEmpty={(data) => data.buckets.length === 0}
          ariaSummary={(data) =>
            `Pemasukan versus pengeluaran per minggu, ${data.buckets.length} minggu`
          }
          option={incomeExpenseOption}
        />

        <ChartFrame
          title="Safe-to-Spend & Runway"
          caption="STS kini, runway per hari"
          query={stsTrend}
          isEmpty={(data) => data.points.length === 0}
          ariaSummary={(data) =>
            `Tren Safe-to-Spend, terakhir ${formatIDR(
              data.points[data.points.length - 1]?.sts_minor ?? 0,
            )}`
          }
          option={stsOption}
        />

        <ChartFrame
          title="Heatmap harian"
          caption="pengeluaran per hari, anomali > 2σ"
          query={heatmap}
          isEmpty={(data) => data.days.length === 0}
          ariaSummary={(data) =>
            `Pengeluaran harian, ${data.days.filter((day) => day.anomaly).length} hari anomali`
          }
          option={heatmapWindow}
          height={narrow ? 140 : 256}
        />

        <ChartFrame
          title="Merchant teratas"
          caption="berdasarkan pengeluaran"
          query={merchants}
          isEmpty={(data) => data.merchants.length === 0}
          ariaSummary={(data) =>
            `Merchant teratas, terbesar ${data.merchants[0]?.name ?? "—"} ${formatIDR(
              data.merchants[0]?.amount_minor ?? 0,
            )}`
          }
          option={merchantsOption}
        />

        <ChartFrame
          title="Kebutuhan vs Gaya hidup"
          caption="periode terpilih"
          query={essential}
          isEmpty={(data) => data.essential_minor + data.lifestyle_minor === 0}
          ariaSummary={(data) =>
            `Kebutuhan ${formatIDR(data.essential_minor)}, gaya hidup ${formatIDR(
              data.lifestyle_minor,
            )}`
          }
          option={essentialPie}
        />
      </div>
    </>
  );
}

const SLICE_COLORS = [INK, MUTED, "#9b968e", "#c3bdb4", SAFE, WARN];

function drilledView(data: CategoryBreakdownData, drilled: string | null) {
  if (drilled !== null) {
    const parent = data.categories.find((node) => node.name === drilled);
    if (parent !== undefined && (parent.children?.length ?? 0) > 0) {
      return parent.children ?? [];
    }
  }
  return data.categories;
}

function categoryDonutOption(
  data: CategoryBreakdownData,
  drilled: string | null,
  inlineLabels: boolean,
): EChartsOption {
  const items = drilledView(data, drilled);
  return {
    ...chartBase(),
    tooltip: {
      ...chartBase().tooltip,
      trigger: "item",
      valueFormatter: (value) => formatIDR(Number(value)),
    },
    series: [
      {
        type: "pie",
        radius: ["55%", "82%"],
        center: ["50%", "52%"],
        itemStyle: { borderRadius: 4, borderColor: SURFACE, borderWidth: 2 },
        label: { show: inlineLabels, color: MUTED, fontSize: tokenPx("--text-label", 11) },
        labelLine: { show: inlineLabels, lineStyle: { color: BORDER } },
        data: items.map((node, index) => ({
          name: node.name,
          value: node.amount_minor,
          itemStyle: { color: SLICE_COLORS[index % SLICE_COLORS.length] },
        })),
      },
    ],
  };
}

function CategoryLegend({
  data,
  drilled,
}: {
  data: CategoryBreakdownData;
  drilled: string | null;
}) {
  const items = drilledView(data, drilled);
  return (
    <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 lg:hidden" aria-label="Kategori">
      {items.map((node, index) => (
        <li
          key={node.name}
          className="flex min-w-0 items-center gap-1 text-meta text-muted-foreground"
        >
          <span
            className="size-2 shrink-0 rounded-md"
            style={{ backgroundColor: SLICE_COLORS[index % SLICE_COLORS.length] }}
            aria-hidden="true"
          />
          <span className="truncate">{node.name}</span>
        </li>
      ))}
    </ul>
  );
}

// --------------------------------------------------------- line / bars

function incomeExpenseOption(data: IncomeExpenseData): EChartsOption {
  return {
    ...chartBase(),
    legend: {
      data: ["Masuk", "Keluar"],
      icon: "none",
      textStyle: { color: MUTED, fontSize: tokenPx("--text-label", 11) },
      top: 0,
    },

    xAxis: {
      ...chartBase().xAxis,
      data: data.buckets.map((bucket) => bucket.week_start),
    },
    series: [
      {
        name: "Masuk",
        type: "bar",
        data: data.buckets.map((bucket) => bucket.income_minor),
        itemStyle: { color: SAFE },
        barGap: "-100%",
        barWidth: "35%",
      },
      {
        name: "Keluar",
        type: "bar",
        data: data.buckets.map((bucket) => bucket.expense_minor),
        itemStyle: { color: OVER, opacity: 0.8 },
        barWidth: "35%",
      },
    ],
  };
}

function stsOption(data: StsTrendData): EChartsOption {
  const runwayByDate = new Map(data.points.map((point) => [point.date, point.runway_days]));
  return {

    ...chartBase(),
    legend: {
      data: ["STS", "Runway (hari)"],
      icon: "none",
      textStyle: { color: MUTED, fontSize: tokenPx("--text-label", 11) },
      top: 0,
    },

    tooltip: {
      ...chartBase().tooltip,
      trigger: "axis",
      formatter: (params) => {
        const entries = Array.isArray(params) ? params : [params];
        const title = entries[0]?.name ?? "";
        const lines = entries.map((entry) => {
          const value = Number(entry.value);
          const rawRunway = runwayByDate.get(String(title));
          const formatted =
            entry.seriesName === "Runway (hari)"
              ? rawRunway === 0
                ? "∞"
                : `${(rawRunway ?? value).toLocaleString("id-ID")} hari`
              : formatIDR(value);
          return `${entry.seriesName ?? ""}: ${formatted}`;
        });
        return [title, ...lines].join("<br/>");
      },

      },
    xAxis: {
      ...chartBase().xAxis,
      data: data.points.map((point) => point.date),
    },
    yAxis: [
      {
        type: "value",
        axisLine: { show: false },
        splitLine: { lineStyle: { color: BORDER, type: "dashed" } },
        axisLabel: { color: MUTED, fontSize: tokenPx("--text-label", 11) },
      },
      {
        type: "value",
        max: 90,
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: MUTED,
          fontSize: tokenPx("--text-label", 11),
          formatter: (value: number) => (value >= 90 ? "≥90" : `${value} hari`),
        },
      },
    ],
    series: [
      {
        name: "STS",
        type: "line",
        data: data.points.map((point) => point.sts_minor),
        symbol: "none",
        lineStyle: { color: SAFE, width: 2 },
      },
      {
        name: "Runway (hari)",
        type: "line",
        yAxisIndex: 1,
        data: data.points.map((point) => runwayChartValue(point.runway_days)),
        symbol: "none",
        lineStyle: { color: WARN, width: 1.5, type: "dashed" },
      },
    ],
  };
}

function heatmapOption(data: HeatmapData, narrow: boolean): EChartsOption {
  const points: [string, number][] = data.days.map((day) => [day.date, day.outflow_minor]);
  const anomalies = data.days.filter((day) => day.anomaly).map((day) => [day.date, day.outflow_minor]);
  return {
    ...chartBase(),
    grid: undefined as unknown as never,
    tooltip: {
      ...chartBase().tooltip,
      trigger: "item",
      position: "top",
      valueFormatter: (value) => formatIDR(Number(value)),
    },
    visualMap: {
      min: 0,
      max: Math.max(...data.days.map((day) => day.outflow_minor), 1),
      show: false,
      inRange: { color: [CANVAS, SURFACE_300, "rgba(196,122,18,0.45)", WARN] },
    },
    calendar: {
      // Below md the month grid is unreadable: show a trailing strip instead.
      range: [data.days[0]?.date ?? "1970-01-01", data.days[data.days.length - 1]?.date ?? "1970-01-01"],
      orient: "horizontal",
      // Phone: the strip has to fit a 304×140 canvas, so the day column
      // goes and the gutters shrink to what the month label needs. The
      // defaults (80px sides, 60px top) push the last weeks and the
      // bottom row outside the frame (DESIGN.md §8).
      ...(narrow ? { left: 28, right: 8, top: 26 } : {}),
      cellSize: narrow ? ["auto", 14] : ["auto", 18],
      dayLabel: { show: !narrow, color: MUTED, fontSize: 10 },
      itemStyle: { color: CANVAS, borderColor: BORDER, borderWidth: 3 },
      splitLine: { show: false },
      monthLabel: { color: MUTED, fontSize: tokenPx("--text-label", 11) },
      yearLabel: { show: false },
    },
    series: [
      {
        type: "heatmap",
        coordinateSystem: "calendar",
        data: points,
        itemStyle: { borderRadius: 4 },
      },
      {
        // Anomaly overlay: solid --over dots (DESIGN.md §4).
        type: "scatter",
        coordinateSystem: "calendar",
        symbolSize: 10,
        data: anomalies,
        itemStyle: { color: OVER },
        z: 3,
      },
    ],
  } as EChartsOption;
}


function merchantsOption(data: TopMerchantsData): EChartsOption {
  const sorted = [...data.merchants].reverse();
  return {
    ...chartBase(),
    grid: { left: 8, right: 24, top: 8, bottom: 8, containLabel: true },
    xAxis: {
      type: "value",
      axisLine: { show: false },
      splitLine: { lineStyle: { color: BORDER, type: "dashed" } },
      axisLabel: {
        color: MUTED,
        fontSize: tokenPx("--text-label", 11),
        formatter: (value: number) => jutaLabel(value),
      },
    },
    yAxis: {
      type: "category",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: MUTED, fontSize: tokenPx("--text-label", 11) },
      data: sorted.map((merchant) => merchant.name),
    },
    series: [
      {
        type: "bar",
        data: sorted.map((merchant) => merchant.amount_minor),
        itemStyle: { color: INK, borderRadius: [0, 4, 4, 0] },
        barWidth: "55%",
      },
    ],
  };
}

function essentialOption(data: EssentialLifestyleData, narrow: boolean): EChartsOption {
  return {
    ...chartBase(),
    tooltip: {
      ...chartBase().tooltip,
      trigger: "item",
      valueFormatter: (value) => formatIDR(Number(value)),
    },
    // Narrow: "Kebutuhan"/"Gaya hidup" do not fit beside a 328px pie, so
    // they move under it as a legend instead of clipping to "Keb…".
    legend: narrow
      ? { show: true, bottom: 0, icon: "circle", textStyle: { color: MUTED, fontSize: tokenPx("--text-meta", 12) } }
      : { show: false },
    series: [
      {
        type: "pie",
        radius: ["0%", "70%"],
        center: narrow ? ["50%", "44%"] : ["50%", "52%"],
        label: { show: !narrow, color: MUTED, fontSize: tokenPx("--text-label", 11) },
        data: [
          { name: "Kebutuhan", value: data.essential_minor, itemStyle: { color: SAFE } },
          { name: "Gaya hidup", value: data.lifestyle_minor, itemStyle: { color: WARN } },
        ],
      },
    ],
  };
}
