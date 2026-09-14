"use client";

import { useEffect, useMemo, useState } from "react";
import type { EChartsOption } from "echarts";

import { CHART_COLORS, EChart, chartBase, jutaLabel } from "@/components/charts/echart";

import { PageHeader } from "@/components/page-header";
import { QueryErrorState } from "@/components/empty-state";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  { days: "7", label: "7 hari" },
  { days: "30", label: "30 hari" },
  { days: "90", label: "90 hari" },
] as const;

const { INK, MUTED, BORDER, SAFE, WARN, OVER } = CHART_COLORS;
export function runwayChartValue(runwayDays: number): number {
  return runwayDays === 0 ? 90 : runwayDays;
}


export default function AnalyticsPage() {
  const [rangeDays, setRangeDays] = useState<"7" | "30" | "90">("30");

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

  return (
    <>
      <PageHeader
        title="Analytics"
        actions={
          <Tabs value={rangeDays} onValueChange={(value) => setRangeDays(value as "7" | "30" | "90")}>
            <TabsList>
              {RANGES.map((item) => (
                <TabsTrigger key={item.days} value={item.days}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
      />

      <div className="grid gap-4 py-4 lg:grid-cols-2">
        <ChartCard title="Kategori" caption={drillCaption(breakdown.data)}>
          {breakdown.isError ? (
            <QueryErrorState message="Kategori gagal dimuat." onRetry={() => breakdown.refetch()} />
          ) : breakdown.data !== undefined && breakdown.data.categories.length > 0 ? (
            <CategoryDonut data={breakdown.data} />
          ) : (
            <ChartEmpty />

          )}
        </ChartCard>

        <ChartCard title="Pemasukan vs Pengeluaran" caption="per minggu">
          {incomeExpense.isError ? (
            <QueryErrorState message="Arus kas gagal dimuat." onRetry={() => incomeExpense.refetch()} />
          ) : incomeExpense.data !== undefined && incomeExpense.data.buckets.length > 0 ? (
            <EChart className="h-64 w-full" option={incomeExpenseOption(incomeExpense.data)} />
          ) : (
            <ChartEmpty />

          )}
        </ChartCard>

        <ChartCard title="Safe-to-Spend & Runway" caption="STS kini, runway per hari">
          {stsTrend.isError ? (
            <QueryErrorState message="Safe-to-Spend gagal dimuat." onRetry={() => stsTrend.refetch()} />
          ) : stsTrend.data !== undefined && stsTrend.data.points.length > 0 ? (
            <EChart className="h-64 w-full" option={stsOption(stsTrend.data)} />
          ) : (
            <ChartEmpty />

          )}
        </ChartCard>

        <ChartCard title="Heatmap harian" caption="pengeluaran per hari, anomali > 2σ">
          {heatmap.isError ? (
            <QueryErrorState message="Heatmap gagal dimuat." onRetry={() => heatmap.refetch()} />
          ) : heatmap.data !== undefined && heatmap.data.days.length > 0 ? (
            <EChart className="h-64 w-full" option={heatmapOption(heatmap.data)} />
          ) : (
            <ChartEmpty />

          )}
        </ChartCard>

        <ChartCard title="Merchant teratas" caption="berdasarkan pengeluaran">
          {merchants.isError ? (
            <QueryErrorState message="Merchant gagal dimuat." onRetry={() => merchants.refetch()} />
          ) : merchants.data !== undefined && merchants.data.merchants.length > 0 ? (
            <EChart className="h-64 w-full" option={merchantsOption(merchants.data)} />
          ) : (
            <ChartEmpty />

          )}
        </ChartCard>

        <ChartCard title="Kebutuhan vs Gaya hidup" caption="periode terpilih">
          {essential.isError ? (
            <QueryErrorState message="Rincian kebutuhan gagal dimuat." onRetry={() => essential.refetch()} />
          ) : essential.data !== undefined &&
            essential.data.essential_minor + essential.data.lifestyle_minor > 0 ? (
            <EChart className="h-64 w-full" option={essentialOption(essential.data)} />
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>
      </div>
    </>
  );
}

function drillCaption(data: CategoryBreakdownData | undefined): string {
  return data === undefined ? "" : `total ${formatIDR(data.total_minor)} · klik irisan untuk detail`;
}

function ChartCard({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-surface p-3">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="text-[15px] font-medium text-ink">{title}</h2>
        {caption !== undefined && caption !== "" ? (
          <p className="text-xs text-muted-foreground">{caption}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ChartEmpty() {
  return (
    <div className="flex h-64 items-center justify-center text-[13px] text-muted-foreground">
      Belum ada data pada periode ini.
    </div>
  );
}

// --------------------------------------------------------------- donut

function CategoryDonut({ data }: { data: CategoryBreakdownData }) {
  const [drilled, setDrilled] = useState<string | null>(null);
  const [showInlineLabels, setShowInlineLabels] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setShowInlineLabels(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const view = useMemo(() => {
    if (drilled !== null) {
      const parent = data.categories.find((node) => node.name === drilled);
      if (parent !== undefined && (parent.children?.length ?? 0) > 0) {
        return { name: `${parent.name} — sub`, items: parent.children ?? [] };
      }
    }
    return { name: "Semua kategori", items: data.categories };
  }, [data, drilled]);

  const sliceColors = [INK, MUTED, "#9b968e", "#c3bdb4", SAFE, WARN];
  const option: EChartsOption = {
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
        itemStyle: { borderRadius: 4, borderColor: "#faf9f6", borderWidth: 2 },
        label: { show: showInlineLabels, color: MUTED, fontSize: 11 },
        labelLine: { show: showInlineLabels, lineStyle: { color: BORDER } },
        data: view.items.map((node, index) => ({
          name: node.name,
          value: node.amount_minor,
          itemStyle: { color: sliceColors[index % sliceColors.length] },
        })),
      },
    ],
  };

  return (
    <div className="relative">
      <EChart
        className="h-64 w-full"
        option={option}
        onSelect={(name) => setDrilled((current) => (current === null ? name : null))}
      />
      <button
        type="button"
        className="absolute inset-x-0 top-1/2 mx-auto w-fit -translate-y-1/2 text-center text-xs text-muted-foreground hover:text-ink"
        onClick={() => setDrilled(drilled === null ? data.categories[0]?.name ?? null : null)}
      >
        {drilled === null ? "klik irisan" : "← kembali"}
      </button>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 lg:hidden" aria-label="Kategori">
        {view.items.map((node, index) => {
          const color = sliceColors[index % sliceColors.length];
          return (
            <li key={node.name} className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <span className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: color }} aria-hidden="true" />
              <span className="truncate">{node.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// --------------------------------------------------------- line / bars

function incomeExpenseOption(data: IncomeExpenseData): EChartsOption {
  return {
    ...chartBase(),
    legend: {
      data: ["Masuk", "Keluar"],
      icon: "none",
      textStyle: { color: MUTED, fontSize: 11 },
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
      textStyle: { color: MUTED, fontSize: 11 },
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
        axisLabel: { color: MUTED, fontSize: 11 },
      },
      {
        type: "value",
        max: 90,
        axisLine: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: MUTED,
          fontSize: 11,
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

function heatmapOption(data: HeatmapData): EChartsOption {
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
      inRange: { color: ["#f2f1ee", "#e7e3dc", "rgba(196,122,18,0.45)", "#c47a12"] },
    },
    calendar: {
      range: [data.days[0]?.date ?? "1970-01-01", data.days[data.days.length - 1]?.date ?? "1970-01-01"],
      cellSize: ["auto", 18],
      itemStyle: { color: "#f2f1ee", borderColor: "rgba(38,35,29,0.10)", borderWidth: 3 },
      splitLine: { show: false },
      dayLabel: { color: MUTED, fontSize: 10 },
      monthLabel: { color: MUTED, fontSize: 11 },
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
        itemStyle: { color: "#cf3f52" },
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
        fontSize: 11,
        formatter: (value: number) => jutaLabel(value),
      },
    },
    yAxis: {
      type: "category",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: MUTED, fontSize: 11 },
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

function essentialOption(data: EssentialLifestyleData): EChartsOption {
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
        radius: ["0%", "70%"],
        center: ["50%", "52%"],
        label: { color: MUTED, fontSize: 11 },
        data: [
          { name: "Kebutuhan", value: data.essential_minor, itemStyle: { color: SAFE } },
          { name: "Gaya hidup", value: data.lifestyle_minor, itemStyle: { color: WARN } },
        ],
      },
    ],
  };
}
