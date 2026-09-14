"use client";

import { init, type ECharts, type EChartsOption } from "echarts";
import { useEffect, useRef } from "react";

// DESIGN.md §4 chart theme: dashed alpha-ink gridlines (horizontal
// only), muted caption axis text, tabular ticks, sheet-style tooltip.
const INK = "#454139";
const MUTED = "#6f6a62";
const BORDER = "rgba(38,35,29,0.10)";
const SAFE = "#178269";
const WARN = "#c47a12";
const OVER = "#cf3f52";

export function chartBase(): EChartsOption {
  return {
    textStyle: { fontFamily: "var(--font-hanken), 'Hanken Grotesk', sans-serif" },
    grid: { left: 8, right: 8, top: 16, bottom: 8, containLabel: true },
    xAxis: {
      type: "category",
      axisLine: { lineStyle: { color: BORDER } },
      axisTick: { show: false },
      axisLabel: { color: MUTED, fontSize: 11 },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      splitLine: { lineStyle: { color: BORDER, type: "dashed" } },
      axisLabel: {
        color: MUTED,
        fontSize: 11,
        formatter: (value: number) => jutaLabel(value),
      },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#fffefc",
      borderColor: BORDER,
      borderWidth: 1,
      textStyle: { color: "#26231d", fontSize: 12 },
      valueFormatter: (value) => formatRupiah(Number(value)),
    },
  };
}

function formatRupiah(minor: number): string {
  const abs = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(
    Math.abs(minor),
  );
  return minor < 0 ? `−Rp${abs}` : `Rp${abs}`;
}

export function jutaLabel(minor: number): string {
  if (minor === 0) {
    return "0";
  }
  const juta = minor / 1_000_000;
  if (Math.abs(juta) >= 1) {
    return `${juta.toLocaleString("id-ID", { maximumFractionDigits: 1 })}jt`;
  }
  const ribu = minor / 1_000;
  return `${ribu.toLocaleString("id-ID", { maximumFractionDigits: 0 })}rb`;
}

export const CHART_COLORS = { INK, MUTED, BORDER, SAFE, WARN, OVER };

/**
 * EChart: thin React wrapper over the full echarts bundle — init once,
 * ResizeObserver for fluid width, dispose on unmount, notMerge on
 * option change.
 */
export function EChart({
  option,
  onSelect,
  className,
}: {
  option: EChartsOption;
  onSelect?: (name: string) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ECharts | null>(null);
  const selectRef = useRef(onSelect);
  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) {
      return;
    }
    const chart = init(container, undefined, { renderer: "canvas" });
    chartRef.current = chart;

    chart.on("click", (params) => {
      selectRef.current?.(String(params.name ?? ""));
    });

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  return <div ref={containerRef} className={className ?? "h-64 w-full"} />;
}
