"use client";

import { init, type ECharts, type EChartsOption } from "echarts";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";

import { MASKED_TICK, usePrivacy } from "@/components/privacy-provider";
import { cn } from "@/lib/utils";

/*
 * DESIGN.md §4 chart theme: dashed gridlines, muted caption axis text,
 * white card tooltip. Colours come from the CSS tokens at runtime so the
 * chart palette cannot drift from the design tokens; the literals are the
 * SSR fallback only. --primary is never a series colour (DESIGN.md §9).
 */
function token(name: string, fallback: string): string {
  if (typeof document === "undefined") {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value === "" ? fallback : value;
}

/*
 * Font sizes come from the --text-* tokens, which change under 640px
 * (DESIGN.md §3). Read per call — chartBase() runs on every option build,
 * so a resize across the breakpoint picks the new value up.
 */
export function tokenPx(name: string, fallback: number): number {
  if (typeof document === "undefined") {
    return fallback;
  }
  const parsed = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(name),
  );
  return Number.isFinite(parsed) ? parsed : fallback;
}

const INK = token("--ink-soft", "#374151");
const MUTED = token("--muted-foreground", "#5b616e");
const BORDER = token("--border", "#e5e7eb");
const SAFE = token("--safe", "#05b169");
const WARN = token("--warn", "#f0ad4e");
const OVER = token("--over", "#df2935");
const SURFACE = token("--surface", "#ffffff");
const CANVAS = token("--canvas", "#f9fafb");
const SURFACE_300 = token("--surface-300", "#e5e7eb");
// --primary is a series colour in exactly one place: the Safe-to-Spend
// sparkline in BalanceHero (DESIGN.md §2 "Chart palette" exception).
const PRIMARY = token("--primary", "#0052ff");

export function chartBase(): EChartsOption {
  return {
    textStyle: { fontFamily: "var(--font-inter), Inter, sans-serif" },
    grid: { left: 8, right: 8, top: 16, bottom: 8, containLabel: true },
    xAxis: {
      type: "category",
      axisLine: { lineStyle: { color: BORDER } },
      axisTick: { show: false },
      axisLabel: { color: MUTED, fontSize: tokenPx("--text-label", 11) },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      splitLine: { lineStyle: { color: BORDER, type: "dashed" } },
      axisLabel: {
        color: MUTED,
        fontSize: tokenPx("--text-label", 11),
        formatter: (value: number) => jutaLabel(value),
      },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: SURFACE,
      borderColor: BORDER,
      borderWidth: 1,
      textStyle: { color: token("--ink", "#050f1a"), fontSize: tokenPx("--text-meta", 12) },
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

export const CHART_COLORS = {
  INK,
  MUTED,
  BORDER,
  SAFE,
  WARN,
  OVER,
  SURFACE,
  CANVAS,
  SURFACE_300,
  PRIMARY,
};

type AxisLike = { type?: string; axisLabel?: Record<string, unknown> };

function maskAxis(axis: unknown): unknown {
  if (axis === null || typeof axis !== "object") {
    return axis;
  }
  const candidate = axis as AxisLike;
  // Category axes carry names (merchants, dates, categories), never money.
  if (candidate.type !== "value") {
    return axis;
  }
  return {
    ...candidate,
    axisLabel: { ...candidate.axisLabel, formatter: () => MASKED_TICK },
  };
}

function maskAxes(axes: unknown): unknown {
  return Array.isArray(axes) ? axes.map(maskAxis) : maskAxis(axes);
}

function maskTooltip(tooltip: unknown): unknown {
  if (Array.isArray(tooltip)) {
    return tooltip.map((entry) => ({ ...(entry as object), show: false }));
  }
  return { ...((tooltip ?? {}) as object), show: false };
}

/**
 * Privacy mode: value-axis ticks become "•••" and tooltips are disabled;
 * series geometry is untouched, so the shape of the month still reads
 * (DESIGN.md §4 Privacy mode). The runway axis is a value axis too and is
 * masked with the rest — one rule beats a money/non-money taxonomy.
 */
function maskOption(option: EChartsOption): EChartsOption {
  const masked: EChartsOption = {
    ...option,
    tooltip: maskTooltip(option.tooltip) as EChartsOption["tooltip"],
  };
  if (option.xAxis !== undefined) {
    masked.xAxis = maskAxes(option.xAxis) as EChartsOption["xAxis"];
  }
  if (option.yAxis !== undefined) {
    masked.yAxis = maskAxes(option.yAxis) as EChartsOption["yAxis"];
  }
  return masked;
}

/**
 * EChart: thin React wrapper over the full echarts bundle — init once,
 * ResizeObserver for fluid width, dispose on unmount, notMerge on
 * option change.
 *
 * `min-w-0 overflow-hidden` is load-bearing: the rendered SVG carries an
 * explicit pixel width, so inside an auto-sized grid track it would feed its
 * own width back into the track and the card would grow past the viewport.
 * Clipping the container zeroes that intrinsic contribution and lets the
 * ResizeObserver settle on the real available width.
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
  const { masked } = usePrivacy();
  const resolved = useMemo(() => (masked ? maskOption(option) : option), [option, masked]);
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
    chartRef.current?.setOption(resolved, { notMerge: true });
  }, [resolved]);

  return (
    <div
      ref={containerRef}
      className={cn("min-w-0 overflow-hidden", className ?? "h-64 w-full")}
      style={style}
    />
  );
}
