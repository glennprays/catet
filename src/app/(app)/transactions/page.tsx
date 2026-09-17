"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Inbox, Plus } from "lucide-react";

import { EmptyState, QueryErrorState } from "@/components/empty-state";
import { GroupLabel } from "@/components/group-label";
import { LedgerHead, LedgerRow, LedgerRowSkeleton } from "@/components/ledger-row";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { TransactionFilterBar } from "@/components/transactions/transaction-filter-bar";
import { useCaptureSheet } from "@/components/capture-sheet-provider";
import { Button } from "@/components/ui/button";
import { useFilterParams } from "@/hooks/use-filter-params";
import {
  useSourceTypeMap,
  useTransactionsInfinite,
  type TransactionFilters,
} from "@/lib/api/hooks";
import { groupByJakartaDay } from "@/lib/group-by-day";
import { parsePeriod, resolvePeriod } from "@/lib/period";

/** Filters read `useSearchParams`, which needs a suspense boundary. */
export default function TransactionsPage() {
  return (
    <Suspense fallback={<LedgerFallback />}>
      <TransactionsScreen />
    </Suspense>
  );
}

function LedgerFallback() {
  return (
    <>
      <PageHeader title="Transactions" />
      <Panel density="list">
        <LedgerHead />
        {Array.from({ length: 8 }, (_, index) => (
          <LedgerRowSkeleton key={index} />
        ))}
      </Panel>
    </>
  );
}

function TransactionsScreen() {
  const { openCreate, openDetail } = useCaptureSheet();

  /* Every filter lives in the URL: the list is linkable, survives a
     reload, and analytics can hand it a merchant or a category. An absent
     key is the unfiltered value, and an absent `period` is the default
     30-day window — so landing on a bare /transactions rewrites nothing. */
  const { get, set } = useFilterParams();
  const urlQuery = get("q") ?? "";
  const direction = get("direction") ?? "";
  const sourceId = get("source_id") ?? "";
  const status = get("status") ?? "";
  const categoryId = get("category_id") ?? "";
  const merchantId = get("merchant_id") ?? "";
  const presetParam = get("period");
  const fromParam = get("from");
  const toParam = get("to");
  const period = useMemo(
    () => parsePeriod(presetParam, fromParam, toParam),
    [presetParam, fromParam, toParam],
  );

  const [query, setQuery] = useState(urlQuery);
  // The last term this box put in the URL. Router updates land a tick
  // after the debounce fires, so without it the arriving value would
  // clobber whatever was typed in the meantime.
  const written = useRef(urlQuery);

  /* The box types locally and the URL learns the term once typing
     settles. Writing only on a real difference keeps the mount — and the
     render after the URL catches up — from rewriting the URL. */
  useEffect(() => {
    if (query === urlQuery) return;
    const timer = setTimeout(() => {
      written.current = query;
      set({ q: query });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, urlQuery, set]);

  /* A term that arrived from anywhere else — Back, a deep link, Reset —
     is adopted by the box instead of being typed over. */
  useEffect(() => {
    if (urlQuery === written.current) return;
    written.current = urlQuery;
    setQuery(urlQuery);
  }, [urlQuery]);

  const filters = useMemo<TransactionFilters>(() => {
    const range = resolvePeriod(period);
    return {
      q: urlQuery === "" ? undefined : urlQuery,
      direction: direction === "" ? undefined : direction,
      source_id: sourceId === "" ? undefined : sourceId,
      category_id: categoryId === "" ? undefined : categoryId,
      merchant_id: merchantId === "" ? undefined : merchantId,
      // The bin and the review states are exclusive: "Di-void" asks for
      // the soft-deleted rows, every other status narrows the live ones.
      review_status: status === "" || status === "voided" ? undefined : status,
      voided: status === "voided" ? "only" : undefined,
      from: range.from,
      to: range.to,
      limit: 50,
    };
  }, [urlQuery, direction, sourceId, categoryId, merchantId, status, period]);

  const sourceTypes = useSourceTypeMap();
  const pages = useTransactionsInfinite(filters);
  const rows = useMemo(
    () => pages.data?.pages.flatMap((page) => page.data?.transactions ?? []) ?? [],
    [pages.data],
  );

  const groups = groupByJakartaDay(rows);
  const filtersActive =
    urlQuery !== "" ||
    [direction, sourceId, status, categoryId, merchantId].some((value) => value !== "");
  /* A window narrows the list even when nothing else does, so an empty
     ledger inside one is a range question before it is a filter one. */
  const windowActive = period.preset !== "all";

  function resetFilters() {
    setQuery("");
    set({
      q: null,
      direction: null,
      source_id: null,
      status: null,
      category_id: null,
      merchant_id: null,
      period: null,
      from: null,
      to: null,
    });
  }

  return (
    <>
      <PageHeader
        title="Transactions"
        actions={
          <Button onClick={() => openCreate()}>
            <Plus className="size-4" strokeWidth={1.75} /> Tambah
          </Button>
        }
      />

      <TransactionFilterBar
        values={{ query, direction, sourceId, status, categoryId, merchantId, period }}
        onQueryChange={setQuery}
        set={set}
        onReset={resetFilters}
      />

      <Panel
        density="list"
        className={
          pages.isFetching && !pages.isFetchingNextPage
            ? "opacity-60 transition-opacity"
            : undefined
        }
      >
        {pages.isPending ? (
          <>
            <LedgerHead />
            {Array.from({ length: 8 }, (_, index) => (
              <LedgerRowSkeleton key={index} />
            ))}
          </>
        ) : pages.isError ? (
          <div className="p-4">
            <QueryErrorState message="Transaksi gagal dimuat." onRetry={() => pages.refetch()} />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Inbox}
              heading="Tidak ada transaksi"
              caption={
                windowActive
                  ? "Tidak ada transaksi di rentang ini."
                  : filtersActive
                    ? "Tidak ada yang cocok dengan filter ini."
                    : "Catat lewat WhatsApp atau tambah manual dari sini."
              }
              action={
                windowActive || filtersActive ? (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {windowActive ? (
                      <Button
                        variant="ghost"
                        onClick={() => set({ period: "all", from: null, to: null })}
                      >
                        Lihat semua
                      </Button>
                    ) : null}
                    {filtersActive ? (
                      <Button variant="ghost" onClick={resetFilters}>
                        Hapus filter
                      </Button>
                    ) : null}
                  </div>
                ) : undefined
              }
            />
          </div>
        ) : (
          <>
            <LedgerHead />
            {groups.map((group) => (
              <section key={group.day}>
                <GroupLabel sticky className="top-[calc(48px+var(--toolbar-h,0px))]">
                  {group.day}
                </GroupLabel>
                {group.items.map((item) => (
                  <LedgerRow
                    key={item.transaction_id}
                    item={item}
                    onOpen={() => openDetail(item.transaction_id)}
                    sourceType={sourceTypes.get(item.source_id)}
                  />
                ))}
              </section>
            ))}
          </>
        )}
      </Panel>

      {pages.hasNextPage ? (
        <Button
          variant="secondary"
          size="sm"
          className="mx-auto mt-3 flex"
          disabled={pages.isFetchingNextPage}
          onClick={() => pages.fetchNextPage()}
        >
          Muat lebih banyak
        </Button>
      ) : null}
    </>
  );
}
