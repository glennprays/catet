"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiFetchEnvelope, apiGet, apiSend } from "./client";
import type { components, operations } from "./schema";

type DataOf<E extends { data?: unknown }> = NonNullable<E["data"]>;

export type SourcesData = DataOf<components["schemas"]["SourcesEnvelope"]>;
export type Source = components["schemas"]["Source"];
export type LedgerItem = components["schemas"]["LedgerItem"];
export type TransactionListEnvelope = components["schemas"]["TransactionListEnvelope"];
export type TransactionListData = NonNullable<TransactionListEnvelope["data"]>;
export type Transaction = components["schemas"]["Transaction"];
export type Category = components["schemas"]["Category"];
export type Bill = components["schemas"]["Bill"];
export type BillPayment = components["schemas"]["BillPayment"];
export type BillPaymentResult = DataOf<components["schemas"]["BillPaymentEnvelope"]>;
export type BudgetRow = components["schemas"]["BudgetRow"];
export type Overview = components["schemas"]["Overview"];
export type BadgeCounts = components["schemas"]["BadgeCounts"];
export type PendingAction = components["schemas"]["PendingAction"];
export type Settings = components["schemas"]["Settings"];
export type Me = components["schemas"]["Me"];
export type User = components["schemas"]["User"];
export type Invite = components["schemas"]["Invite"];
export type CategoryBreakdownData = DataOf<components["schemas"]["CategoryBreakdownEnvelope"]>;
export type IncomeExpenseData = DataOf<components["schemas"]["IncomeExpenseEnvelope"]>;
export type StsTrendData = DataOf<components["schemas"]["StsTrendEnvelope"]>;
export type HeatmapData = DataOf<components["schemas"]["HeatmapEnvelope"]>;
export type TopMerchantsData = DataOf<components["schemas"]["TopMerchantsEnvelope"]>;
export type MerchantListData = DataOf<components["schemas"]["MerchantListEnvelope"]>;
export type MerchantSummary = components["schemas"]["MerchantSummary"];
export type Merchant = components["schemas"]["Merchant"];
export type TopMerchant = components["schemas"]["TopMerchant"];
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

/**
 * Ledger rows show a source glyph; the list payload carries only the
 * source name, so the type comes from the sources cache.
 */
export function useSourceTypeMap(): Map<string, Source["type"]> {
  const sources = useSources();
  return useMemo(
    () => new Map((sources.data?.sources ?? []).map((source) => [source.id, source.type])),
    [sources.data],
  );
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
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      type?: Source["type"];
      is_debt?: boolean;
    }) => apiSend<Source>(`/sources/${id}`, "PATCH", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sources"] }),
  });
}

/**
 * The archive response is only `{ archived: true }`, so confirmed success
 * moves the row between the two cached memberships instead of waiting on
 * the refetch: the include-archived list marks the source, the active-only
 * list drops it. Totals stay put — the backend refuses to archive a
 * source with a balance — and the timestamp is a transient membership
 * marker the refetch replaces with server truth.
 */
function archiveCachedSource(qc: QueryClient, id: string, archivedAt: string): void {
  qc.setQueryData<SourcesData>(["sources", true], (current) =>
    current === undefined
      ? current
      : {
          ...current,
          sources: current.sources.map((source) =>
            source.id === id ? { ...source, archived_at: archivedAt } : source,
          ),
        },
  );
  qc.setQueryData<SourcesData>(["sources", false], (current) =>
    current === undefined
      ? current
      : { ...current, sources: current.sources.filter((source) => source.id !== id) },
  );
}

export function useArchiveSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiSend<{ archived: boolean }>(`/sources/${id}`, "DELETE"),
    onSuccess: (_data, id) => {
      archiveCachedSource(qc, id, new Date().toISOString());
      qc.invalidateQueries({ queryKey: ["sources"] });
    },
  });
}

export function useRestoreSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiSend<Source>(`/sources/${id}/restore`, "POST"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sources"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
  });
}

/**
 * Permanent delete, only ever offered for a source the ledger never
 * touched. Bills that linked it are unlinked server-side, so their
 * cache goes too.
 */
export function useDeleteSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiSend<{ deleted: boolean }>(`/sources/${id}/permanent`, "DELETE"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sources"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
      qc.invalidateQueries({ queryKey: ["bills"] });
    },
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
      qc.invalidateQueries({ queryKey: ["badges"] });
    },
  });
}

// ------------------------------------------------------------- transactions

