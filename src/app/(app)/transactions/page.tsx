"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox, Plus, Search } from "lucide-react";

import { EmptyState, QueryErrorState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { GroupLabel } from "@/components/group-label";
import { LedgerRow, LedgerRowSkeleton } from "@/components/ledger-row";
import { PageHeader } from "@/components/page-header";
import { useCaptureSheet } from "@/components/capture-sheet-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSources, useSourceTypeMap, useTransactionsInfinite } from "@/lib/api/hooks";
import { groupByJakartaDay } from "@/lib/group-by-day";

export default function TransactionsPage() {
  const { openCreate, openDetail } = useCaptureSheet();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [direction, setDirection] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");


  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const sources = useSources();
  const sourceTypes = useSourceTypeMap();

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


  const groups = groupByJakartaDay(rows);
  const filtersActive =
    debouncedQuery !== "" || direction !== "" || sourceFilter !== "" || statusFilter !== "";

  function resetFilters() {
    setQuery("");
    setDebouncedQuery("");
    setDirection("");
    setSourceFilter("");
    setStatusFilter("");
  }

  return (
    <>
      <PageHeader
        title="Transactions"
        actions={
          <Button onClick={() => openCreate()}>
            <Plus className="size-4" /> Tambah Transaksi
          </Button>
        }
      />

      <FilterBar className="grid grid-cols-2 gap-2 lg:grid-cols-4">
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
      </FilterBar>

      {pages.isPending ? (
        <div>
          {Array.from({ length: 8 }, (_, index) => (
            <LedgerRowSkeleton key={index} />
          ))}
        </div>
      ) : pages.isError ? (
        <QueryErrorState message="Transaksi gagal dimuat." onRetry={() => pages.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          heading="Tidak ada transaksi"
          caption={
            filtersActive
              ? "Tidak ada yang cocok dengan filter ini."
              : "Catat lewat WhatsApp atau tambah manual dari sini."
          }
          action={
            filtersActive ? (
              <Button variant="ghost" onClick={resetFilters}>
                Hapus filter
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div
          className={`pb-4 ${
            pages.isFetching && !pages.isFetchingNextPage ? "opacity-60 transition-opacity" : ""
          }`}
        >
          {groups.map((group) => (
            <section key={group.day}>
              <GroupLabel sticky className="top-[calc(56px+var(--toolbar-h,0px))]">
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

          {pages.hasNextPage ? (
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                disabled={pages.isFetchingNextPage}
                onClick={() => pages.fetchNextPage()}
              >
                Muat lebih banyak
              </Button>
            </div>
          ) : null}
        </div>
      )}


    </>
  );
}
