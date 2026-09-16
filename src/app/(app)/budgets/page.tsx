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
  useUpdateBudget,
  type BudgetRow,
} from "@/lib/api/hooks";
import { formatJakartaDate } from "@/lib/time";
import { useIsPhone } from "@/lib/use-media-query";

export default function BudgetsPage() {
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const isPhone = useIsPhone();
  const budgets = useBudgets(period);
  const categories = useCategories();
  const remove = useDeleteBudget();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BudgetRow | null>(null);

  const rows = budgets.data?.budgets ?? [];
  const totals = rows.reduce(
    (acc, row) => ({
      amount: acc.amount + row.amount_minor,
      spent: acc.spent + row.spent_minor,
    }),
    { amount: 0, spent: 0 },
  );
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
            caption="Pasang batas per kategori untuk bulan ini."
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
                actions={
                  <RowMenu
                    label={`Aksi ${row.category_name}`}
                    actions={[
                      { label: "Ubah", onClick: () => openForm(row) },
                      { label: "Hapus", tone: "danger", onClick: () => setDeleteTarget(row) },
                    ]}
                  />
                }
              />
            ))}
          </Panel>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Hapus anggaran ${deleteTarget?.category_name ?? ""}?`}
        description="Riwayat pengeluaran tetap ada; hanya batas anggaran yang dihapus."
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
  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  const sessionKey = `${open ? "open" : "closed"}-${editing?.id ?? "new"}`;
  if (open && initializedFor !== sessionKey) {
    setInitializedFor(sessionKey);
    setCategoryId(editing?.category_id ?? "");
    setAmountMinor(editing?.amount_minor ?? null);
    setEditPeriod(period);
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

  function submit() {
    const minor = amountMinor ?? 0;
    if (minor <= 0) {
      toastError("Isi nominal anggaran");
      return;
    }
    if (editing !== null) {
      update.mutate(
        { id: editing.id, amount_minor: minor },
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
      { category_id: categoryId, period: editPeriod, amount_minor: minor },
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
      description="Batas belanja per kategori per bulan."
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
    </ResponsiveSheet>
  );
}
