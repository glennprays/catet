"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AmountInput } from "@/components/amount-input";
import { DatePicker } from "@/components/date-picker";
import { FormField } from "@/components/form-field";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { SegmentedControl } from "@/components/segmented-control";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import { useCreateTransaction, useUpdateTransaction } from "@/lib/api/hooks";
import type { Category, LedgerItem, Source } from "@/lib/api/hooks";
import { jakartaDateKey } from "@/lib/time";

export type Direction = "expense" | "income" | "transfer";

const LAST_SOURCE_KEY = "catet:last-source-id";

/** Private-mode browsers throw on storage access; a lost default is fine. */
function rememberedSourceId(): string | null {
  try {
    return window.localStorage.getItem(LAST_SOURCE_KEY);
  } catch {
    return null;
  }
}

function rememberSourceId(id: string): void {
  try {
    window.localStorage.setItem(LAST_SOURCE_KEY, id);
  } catch {
    // Nothing to do: the next capture just starts without a default.
  }
}

const DIRECTIONS = [
  { value: "expense", label: "Keluar" },
  { value: "income", label: "Masuk" },
  { value: "transfer", label: "Pindah" },
];

export function validateTransactionFields({
  editing,
  direction,
  sourceId,
  destinationId,
  categoryId,
}: {
  editing: boolean;
  direction: Direction;
  sourceId: string;
  destinationId: string;
  categoryId: string;
}): Record<string, string> {
  if (editing) {
    return {};
  }

  const errors: Record<string, string> = {};
  if (sourceId === "") {
    errors.source_id = "Pilih sumber dana";
  }
  if (direction === "transfer") {
    if (destinationId === "") {
      errors.destination_source_id = "Pilih tujuan transfer";
    } else if (destinationId === sourceId) {
      errors.destination_source_id = "Tujuan harus berbeda dari sumber";
    }
  } else if (categoryId === "") {
    errors.category_id = "Pilih kategori";
  }
  return errors;
}

/**
 * TransactionSheet: peer capture form (ADR-0004). Manual validation
 * mirrors the backend FieldError rules inline; the backend stays the
 * final authority.
 */
