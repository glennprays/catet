"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";

import { chartBase, EChart } from "@/components/charts/echart";

/**
 * Axis-less trend line for a hero figure: direction only, no reading of
 * values off it (the delta beside it carries the number). Wrapped in a
 * `role="img"` so the shape is never colour-only (WCAG 1.1.1).
 */
export function Sparkline({
  points,
  color,
  height = 72,
  ariaLabel,
}: {
  points: number[];
  color: string;
  height?: number;
  ariaLabel: string;
}) {
  const option = useMemo<EChartsOption>(
    () => ({
      ...chartBase(),
      grid: { left: 0, right: 0, top: 4, bottom: 0 },
      xAxis: { type: "category", show: false, data: points.map((_, index) => index) },
      yAxis: { type: "value", show: false, min: "dataMin", max: "dataMax" },
      tooltip: { show: false },
      series: [
        {
          type: "line",
          data: points,
          showSymbol: false,
          smooth: false,
          lineStyle: { width: 2, color },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${color}2e` },
                { offset: 1, color: `${color}00` },
              ],
            },
          },
        },
      ],
    }),
    [points, color],
  );

  return (
    <div role="img" aria-label={ariaLabel}>
      <EChart option={option} className="w-full" style={{ height }} />
    </div>
  );
}