export type TransactionFilters = {
  source_id?: string;
  category_id?: string;
  merchant_id?: string;
  review_status?: string;
  /** Soft-deleted rows: "exclude" (default), "include", or the "only" bin. */
  voided?: "exclude" | "include" | "only";
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
    // Filtering must not blank the list: keep the previous page while
    // the new query resolves.
    placeholderData: keepPreviousData,
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

/**
 * Invalidation policy. A category fix only moves labels, so it must not
 * refetch balances or the whole analytics namespace: on a Pi-class host
 * that was eight round trips per row.
 */
function invalidateLedger(qc: QueryClient, scope: "money" | "label"): void {
  const keys: unknown[][] =
    scope === "money"
      ? [["overview"], ["sources"], ["transactions"], ["badges"], ["analytics"], ["budgets"]]
      : [
          ["transactions"],
          ["badges"],
          ["overview"],
          ["analytics", "category-breakdown"],
          ["analytics", "essential-lifestyle"],
          ["budgets"],
        ];
  for (const queryKey of keys) {
    qc.invalidateQueries({ queryKey });
  }
}

/** Full transaction: legs, provenance, edit history (detail sheet). */
export function useTransaction(id: string | null) {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: () => apiGet<Transaction>(`/transactions/${id}`),
    enabled: id !== null,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiSend<Transaction>("/transactions", "POST", body),
    onSuccess: () => invalidateLedger(qc, "money"),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      amount_minor?: number;
      occurred_at?: string;
      category_id?: string;
      note?: string;
      merchant?: string;
    }) => apiSend<Transaction>(`/transactions/${id}`, "PATCH", body),
    onSuccess: (_data, variables) => {
      const { id, ...body } = variables;
      const labelOnly = Object.keys(body).length === 1 && body.category_id !== undefined;
      invalidateLedger(qc, labelOnly ? "label" : "money");
      qc.invalidateQueries({ queryKey: ["transaction", id] });
    },
  });
}

export function useVoidTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiSend<{ voided: boolean }>(`/transactions/${id}`, "DELETE"),
    onSuccess: (_data, id) => {
      invalidateLedger(qc, "money");
      qc.invalidateQueries({ queryKey: ["transaction", id] });
    },
  });
}

export function useReverseTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      apiSend<Transaction>(
        `/transactions/${id}/reversals`,
        "POST",
        note === undefined ? undefined : { note },
      ),
    onSuccess: (_data, variables) => {
      invalidateLedger(qc, "money");
      qc.invalidateQueries({ queryKey: ["transaction", variables.id] });
    },
  });
}

// ---------------------------------------------------------------- merchants

export function useMerchants() {
  return useQuery({
    queryKey: ["merchants"],
    queryFn: () => apiGet<MerchantListData>("/merchants"),
  });
}

/** Name → merchant lookup for chips, datalists and deep links. */
export function useMerchantNameMap(): Map<string, string> {
  const merchants = useMerchants();
  return useMemo(
    () => new Map((merchants.data?.merchants ?? []).map((m) => [m.id, m.name])),
    [merchants.data],
  );
}

export function useRenameMerchant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiSend<{ merchant: Merchant }>(`/merchants/${id}`, "PATCH", { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["merchants"] });
      // Every row carries the merchant name as display text.
      invalidateLedger(qc, "label");
    },
  });
}

export function useMergeMerchant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, intoMerchantId }: { id: string; intoMerchantId: string }) =>
      apiSend<{ merged: boolean; into_merchant_id: string }>(`/merchants/${id}/merge`, "POST", {
        into_merchant_id: intoMerchantId,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["merchants"] });
      invalidateLedger(qc, "label");
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

export function useReactivateBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiSend<{ active: boolean }>(`/bills/${id}/activate`, "POST"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bills"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
  });
}

/**
 * The payment response carries the authoritative Bill — cadence,
 * completion and next due date are already applied server-side — so the
 * cached list is patched instead of waiting a round trip. Only the
 * matching id is replaced, and a cache that was never populated stays
 * that way.
 */
function replaceCachedBill(qc: QueryClient, next: Bill): void {
  qc.setQueryData<{ bills: Bill[] }>(["bills"], (current) =>
    current === undefined
      ? current
      : { bills: current.bills.map((bill) => (bill.id === next.id ? next : bill)) },
  );
}

/**
 * Paying a bill writes a real expense, so it invalidates the money
 * surfaces as well as the bill list: Safe-to-Spend, balances and the
 * ledger all moved. The returned Bill moves the row between the
 * `Aktif`/`Selesai` groups before the list refetch lands.
 */
export function usePayBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      apiSend<BillPaymentResult>(`/bills/${id}/payments`, "POST", body),
    onSuccess: (result) => {
      replaceCachedBill(qc, result.bill);
      invalidateLedger(qc, "money");
      qc.invalidateQueries({ queryKey: ["bills"] });
      qc.invalidateQueries({ queryKey: ["bill-payments"] });
    },
  });
}

