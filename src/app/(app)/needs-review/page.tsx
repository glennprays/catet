"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, QueryErrorState } from "@/components/empty-state";
import { LedgerRow, LedgerRowSkeleton } from "@/components/ledger-row";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCategories,
  useTransactions,
  useUpdateTransaction,
  type LedgerItem,
} from "@/lib/api/hooks";
import { dayLabel } from "@/lib/time";

/** Needs-Review queue: low category-confidence rows, fixable inline. */
export default function NeedsReviewPage() {
  const transactions = useTransactions({ review_status: "needs_review", limit: 100 });
  const categories = useCategories();
  const update = useUpdateTransaction();

  const [draftByTx, setDraftByTx] = useState<Record<string, string>>({});
  const rows = transactions.data?.transactions ?? [];

  function commit(item: LedgerItem) {
    const categoryId = draftByTx[item.transaction_id];
    if (categoryId === undefined || categoryId === "") {
      toast.error("Pilih kategori dulu");
      return;
    }
    update.mutate(
      { id: item.transaction_id, category_id: categoryId },
      {
        onSuccess: () => toast.success("Kategori diperbarui"),
        onError: (error) => toast.error(error.message),
      },
    );
  }

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
      <PageHeader title="Needs-Review" />
      <div className="py-4">
        {transactions.isPending ? (
          <div>
            {Array.from({ length: 5 }, (_, index) => (
              <LedgerRowSkeleton key={index} />
            ))}
          </div>
        ) : transactions.isError ? (
          <QueryErrorState message="Review gagal dimuat." onRetry={() => transactions.refetch()} />
        ) : rows.length === 0 ? (

          <EmptyState
            icon={CircleCheck}
            heading="Semua beres"
            caption="Tidak ada transaksi yang menunggu review kategori."
          />
        ) : (
          <div className="rounded-md border border-border bg-surface px-3">
            {groups.map((group) => (
              <section key={group.day}>
                <h3 className="py-1.5 text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
                  {group.day}
                </h3>
                {group.items.map((item) => (
                  <div
                    key={item.transaction_id}
                    className="flex flex-col gap-2 border-b border-border py-2 last:border-b-0 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <LedgerRow item={item} showCategory={false} />
                    </div>
                    <div className="flex w-full items-center gap-2 sm:w-72">
                      <Select
                        value={draftByTx[item.transaction_id] ?? item.category_id ?? ""}
                        onValueChange={(value) =>
                          setDraftByTx((current) => ({ ...current, [item.transaction_id]: value }))
                        }
                      >
                        <SelectTrigger className="w-full" aria-label={`Kategori ${item.merchant ?? item.type}`}>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {(categories.data?.categories ?? [])
                            .filter((category) => category.archived_at === null)
                            .map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="shrink-0"
                        disabled={update.isPending}
                        onClick={() => commit(item)}
                      >
                        Simpan
                      </Button>
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
