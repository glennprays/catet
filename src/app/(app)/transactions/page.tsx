"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Inbox, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { LedgerRow, LedgerRowSkeleton } from "@/components/ledger-row";
import { PageHeader } from "@/components/page-header";
import { TypedConfirmation } from "@/components/typed-confirmation";

import { TransactionSheet } from "@/components/transactions/transaction-sheet";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCategories,
  useReverseTransaction,
  useSources,
  useTransactionsInfinite,
  useVoidTransaction,
  type LedgerItem,
} from "@/lib/api/hooks";
import { dayLabel } from "@/lib/time";

export default function TransactionsPage() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [direction, setDirection] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sheetOpen, setSheetOpen] = useState(searchParams.get("add") === "1");
  const [editing, setEditing] = useState<LedgerItem | null>(null);
  const [voidTarget, setVoidTarget] = useState<LedgerItem | null>(null);
  const [reverseTarget, setReverseTarget] = useState<LedgerItem | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const sources = useSources();
  const categories = useCategories();
  const voidTx = useVoidTransaction();
  const reverseTx = useReverseTransaction();

  const filters = useMemo(
    () => ({
      q: debouncedQuery === "" ? undefined : debouncedQuery,
      direction: direction === "" ? undefined : direction,
      source_id: sourceFilter === "" ? undefined : sourceFilter,
      review_status: statusFilter === "" ? undefined : statusFilter,
      limit: 50,
    }),
    [debouncedQuery, direction, sourceFilter, statusFilter],
  );

  const pages = useTransactionsInfinite(filters);
  const rows = useMemo(
    () => pages.data?.pages.flatMap((page) => page.data?.transactions ?? []) ?? [],
    [pages.data],
  );

  function onEdit(item: LedgerItem) {
    setEditing(item);
    setSheetOpen(true);
  }

  function confirmVoid() {
    if (voidTarget === null) {
      return;
    }
    voidTx.mutate(voidTarget.transaction_id, {
      onSuccess: () => {
        toast.success("Transaksi dihapus (soft)");
        setVoidTarget(null);
      },
      onError: (error) => toast.error(error.message),
    });
  }

  function confirmReverse() {
    if (reverseTarget === null) {
      return;
    }
    reverseTx.mutate(
      { id: reverseTarget.transaction_id },
      {
        onSuccess: () => {
          toast.success("Reversal dibuat");
          setReverseTarget(null);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  // Group rows by Jakarta day for the sticky day headers.
  const groups: { day: string; items: LedgerItem[] }[] = [];
  for (const item of rows) {
    const day = dayLabel(item.occurred_at);
    const last = groups[groups.length - 1];
    if (last !== undefined && last.day === day) {
      last.items.push(item);
    } else {
      groups.push({ day, items: [item] });
    }
  }

  return (
    <>
      <PageHeader
        title="Transactions"
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setSheetOpen(true);
            }}
          >
            <Plus className="size-4" /> Tambah Transaksi
          </Button>
        }
      />

      <div className="sticky top-14 z-10 -mx-4 mb-3 grid grid-cols-2 gap-2 border-b border-border bg-canvas/90 px-4 py-2 lg:-mx-6 lg:grid-cols-4 lg:px-6">
        <div className="relative col-span-2 lg:col-span-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ash" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari merchant / catatan"
            className="pl-8"
            aria-label="Cari transaksi"
          />
        </div>
        <Select
          value={direction}
          onValueChange={(value) => setDirection(value === "all" ? "" : value)}
        >
          <SelectTrigger aria-label="Filter arah">
            <SelectValue placeholder="Semua arah" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua arah</SelectItem>
            <SelectItem value="expense">Keluar</SelectItem>
            <SelectItem value="income">Masuk</SelectItem>
            <SelectItem value="transfer">Pindah</SelectItem>
            <SelectItem value="adjustment">Koreksi</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sourceFilter}
          onValueChange={(value) => setSourceFilter(value === "all" ? "" : value)}
        >
          <SelectTrigger aria-label="Filter sumber">
            <SelectValue placeholder="Semua sumber" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua sumber</SelectItem>
            {(sources.data?.sources ?? []).map((source) => (
              <SelectItem key={source.id} value={source.id}>
                {source.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}
        >
          <SelectTrigger className="col-span-2 lg:col-span-1" aria-label="Filter status">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="clean">Bersih</SelectItem>
            <SelectItem value="needs_review">Perlu review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {pages.isPending ? (
        <div>
          {Array.from({ length: 8 }, (_, index) => (
            <LedgerRowSkeleton key={index} />
          ))}
        </div>
      ) : pages.isError ? (
        <p className="py-10 text-center text-[13px] text-over-text">Gagal memuat transaksi.</p>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          heading="Tidak ada transaksi"
          caption="Coba ubah filter, atau catat transaksi baru."
        />
      ) : (
        <div className="pb-4">
          {groups.map((group) => (
            <section key={group.day}>
              <h3 className="sticky top-[104px] max-lg:top-[197px] z-[5] -mx-4 bg-canvas/95 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground lg:-mx-6 lg:px-6">
                {group.day}
              </h3>
              {group.items.map((item) => (
                <LedgerRow
                  key={item.transaction_id}
                  item={item}
                  onEdit={onEdit}
                  onReverse={setReverseTarget}
                  onVoid={setVoidTarget}
                />
              ))}
            </section>
          ))}

          {pages.hasNextPage ? (
            <div className="flex justify-center pt-4">
              <Button variant="secondary" disabled={pages.isFetching} onClick={() => pages.fetchNextPage()}>
                Muat lebih banyak
              </Button>
            </div>
          ) : null}
        </div>
      )}

      <TransactionSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) {
            setEditing(null);
          }
        }}
        categories={categories.data?.categories ?? []}
        sources={sources.data?.sources ?? []}
        editing={editing}
      />

      <Dialog open={voidTarget !== null} onOpenChange={(open) => !open && setVoidTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Hapus &quot;{voidTarget?.merchant ?? voidTarget?.note ?? "transaksi"}&quot;?
            </DialogTitle>
            <DialogDescription>
              Transaksi di-void (soft delete): hilang dari semua hitungan, tapi tetap terlihat
              di riwayat.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setVoidTarget(null)}>
              Batal
            </Button>
            <TypedConfirmation phrase="HAPUS" label="Hapus" pending={voidTx.isPending} onConfirm={confirmVoid} />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reverseTarget !== null} onOpenChange={(open) => !open && setReverseTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Balaskan transaksi ini?</DialogTitle>
            <DialogDescription>
              Membuat transaksi reversal tertaut dengan nominal terbalik. Keduanya tetap
              terlihat di riwayat.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReverseTarget(null)}>
              Batal
            </Button>
            <Button onClick={confirmReverse} disabled={reverseTx.isPending}>
              Buat reversal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
