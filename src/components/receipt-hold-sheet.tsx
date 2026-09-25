"use client";

import { useMemo, useState } from "react";
import { Plus, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { CategoryPicker } from "@/components/category-picker";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DatePicker } from "@/components/date-picker";
import { FormField } from "@/components/form-field";
import { MoneyText } from "@/components/money-text";
import { SOURCE_BASIS_LABELS } from "@/components/pending-action-params";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import {
  useResolveHold,
  type Category,
  type HoldOverrides,
  type PendingAction,
  type Source,
} from "@/lib/api/hooks";
import { jakartaDateKey } from "@/lib/time";
import { toastError } from "@/lib/toast";

/** One parked receipt line, as the bot stored it. */
type ReceiptLine = {
  n: number;
  name: string;
  qty?: number;
  amount_minor: number;
  category_id: string | null;
  category_name?: string;
  /** A split bill pays some lines from their own Source. */
  source_id?: string | null;
  source_name?: string;
  part?: string;
};

/** One share of a bill split across several Sources. */
type ReceiptPayment = { source_id?: string; source_name?: string; amount_minor?: number };

/** The parked receipt draft, read defensively: the params are bot-authored. */
type ReceiptDraft = {
  type: "expense" | "income" | "transfer";
  documentType: string;
  merchant: string;
  totalMinor: number;
  items: ReceiptLine[];
  sourceId: string | null;
  sourceName: string;
  sourceBasis: string;
  destinationSourceId: string | null;
  occurredAt: string;
  missing: string[];
  payments: ReceiptPayment[];
  duplicate: boolean;
  inconsistent: boolean;
};

function receiptDraftOf(params: Record<string, unknown>): ReceiptDraft {
  const text = (key: string): string => (typeof params[key] === "string" ? params[key] : "");
  const type = text("type");
  const rawItems = Array.isArray(params.items) ? params.items : [];
  const items: ReceiptLine[] = rawItems
    .map((raw, index) => {
      const line = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
      return {
        n: typeof line.n === "number" ? line.n : index + 1,
        name: typeof line.name === "string" ? line.name : "",
        qty: typeof line.qty === "number" ? line.qty : undefined,
        amount_minor: typeof line.amount_minor === "number" ? line.amount_minor : 0,
        category_id: typeof line.category_id === "string" ? line.category_id : null,
        category_name: typeof line.category_name === "string" ? line.category_name : undefined,
        source_id: typeof line.source_id === "string" ? line.source_id : null,
        source_name: typeof line.source_name === "string" ? line.source_name : undefined,
        part: typeof line.part === "string" ? line.part : undefined,
      };
    })
    .sort((a, b) => a.n - b.n);
  const rawPayments = Array.isArray(params.payments) ? params.payments : [];

  return {
    type: type === "income" || type === "transfer" ? type : "expense",
    documentType: text("document_type"),
    merchant: text("merchant"),
    totalMinor: typeof params.total_minor === "number" ? params.total_minor : 0,
    items,
    sourceId: text("source_id") === "" ? null : text("source_id"),
    sourceName: text("source_name"),
    sourceBasis: text("source_basis"),
    destinationSourceId:
      text("destination_source_id") === "" ? null : text("destination_source_id"),
    occurredAt: text("occurred_at"),
    missing: Array.isArray(params.missing) ? params.missing.map(String) : [],
    payments: rawPayments.map((raw) => {
      const payment = (typeof raw === "object" && raw !== null ? raw : {}) as Record<
        string,
        unknown
      >;
      return {
        source_id: typeof payment.source_id === "string" ? payment.source_id : undefined,
        source_name: typeof payment.source_name === "string" ? payment.source_name : undefined,
        amount_minor:
          typeof payment.amount_minor === "number" ? payment.amount_minor : undefined,
      };
    }),
    duplicate: typeof params.duplicate_of === "string" && params.duplicate_of !== "",
    inconsistent: params.inconsistent === true,
  };
}

