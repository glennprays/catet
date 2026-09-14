"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { TransactionSheet, type Direction } from "@/components/transactions/transaction-sheet";
import { useCategories, useSources, type LedgerItem } from "@/lib/api/hooks";

type CaptureSheet = {
  openCreate: (direction?: Direction) => void;
  openEdit: (item: LedgerItem) => void;
};

const CaptureSheetContext = createContext<CaptureSheet | null>(null);

/**
 * Capture is a shell-level control, not a page's: the mobile FAB, every
 * header button, and every ledger row open the same single sheet
 * instance. Page-local sheet state made the FAB a no-op on the screen
 * that needed it most.
 */
export function useCaptureSheet(): CaptureSheet {
  const context = useContext(CaptureSheetContext);
  if (context === null) {
    throw new Error("useCaptureSheet must be used inside CaptureSheetProvider");
  }
  return context;
}

export function CaptureSheetProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LedgerItem | null>(null);
  const [direction, setDirection] = useState<Direction | undefined>(undefined);

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
    </CaptureSheetContext.Provider>
  );
}
