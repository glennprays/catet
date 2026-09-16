"use client";

import Link from "next/link";
import { ArrowRight, Inbox, Plus, Send, Wallet } from "lucide-react";

import { AttentionList, type AttentionItem } from "@/components/attention-list";
import { BalanceHero } from "@/components/balance-hero";
import { BudgetProgressRow } from "@/components/budget-progress-row";
import { CashflowCard } from "@/components/cashflow-card";
import { EmptyState, QueryErrorState } from "@/components/empty-state";
import { LedgerHead, LedgerRow, LedgerRowSkeleton } from "@/components/ledger-row";
import { Metric } from "@/components/metric";
import { MoneyText } from "@/components/money-text";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { SourceCard } from "@/components/source-card";
import { UpcomingBillRow } from "@/components/upcoming-bill-row";
import { useCaptureSheet } from "@/components/capture-sheet-provider";
import { useFormatIDR } from "@/components/privacy-provider";
import { Button } from "@/components/ui/button";
import {
  useAnalytics,
  useBills,
  useBudgets,
  useOverview,
  useSources,
  useSourceTypeMap,
  type IncomeExpenseData,
  type StsTrendData,
} from "@/lib/api/hooks";
import { daysUntilJakarta, formatJakartaDate, todayJakartaKey } from "@/lib/time";

const CARD_LINK =
  // Panel action: a text link on desktop; below 640px an invisible
  // expander (DESIGN.md §4) gives it a 44px tap target without a box.
  "relative inline-flex items-center gap-1 text-meta font-medium text-primary hover:underline " +
  "max-sm:before:absolute max-sm:before:inset-[-14px] max-sm:before:content-['']";

/**
 * Overview answers, in order: what is safe to spend, what needs me,
 * what changed. One hero carries Safe-to-Spend; everything else is a
 * dense list card — accounts, cash flow, upcoming bills, attention,
 * activity, budgets — so a 900px viewport holds the whole answer.
 */
