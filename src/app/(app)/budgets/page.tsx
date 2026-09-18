"use client";

import { useMemo, useState } from "react";
import { PiggyBank } from "lucide-react";
import { toast } from "sonner";

import { toastError } from "@/lib/toast";

import { EmptyState, QueryErrorState } from "@/components/empty-state";
import { AmountInput } from "@/components/amount-input";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FilterBar } from "@/components/filter-bar";
import { FormField } from "@/components/form-field";
import { BudgetProgressRow } from "@/components/budget-progress-row";
import { Metric } from "@/components/metric";
import { MoneyText } from "@/components/money-text";
import { Panel } from "@/components/panel";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { RowMenu } from "@/components/row-menu";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useBudgets,
  useCategories,
  useCreateBudget,
  useDeleteBudget,
  useStopBudget,
  useUpdateBudget,
  type BudgetRow,
} from "@/lib/api/hooks";
import { formatIDR } from "@/lib/money";
import { formatJakartaDate, todayJakartaKey } from "@/lib/time";
import { useIsPhone } from "@/lib/use-media-query";
import { SegmentedControl } from "@/components/segmented-control";
import { SwitchRow } from "@/components/switch-row";

/** "Sep 2026" — the label every budget caption and dialog is dated with. */
function monthLabelOf(period: string): string {
  return formatJakartaDate(`${period}-01T00:00:00+07:00`, { month: "short", year: "numeric" });
}

/**
 * budgetCaption states the rule behind the row: whether it recurs, since
 * when, until when, and — on the month a change took effect — what
 * nominal it replaced.
 */
export function budgetCaption(row: BudgetRow, period: string): string {
  const parts: string[] = [];
  if (row.to_period === null) {
    parts.push(`Berulang · sejak ${monthLabelOf(row.since_period)}`);
  } else if (
    row.from_period === row.to_period &&
    row.to_period === period &&
    row.since_period === row.from_period
  ) {
    parts.push(`Hanya ${monthLabelOf(period)}`);
  } else {
    parts.push(
      `Berulang · sejak ${monthLabelOf(row.since_period)} · sampai ${monthLabelOf(row.to_period)}`,
    );
  }
  if (row.previous_amount_minor !== null && row.from_period === period) {
    parts.push(`sebelumnya ${formatIDR(row.previous_amount_minor)}`);
  }
  return parts.join(" · ");
}

/**
 * budgetTotals sums the strip. Nested rows are skipped: their spend is
 * already inside a budgeted ancestor's, so counting both would double
 * the month.
 */
export function budgetTotals(rows: BudgetRow[]): { amount: number; spent: number } {
  return rows
    .filter((row) => !row.nested)
    .reduce(
      (acc, row) => ({
        amount: acc.amount + row.amount_minor,
        spent: acc.spent + row.spent_minor,
      }),
      { amount: 0, spent: 0 },
    );
}

