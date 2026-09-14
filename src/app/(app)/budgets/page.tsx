"use client";

import { useMemo, useState } from "react";
import { PiggyBank } from "lucide-react";
import { toast } from "sonner";

import { toastError } from "@/lib/toast";

import { EmptyState, QueryErrorState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

function thresholdOf(ratio: number): { badge: "safe" | "warn" | "over" | null; label: string; fill: string } {
  if (ratio >= 1) {
    return { badge: "over", label: "100%", fill: "bg-over" };
  }
  if (ratio >= 0.8) {
    return { badge: "warn", label: "80%", fill: "bg-warn" };
  }
  return { badge: null, label: "", fill: "bg-safe" };
}

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
          <ul className="grid gap-3">
            {rows.map((row) => {
              const ratio = row.amount_minor === 0 ? 0 : row.spent_minor / row.amount_minor;
              const pct = Math.min(100, Math.round(ratio * 100));
              const threshold = thresholdOf(ratio);
              return (
                <li key={row.id} className="rounded-md border border-border bg-surface p-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[15px] font-medium text-ink">{row.category_name}</p>
                    <p className="text-[13px] tabular-nums text-ink-soft">
                      <span className={ratio >= 1 ? "text-over-text" : ""}>
                        {formatIDR(row.spent_minor)}
                      </span>
                      <span className="text-muted-foreground"> / {formatIDR(row.amount_minor)}</span>
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-300">
                      <div className={`h-full rounded-full ${threshold.fill}`} style={{ width: `${pct}%` }} />
                    </div>
                    {threshold.badge !== null ? (
                      <Badge variant={threshold.badge}>{threshold.label}</Badge>
                    ) : (
                      <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                        {pct}%
                      </span>
                    )}
                    <div className="flex gap-1">
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
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <BudgetFormDialog
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

function BudgetFormDialog({
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
  const [amount, setAmount] = useState("");
  const [editPeriod, setEditPeriod] = useState(period);
  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  const sessionKey = `${open ? "open" : "closed"}-${editing?.id ?? "new"}`;
  if (open && initializedFor !== sessionKey) {
    setInitializedFor(sessionKey);
    setCategoryId(editing?.category_id ?? "");
    setAmount(editing === null ? "" : String(editing.amount_minor));
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
    const minor = Number.parseInt(amount.replace(/\D/g, ""), 10) || 0;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing === null ? "Tambah anggaran" : "Ubah anggaran"}</DialogTitle>
          <DialogDescription>Batas belanja per kategori per bulan.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {editing === null ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Kategori</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full">
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
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="budget-period">Periode</Label>
                <Input
                  id="budget-period"
                  type="month"
                  value={editPeriod}
                  onChange={(event) => setEditPeriod(event.target.value)}
                />
              </div>
            </div>
          ) : null}
          <div className="grid gap-1.5">
            <Label htmlFor="budget-amount">Nominal</Label>
            <Input
              id="budget-amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="numeric"
              className="text-right tabular-nums"
              placeholder="1500000"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={create.isPending || update.isPending}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