export default function OverviewPage() {
  const overview = useOverview();
  const sources = useSources();
  const sourceTypes = useSourceTypeMap();
  const bills = useBills();
  const budgets = useBudgets(todayJakartaKey().slice(0, 7));
  const stsTrend = useAnalytics<StsTrendData>("sts-trend", { days: 30 });
  const incomeExpense = useAnalytics<IncomeExpenseData>("income-expense", {});
  const { openCreate, openDetail } = useCaptureSheet();
  const format = useFormatIDR();

  const data = overview.data;
  const stale = !overview.isFetching && overview.isStale;

  const sourceList = sources.data?.sources ?? [];
  const assets = sourceList.filter((source) => !source.is_debt);
  const debts = sourceList.filter((source) => source.is_debt);
  const totalAvailable = sources.data?.total_available_minor ?? 0;
  const totalDebt = sources.data?.total_debt_minor ?? 0;

  // Overdue bills sort to the top and are never filtered out: the
  // horizon bounds what is coming, not what is already late.
  const upcoming = (bills.data?.bills ?? [])
    .filter((bill) => bill.active)
    .map((bill) => ({ bill, days: daysUntilJakarta(bill.next_due_date) }))
    .filter((entry) => entry.days <= 30)
    .sort((a, b) => a.days - b.days)
    .slice(0, 6);

  const budgetRows = [...(budgets.data?.budgets ?? [])]
    .sort((a, b) => {
      const ratioA = a.amount_minor === 0 ? 0 : a.spent_minor / a.amount_minor;
      const ratioB = b.amount_minor === 0 ? 0 : b.spent_minor / b.amount_minor;
      return ratioB - ratioA;
    })
    .slice(0, 8);

  const attention =
    data === undefined
      ? []
      : attentionItems({
          badges: data.badges,
          bills: bills.data?.bills,
          budgets: budgets.data?.budgets,
        });

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle={formatJakartaDate(new Date(), {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
        actions={
          <>
            {/* Two labelled actions plus the 18px phone title overflow a
                360px header; below 640px the glyph carries Transfer. */}
            <Button
              variant="secondary"
              aria-label="Transfer"
              className="max-sm:w-11 max-sm:px-0"
              onClick={() => openCreate("transfer")}
            >
              <Send className="size-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Transfer</span>
            </Button>
            <Button onClick={() => openCreate()}>
              <Plus className="size-4" strokeWidth={1.75} /> Tambah
            </Button>
          </>
        }
      />

      <div className="grid gap-2.5 py-2.5 md:grid-cols-2 lg:grid-cols-12">
        {/* A — Safe-to-Spend hero */}
        <div className="order-1 min-w-0 md:col-span-2 lg:order-none lg:col-span-8">
          {overview.isPending ? (
            <div className="catet-shimmer h-[220px] rounded-lg bg-surface shadow-card" />
          ) : data === undefined ? (
            <Panel density="comfortable">
              <QueryErrorState
                message="Safe-to-Spend gagal dimuat."
                onRetry={() => overview.refetch()}
              />
            </Panel>
          ) : (
            <BalanceHero
              overview={data}
              trend={stsTrend}
              updatedAt={overview.dataUpdatedAt}
              stale={stale}
            />
          )}
        </div>

        {/* B — Accounts */}
        <div className="order-4 min-w-0 lg:order-none lg:col-span-4">
          <Panel
            className="h-full"
            density="list"
            title="Akun"
            action={
              <Link href="/sources" className={CARD_LINK}>
                Kelola <ArrowRight className="size-3" strokeWidth={1.75} />
              </Link>
            }
          >
            {sources.isPending ? (
              <div className="grid gap-px p-3">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="catet-shimmer h-10 rounded-md" />
                ))}
              </div>
            ) : sources.isError ? (
              <QueryErrorState message="Sumber gagal dimuat." onRetry={() => sources.refetch()} />
            ) : sourceList.length === 0 ? (
              <EmptyState
                icon={Wallet}
                heading="Belum ada sumber"
                caption="Tambah rekening, dompet, atau paylater."
                action={
                  <Button asChild variant="secondary">
                    <Link href="/sources">Tambah sumber</Link>
                  </Button>
                }
              />
            ) : (
              <>
                <div className="flex items-baseline justify-between gap-3 px-3 py-3">
                  <Metric
                    label="Posisi bersih"
                    value={
                      <MoneyText
                        minor={totalAvailable - totalDebt}
                        size="lg"
                        tone="neutral"
                        className="font-semibold"
                      />
                    }
                  />
                  <span className="text-right text-meta text-ash">
                    Aset {format(totalAvailable)}
                    {totalDebt > 0 ? (
                      <span className="text-over-text"> · Utang {format(totalDebt)}</span>
                    ) : null}
                  </span>
                </div>

                <div className="grid gap-2 px-3 pb-3">
                  {assets.map((source) => (
                    <SourceCard
                      key={source.id}
                      source={source}
                      share={totalAvailable === 0 ? 0 : source.balance_minor / totalAvailable}
                      href="/sources"
                    />
                  ))}

                  {debts.map((source) => (
                    <SourceCard
                      key={source.id}
                      source={source}
                      share={totalDebt === 0 ? 0 : Math.abs(source.balance_minor) / totalDebt}
                      href="/sources"
                    />
                  ))}
                </div>
              </>
            )}
          </Panel>
        </div>

        {/* C — Cash flow */}
        <div className="order-6 min-w-0 lg:order-none lg:col-span-5">
          <CashflowCard query={incomeExpense} />
        </div>

        {/* D — Upcoming bills */}
        <div className="order-5 min-w-0 lg:order-none lg:col-span-4">
          <Panel
            className="h-full"
            density="list"
            title="Mendatang"
            caption={upcoming.length > 0 ? `${upcoming.length} dalam 30 hari` : undefined}
            action={
              <Link href="/bills" className={CARD_LINK}>
                Semua <ArrowRight className="size-3" strokeWidth={1.75} />
              </Link>
            }
          >
            {bills.isPending ? (
              <div className="grid gap-px p-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="catet-shimmer h-10 rounded-md" />
                ))}
              </div>
            ) : bills.isError ? (
              <QueryErrorState message="Tagihan gagal dimuat." onRetry={() => bills.refetch()} />
            ) : upcoming.length === 0 ? (
              <p className="p-4 text-meta text-ash">Tidak ada tagihan 30 hari ke depan.</p>
            ) : (
              upcoming.map((entry) => (
                <UpcomingBillRow key={entry.bill.id} bill={entry.bill} days={entry.days} />
              ))
            )}
          </Panel>
        </div>

        {/* E — Needs attention */}
        <div className="order-2 min-w-0 md:col-span-2 lg:order-none lg:col-span-3">
          <Panel
            className="h-full"
            density="list"
            title="Perlu perhatian"
            caption={attention.length > 0 ? String(attention.length) : undefined}
          >
            {overview.isPending ? (
              <div className="grid gap-px p-3">
                {Array.from({ length: 2 }, (_, index) => (
                  <div key={index} className="catet-shimmer h-9 rounded-md" />
                ))}
              </div>
            ) : data === undefined ? (
              <p className="p-4 text-meta text-ash">Status tidak bisa dimuat.</p>
            ) : (
              <AttentionList items={attention} />
            )}
          </Panel>
        </div>

        {/* F — Recent activity */}
        <div className="order-3 min-w-0 md:col-span-2 lg:order-none lg:col-span-8">
          <Panel
            className="h-full"
            density="list"
            title="Aktivitas terakhir"
            action={
              <Link href="/transactions" className={CARD_LINK}>
                Lihat semua <ArrowRight className="size-3" strokeWidth={1.75} />
              </Link>
            }
          >
            {overview.isPending ? (
              <>
                <LedgerHead />
                {Array.from({ length: 10 }, (_, index) => (
                  <LedgerRowSkeleton key={index} />
                ))}
              </>
            ) : data === undefined ? (
              <QueryErrorState
                message="Transaksi terakhir gagal dimuat."
                onRetry={() => overview.refetch()}
              />
            ) : data.recent.length === 0 ? (
              <EmptyState
                icon={Inbox}
                heading="Belum ada transaksi"
                caption="Catat lewat WhatsApp atau tambah manual dari sini."
                action={<Button onClick={() => openCreate()}>Tambah</Button>}
              />
            ) : (
              <>
                <LedgerHead />
                {data.recent.slice(0, 12).map((item) => (
                  <LedgerRow
                    key={item.transaction_id}
                    item={item}
                    onOpen={() => openDetail(item.transaction_id)}
                    sourceType={sourceTypes.get(item.source_id)}
                  />
                ))}
              </>
            )}
          </Panel>
        </div>

        {/* G — Budgets */}
        <div className="order-7 min-w-0 md:col-span-2 lg:order-none lg:col-span-4">
          <Panel
            className="h-full"
            density="list"
            title="Anggaran"
            caption={formatJakartaDate(new Date(), { month: "long" })}
            action={
              <Link href="/budgets" className={CARD_LINK}>
                Semua <ArrowRight className="size-3" strokeWidth={1.75} />
              </Link>
            }
          >
            {budgets.isPending ? (
              <div className="grid gap-px p-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="catet-shimmer h-9 rounded-md" />
                ))}
              </div>
            ) : budgets.isError ? (
              <QueryErrorState message="Anggaran gagal dimuat." onRetry={() => budgets.refetch()} />
            ) : budgetRows.length === 0 ? (
              <p className="p-4 text-meta text-ash">Belum ada anggaran bulan ini.</p>
            ) : (
              budgetRows.map((row) => <BudgetProgressRow key={row.id} row={row} />)
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

type Badges = { needs_review: number; hold_queue: number };
type Bill = { name: string; next_due_date: string; active: boolean };
type Budget = { spent_minor: number; amount_minor: number };

/**
 * Bills/budgets failing is not fatal here: those items drop out, the
 * list still tells the truth about what it does know.
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
    // An unpaid past-due bill is not "coming up", it is already late —
    // and late is the red tone, not the amber one.
    items.push({
      label:
        days < 0
          ? `${nextBill.name} terlambat ${-days} hari`
          : `${nextBill.name} jatuh tempo ${days === 0 ? "hari ini" : `dalam ${days} hari`}`,
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