/** Settled occurrences in [from, to) — the calendar's paid markers. */
export function useBillPayments(from: string, to: string) {
  return useQuery({
    queryKey: ["bill-payments", from, to],
    queryFn: () => apiGet<{ payments: BillPayment[] }>(`/bills/payments?from=${from}&to=${to}`),
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

/** Recurring is the default: a rule runs from `period` until stopped. */
export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      category_id: string;
      period: string;
      amount_minor: number;
      recurring: boolean;
    }) => apiSend<BudgetRow>("/budgets", "POST", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

/** Scope decides whether the new nominal starts a run or carves out one month. */
export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      amount_minor,
      period,
      scope,
    }: {
      id: string;
      amount_minor: number;
      period: string;
      scope: "from_month" | "only_month";
    }) => apiSend<BudgetRow>(`/budgets/${id}`, "PATCH", { amount_minor, period, scope }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

/** Ends the rule from `period` on; earlier months stay as history. */
export function useStopBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, period }: { id: string; period: string }) =>
      apiSend<{ deleted: boolean }>(`/budgets/${id}/stop`, "POST", { period }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

/** Deletes the rule and its whole history. */
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

/** The overrides a confirming capture or receipt sheet may send with `confirm`. */
export type HoldOverrides = NonNullable<
  operations["resolveHoldQueueItem"]["requestBody"]
>["content"]["application/json"]["overrides"];

/** One parked receipt line's correction, keyed by the line's `n`. */
export type HoldItemOverride = NonNullable<
  NonNullable<HoldOverrides>["items"]
>[number];

export function useResolveHold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      overrides,
    }: {
      id: string;
      action: "confirm" | "discard";
      overrides?: HoldOverrides;
    }) =>
      apiSend<{
        resolved: boolean;
        transaction_id?: string;
        transaction_ids?: string[];
      }>(
        `/hold-queue/${id}/resolve`,
        "POST",
        { action, overrides },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hold-queue"] });
      // Confirming executes the parked write, so the ledger moved too
      // (invalidateLedger already covers badges and overview).
      invalidateLedger(qc, "money");
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
    mutationFn: (body: {
      income_horizon_days: number;
      photo_default_source_id: string | null;
      reminder_hour?: number;
    }) => apiSend<Settings>("/settings", "PUT", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
  });
}

// ------------------------------------------------------------------ account

/** Identity of the signed-in user — the `/settings` account row reads it. */
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<Me>("/auth/me"),
    staleTime: 5 * 60_000,
  });
}

/**
 * A password change bumps the session epoch, so the current cookie dies
 * with it: the caller sends the user back to /login on success.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (body: { current_password: string; new_password: string }) =>
      apiSend<{ ok: boolean }>("/auth/password/change", "POST", body),
  });
}

export function useLogoutAll() {
  return useMutation({
    mutationFn: () => apiSend<{ ok: boolean }>("/auth/logout-all", "POST"),
  });
}

// -------------------------------------------------------------------- users

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => apiGet<{ users: User[] }>("/users").then((data) => data.users),
  });
}

export function useInvites() {
  return useQuery({
    queryKey: ["invites"],
    queryFn: () => apiGet<{ invites: Invite[] }>("/users/invites").then((data) => data.invites),
  });
}

/** The token is never returned: the bot delivers the link over WhatsApp. */
export function useCreateInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { phone: string }) => apiSend<Invite>("/users/invites", "POST", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invites"] }),
  });
}

export function useRevokeInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      apiSend<{ ok: boolean }>(`/users/invites/${id}`, "DELETE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invites"] }),
  });
}

export function useSetUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      apiSend<User>(`/users/${id}/${active ? "activate" : "deactivate"}`, "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

// ------------------------------------------------------------- admin · AI

export type LlmProvider = components["schemas"]["LLMProvider"];
export type LlmProviderUpdate = components["schemas"]["LLMProviderUpdate"];
export type LlmModels = components["schemas"]["LLMModels"];
export type LlmTest = components["schemas"]["LLMTest"];

export function useLlmProvider() {
  return useQuery({
    queryKey: ["admin", "llm"],
    queryFn: () => apiGet<LlmProvider>("/admin/llm"),
  });
}

export function useUpdateLlmProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LlmProviderUpdate) => apiSend<LlmProvider>("/admin/llm", "PUT", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "llm"] }),
  });
}

/** Back to the environment variables the server booted with. */
export function useResetLlmProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiSend<LlmProvider>("/admin/llm", "DELETE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "llm"] }),
  });
}

/**
 * Both of these run against the *draft* form values, before anything is
 * saved, so they are mutations rather than queries.
 */
export function useLlmModels() {
  return useMutation({
    mutationFn: (body: { base_url: string; api_key?: string | null }) =>
      apiSend<LlmModels>("/admin/llm/models", "POST", body),
  });
}

export function useTestLlmProvider() {
  return useMutation({
    mutationFn: (body: LlmProviderUpdate) => apiSend<LlmTest>("/admin/llm/test", "POST", body),
  });
}
