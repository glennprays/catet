"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  Inbox,
  ListFilter,
  Plus,
  ReceiptText,
  Send,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { EmptyState, QueryErrorState } from "@/components/empty-state";
import { LedgerRow, LedgerRowSkeleton } from "@/components/ledger-row";
import { useCaptureSheet } from "@/components/capture-sheet-provider";
import { Button } from "@/components/ui/button";
import { useOverview, useSources } from "@/lib/api/hooks";
import { formatIDR } from "@/lib/money";

const QUICK_ACTIONS = [
  { key: "add", label: "Tambah", icon: Plus },
  { key: "transfer", label: "Transfer", icon: Send },
  { key: "bills", label: "Bayar tagihan", icon: CalendarClock, href: "/bills" },
  { key: "review", label: "Perbaiki kategori", icon: ListFilter, href: "/needs-review" },
  { key: "recap", label: "Rekap mingguan", icon: BarChart3, href: "/analytics" },
  { key: "all", label: "Lihat semua", icon: ReceiptText, href: "/transactions" },
] as const;

function stsTone(stsMinor: number): string {
  if (stsMinor > 0) {
    return "text-safe-text";
  }
  if (stsMinor === 0) {
    return "text-warn-text";
  }
  return "text-over-text";
}

export default function OverviewPage() {
  const overview = useOverview();
  const sources = useSources();
  const { openCreate, openEdit } = useCaptureSheet();

  const data = overview.data;
  const hasSources = (sources.data?.sources.length ?? 0) > 0;
  const totalSplit = (data?.essential_minor ?? 0) + (data?.lifestyle_minor ?? 0);

  return (
    <>
      <PageHeader title="Overview" />
      <div className="flex flex-col gap-6 py-4">
        <section aria-label="Safe-to-Spend" className="px-1">
          {overview.isPending ? (
            <div className="grid gap-2">
              <div className="h-4 w-24 catet-shimmer rounded-sm bg-surface-200" />
              <div className="h-10 w-64 catet-shimmer rounded-sm bg-surface-200" />
              <div className="h-4 w-72 catet-shimmer rounded-sm bg-surface-200" />
            </div>
          ) : overview.isError ? (
            <p className="text-[13px] text-over-text">Gagal memuat. Coba muat ulang.</p>
          ) : data === undefined ? null : (
            <>
              <p className="text-xs text-muted-foreground">Safe-to-Spend</p>
              <p className={`text-[40px] font-medium leading-[1.05] tracking-[-0.01em] tabular-nums ${stsTone(data.sts_minor)}`}>
                {formatIDR(data.sts_minor)}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs tabular-nums">
                <span className="text-muted-foreground">
                  Runway{" "}
                  <span className="text-ink-soft">
                    {data.runway_days === 0 ? "∞" : `${data.runway_days} hari`}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  Jatah harian <span className="text-ink-soft">{formatIDR(data.daily_allowance_minor)}</span>
                </span>
                <span className="text-warn-text">
                  Tereservasi besok {formatIDR(data.reserved_tomorrow_minor)}
                </span>
              </div>
              <div className="mt-3 h-px bg-border" />
            </>
          )}
        </section>

        <section aria-label="Aksi cepat">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {QUICK_ACTIONS.map((action) => {
              const inner = (
                <>
                  <span className="flex size-12 items-center justify-center rounded-md bg-surface-200 transition-colors group-hover:bg-surface-300">
                    <action.icon className="size-5 text-ink-soft" strokeWidth={1.75} />
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-ink">
                    {action.label}
                  </span>
                </>
              );
              const className =
                "group flex min-h-11 flex-col items-center justify-start gap-1.5 rounded-md p-1";
              if ("href" in action && action.href !== undefined) {
                return (
                  <Link key={action.key} href={action.href} className={className}>
                    {inner}
                  </Link>
                );
              }
              return (
                <button
                  key={action.key}
                  type="button"
                  className={className}
                  onClick={() => openCreate(action.key === "transfer" ? "transfer" : "expense")}
                >
                  {inner}
                </button>
              );
            })}
          </div>
        </section>

        <section aria-label="Aktivitas terbaru">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-[15px] font-medium text-ink">Transaksi terakhir</h2>
            <Link
              href="/transactions"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-ink"
            >
              Lihat semua <ArrowRight className="size-3" />
            </Link>
          </div>

          {!hasSources && sources.isSuccess ? (
            <EmptyState
              icon={Wallet}
              heading="Mulai dengan sumber dana"
              caption="Tambahkan rekening, e-wallet, atau dompet tunai dulu."
              action={
                <Button asChild variant="secondary">
                  <Link href="/sources">Tambah sumber</Link>
                </Button>
              }
            />
          ) : overview.isPending ? (
            <div>
              {Array.from({ length: 6 }, (_, index) => (
                <LedgerRowSkeleton key={index} />
              ))}
            </div>
          ) : overview.isError ? (
            <QueryErrorState
              message="Transaksi terakhir gagal dimuat."
              onRetry={() => overview.refetch()}
            />
          ) : data !== undefined && data.recent.length > 0 ? (
            <div>
              {data.recent.map((item) => (
                <LedgerRow key={item.transaction_id} item={item} onEdit={openEdit} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Inbox}
              heading="Belum ada transaksi"
              caption="Catat lewat WhatsApp atau tambah manual dari sini."
            />
          )}
        </section>

        {data !== undefined && totalSplit > 0 ? (
          <section aria-label="Kebutuhan vs gaya hidup" className="pb-2">
            <h2 className="mb-2 text-[15px] font-medium text-ink">Bulan ini</h2>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-surface-300" role="img" aria-label="Essential vs lifestyle split">
              <div
                className="bg-safe"
                style={{ width: `${Math.round((data.essential_minor / totalSplit) * 100)}%` }}
              />
              <div
                className="bg-warn"
                style={{ width: `${Math.round((data.lifestyle_minor / totalSplit) * 100)}%` }}
              />
            </div>
            <div className="mt-1.5 flex gap-4 text-xs tabular-nums">
              <span className="text-safe-text">Kebutuhan {formatIDR(data.essential_minor)}</span>
              <span className="text-warn-text">Gaya hidup {formatIDR(data.lifestyle_minor)}</span>
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
