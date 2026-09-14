"use client";

import { useMemo, useState } from "react";
import { PiggyBank } from "lucide-react";
import { toast } from "sonner";

import { toastError } from "@/lib/toast";

import { EmptyState, QueryErrorState } from "@/components/empty-state";
import { AmountInput } from "@/components/amount-input";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormField } from "@/components/form-field";
import { ListRow } from "@/components/list-row";
import { ProgressBar } from "@/components/progress-bar";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { StatusBadge } from "@/components/status-badge";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { formatIDR } from "@/lib/money";

export default function BudgetsPage() {
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const budgets = useBudgets(period);
  const categories = useCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetRow | null>(null);

  const rows = budgets.data?.budgets ?? [];

  return (
    <>
      <PageHeader
        title="Budgets"
        actions={
          <div className="flex items-center gap-2">
            <Input
              type="month"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="w-40 tabular-nums"
              aria-label="Periode anggaran"
            />
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <PiggyBank className="size-4" /> Tambah
            </Button>
          </div>
        }
      />

      <div className="py-4">
        {budgets.isPending ? (
          <div className="grid gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : budgets.isError ? (
          <QueryErrorState message="Anggaran gagal dimuat." onRetry={() => budgets.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={PiggyBank}
            heading="Belum ada anggaran"
            caption="Pasang batas per kategori untuk bulan ini."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                Buat anggaran
              </Button>
            }
          />
        ) : (
          <ul>
            {rows.map((row) => {
              const ratio = row.amount_minor === 0 ? 0 : row.spent_minor / row.amount_minor;
              const tone = ratio >= 1 ? "over" : ratio >= 0.8 ? "warn" : "safe";
              return (
                <li key={row.id}>
                  <ListRow
                    title={row.category_name}
                    caption={
                      <>
                        {formatIDR(row.spent_minor)} dari {formatIDR(row.amount_minor)}
                      </>
                    }
                    trailing={
                      <span className="flex w-40 items-center gap-2 sm:w-56">
                        <ProgressBar
                          ratio={ratio}
                          tone={tone}
                          label={`Terpakai ${Math.round(ratio * 100)}% dari anggaran ${row.category_name}`}
                        />
                        {tone === "safe" ? (
                          <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                            {Math.round(ratio * 100)}%
                          </span>
                        ) : (
                          <StatusBadge tone={tone}>{Math.round(ratio * 100)}%</StatusBadge>
                        )}
                      </span>
                    }
                    actions={
                      <span className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditing(row);
                            setFormOpen(true);
                          }}
                        >
                          Ubah
                        </Button>
                        <DeleteButton row={row} />
                      </span>
                    }
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>

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

function DeleteButton({ row }: { row: BudgetRow }) {
  const remove = useDeleteBudget();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="dangerGhost" size="sm" disabled={remove.isPending} onClick={() => setOpen(true)}>
        Hapus
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Hapus anggaran ${row.category_name}?`}
        description="Riwayat pengeluaran tetap ada; hanya batas anggaran yang dihapus."
        confirmLabel="Hapus"
        tone="danger"
        pending={remove.isPending}
        onConfirm={() =>
          remove.mutate(row.id, {
            onSuccess: () => {
              toast.success("Anggaran dihapus");
              setOpen(false);
            },
            onError: (error) => toastError(error.message),
          })
        }
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
