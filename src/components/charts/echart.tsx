"use client";

import { init, type ECharts, type EChartsOption } from "echarts";
import { useEffect, useRef, type CSSProperties } from "react";

/*
 * DESIGN.md §4 chart theme: dashed alpha-ink gridlines, muted caption
 * axis text, sheet-style tooltip. Colours come from the CSS tokens at
 * runtime so the chart palette cannot drift from the design tokens;
 * the literals are the SSR fallback only.
 */
function token(name: string, fallback: string): string {
  if (typeof document === "undefined") {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value === "" ? fallback : value;
}

const INK = token("--ink-soft", "#454139");
const MUTED = token("--muted-foreground", "#6f6a62");
const BORDER = token("--border", "rgba(38,35,29,0.10)");
const SAFE = token("--safe", "#178269");
const WARN = token("--warn", "#c47a12");
const OVER = token("--over", "#cf3f52");
const SHEET = token("--sheet", "#fffefc");
const CANVAS = token("--canvas", "#f2f1ee");
const SURFACE_300 = token("--surface-300", "#e7e3dc");

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
      backgroundColor: SHEET,
      borderColor: BORDER,
      borderWidth: 1,
      textStyle: { color: token("--ink", "#26231d"), fontSize: 12 },
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

export const CHART_COLORS = { INK, MUTED, BORDER, SAFE, WARN, OVER, SHEET, CANVAS, SURFACE_300 };

/**
 * EChart: thin React wrapper over the full echarts bundle — init once,
 * ResizeObserver for fluid width, dispose on unmount, notMerge on
 * option change.
 */
export function EChart({
  option,
  onSelect,
  className,
  style,
}: {
  option: EChartsOption;
  onSelect?: (name: string) => void;
  className?: string;
  style?: CSSProperties;
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
    // SVG keeps the hairline geometry crisp and text selectable.
    const chart = init(container, undefined, { renderer: "svg" });
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
    chartRef.current?.setOption(option, { notMerge: true });
  }, [option]);

  return <div ref={containerRef} className={className ?? "h-64 w-full"} style={style} />;
}
