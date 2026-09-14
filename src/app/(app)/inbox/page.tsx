"use client";

import { useState } from "react";
import { CircleCheck, Inbox } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { GroupLabel } from "@/components/group-label";
import { LedgerRow, LedgerRowSkeleton } from "@/components/ledger-row";
import { PageHeader } from "@/components/page-header";
import { PendingActionParams } from "@/components/pending-action-params";
import { QueryBoundary } from "@/components/query-boundary";
import { SectionHeader } from "@/components/section-header";
import { useCaptureSheet } from "@/components/capture-sheet-provider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBadges,
  useCategories,
  useHoldQueue,
  useResolveHold,
  useSourceTypeMap,
  useTransactionsInfinite,
  useUpdateTransaction,
  type Category,
  type LedgerItem,
  type PendingAction,
  type Source,
} from "@/lib/api/hooks";
import { groupByJakartaDay } from "@/lib/group-by-day";
import { dateTimeLabel } from "@/lib/time";
import { toastError } from "@/lib/toast";

const REVIEW_FILTERS = { review_status: "needs_review", limit: 50 } as const;

const SOURCE_LABELS: Record<string, string> = {
  rules: "aturan",
  llm: "AI",
  user: "kamu",
  import: "impor",
};

/**
 * Inbox: everything the bot needs a human for, in risk order — money it
 * wants to write first, labels it guessed second. Replaces the split
 * Needs-Review / Hold Queue screens.
 */
