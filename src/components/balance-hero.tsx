"use client";

import { CHART_COLORS } from "@/components/charts/echart";
import { Metric } from "@/components/metric";
import { MoneyText } from "@/components/money-text";
import { useFormatIDR } from "@/components/privacy-provider";
import { Sparkline } from "@/components/sparkline";
import { StatusBadge } from "@/components/status-badge";
import { Well } from "@/components/well";
import type { BoundaryQuery } from "@/components/query-boundary";
import { formatIDR } from "@/lib/money";
import { shortDateLabel, timeLabel } from "@/lib/time";
import type { Overview, StsTrendData } from "@/lib/api/hooks";

function stsTone(stsMinor: number): "safe" | "warn" | "over" {
  if (stsMinor > 0) {
    return "safe";
  }
  return stsMinor === 0 ? "warn" : "over";
}

const STS_LABEL: Record<"safe" | "warn" | "over", string> = {
  safe: "Aman",
  warn: "Tipis",
  over: "Minus",
};

/**
 * The one hero on the product: Safe-to-Spend at 32px with its inputs
 * spelled out, its four derived figures demoted into a well, and 30
 * days of direction beside it. Everything else on the Overview is a
 * 13px list — that contrast *is* the hierarchy (DESIGN.md §4).
 *
 * The two panes and the metric strip split on the *card's* width, not the
 * viewport's (DESIGN.md §4 Cards): the same card is 1040px wide on Overview
 * and 440px in the landing hero, and a viewport breakpoint cannot tell those
 * apart. `@container` therefore sits on a wrapper — a container query never
 * matches on the element that declares the container.
 */
export function BalanceHero({
  overview,
  trend,
  updatedAt,
  stale,
}: {
  overview: Overview;
  trend: BoundaryQuery<StsTrendData>;
  updatedAt: number;
  stale: boolean;
}) {
  const format = useFormatIDR();
  const tone = stsTone(overview.sts_minor);
  const points = trend.data?.points ?? [];
  const enoughTrend = points.length >= 2;
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <div className="@container h-full min-w-0">
      <section
        aria-label="Safe-to-Spend"
        className="grid h-full min-w-0 rounded-lg bg-surface shadow-card @3xl:grid-cols-[minmax(0,1fr)_260px]"
      >
        <div className="@container/pane flex min-w-0 flex-col p-3.5">
          <div className="flex items-center gap-2">
            <span className="text-label font-medium uppercase text-ash">
              Safe-to-Spend
            </span>
            <StatusBadge tone={tone}>{STS_LABEL[tone]}</StatusBadge>
          </div>

          <MoneyText
            minor={overview.sts_minor}
            size="xl"
            tone="neutral"
            className="mt-1 block font-semibold"
          />

          <p className="mt-1 text-meta text-ash">
            Tersedia {format(overview.available_minor)} − Tereservasi{" "}
            {format(overview.reserved_minor)}
            {stale ? ` · diperbarui ${timeLabel(updatedAt)} WIB` : ""}
          </p>

          <Well className="mt-auto grid grid-cols-2 gap-3 pt-3 @md/pane:grid-cols-4">
            <Metric
              label="Runway"
              value={overview.runway_days === 0 ? "∞" : `${overview.runway_days} hari`}
            />
            <Metric
              label="Jatah harian"
              value={
                <MoneyText
                  minor={overview.daily_allowance_minor}
                  size="md"
                  tone="neutral"
                  className="font-semibold"
                />
              }
            />
            <Metric
              label="Tereservasi besok"
              value={
                <MoneyText
                  minor={overview.reserved_tomorrow_minor}
                  size="md"
                  tone={overview.reserved_tomorrow_minor > 0 ? "warn" : "neutral"}
                  className="font-semibold"
                />
              }
            />
            <Metric
              label="Kebutuhan · Gaya hidup"
              value={`${format(overview.essential_minor)} · ${format(overview.lifestyle_minor)}`}
              hint="porsi pengeluaran"
            />
          </Well>
        </div>

        <div className="min-w-0 border-t border-border p-3.5 @3xl:border-t-0 @3xl:border-l">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-label font-medium uppercase text-ash">
              Tren 30 hari
            </span>
            {enoughTrend ? (
              <MoneyText minor={last.sts_minor - first.sts_minor} signed size="xs" tone="auto" />
            ) : null}
          </div>

          {trend.isPending ? (
            <div className="catet-shimmer mt-2 h-[72px] rounded-md" />
          ) : trend.isError || !enoughTrend ? (
            <p className="mt-2 text-meta text-ash">Belum ada tren.</p>
          ) : (
            <>
              <Sparkline
                points={points.map((point) => point.sts_minor)}
                color={CHART_COLORS.PRIMARY}
                height={72}
                ariaLabel={`Safe-to-Spend 30 hari, dari ${formatIDR(first.sts_minor)} ke ${formatIDR(
                  last.sts_minor,
                )}`}
              />
              <div className="flex justify-between text-[10px] text-ash">
                <span>{shortDateLabel(first.date)}</span>
                <span>{shortDateLabel(last.date)}</span>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
