"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";

import { chartBase, CHART_COLORS, EChart } from "@/components/charts/echart";
import { Metric } from "@/components/metric";
import { MoneyText } from "@/components/money-text";
import { Panel } from "@/components/panel";
import { QueryBoundary, type BoundaryQuery } from "@/components/query-boundary";
import { formatIDR } from "@/lib/money";
import { formatJakartaDate } from "@/lib/time";
import type { IncomeExpenseData } from "@/lib/api/hooks";

/**
 * "What changed" as money in versus money out. Three figures answer it
 * in text; the weekly bars only show the shape, which is why they are
 * axis-light (DESIGN.md §4 "Charts"). The bars stretch to fill whatever
 * height the Overview grid row gives the card (§5 fill rule) with 120px as
 * the floor — dead space under a module is a bug.
 */
export function CashflowCard({ query }: { query: BoundaryQuery<IncomeExpenseData> }) {
  return (
    <Panel
      className="flex h-full flex-col"
      density="list"
      title="Arus kas"
      caption="30 hari terakhir"
    >
      <QueryBoundary
        query={query}
        isEmpty={(data) => data.buckets.length === 0}
        errorMessage="Arus kas gagal dimuat."
        skeleton={<div className="catet-shimmer m-3 h-[132px] rounded-md" />}
        empty={<p className="p-4 text-meta text-ash">Belum ada arus kas 30 hari terakhir.</p>}
      >
        {(data) => <CashflowBody data={data} />}
      </QueryBoundary>
    </Panel>
  );
}

function CashflowBody({ data }: { data: IncomeExpenseData }) {
  const income = data.buckets.reduce((sum, bucket) => sum + bucket.income_minor, 0);
  const expense = data.buckets.reduce((sum, bucket) => sum + bucket.expense_minor, 0);
  const net = income - expense;

  const option = useMemo<EChartsOption>(
    () => ({
      ...chartBase(),
      grid: { left: 8, right: 8, top: 4, bottom: 18 },
      xAxis: {
        type: "category",
        data: data.buckets.map((bucket) =>
          formatJakartaDate(bucket.week_start, { day: "numeric", month: "short" }),
        ),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { fontSize: 10, color: CHART_COLORS.MUTED },
      },
      yAxis: { type: "value", show: false },
      tooltip: {
        trigger: "axis",
        backgroundColor: CHART_COLORS.SURFACE,
        borderColor: CHART_COLORS.BORDER,
        borderWidth: 1,
        textStyle: { fontSize: 12 },
        valueFormatter: (value) => formatIDR(Number(value)),
      },
      series: [
        {
          name: "Masuk",
          type: "bar",
          data: data.buckets.map((bucket) => bucket.income_minor),
          barWidth: 8,
          barGap: "20%",
          itemStyle: { color: CHART_COLORS.SAFE, borderRadius: [2, 2, 0, 0] },
        },
        {
          name: "Keluar",
          type: "bar",
          data: data.buckets.map((bucket) => bucket.expense_minor),
          barWidth: 8,
          itemStyle: { color: CHART_COLORS.OVER, borderRadius: [2, 2, 0, 0] },
        },
      ],
    }),
    [data],
  );

  return (
    <>
      <div className="grid grid-cols-3 gap-3 px-4 py-3">
        <Metric
          label="Masuk"
          value={
            <MoneyText minor={income} signed size="md" tone="safe" className="font-semibold" />
          }
        />
        <Metric
          label="Keluar"
          value={<MoneyText minor={-expense} size="md" tone="neutral" className="font-semibold" />}
        />
        <Metric
          label="Bersih"
          value={<MoneyText minor={net} signed size="md" tone="auto" className="font-semibold" />}
        />
      </div>
      <div
        role="img"
        aria-label={`Arus kas mingguan: masuk ${formatIDR(income)}, keluar ${formatIDR(expense)}`}
        className="min-h-[120px] flex-1"
      >
        <EChart option={option} className="size-full" />
      </div>
    </>
  );
}
