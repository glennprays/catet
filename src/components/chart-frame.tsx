"use client";

import { useMemo, type ReactNode } from "react";
import type { EChartsOption } from "echarts";

import { EChart } from "@/components/charts/echart";
import { Panel } from "@/components/panel";
import { QueryBoundary, type BoundaryQuery } from "@/components/query-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsPhone } from "@/lib/use-media-query";

/**
 * One frame for every chart: panel, truthful branch order, memoized
 * option, and a text alternative so the chart is not colour-only
 * (WCAG 1.1.1). Loading is a skeleton, never "Belum ada data".
 *
 * The chart stretches to fill the grid cell (`height` is the *floor*, not a
 * fixed size), so an equal-height row of cards is filled by chart, not by
 * whitespace under it (DESIGN.md §5 fill rule).
 */
export function ChartFrame<T>({
  title,
  caption,
  action,
  query,
  isEmpty,
  ariaSummary,
  option,
  height = 224,
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
  onSelect?: (name: string, item?: unknown) => void;
  children?: (data: T) => ReactNode;
}) {
  // Panel's header is one line and truncates, which eats chart captions at
  // 328px ("STS kini, runway per hari"). Below 640px the caption leaves the
  // header and becomes its own line; desktop keeps the baseline-riding
  // caption exactly as before (DESIGN.md §8).
  const isPhone = useIsPhone();
  const inlineCaption = isPhone ? undefined : caption;

  return (
    <Panel
      title={title}
      caption={inlineCaption}
      action={action}
      density="compact"
      className="flex h-full flex-col"
    >
      {isPhone && caption !== undefined ? (
        <p className="-mt-1 mb-2 text-meta text-ash">{caption}</p>
      ) : null}
      <QueryBoundary
        query={query}
        isEmpty={isEmpty}
        errorMessage={`${title} gagal dimuat.`}
        skeleton={<Skeleton className="w-full flex-1 rounded-md" style={{ minHeight: height }} />}
        empty={
          <div
            className="flex flex-1 items-center justify-center text-meta text-ash"
            style={{ minHeight: height }}
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
  onSelect?: (name: string, item?: unknown) => void;
}) {
  const resolved = useMemo(() => option(data), [data, option]);
  return (
    <div role="img" aria-label={ariaSummary(data)} className="flex min-h-0 flex-1 flex-col">
      <EChart
        option={resolved}
        onSelect={onSelect}
        className="w-full flex-1"
        style={{ minHeight: height }}
      />
    </div>
  );
}
