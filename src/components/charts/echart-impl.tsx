"use client";

import { init, type ECharts, type EChartsOption } from "echarts";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";

import { MASKED_TICK, usePrivacy } from "@/components/privacy-provider";
import { cn } from "@/lib/utils";

/*
 * The echarts bundle lives here and nowhere else: `echart.tsx` loads this
 * module lazily, so a page that renders no chart never pays for it and the
 * shell paints before the chart code is even fetched.
 */

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
export default function EChartImpl({
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