export default function InboxPage() {
  const holds = useHoldQueue();
  const reviews = useTransactionsInfinite(REVIEW_FILTERS);
  const categories = useCategories();
  const badges = useBadges();
  const sourceTypes = useSourceTypeMap();
  const { openDetail } = useCaptureSheet();

  const reviewRows = reviews.data?.pages.flatMap((page) => page.data?.transactions ?? []) ?? [];
  const activeCategories = (categories.data?.categories ?? []).filter(
    (category) => category.archived_at === null,
  );

  return (
    <>
      <PageHeader title="Inbox" />

      <div className="grid gap-6 py-4">
        <section aria-label="Konfirmasi bot">
          <SectionHeader
            title="Konfirmasi bot"
            caption={
              badges.data === undefined
                ? undefined
                : `${badges.data.hold_queue} aksi menunggu konfirmasi`
            }
          />
          <QueryBoundary
            query={holds}
            isEmpty={(data) => data.items.length === 0}
            errorMessage="Konfirmasi bot gagal dimuat."
            skeleton={
              <div className="grid gap-2">
                {Array.from({ length: 2 }, (_, index) => (
                  <Skeleton key={index} className="h-24 w-full rounded-md" />
                ))}
              </div>
            }
            empty={
              <EmptyState
                icon={Inbox}
                heading="Tidak ada aksi menunggu"
                caption="Semua pesan bot sudah dikonfirmasi."
              />
            }
          >
            {(data) => (
              <ul className="grid gap-2">
                {data.items.map((item) => (
                  <HoldRow key={item.id} item={item} />
                ))}
              </ul>
            )}
          </QueryBoundary>
        </section>

        <section aria-label="Perbaiki kategori">
          <SectionHeader
            title="Perbaiki kategori"
            caption={
              badges.data === undefined ? undefined : `${badges.data.needs_review} transaksi`
            }
          />
          <QueryBoundary
            query={reviews}
            isEmpty={() => reviewRows.length === 0}
            errorMessage="Transaksi perlu review gagal dimuat."
            skeleton={
              <div>
                {Array.from({ length: 4 }, (_, index) => (
                  <LedgerRowSkeleton key={index} />
                ))}
              </div>
            }
            empty={
              <EmptyState
                icon={CircleCheck}
                heading="Semua beres"
                caption="Tidak ada transaksi yang menunggu review kategori."
              />
            }
          >
            {() => (
              <div>
                {groupByJakartaDay(reviewRows).map((group) => (
                  <section key={group.day}>
                    <GroupLabel>{group.day}</GroupLabel>
                    {group.items.map((item) => (
                      <ReviewRow
                        key={item.transaction_id}
                        item={item}
                        categories={activeCategories}
                        sourceType={sourceTypes.get(item.source_id)}
                        onOpen={() => openDetail(item.transaction_id)}
                      />
                    ))}
                  </section>
                ))}
                {reviews.hasNextPage ? (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="secondary"
                      disabled={reviews.isFetchingNextPage}
                      onClick={() => reviews.fetchNextPage()}
                    >
                      Muat lebih banyak
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </QueryBoundary>
        </section>
      </div>
    </>
  );
}

/** Owns its own mutation so one pending row never disables the others. */
function HoldRow({ item }: { item: PendingAction }) {
  const resolve = useResolveHold();
  const [confirming, setConfirming] = useState<"confirm" | "discard" | null>(null);

  function run(action: "confirm" | "discard") {
    resolve.mutate(
      { id: item.id, action },
      {
        onSuccess: () => {
          toast.success(action === "confirm" ? "Aksi dikonfirmasi" : "Aksi dibuang");
          setConfirming(null);
        },
        onError: (error) => toastError(error.message, () => run(action)),
      },
    );
  }

  return (
    <li className="rounded-md border border-border bg-surface p-3">
      <p className="text-[15px] font-medium text-ink">{item.summary}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{dateTimeLabel(item.created_at)}</p>
      <div className="mt-2">
        <PendingActionParams params={item.params} />
      </div>
      <div className="mt-2 flex justify-end gap-1">
        <Button
          variant="dangerGhost"
          size="sm"
          disabled={resolve.isPending}
          onClick={() => setConfirming("discard")}
        >
          Buang
        </Button>
        <Button size="sm" disabled={resolve.isPending} onClick={() => setConfirming("confirm")}>
          Konfirmasi
        </Button>
      </div>

      <ConfirmDialog
        open={confirming === "confirm"}
        onOpenChange={(open) => !open && setConfirming(null)}
        title="Konfirmasi aksi bot?"
        description={<PendingActionParams params={item.params} />}
        confirmLabel="Konfirmasi"
        pending={resolve.isPending}
        onConfirm={() => run("confirm")}
      />

      <ConfirmDialog
        open={confirming === "discard"}
        onOpenChange={(open) => !open && setConfirming(null)}
        title="Buang aksi ini?"
        description="Bot tidak akan menulis apa pun."
        confirmLabel="Buang"
        tone="danger"
        pending={resolve.isPending}
        onConfirm={() => run("discard")}
      />
    </li>
  );
}

/** One-tap accept, auto-saving select; per-row pending and flash. */
function ReviewRow({
  item,
  categories,
  sourceType,
  onOpen,
}: {
  item: LedgerItem;
  categories: Category[];
  sourceType?: Source["type"];
  onOpen: () => void;
}) {
  const update = useUpdateTransaction();
  const [flash, setFlash] = useState(false);

  function save(categoryId: string) {
    update.mutate(
      { id: item.transaction_id, category_id: categoryId },
      {
        onSuccess: () => {
          setFlash(true);
          toast.success("Kategori disimpan");
        },
        onError: (error) => toastError(error.message, () => save(categoryId)),
      },
    );
  }

  const guess =
    item.category_source === null || item.category_source === undefined
      ? null
      : `${item.category_name ?? "—"} · ${SOURCE_LABELS[item.category_source] ?? item.category_source}${
          item.category_confidence === null || item.category_confidence === undefined
            ? ""
            : ` ${Math.round(item.category_confidence * 100)}%`
        }`;

  return (
    <LedgerRow
      item={item}
      showCategory={false}
      sourceType={sourceType}
      onOpen={onOpen}
      flash={flash}
      trailing={
        <div className="flex w-full flex-col gap-1 sm:w-80">
          {guess === null ? null : (
            <span className="truncate text-xs text-muted-foreground">Tebakan: {guess}</span>
          )}
          <div className="flex items-center gap-2">
            <Select
              value={item.category_id ?? ""}
              disabled={update.isPending}
              onValueChange={save}
            >
              <SelectTrigger className="w-full" aria-label={`Ganti kategori ${item.merchant ?? item.type}`}>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="secondary"
              className="shrink-0"
              disabled={update.isPending || item.category_id === null || item.category_id === undefined}
              onClick={() => save(item.category_id as string)}
            >
              Benar
            </Button>
          </div>
        </div>
      }
    />
  );
}