/**
 * ReceiptHoldSheet confirms a parked receipt: N lines at a printed total
 * the user may not edit (ADR-0003 — the total is the only money fact a
 * photo contributes). The capture sheet carries one amount and cannot
 * express that, so a receipt gets its own form.
 */
export function ReceiptHoldSheet({
  item,
  onOpenChange,
  sources,
  categories,
}: {
  item: PendingAction | null;
  onOpenChange: (open: boolean) => void;
  sources: Source[];
  categories: Category[];
}) {
  const open = item !== null && item.kind === "receipt";
  return (
    <ReceiptHoldForm
      // A new draft is a new form: keying on the id re-initialises every
      // field instead of leaking the last receipt's answers into this one.
      key={item?.id ?? "none"}
      item={item}
      open={open}
      onOpenChange={onOpenChange}
      sources={sources}
      categories={categories}
    />
  );
}

function ReceiptHoldForm({
  item,
  open,
  onOpenChange,
  sources,
  categories,
}: {
  item: PendingAction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: Source[];
  categories: Category[];
}) {
  const draft = useMemo(
    () => receiptDraftOf(item?.params ?? {}),
    [item],
  );

  // A split bill has no single Source to preselect: the user is choosing
  // whether to keep it (untouched) or replace it with one account.
  const [sourceId, setSourceId] = useState(
    draft.payments.length > 1 ? "" : (draft.sourceId ?? ""),
  );
  const [destinationId, setDestinationId] = useState(draft.destinationSourceId ?? "");
  const [splitLines, setSplitLines] = useState(true);
  const [lineCategories, setLineCategories] = useState<Record<number, string>>(() =>
    Object.fromEntries(draft.items.map((line) => [line.n, line.category_id ?? ""])),
  );
  const [singleCategory, setSingleCategory] = useState("");
  const [merchant, setMerchant] = useState(draft.merchant);
  const [date, setDate] = useState<Date | undefined>(
    draft.occurredAt === "" ? new Date() : new Date(draft.occurredAt),
  );
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [discarding, setDiscarding] = useState(false);

  const resolveHold = useResolveHold();

  const activeSources = useMemo(
    () => sources.filter((source) => source.archived_at === null),
    [sources],
  );
  const activeCategories = useMemo(
    () => categories.filter((category) => category.archived_at === null),
    [categories],
  );

  const isTransfer = draft.type === "transfer";
  const isScreenshot = draft.documentType === "payment_screenshot";
  const multiLine = draft.items.length > 1;
  const perLine = splitLines || !multiLine;
  // Picking one Source for a split bill drops the split: the user is
  // saying the whole bill came from one account.
  const splitDropped = draft.payments.length > 1 && sourceId !== "";
  const selectedSourceName = activeSources.find((source) => source.id === sourceId)?.name ?? "";
  const sourceHint = draft.missing.includes("source")
    ? "diminta bot"
    : SOURCE_BASIS_LABELS[draft.sourceBasis];

  function submit() {
    if (item === null) {
      return;
    }
    const overrides: HoldOverrides = { source_id: sourceId };
    if (isTransfer) {
      overrides.destination_source_id = destinationId;
    }
    if (merchant !== draft.merchant && merchant !== "") {
      overrides.merchant = merchant;
    }
    if (note !== "") {
      overrides.note = note;
    }
    if (
      date !== undefined &&
      draft.occurredAt !== "" &&
      jakartaDateKey(date) !== jakartaDateKey(new Date(draft.occurredAt))
    ) {
      overrides.occurred_date = jakartaDateKey(date);
    }
    if (multiLine && !splitLines) {
      overrides.collapse = true;
      if (singleCategory !== "") {
        overrides.category_id = singleCategory;
      }
    } else if (!isTransfer) {
      // Only corrections travel: an untouched line keeps whatever label
      // the bot stored for it.
      const changed = draft.items
        .filter(
          (line) =>
            (lineCategories[line.n] ?? "") !== "" &&
            lineCategories[line.n] !== (line.category_id ?? ""),
        )
        .map((line) => ({ n: line.n, category_id: lineCategories[line.n] }));
      if (changed.length > 0) {
        overrides.items = changed;
      }
    }

    resolveHold.mutate(
      { id: item.id, action: "confirm", overrides },
      {
        onError: (error: unknown) => {
          if (error instanceof ApiError && error.details !== undefined) {
            const errors: Record<string, string> = {};
            for (const detail of error.details) {
              // `items` is not a form field: it is the whole per-line
              // correction, so it can only be said out loud.
              if (detail.field === "items") {
                toastError(detail.message);
                continue;
              }
              errors[detail.field] ??= detail.message;
            }
            setFieldErrors(errors);
          } else {
            toastError(error instanceof Error ? error.message : "Gagal mencatat struk", submit);
          }
        },
        onSuccess: (data) => {
          toast.success(
            `${isScreenshot ? "Bukti bayar" : "Struk"} dicatat · ${
              data.transaction_ids?.length ?? 1
            } baris`,
          );
          onOpenChange(false);
        },
      },
    );
  }

  function discard() {
    if (item === null) {
      return;
    }
    resolveHold.mutate(
      { id: item.id, action: "discard" },
      {
        onSuccess: () => {
          toast.success("Aksi dibuang");
          setDiscarding(false);
          onOpenChange(false);
        },
        onError: (error) => toastError(error.message),
      },
    );
  }

  return (
    <>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={isScreenshot ? "Konfirmasi bukti bayar" : "Konfirmasi struk"}
        description={item?.summary}
        footer={
          <>
            <Button
              type="button"
              variant="dangerGhost"
              disabled={resolveHold.isPending}
              onClick={() => setDiscarding(true)}
            >
              Buang
            </Button>
            <Button
              type="submit"
              form="receipt-form"
              disabled={
                resolveHold.isPending || sourceId === "" || (isTransfer && destinationId === "")
              }
              className="min-w-24"
            >
              Konfirmasi
            </Button>
          </>
        }
      >
        <form
          id="receipt-form"
          className="contents"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          {draft.duplicate || draft.inconsistent ? (
            <div className="grid gap-1.5">
              <div className="flex flex-wrap gap-1.5">
                {draft.duplicate ? <StatusBadge tone="warn">Mungkin duplikat</StatusBadge> : null}
                {draft.inconsistent ? (
                  <StatusBadge tone="warn">Rincian tidak konsisten</StatusBadge>
                ) : null}
              </div>
              {draft.inconsistent ? (
                <p className="text-meta text-ash">
                  Harga per baris tidak cocok dengan total di struk; nominal di bawah adalah
                  bagian proporsional dari total.
                </p>
              ) : null}
            </div>
          ) : null}

          {/* The printed total is a money fact, not an input: the backend
              rejects `amount_minor` on a receipt. */}
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-meta text-ash">Total struk</span>
            <MoneyText minor={draft.totalMinor} size="lg" tone="neutral" />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-meta font-medium text-ink">Rincian</span>
              {multiLine ? (
                <div className="flex items-center gap-2">
                  <Label htmlFor="receipt-split" className="text-meta font-normal">
                    Pecah per baris
                  </Label>
                  <Switch
                    id="receipt-split"
                    checked={splitLines}
                    onCheckedChange={setSplitLines}
                  />
                </div>
              ) : null}
            </div>

            {perLine ? (
              draft.items.map((line) => (
                <div
                  key={`${line.n}${line.part ?? ""}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1"
                >
                  <div className="min-w-0">
                    <span className="block truncate text-body text-ink">
                      {`${line.n}${line.part ?? ""}. ${line.name}`}
                      {line.qty !== undefined && line.qty > 1 ? ` ×${line.qty}` : ""}
                    </span>
                    {line.source_name !== undefined && line.source_name !== "" ? (
                      <span className="block text-meta text-ash">{line.source_name}</span>
                    ) : null}
                  </div>
                  <MoneyText minor={line.amount_minor} size="md" tone="neutral" />
                  {isTransfer ? null : (
                    <div className="col-span-2">
                      <CategoryPicker
                        value={lineCategories[line.n] ?? ""}
                        onChange={(id) => setLineCategories((prev) => ({ ...prev, [line.n]: id }))}
                        categories={activeCategories}
                        id={`receipt-cat-${line.n}`}
                        ariaLabel={`Kategori baris ${line.n}`}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
                <span className="truncate text-body text-ink">
                  {`${merchant === "" ? draft.merchant : merchant} · ${draft.items.length} item`}
                </span>
                <MoneyText minor={draft.totalMinor} size="md" tone="neutral" />
                {isTransfer ? null : (
                  <div className="col-span-2">
                    <CategoryPicker
                      value={singleCategory}
                      onChange={setSingleCategory}
                      categories={activeCategories}
                      id="receipt-cat-all"
                      ariaLabel="Kategori"
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <FormField
            label={isTransfer ? "Dari" : "Sumber"}
            htmlFor="receipt-source"
            error={fieldErrors.source_id}
            hint={sourceHint}
          >
            <Select
              value={sourceId}
              onValueChange={(value) => {
                setSourceId(value);
                setFieldErrors((prev) => {
                  if (!("source_id" in prev)) {
                    return prev;
                  }
                  const next = { ...prev };
                  delete next.source_id;
                  return next;
                });
              }}
            >
              <SelectTrigger
                id="receipt-source"
                className="w-full"
                aria-label={isTransfer ? "Dari" : "Sumber"}
                aria-invalid={fieldErrors.source_id !== undefined}
              >
                <SelectValue
                  placeholder={
                    draft.payments.length > 1
                      ? `Terbagi (${draft.payments
                          .map((payment) => payment.source_name ?? "")
                          .join(" · ")})`
                      : "Pilih sumber"
                  }
                />
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
          {splitDropped ? (
            <p className="flex items-center gap-1.5 text-meta text-ash">
              <TriangleAlert className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
              Pembagian sumber dibatalkan, semua baris dari {selectedSourceName}.
            </p>
          ) : null}

          {isTransfer ? (
            <FormField
              label="Ke"
              htmlFor="receipt-destination"
              error={fieldErrors.destination_source_id}
            >
              <Select value={destinationId} onValueChange={setDestinationId}>
                <SelectTrigger
                  id="receipt-destination"
                  className="w-full"
                  aria-label="Ke"
                  aria-invalid={fieldErrors.destination_source_id !== undefined}
                >
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
          ) : null}

          <FormField label="Merchant" htmlFor="receipt-merchant" error={fieldErrors.merchant}>
            <Input
              id="receipt-merchant"
              value={merchant}
              onChange={(event) => setMerchant(event.target.value)}
              placeholder="mis. Alfamart"
            />
          </FormField>

          <FormField label="Tanggal" htmlFor="receipt-date" error={fieldErrors.occurred_date}>
            <DatePicker id="receipt-date" date={date} onChange={setDate} disableFuture />
          </FormField>

          {noteOpen ? (
            <FormField label="Catatan" htmlFor="receipt-note">
              <Textarea
                id="receipt-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                placeholder="detail kecil"
                autoFocus
              />
            </FormField>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-self-start"
              onClick={() => setNoteOpen(true)}
            >
              <Plus className="size-3.5" strokeWidth={1.75} />
              Tambah catatan
            </Button>
          )}
        </form>
      </ResponsiveSheet>

      <ConfirmDialog
        open={discarding}
        onOpenChange={setDiscarding}
        title="Buang aksi ini?"
        description="Bot tidak akan menulis apa pun."
        confirmLabel="Buang"
        tone="danger"
        pending={resolveHold.isPending}
        onConfirm={discard}
      />
    </>
  );
}