export function TransactionSheet({
  open,
  onOpenChange,
  categories,
  sources,
  editing,
  initialDirection,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  sources: Source[];
  editing?: LedgerItem | null;
  initialDirection?: Direction;
}) {
  const [direction, setDirection] = useState<Direction>("expense");
  const [amountMinor, setAmountMinor] = useState<number | null>(null);
  const [sourceId, setSourceId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [merchant, setMerchant] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();

  // Render-phase re-init (React "adjust state when props change"):
  // the form resets whenever the sheet opens for a different target.
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const nextSessionKey = `${open ? "open" : "closed"}-${editing?.transaction_id ?? "new"}-${
    editing === null || editing === undefined ? (initialDirection ?? "expense") : "edit"
  }`;
  if (sessionKey !== nextSessionKey) {
    setSessionKey(nextSessionKey);
    setFieldErrors({});
    if (editing !== null && editing !== undefined) {
      setDirection(editing.type === "adjustment" ? "expense" : (editing.type as Direction));
      setAmountMinor(Math.abs(editing.amount_minor));
      setSourceId(editing.source_id);
      setDestinationId("");
      setCategoryId(editing.category_id ?? "");
      setMerchant(editing.merchant ?? "");
      setNote(editing.note ?? "");
      setDate(new Date(editing.occurred_at));
    } else {
      setDirection(initialDirection ?? "expense");
      setAmountMinor(null);
      // Most captures come from the same wallet; remember it, but only
      // honour it in the browser and while that source is still active.
      const remembered = typeof window === "undefined" ? null : rememberedSourceId();
      setSourceId(
        remembered !== null &&
          sources.some((source) => source.id === remembered && source.archived_at === null)
          ? remembered
          : "",
      );
      setDestinationId("");
      setCategoryId("");
      setMerchant("");
      setNote("");
      setDate(new Date());
    }
  }

  const activeCategories = useMemo(
    () => categories.filter((category) => category.archived_at === null),
    [categories],
  );
  const activeSources = useMemo(
    () => sources.filter((source) => source.archived_at === null),
    [sources],
  );
  const isEditing = editing !== null && editing !== undefined;
  const isAdjustment = editing?.type === "adjustment";
  const pending = createTx.isPending || updateTx.isPending;

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (amountMinor === null || amountMinor === 0) {
      errors.amount_minor = "Nominal harus lebih dari nol";
    }
    Object.assign(
      errors,
      validateTransactionFields({
        editing: isEditing,
        direction,
        sourceId,
        destinationId,
        categoryId,
      }),
    );
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function submit() {
    if (!validate()) {
      return;
    }
    const minor = amountMinor ?? 0;

    const onError = (error: unknown) => {
      if (error instanceof ApiError && error.details !== undefined) {
        const errors: Record<string, string> = {};
        for (const detail of error.details) {
          errors[detail.field] ??= detail.message;
        }
        setFieldErrors(errors);
      }
    };

    if (editing) {
      const body: Record<string, unknown> = {};
      if (minor !== Math.abs(editing.amount_minor)) {
        body.amount_minor = minor;
      }
      if (
        direction !== "transfer" &&
        !isAdjustment &&
        categoryId !== "" &&
        categoryId !== editing.category_id
      ) {
        body.category_id = categoryId;
      }
      if (note !== (editing.note ?? "")) {
        body.note = note;
      }
      if (merchant !== (editing.merchant ?? "")) {
        body.merchant = merchant;
      }
      if (date !== undefined && jakartaDateKey(date) !== jakartaDateKey(editing.occurred_at)) {
        // Anchor at Jakarta noon so the wire instant lands on the day
        // the user picked regardless of the browser's timezone.
        body.occurred_at = new Date(`${jakartaDateKey(date)}T12:00:00+07:00`).toISOString();
      }
      updateTx.mutate(
        { id: editing.transaction_id, ...body },
        {
          onError,
          onSuccess: () => {
            toast.success("Transaksi diubah");
            onOpenChange(false);
          },
        },
      );
      return;
    }

    const body: Record<string, unknown> = {
      type: direction,
      amount_minor: minor,
      source_id: sourceId,
      merchant: merchant === "" ? undefined : merchant,
      note: note === "" ? undefined : note,
      occurred_date: date === undefined ? undefined : jakartaDateKey(date),
    };
    if (direction === "transfer") {
      body.destination_source_id = destinationId;
    } else {
      body.category_id = categoryId;
    }

    createTx.mutate(body, {
      onError,
      onSuccess: () => {
        rememberSourceId(sourceId);
        toast.success("Transaksi dicatat");
        onOpenChange(false);
      },
    });
  }

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Ubah Transaksi" : "Tambah Transaksi"}
      description="Catat uang keluar, masuk, atau pindah antar sumber."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={pending} className="min-w-24">
            {isEditing ? "Ubah" : "Simpan"}
          </Button>
        </>
      }
    >
      {isEditing ? null : (
        <SegmentedControl
          aria-label="Arah transaksi"
          value={direction}
          onValueChange={(value) => setDirection(value as Direction)}
          options={DIRECTIONS}
          className="w-full"
        />
      )}

      <FormField label="Nominal" htmlFor="tx-amount" error={fieldErrors.amount_minor}>
        <AmountInput
          id="tx-amount"
          valueMinor={amountMinor}
          onChangeMinor={setAmountMinor}
          autoFocus
          aria-describedby={fieldErrors.amount_minor === undefined ? undefined : "tx-amount-error"}
        />
      </FormField>

      <FormField
        label={direction === "transfer" ? "Dari" : "Sumber"}
        htmlFor="tx-source"
        error={fieldErrors.source_id}
        hint={isEditing ? "tidak bisa diubah — balikkan lalu catat ulang" : undefined}
      >
        <Select value={sourceId} onValueChange={setSourceId} disabled={isEditing}>
          <SelectTrigger id="tx-source" className="w-full">
            <SelectValue placeholder="Pilih sumber" />
          </SelectTrigger>
          <SelectContent>
            {activeSources.map((source) => (
              <SelectItem key={source.id} value={source.id}>
                {source.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      {direction === "transfer" && !isEditing ? (
        <FormField label="Ke" htmlFor="tx-destination" error={fieldErrors.destination_source_id}>
          <Select value={destinationId} onValueChange={setDestinationId}>
            <SelectTrigger id="tx-destination" className="w-full">
              <SelectValue placeholder="Pilih tujuan" />
            </SelectTrigger>
            <SelectContent>
              {activeSources
                .filter((source) => source.id !== sourceId)
                .map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </FormField>
      ) : direction !== "transfer" && (!isEditing || !isAdjustment) ? (
        <FormField label="Kategori" htmlFor="tx-category" error={fieldErrors.category_id}>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="tx-category" className="w-full">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {activeCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      ) : null}

      <FormField label="Tanggal" htmlFor="tx-date">
        <DatePicker id="tx-date" date={date} onChange={setDate} disableFuture />
      </FormField>

      <FormField label="Merchant" htmlFor="tx-merchant" hint="opsional">
        <Input
          id="tx-merchant"
          value={merchant}
          onChange={(event) => setMerchant(event.target.value)}
          placeholder="mis. Kopi Kenangan"
        />
      </FormField>

      <FormField label="Catatan" htmlFor="tx-note" hint="opsional">
        <Textarea
          id="tx-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
          placeholder="detail kecil"
        />
      </FormField>
    </ResponsiveSheet>
  );
}
