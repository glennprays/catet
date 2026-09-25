"use client";

import { useState } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { toast } from "sonner";

import { CategoryPicker } from "@/components/category-picker";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { GroupLabel } from "@/components/group-label";
import { LedgerRow, LedgerRowSkeleton } from "@/components/ledger-row";
import { PageHeader } from "@/components/page-header";
import { FIELD_LABELS, PendingActionParams } from "@/components/pending-action-params";
import { QueryBoundary } from "@/components/query-boundary";
import { Panel } from "@/components/panel";
import { StatusBadge } from "@/components/status-badge";
import { useCaptureSheet } from "@/components/capture-sheet-provider";
import { Button } from "@/components/ui/button";
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
  type TransactionListEnvelope,
} from "@/lib/api/hooks";
import { groupByJakartaDay } from "@/lib/group-by-day";
import { dayLabel, timeLabel } from "@/lib/time";
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

      <div className="grid gap-2.5 py-2.5 xl:grid-cols-12">
        <section aria-label="Konfirmasi bot" className="min-w-0 xl:col-span-5">
          <Panel
            title="Konfirmasi bot"
            caption={
              badges.data === undefined
                ? undefined
                : `${badges.data.hold_queue} aksi menunggu konfirmasi`
            }
            density="list"
          >
            <QueryBoundary
              query={holds}
              isEmpty={(data) => data.items.length === 0}
              errorMessage="Konfirmasi bot gagal dimuat."
              skeleton={
                <div>
                  {Array.from({ length: 2 }, (_, index) => (
                    <div
                      key={index}
                      className="grid h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-b border-border px-4 last:border-b-0 md:h-9"
                    >
                      <div className="grid gap-1">
                        <span className="catet-shimmer h-3 w-40 rounded" />
                        <span className="catet-shimmer h-2.5 w-56 rounded" />
                      </div>
                      <span className="catet-shimmer h-7 w-36 rounded-md" />
                    </div>
                  ))}
                </div>
              }
              empty={
                <p className="p-4 text-meta text-ash">
                  Tidak ada aksi menunggu. Semua pesan bot sudah dikonfirmasi.
                </p>
              }
            >
              {(data) => (
                <ul>
                  {data.items.map((item) => (
                    <HoldRow key={item.id} item={item} />
                  ))}
                </ul>
              )}
            </QueryBoundary>
          </Panel>
        </section>

        <section aria-label="Perbaiki kategori" className="min-w-0 xl:col-span-7">
          <Panel
            title="Perbaiki kategori"
            caption={
              badges.data === undefined ? undefined : `${badges.data.needs_review} transaksi`
            }
            density="list"
          >
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
                <p className="p-4 text-meta text-ash">
                  Semua beres. Tidak ada transaksi yang menunggu review kategori.
                </p>
              }
            >
            {() => (
              <div>
                {groupByJakartaDay(reviewRows).map((group) => (
                  <section key={group.day}>
                    <GroupLabel className="px-4">{group.day}</GroupLabel>
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
                  <div className="flex justify-center p-4">
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
          </Panel>
        </section>
      </div>
    </>
  );
}

/** Owns its own mutation so one pending row never disables the others. */
function HoldRow({ item }: { item: PendingAction }) {
  const resolve = useResolveHold();
  const { openHold, openReceipt } = useCaptureSheet();
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

  const originalText =
    typeof item.params.original_text === "string" ? item.params.original_text : "";
  const missing = Array.isArray(item.params.missing) ? item.params.missing.map(String) : [];
  // A capture is an unfinished write: confirming it means filling the
  // gap the bot refused to guess, which is the capture form's job. A
  // receipt is N lines at a printed total, so it has its own sheet. A
  // refund is a yes/no on an already-identified target.
  const isCapture = item.kind === "capture";
  const isReceipt = item.kind === "receipt";

  /** The row's one action, shared by the row body and Konfirmasi. */
  function primary() {
    if (isCapture) {
      openHold(item);
    } else if (isReceipt) {
      openReceipt(item);
    } else {
      setConfirming("confirm");
    }
  }

  return (
    // On a phone the summary needs the full width — two lines of a
    // 160px column hide the amount — so the actions drop to their own
    // row and the grid is one column until md.
    <li className="relative grid min-h-11 gap-y-1.5 border-b border-border px-4 py-1.5 last:border-b-0 md:min-h-9 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-x-3 md:gap-y-0">
      {/* The whole row is the target: a phone summary is too long to read
          from a 2px-tall button. `-bottom-px` reaches over the hairline. */}
      <button
        type="button"
        onClick={primary}
        aria-label={item.summary}
        className="absolute inset-0 -bottom-px hover:bg-surface-100 focus-visible:ring-[4px] focus-visible:ring-primary/10 focus-visible:outline-none"
      />
      <div className="pointer-events-none relative min-w-0">
        <div className="flex min-w-0 flex-col gap-1 md:flex-row md:items-center md:gap-2">
          <p className="line-clamp-2 text-body font-medium text-ink md:truncate">{item.summary}</p>
          {missing.length > 0 ? (
            <StatusBadge tone="warn" className="self-start">
              {`Butuh ${missing
                .map((field) => FIELD_LABELS[field] ?? field)
                .join(", ")
                .toLowerCase()}`}
            </StatusBadge>
          ) : null}
        </div>
        <p className="truncate text-meta text-ash">
          {originalText === "" ? null : (
            <>
              {`\u201c${originalText}\u201d`}
              <span aria-hidden="true"> · </span>
            </>
          )}
          {dayLabel(item.created_at)} · {timeLabel(item.created_at)}
        </p>
      </div>
      {/* The params table is not inline: a refund previews its numbers
          inside the confirm dialog, a capture and a receipt open their
          own sheet. */}
      <div className="relative z-10 flex items-center justify-end gap-1">
        <Button
          variant="dangerGhost"
          size="sm"
          disabled={resolve.isPending}
          onClick={() => setConfirming("discard")}
        >
          Buang
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={resolve.isPending}
          onClick={primary}
        >
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
  const qc = useQueryClient();
  const [flash, setFlash] = useState(false);

  function save(categoryId: string) {
    update.mutate(
      { id: item.transaction_id, category_id: categoryId },
      {
        onSuccess: () => {
          setFlash(true);
          toast.success("Kategori disimpan");
          // Let the teal flash play, then drop the row locally so the
          // list settles even before the refetch lands.
          setTimeout(() => {
            qc.setQueryData<InfiniteData<TransactionListEnvelope>>(
              ["transactions", "infinite", REVIEW_FILTERS],
              (current) =>
                current === undefined
                  ? current
                  : {
                      ...current,
                      pages: current.pages.map((page) => ({
                        ...page,
                        data: {
                          ...page.data,
                          transactions: (page.data?.transactions ?? []).filter(
                            (row) => row.transaction_id !== item.transaction_id,
                          ),
                        },
                      })),
                    },
            );
          }, 900);
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
        <div className="flex w-full items-center gap-2 sm:w-auto">
          {guess === null ? null : (
            <span className="hidden truncate text-meta whitespace-nowrap text-ash lg:inline">
              Tebakan: {guess}
            </span>
          )}
          <CategoryPicker
            value={item.category_id ?? ""}
            onChange={save}
            categories={categories}
            size="sm"
            disabled={update.isPending}
            ariaLabel={`Ganti kategori ${item.merchant ?? item.type}`}
            className="w-full sm:w-40"
          />
          <Button
            size="sm"
            variant="secondary"
            className="shrink-0"
            disabled={
              update.isPending || item.category_id === null || item.category_id === undefined
            }
            onClick={() => save(item.category_id as string)}
          >
            Benar
          </Button>
        </div>
      }
    />
  );
}