export default function BudgetsPage() {
  const [period, setPeriod] = useState(() => todayJakartaKey().slice(0, 7));
  const isPhone = useIsPhone();
  const budgets = useBudgets(period);
  const categories = useCategories();
  const remove = useDeleteBudget();
  const stop = useStopBudget();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BudgetRow | null>(null);
  const [stopTarget, setStopTarget] = useState<BudgetRow | null>(null);

  const rows = budgets.data?.budgets ?? [];
  const totals = budgetTotals(rows);
  const remaining = totals.amount - totals.spent;
  const monthLabel = formatJakartaDate(`${period}-01T00:00:00+07:00`, {
    month: "long",
    year: "numeric",
  });

  function openForm(target: BudgetRow | null) {
    setEditing(target);
    setFormOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Budgets"
        actions={
          <>
            {/* The picker needs ~200px at the 16px phone control size, which
                a 360px header cannot spare beside Tambah — below 640px it
                moves into the toolbar and takes the full width. */}
            {isPhone ? null : (
              <Input
                type="month"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="w-[168px] tabular-nums"
                aria-label="Periode anggaran"
              />
            )}
            <Button onClick={() => openForm(null)}>
              <PiggyBank className="size-4" strokeWidth={1.75} /> Tambah
            </Button>
          </>
        }
      />

      {isPhone ? (
        <FilterBar>
          <Input
            type="month"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="w-full tabular-nums"
            aria-label="Periode anggaran"
          />
        </FilterBar>
      ) : null}

      <div className="py-2.5">
        {budgets.isPending ? (
          <Panel density="list">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="catet-shimmer m-2 h-9 rounded-md" />
            ))}
          </Panel>
        ) : budgets.isError ? (
          <QueryErrorState message="Anggaran gagal dimuat." onRetry={() => budgets.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={PiggyBank}
            heading="Belum ada anggaran"
            caption="Pasang batas per kategori; berulang tiap bulan sampai kamu hentikan."
            action={
              <Button variant="secondary" onClick={() => openForm(null)}>
                Buat anggaran
              </Button>
            }
          />
        ) : (
          <Panel density="list" title="Anggaran" caption={monthLabel}>
            <div className="grid grid-cols-1 gap-2 border-b border-border px-4 py-3 sm:grid-cols-3 sm:gap-3">
              <Metric
                label="Total anggaran"
                inlineOnPhone
                value={
                  <MoneyText
                    minor={totals.amount}
                    size="lg"
                    tone="neutral"
                    className="font-semibold"
                  />
                }
              />
              <Metric
                label="Terpakai"
                inlineOnPhone
                value={
                  <MoneyText
                    minor={totals.spent}
                    size="lg"
                    tone={totals.spent > totals.amount ? "over" : "neutral"}
                    className="font-semibold"
                  />
                }
              />
              <Metric
                label="Sisa"
                align="right"
                inlineOnPhone
                value={
                  <MoneyText
                    minor={remaining}
                    size="lg"
                    tone={remaining < 0 ? "over" : "neutral"}
                    className="font-semibold"
                  />
                }
              />
            </div>

            {rows.map((row) => (
              <BudgetProgressRow
                key={row.id}
                row={row}
                caption={budgetCaption(row, period)}
                actions={
                  <RowMenu
                    label={`Aksi ${row.category_name}`}
                    actions={
                      // A rule that only ever covered this month has nothing
                      // to stop: deleting it is the same act.
                      row.since_period === period && row.to_period === period
                        ? [
                            { label: "Ubah", onClick: () => openForm(row) },
                            {
                              label: "Hapus",
                              tone: "danger" as const,
                              onClick: () => setDeleteTarget(row),
                            },
                          ]
                        : [
                            { label: "Ubah", onClick: () => openForm(row) },
                            {
                              label: "Hentikan mulai bulan ini",
                              onClick: () => setStopTarget(row),
                            },
                            {
                              label: "Hapus seluruhnya",
                              tone: "danger" as const,
                              onClick: () => setDeleteTarget(row),
                            },
                          ]
                    }
                  />
                }
              />
            ))}
          </Panel>
        )}
      </div>

      <ConfirmDialog
        open={stopTarget !== null}
        onOpenChange={(open) => !open && setStopTarget(null)}
        title={`Hentikan anggaran ${stopTarget?.category_name ?? ""}?`}
        description={`Berlaku mulai ${monthLabelOf(period)}; bulan-bulan sebelumnya tetap tersimpan.`}
        confirmLabel="Hentikan"
        pending={stop.isPending}
        onConfirm={() => {
          if (stopTarget === null) {
            return;
          }
          stop.mutate(
            { id: stopTarget.id, period },
            {
              onSuccess: () => {
                toast.success("Anggaran dihentikan");
                setStopTarget(null);
              },
              onError: (error) => toastError(error.message),
            },
          );
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Hapus anggaran ${deleteTarget?.category_name ?? ""} seluruhnya?`}
        description={`Termasuk riwayat sejak ${monthLabelOf(
          deleteTarget?.since_period ?? period,
        )}. Riwayat pengeluaran tetap ada; hanya batas anggaran yang dihapus.`}
        confirmLabel="Hapus"
        tone="danger"
        pending={remove.isPending}
        onConfirm={() => {
          if (deleteTarget === null) {
            return;
          }
          remove.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Anggaran dihapus");
              setDeleteTarget(null);
            },
            onError: (error) => toastError(error.message),
          });
        }}
      />

      <BudgetFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        period={period}
        categories={categories.data?.categories ?? []}
        existing={rows}
      />
    </>
  );
}

function BudgetFormSheet({
  open,
  onOpenChange,
  editing,
  period,
  categories,
  existing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: BudgetRow | null;
  period: string;
  categories: { id: string; name: string }[];
  existing: BudgetRow[];
}) {
  const create = useCreateBudget();
  const update = useUpdateBudget();
  const [categoryId, setCategoryId] = useState("");
  const [amountMinor, setAmountMinor] = useState<number | null>(null);
  const [editPeriod, setEditPeriod] = useState(period);
  const [recurring, setRecurring] = useState(true);
  const [scope, setScope] = useState<"from_month" | "only_month">("from_month");
  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  const sessionKey = `${open ? "open" : "closed"}-${editing?.id ?? "new"}`;
  if (open && initializedFor !== sessionKey) {
    setInitializedFor(sessionKey);
    setCategoryId(editing?.category_id ?? "");
    setAmountMinor(editing?.amount_minor ?? null);
    setEditPeriod(period);
    setRecurring(true);
    setScope("from_month");
  }

  const available = useMemo(
    () =>
      categories.filter(
        (category) =>
          editing !== null ||
          !existing.some((row) => row.category_id === category.id),
      ),
    [categories, existing, editing],
  );

  // A segment that already covers exactly one month cannot be split, so
  // the scope question has only one honest answer.
  const scopeApplies = editing !== null && editing.from_period !== editing.to_period;

  function submit() {
    const minor = amountMinor ?? 0;
    if (minor <= 0) {
      toastError("Isi nominal anggaran");
      return;
    }
    if (editing !== null) {
      update.mutate(
        {
          id: editing.id,
          amount_minor: minor,
          period,
          scope: scopeApplies ? scope : "from_month",
        },
        {
          onSuccess: () => {
            toast.success("Anggaran diubah");
            onOpenChange(false);
          },
          onError: (error) => toastError(error.message),
        },
      );
      return;
    }
    if (categoryId === "") {
      toastError("Pilih kategori");
      return;
    }
    create.mutate(
      { category_id: categoryId, period: editPeriod, amount_minor: minor, recurring },
      {
        onSuccess: () => {
          toast.success("Anggaran dibuat");
          onOpenChange(false);
        },
        onError: (error) => toastError(error.message),
      },
    );
  }

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing === null ? "Tambah anggaran" : "Ubah anggaran"}
      description="Batas belanja per kategori; berulang tiap bulan sampai dihentikan."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={create.isPending || update.isPending}>
            Simpan
          </Button>
        </>
      }
    >
      {editing === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Kategori" htmlFor="budget-category">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="budget-category" className="w-full">
                <SelectValue placeholder="Pilih" />
              </SelectTrigger>
              <SelectContent>
                {available.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Periode" htmlFor="budget-period">
            <Input
              id="budget-period"
              type="month"
              value={editPeriod}
              onChange={(event) => setEditPeriod(event.target.value)}
            />
          </FormField>
        </div>
      ) : null}

      <FormField label="Nominal" htmlFor="budget-amount">
        <AmountInput id="budget-amount" valueMinor={amountMinor} onChangeMinor={setAmountMinor} />
      </FormField>

      {editing === null ? (
        <SwitchRow
          id="budget-recurring"
          label="Ulangi tiap bulan"
          caption="Berlaku mulai periode di atas sampai kamu hentikan."
          checked={recurring}
          onCheckedChange={setRecurring}
        />
      ) : null}

      {scopeApplies ? (
        <SegmentedControl
          aria-label="Cakupan perubahan"
          value={scope}
          onValueChange={(value) => setScope(value as "from_month" | "only_month")}
          options={[
            { value: "from_month", label: "Mulai bulan ini" },
            { value: "only_month", label: "Hanya bulan ini" },
          ]}
          stretch
          className="w-full"
        />
      ) : null}
    </ResponsiveSheet>
  );
}
