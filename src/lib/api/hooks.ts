"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiFetchEnvelope, apiGet, apiSend } from "./client";
import type { components } from "./schema";

type DataOf<E extends { data?: unknown }> = NonNullable<E["data"]>;

export type SourcesData = DataOf<components["schemas"]["SourcesEnvelope"]>;
export type Source = components["schemas"]["Source"];
export type LedgerItem = components["schemas"]["LedgerItem"];
export type TransactionListEnvelope = components["schemas"]["TransactionListEnvelope"];
export type TransactionListData = NonNullable<TransactionListEnvelope["data"]>;
export type Transaction = components["schemas"]["Transaction"];
export type Category = components["schemas"]["Category"];
export type Bill = components["schemas"]["Bill"];
export type BudgetRow = components["schemas"]["BudgetRow"];
export type Overview = components["schemas"]["Overview"];
export type BadgeCounts = components["schemas"]["BadgeCounts"];
export type PendingAction = components["schemas"]["PendingAction"];
export type Settings = components["schemas"]["Settings"];
export type CategoryBreakdownData = DataOf<components["schemas"]["CategoryBreakdownEnvelope"]>;
export type IncomeExpenseData = DataOf<components["schemas"]["IncomeExpenseEnvelope"]>;
export type StsTrendData = DataOf<components["schemas"]["StsTrendEnvelope"]>;
export type HeatmapData = DataOf<components["schemas"]["HeatmapEnvelope"]>;
export type TopMerchantsData = DataOf<components["schemas"]["TopMerchantsEnvelope"]>;
export type EssentialLifestyleData = DataOf<components["schemas"]["EssentialLifestyleEnvelope"]>;

// ------------------------------------------------------------------ overview

export function useOverview() {
  return useQuery({
    queryKey: ["overview"],
    queryFn: () => apiGet<Overview>("/overview"),
  });
}

export function useBadges() {
  return useQuery({
    queryKey: ["badges"],
    queryFn: () => apiGet<BadgeCounts>("/badges"),
  });
}

// ------------------------------------------------------------------ sources

export function useSources(includeArchived = false) {
  return useQuery({
    queryKey: ["sources", includeArchived],
    queryFn: () => apiGet<SourcesData>(`/sources${includeArchived ? "?include_archived=true" : ""}`),
  });
}

export function useCreateSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; type: string; is_debt?: boolean; currency?: string }) =>
      apiSend<Source>("/sources", "POST", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sources"] }),
  });
}

export function useUpdateSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; is_debt?: boolean }) =>
      apiSend<Source>(`/sources/${id}`, "PATCH", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sources"] }),
  });
}

export function useArchiveSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiSend<{ archived: boolean }>(`/sources/${id}`, "DELETE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sources"] }),
  });
}

export function useAdjustSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; amount_minor: number; note?: string }) =>
      apiSend<Transaction>(`/sources/${id}/adjustments`, "POST", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sources"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

// ------------------------------------------------------------- transactions

export type TransactionFilters = {
  source_id?: string;
  category_id?: string;
  review_status?: string;
  q?: string;
  from?: string;
  to?: string;
  direction?: string;
  limit?: number;
  cursor?: string;
};

function transactionsPath(filters: TransactionFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return `/transactions${qs === "" ? "" : `?${qs}`}`;
}

/** Cursor-paged list for the transactions screen ("Muat lebih banyak"). */
export function useTransactionsInfinite(filters: TransactionFilters) {
  return useInfiniteQuery({
    queryKey: ["transactions", "infinite", filters],
    queryFn: ({ pageParam }) =>
      apiFetchEnvelope<TransactionListEnvelope>(transactionsPath({ ...filters, cursor: pageParam })),
    initialPageParam: "",
    getNextPageParam: (lastPage) => {
      const next = lastPage.page?.next_cursor;
      return next !== undefined && next !== "" ? next : undefined;
    },
  });
}

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => apiGet<TransactionListData>(transactionsPath(filters)),
    placeholderData: keepPreviousData,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiSend<Transaction>("/transactions", "POST", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["overview"] });
      qc.invalidateQueries({ queryKey: ["sources"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["badges"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; amount_minor?: number; category_id?: string; note?: string; merchant?: string }) =>
      apiSend<Transaction>(`/transactions/${id}`, "PATCH", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["overview"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["sources"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useVoidTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiSend<{ voided: boolean }>(`/transactions/${id}`, "DELETE"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["overview"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["sources"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useReverseTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      apiSend<Transaction>(`/transactions/${id}/reversals`, "POST", note === undefined ? undefined : { note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["overview"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["sources"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

// --------------------------------------------------------------- categories

export function useCategories(includeArchived = false) {
  return useQuery({
    queryKey: ["categories", includeArchived],
    queryFn: () =>
      apiGet<{ categories: Category[] }>(`/categories${includeArchived ? "?include_archived=true" : ""}`),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; parent_id?: string; icon?: string; essential?: boolean }) =>
      apiSend<Category>("/categories", "POST", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; parent_id?: string | null; essential?: boolean }) =>
      apiSend<Category>(`/categories/${id}`, "PATCH", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useArchiveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiSend<{ archived: boolean }>(`/categories/${id}`, "DELETE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

// -------------------------------------------------------------------- bills

export function useBills() {
  return useQuery({
    queryKey: ["bills"],
    queryFn: () => apiGet<{ bills: Bill[] }>("/bills"),
  });
}

export function useCreateBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => apiSend<Bill>("/bills", "POST", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bills"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
  });
}

export function useUpdateBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      apiSend<Bill>(`/bills/${id}`, "PATCH", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bills"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
  });
}

export function useDeactivateBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiSend<{ active: boolean }>(`/bills/${id}`, "DELETE"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bills"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
  });
}

// ------------------------------------------------------------------ budgets

export function useBudgets(period?: string) {
  return useQuery({
    queryKey: ["budgets", period ?? "current"],
    queryFn: () =>
      apiGet<{ period: string; budgets: BudgetRow[] }>(`/budgets${period ? `?period=${period}` : ""}`),
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { category_id: string; period: string; amount_minor: number }) =>
      apiSend<BudgetRow>("/budgets", "POST", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount_minor }: { id: string; amount_minor: number }) =>
      apiSend<BudgetRow>(`/budgets/${id}`, "PATCH", { amount_minor }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiSend<{ deleted: boolean }>(`/budgets/${id}`, "DELETE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

// ---------------------------------------------------------------- analytics

export type AnalyticsMetric =
  | "category-breakdown"
  | "income-expense"
  | "sts-trend"
  | "heatmap"
  | "top-merchants"
  | "essential-lifestyle";

export function useAnalytics<T>(metric: AnalyticsMetric, params: Record<string, string | number | undefined> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return useQuery({
    queryKey: ["analytics", metric, params],
    queryFn: () => apiGet<T>(`/analytics/${metric}${qs === "" ? "" : `?${qs}`}`),
  });
}

// --------------------------------------------------------------- hold queue

export function useHoldQueue() {
  return useQuery({
    queryKey: ["hold-queue"],
    queryFn: () => apiGet<{ items: PendingAction[] }>("/hold-queue"),
  });
}

export function useResolveHold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "confirm" | "discard" }) =>
      apiSend<{ resolved: boolean }>(`/hold-queue/${id}/resolve`, "POST", { action }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hold-queue"] });
      qc.invalidateQueries({ queryKey: ["badges"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
  });
}

// ----------------------------------------------------------------- settings

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => apiGet<Settings>("/settings"),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { income_horizon_days: number }) =>
      apiSend<Settings>("/settings", "PUT", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
  });
}
