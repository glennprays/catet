"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { Chip } from "@/components/chip";
import { FilterBar } from "@/components/filter-bar";
import { FormField } from "@/components/form-field";
import { PeriodPicker } from "@/components/period-picker";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories, useMerchantNameMap, useSources } from "@/lib/api/hooks";
import { periodLabel, type Period, type PeriodPreset } from "@/lib/period";
import { useIsPhone } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

const DIRECTIONS = [
  { value: "expense", label: "Keluar" },
  { value: "income", label: "Masuk" },
  { value: "transfer", label: "Pindah" },
  { value: "adjustment", label: "Koreksi" },
];

/* "Di-void" is a bin, not a review state: it asks for the soft-deleted
   rows instead of narrowing the live ones. */
const STATUSES = [
  { value: "clean", label: "Bersih" },
  { value: "needs_review", label: "Perlu review" },
  { value: "voided", label: "Di-void" },
];

const PERIOD_PRESETS: PeriodPreset[] = ["7d", "30d", "month", "last_month", "90d", "custom", "all"];

/** The filter state the bar displays; the page owns it in the URL. */
export type TransactionFilterValues = {
  /** Live text in the box — the URL only learns it once typing settles. */
  query: string;
  direction: string;
  sourceId: string;
  status: string;
  categoryId: string;
  merchantId: string;
  period: Period;
};

/**
 * The Transactions filter surface: search, window, selects, applied-filter
 * chips and the phone sheet that holds the selects on a small screen.
 *
 * It renders state it does not own — `set` writes URL search params, so
 * every filter here is linkable and reachable from a chart click-through.
 */
export function TransactionFilterBar({
  values,
  onQueryChange,
  set,
  onReset,
}: {
  values: TransactionFilterValues;
  onQueryChange: (query: string) => void;
  set: (patch: Record<string, string | null>) => void;
  onReset: () => void;
}) {
  const { query, direction, sourceId, status, categoryId, merchantId, period } = values;
  const [sheetOpen, setSheetOpen] = useState(false);
  const isPhone = useIsPhone();

  const sources = useSources();
  const categories = useCategories();
  const merchantNames = useMerchantNameMap();

  const selected = [direction, sourceId, status, categoryId, merchantId];
  const activeCount =
    selected.filter((value) => value !== "").length + (period.preset === "30d" ? 0 : 1);

  /* The phone bar shows one Filter button instead of the selects, so the
     chips below it are the only place that says what is applied. On
     desktop the controls speak for themselves — except merchant and
     category, which only ever arrive by deep link, so their chips are the
     sole way to see and drop them. */
  const chips: {
    key: string;
    label: string;
    remove: string;
    clear: () => void;
    phoneOnly: boolean;
  }[] = [];
  if (period.preset !== "30d") {
    chips.push({
      key: "period",
      label: periodLabel(period),
      remove: "Hapus filter rentang",
      clear: () => set({ period: null, from: null, to: null }),
      phoneOnly: true,
    });
  }
  if (direction !== "") {
    chips.push({
      key: "direction",
      label: DIRECTIONS.find((option) => option.value === direction)?.label ?? direction,
      remove: "Hapus filter arah",
      clear: () => set({ direction: null }),
      phoneOnly: true,
    });
  }
  if (sourceId !== "") {
    chips.push({
      key: "source",
      label:
        (sources.data?.sources ?? []).find((source) => source.id === sourceId)?.name ?? "Sumber",
      remove: "Hapus filter sumber",
      clear: () => set({ source_id: null }),
      phoneOnly: true,
    });
  }
  if (status !== "") {
    chips.push({
      key: "status",
      label: STATUSES.find((option) => option.value === status)?.label ?? status,
      remove: "Hapus filter status",
      clear: () => set({ status: null }),
      phoneOnly: true,
    });
  }
  if (categoryId !== "") {
    chips.push({
      key: "category",
      label:
        (categories.data?.categories ?? []).find((category) => category.id === categoryId)?.name ??
        "Kategori",
      remove: "Hapus filter kategori",
      clear: () => set({ category_id: null }),
      phoneOnly: false,
    });
  }
  if (merchantId !== "") {
    chips.push({
      key: "merchant",
      label: `Merchant: ${merchantNames.get(merchantId) ?? "…"}`,
      remove: "Hapus filter merchant",
      clear: () => set({ merchant_id: null }),
      phoneOnly: false,
    });
  }
  const visibleChips = isPhone ? chips : chips.filter((chip) => !chip.phoneOnly);

  /* One instance of each control, placed either inline (desktop toolbar)
     or stacked inside the phone sheet — never both, so the ledger never
     has two comboboxes with the same accessible name. In the sheet the
     `FormField` label names the control, so the `aria-label` would only
     fight it. */
  const selectClass = isPhone ? "w-full" : "sm:w-auto";
  const periodPicker = (
    <PeriodPicker
      value={period}
      presets={PERIOD_PRESETS}
      inline={!isPhone}
      id={isPhone ? "tx-filter-period" : undefined}
      onChange={(next) =>
        set({
          period: next.preset,
          from: next.preset === "custom" ? (next.from ?? null) : null,
          to: next.preset === "custom" ? (next.to ?? null) : null,
        })
      }
    />
  );
  const directionSelect = (
    <Select
      value={direction}
      onValueChange={(value) => set({ direction: value === "all" ? null : value })}
    >
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
      value={sourceId}
      onValueChange={(value) => set({ source_id: value === "all" ? null : value })}
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
      value={status}
      onValueChange={(value) => set({ status: value === "all" ? null : value })}
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
      <FilterBar className="flex flex-wrap items-center gap-2">
        {isPhone ? null : periodPicker}
        <div className={cn("relative", isPhone ? "min-w-0 flex-1" : "w-full sm:w-64")}>
          <Search
            className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ash"
            strokeWidth={1.75}
          />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
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
            onClick={() => setSheetOpen(true)}
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
        {visibleChips.length > 0 ? (
          <div className="flex w-full flex-wrap items-center gap-2">
            {visibleChips.map((chip) => (
              <Chip key={chip.key} onRemove={chip.clear} removeLabel={chip.remove}>
                {chip.label}
              </Chip>
            ))}
            {isPhone ? (
              <Button variant="ghost" size="sm" onClick={onReset}>
                Reset
              </Button>
            ) : null}
          </div>
        ) : null}
      </FilterBar>

      {isPhone ? (
        <ResponsiveSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          title="Filter"
          footer={
            <>
              <Button variant="ghost" onClick={onReset}>
                Reset
              </Button>
              <Button onClick={() => setSheetOpen(false)}>Selesai</Button>
            </>
          }
        >
          <FormField label="Rentang waktu" htmlFor="tx-filter-period">
            {periodPicker}
          </FormField>
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
