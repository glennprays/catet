"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox, Plus, Search, SlidersHorizontal } from "lucide-react";

import { Chip } from "@/components/chip";
import { EmptyState, QueryErrorState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { FormField } from "@/components/form-field";
import { GroupLabel } from "@/components/group-label";
import { LedgerHead, LedgerRow, LedgerRowSkeleton } from "@/components/ledger-row";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { ResponsiveSheet } from "@/components/responsive-sheet";
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
import { useIsPhone } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

const DIRECTIONS = [
  { value: "expense", label: "Keluar" },
  { value: "income", label: "Masuk" },
  { value: "transfer", label: "Pindah" },
  { value: "adjustment", label: "Koreksi" },
];

const STATUSES = [
  { value: "clean", label: "Bersih" },
  { value: "needs_review", label: "Perlu review" },
];

export default function TransactionsPage() {
  const { openCreate, openDetail } = useCaptureSheet();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [direction, setDirection] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const isPhone = useIsPhone();

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
  const activeCount = [direction, sourceFilter, statusFilter].filter((value) => value !== "")
    .length;

  function clearFilters() {
    setDirection("");
    setSourceFilter("");
    setStatusFilter("");
  }

  function resetFilters() {
    setQuery("");
    setDebouncedQuery("");
    clearFilters();
  }

  /* The phone bar shows one Filter button instead of three selects, so
     the chips below it are the only place that says what is applied. */
  const activeChips: { key: string; label: string; remove: string; clear: () => void }[] = [];
  if (direction !== "") {
    activeChips.push({
      key: "direction",
      label: DIRECTIONS.find((option) => option.value === direction)?.label ?? direction,
      remove: "Hapus filter arah",
      clear: () => setDirection(""),
    });
  }
  if (sourceFilter !== "") {
    activeChips.push({
      key: "source",
      label:
        (sources.data?.sources ?? []).find((source) => source.id === sourceFilter)?.name ??
        "Sumber",
      remove: "Hapus filter sumber",
      clear: () => setSourceFilter(""),
    });
  }
  if (statusFilter !== "") {
    activeChips.push({
      key: "status",
      label: STATUSES.find((option) => option.value === statusFilter)?.label ?? statusFilter,
      remove: "Hapus filter status",
      clear: () => setStatusFilter(""),
    });
  }

  /* One instance of each select, placed either inline (desktop toolbar)
     or stacked inside the phone sheet — never both, so the ledger never
     has two comboboxes with the same accessible name. In the sheet the
     `FormField` label names the control, so the `aria-label` would only
     fight it. */
  const selectClass = isPhone ? "w-full" : "sm:w-auto";
  const directionSelect = (
    <Select value={direction} onValueChange={(value) => setDirection(value === "all" ? "" : value)}>
      <SelectTrigger
        id="tx-filter-direction"
        className={selectClass}
        aria-label={isPhone ? undefined : "Filter arah"}
      >
        <SelectValue placeholder="Semua arah" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua arah</SelectItem>
        {DIRECTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  const sourceSelect = (
    <Select
      value={sourceFilter}
      onValueChange={(value) => setSourceFilter(value === "all" ? "" : value)}
    >
      <SelectTrigger
        id="tx-filter-source"
        className={selectClass}
        aria-label={isPhone ? undefined : "Filter sumber"}
      >
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
  );
  const statusSelect = (
    <Select
      value={statusFilter}
      onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}
    >
      <SelectTrigger
        id="tx-filter-status"
        className={selectClass}
        aria-label={isPhone ? undefined : "Filter status"}
      >
        <SelectValue placeholder="Semua status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua status</SelectItem>
        {STATUSES.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

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

      <FilterBar className="flex flex-wrap items-center gap-2">
        <div className={cn("relative", isPhone ? "min-w-0 flex-1" : "w-full sm:w-64")}>
          <Search
            className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ash"
            strokeWidth={1.75}
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari merchant / catatan"
            className="pl-8"
            aria-label="Cari transaksi"
          />
        </div>
        {isPhone ? (
          <Button
            variant="secondary"
            size="icon"
            className="relative"
            aria-label={`Filter${activeCount === 0 ? "" : ` (${activeCount} aktif)`}`}
            onClick={() => setFilterOpen(true)}
          >
            <SlidersHorizontal className="size-4" strokeWidth={1.75} />
            {activeCount === 0 ? null : (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-label tabular-nums text-white">
                {activeCount}
              </span>
            )}
          </Button>
        ) : (
          <>
            {directionSelect}
            {sourceSelect}
            {statusSelect}
          </>
        )}
        {isPhone && activeChips.length > 0 ? (
          <div className="flex w-full flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <Chip key={chip.key} onRemove={chip.clear} removeLabel={chip.remove}>
                {chip.label}
              </Chip>
            ))}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Reset
            </Button>
          </div>
        ) : null}
      </FilterBar>

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

      {isPhone ? (
        <ResponsiveSheet
          open={filterOpen}
          onOpenChange={setFilterOpen}
          title="Filter"
          footer={
            <>
              <Button variant="ghost" onClick={clearFilters}>
                Reset
              </Button>
              <Button onClick={() => setFilterOpen(false)}>Selesai</Button>
            </>
          }
        >
          <FormField label="Arah" htmlFor="tx-filter-direction">
            {directionSelect}
          </FormField>
          <FormField label="Sumber" htmlFor="tx-filter-source">
            {sourceSelect}
          </FormField>
          <FormField label="Status" htmlFor="tx-filter-status">
            {statusSelect}
          </FormField>
        </ResponsiveSheet>
      ) : null}

    </>
  );
}
