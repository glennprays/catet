"use client";

import type { EChartsOption } from "echarts";
import dynamic from "next/dynamic";


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

/**
 * EChart is code-split: the echarts bundle is the heaviest thing the app
 * ships, and a tab that renders no chart must not wait for it. The
 * shimmer holds the card's height so nothing jumps when it lands.
 */
export const EChart = dynamic(() => import("./echart-impl"), {
  ssr: false,
  loading: () => <div className="catet-shimmer h-full w-full rounded-md" aria-hidden />,
});
