"use client";

import { useMemo, type ReactNode } from "react";
import type { EChartsOption } from "echarts";

import { EChart } from "@/components/charts/echart";
import { Panel } from "@/components/panel";
import { QueryBoundary, type BoundaryQuery } from "@/components/query-boundary";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * One frame for every chart: panel, truthful branch order, memoized
 * option, and a text alternative so the chart is not colour-only
 * (WCAG 1.1.1). Loading is a skeleton, never "Belum ada data".
 */
export function ChartFrame<T>({
  title,
  caption,
  action,
  query,
  isEmpty,
  ariaSummary,
  option,
  height = 256,
  onSelect,
  children,
}: {
  title: string;
  caption?: string;
  action?: ReactNode;
  query: BoundaryQuery<T>;
  isEmpty: (data: T) => boolean;
  ariaSummary: (data: T) => string;
  option: (data: T) => EChartsOption;
  height?: number;
  onSelect?: (name: string) => void;
  children?: (data: T) => ReactNode;
}) {
  return (
    <Panel title={title} caption={caption} action={action} density="compact">
      <QueryBoundary
        query={query}
        isEmpty={isEmpty}
        errorMessage={`${title} gagal dimuat.`}
        skeleton={<Skeleton className="w-full rounded-md" style={{ height }} />}
        empty={
          <div
            className="flex items-center justify-center text-[13px] text-muted-foreground"
            style={{ height }}
          >
            Belum ada data pada periode ini.
          </div>
        }
      >
        {(data) => (
          <>
            <ChartBody
              data={data}
              option={option}
              ariaSummary={ariaSummary}
              height={height}
              onSelect={onSelect}
            />
            {children?.(data)}
          </>
        )}
      </QueryBoundary>
    </Panel>
  );
}

function ChartBody<T>({
  data,
  option,
  ariaSummary,
  height,
  onSelect,
}: {
  data: T;
  option: (data: T) => EChartsOption;
  ariaSummary: (data: T) => string;
  height: number;
  onSelect?: (name: string) => void;
}) {
  const resolved = useMemo(() => option(data), [data, option]);
  return (
    <div role="img" aria-label={ariaSummary(data)}>
      <EChart option={resolved} onSelect={onSelect} className="w-full" style={{ height }} />
    </div>
  );
}
