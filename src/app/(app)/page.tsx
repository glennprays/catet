"use client";

import Link from "next/link";
import { ArrowRight, Inbox, Plus, Send, Wallet } from "lucide-react";

import { AttentionStrip, type AttentionItem } from "@/components/attention-strip";
import { EmptyState, QueryErrorState } from "@/components/empty-state";
import { LedgerRow, LedgerRowSkeleton } from "@/components/ledger-row";
import { MoneyText } from "@/components/money-text";
import { PageHeader } from "@/components/page-header";
import { SectionHeader } from "@/components/section-header";
import { useCaptureSheet } from "@/components/capture-sheet-provider";
import { Button } from "@/components/ui/button";
import {
  useBills,
  useBudgets,
  useOverview,
  useSources,
  useSourceTypeMap,
} from "@/lib/api/hooks";
import { formatIDR } from "@/lib/money";
import { daysUntilJakarta, todayJakartaKey } from "@/lib/time";

function stsTone(stsMinor: number): "safe" | "warn" | "over" {
  if (stsMinor > 0) {
    return "safe";
  }
  return stsMinor === 0 ? "warn" : "over";
}

/**
 * Overview answers, in order: what is safe to spend, what needs me,
 * what changed. Navigation duplicates (the old tile grid) and the
 * Analytics split bar are gone — they pushed the ledger off the fold.
 */
export default function OverviewPage() {
  const overview = useOverview();
  const sources = useSources();
  const sourceTypes = useSourceTypeMap();
  const bills = useBills();
  const budgets = useBudgets(todayJakartaKey().slice(0, 7));
  const { openCreate, openDetail } = useCaptureSheet();

  const data = overview.data;
  const hasSources = (sources.data?.sources.length ?? 0) > 0;

  return (
    <>
      <PageHeader
        title="Overview"
        actions={
          <>
            <Button variant="secondary" onClick={() => openCreate("transfer")}>
              <Send className="size-4" /> Transfer
            </Button>
            <Button onClick={() => openCreate()}>
              <Plus className="size-4" /> Tambah
            </Button>
          </>
        }
      />

      <div className="grid gap-6 py-4">
        <section aria-label="Safe-to-Spend">
          {overview.isPending ? (
            <div className="grid gap-2">
              <div className="catet-shimmer h-4 w-24 rounded-sm" />
              <div className="catet-shimmer h-10 w-64 rounded-sm" />
              <div className="catet-shimmer h-4 w-72 rounded-sm" />
            </div>
          ) : overview.isError || data === undefined ? (
            <QueryErrorState
              message="Safe-to-Spend gagal dimuat."
              onRetry={() => overview.refetch()}
            />
          ) : (
            <>
              <p className="text-xs text-muted-foreground">Safe-to-Spend</p>
              <MoneyText minor={data.sts_minor} size="xl" tone={stsTone(data.sts_minor)} />
              <p className="mt-1 text-[13px] text-muted-foreground">
                Tersedia <MoneyText minor={data.available_minor} size="sm" tone="neutral" /> −
                Tereservasi <MoneyText minor={data.reserved_minor} size="sm" tone="muted" />
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-xs tabular-nums">
                <span className="text-muted-foreground">
                  Runway{" "}
                  <span className="text-ink-soft">
                    {data.runway_days === 0 ? "∞" : `${data.runway_days} hari`}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  Jatah harian{" "}
                  <span className="text-ink-soft">{formatIDR(data.daily_allowance_minor)}</span>
                </span>
                <span
                  className={
                    data.reserved_tomorrow_minor > 0 ? "text-warn-text" : "text-muted-foreground"
                  }
                >
                  Tereservasi besok {formatIDR(data.reserved_tomorrow_minor)}
                </span>
              </div>
            </>
          )}
        </section>

        {data === undefined ? null : (
          <section aria-label="Perlu perhatian">
            <AttentionStrip
              items={attentionItems({
                badges: data.badges,
                bills: bills.data?.bills,
                budgets: budgets.data?.budgets,
              })}
            />
          </section>
        )}

        <section aria-label="Aktivitas terbaru">
          <SectionHeader
            title="Transaksi terakhir"
            action={
              <Link
                href="/transactions"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-ink"
              >
                Lihat semua <ArrowRight className="size-3" />
              </Link>
            }
          />

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
              {Array.from({ length: 8 }, (_, index) => (
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
              {data.recent.slice(0, 8).map((item) => (
                <LedgerRow
                  key={item.transaction_id}
                  item={item}
                  onOpen={() => openDetail(item.transaction_id)}
                  sourceType={sourceTypes.get(item.source_id)}
                />
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
      </div>
    </>
  );
}

type Badges = { needs_review: number; hold_queue: number };
type Bill = { name: string; next_due_date: string; active: boolean };
type Budget = { spent_minor: number; amount_minor: number };

/**
 * Bills/budgets failing is not fatal here: those items drop out, the
 * strip still tells the truth about what it does know.
 */
function attentionItems({
  badges,
  bills,
  budgets,
}: {
  badges: Badges;
  bills: Bill[] | undefined;
  budgets: Budget[] | undefined;
}): AttentionItem[] {
  const items: AttentionItem[] = [];

  if (badges.hold_queue > 0) {
    items.push({
      label: `${badges.hold_queue} aksi bot menunggu konfirmasi`,
      href: "/inbox",
      tone: "over",
    });
  }
  if (badges.needs_review > 0) {
    items.push({
      label: `${badges.needs_review} transaksi perlu kategori`,
      href: "/inbox",
      tone: "warn",
    });
  }

  const nextBill = (bills ?? [])
    .filter((bill) => bill.active && daysUntilJakarta(bill.next_due_date) <= 7)
    .sort((a, b) => daysUntilJakarta(a.next_due_date) - daysUntilJakarta(b.next_due_date))[0];
  if (nextBill !== undefined) {
    const days = daysUntilJakarta(nextBill.next_due_date);
    items.push({
      label: `${nextBill.name} jatuh tempo ${
        days < 0 ? `${-days} hari lalu` : days === 0 ? "hari ini" : `dalam ${days} hari`
      }`,
      href: "/bills",
      tone: days <= 2 ? "over" : "warn",
    });
  }

  const strained = (budgets ?? []).filter(
    (budget) => budget.amount_minor > 0 && budget.spent_minor / budget.amount_minor >= 0.8,
  ).length;
  if (strained > 0) {
    items.push({
      label: `${strained} anggaran ≥80% terpakai`,
      href: "/budgets",
      tone: "warn",
    });
  }

  return items;
}
