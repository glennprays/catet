"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { TransactionDetailSheet } from "@/components/transactions/transaction-detail-sheet";
import { TransactionSheet, type Direction } from "@/components/transactions/transaction-sheet";
import {
  useCategories,
  useSources,
  type LedgerItem,
  type Transaction,
} from "@/lib/api/hooks";

type CaptureSheet = {
  openCreate: (direction?: Direction) => void;
  openEdit: (item: LedgerItem) => void;
  openDetail: (id: string) => void;
};

const CaptureSheetContext = createContext<CaptureSheet | null>(null);

/**
 * Capture and detail are shell-level surfaces, not a page's: the mobile
 * FAB, every header button, and every ledger row drive the same two
 * sheet instances. Page-local sheet state made the FAB a no-op on the
 * screen that needed it most.
 */
export function useCaptureSheet(): CaptureSheet {
  const context = useContext(CaptureSheetContext);
  if (context === null) {
    throw new Error("useCaptureSheet must be used inside CaptureSheetProvider");
  }
  return context;
}

/** The edit form speaks the ledger row shape; the detail view the full one. */
function ledgerItemOf(transaction: Transaction): LedgerItem {
  const leg = transaction.legs.find(
    (candidate) => candidate.source_id !== null && candidate.source_id !== undefined,
  );
  return {
    transaction_id: transaction.id,
    occurred_at: transaction.occurred_at,
    type: transaction.type,
    merchant: transaction.merchant ?? null,
    note: transaction.note ?? null,
    amount_minor:
      leg?.signed_amount ??
      (transaction.type === "income" ? transaction.amount_minor : -transaction.amount_minor),
    category_id: transaction.category_id ?? null,
    category_name: transaction.category_name ?? null,
    source_id: leg?.source_id ?? "",
    source_name: leg?.source_name ?? "",
    review_status: transaction.review_status,
    voided: transaction.voided,
    reverses_transaction_id: transaction.reverses_transaction_id ?? null,
  };
}

export function CaptureSheetProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LedgerItem | null>(null);
  const [direction, setDirection] = useState<Direction | undefined>(undefined);
  const [detailId, setDetailId] = useState<string | null>(null);

  const categories = useCategories();
  const sources = useSources();

  const value = useMemo<CaptureSheet>(
    () => ({
      openCreate: (next) => {
        setEditing(null);
        setDirection(next);
        setOpen(true);
      },
      openEdit: (item) => {
        setEditing(item);
        setDirection(undefined);
        setOpen(true);
      },
      openDetail: (id) => setDetailId(id),
    }),
    [],
  );

  return (
    <CaptureSheetContext.Provider value={value}>
      {children}
      <TransactionSheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setEditing(null);
          }
        }}
        categories={categories.data?.categories ?? []}
        sources={sources.data?.sources ?? []}
        editing={editing}
        initialDirection={direction}
      />
      <TransactionDetailSheet
        id={detailId}
        onOpenChange={(next) => {
          if (!next) {
            setDetailId(null);
          }
        }}
        onEdit={(transaction) => {
          setDetailId(null);
          value.openEdit(ledgerItemOf(transaction));
        }}
        onOpenDetail={setDetailId}
      />
    </CaptureSheetContext.Provider>
  );
}
