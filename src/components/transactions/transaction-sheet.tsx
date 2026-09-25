"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { AmountInput } from "@/components/amount-input";
import { CategoryPicker } from "@/components/category-picker";
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
import {
  useCreateTransaction,
  useMerchants,
  useResolveHold,
  useUpdateTransaction,
  type HoldOverrides,
} from "@/lib/api/hooks";
import type { Category, LedgerItem, PendingAction, Source } from "@/lib/api/hooks";
import { jakartaDateKey, todayJakartaKey } from "@/lib/time";
import { toastError } from "@/lib/toast";

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

const DAY_MS = 86_400_000;

/**
 * The backend's alias key: trimmed, single-spaced, lower-case. A typed name
 * that matches a canonical merchant this way travels as `merchant_id`, so
 * the write skips resolution instead of risking a second spelling.
 */
function merchantKey(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

const DATE_QUICK = [
  { value: "today", label: "Hari ini" },
  { value: "yesterday", label: "Kemarin" },
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

/** The parked capture's params, read defensively: they are bot-authored. */
function holdSeed(hold: PendingAction): {
  direction: Direction;
  amountMinor: number | null;
  sourceId: string;
  destinationId: string;
  categoryId: string;
  merchant: string;
  date: Date | undefined;
} {
  const params = hold.params as Record<string, unknown>;
  const text = (key: string): string => (typeof params[key] === "string" ? params[key] : "");
  const type = text("type");
  const amount = typeof params.amount_minor === "number" ? Math.abs(params.amount_minor) : null;
  const occurredAt = text("occurred_at");
  return {
    direction: type === "income" || type === "transfer" ? type : "expense",
    amountMinor: amount === 0 ? null : amount,
    sourceId: text("source_id"),
    destinationId: text("destination_source_id"),
    categoryId: text("category_id"),
    merchant: text("merchant"),
    date: occurredAt === "" ? new Date() : new Date(occurredAt),
  };
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
  hold,
  initialDirection,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  sources: Source[];
  editing?: LedgerItem | null;
  /** A parked bot capture being confirmed: the form seeds from its params. */
  hold?: PendingAction | null;
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
  const [noteOpen, setNoteOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const resolveHold = useResolveHold();
  const merchants = useMerchants();
  // The canonical names, by alias key: the datalist's suggestions and the
  // lookup that turns a typed name back into its merchant id.
  const merchantNames = useMemo(
    () => merchants.data?.merchants ?? [],
    [merchants.data],
  );
  const merchantIdByKey = useMemo(
    () => new Map(merchantNames.map((item) => [merchantKey(item.name), item.id])),
    [merchantNames],
  );

  // Render-phase re-init (React "adjust state when props change"):
  // the form resets whenever the sheet opens for a different target.
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const nextSessionKey = `${open ? "open" : "closed"}-${editing?.transaction_id ?? hold?.id ?? "new"}-${
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
      setNoteOpen((editing.note ?? "") !== "");
      setDate(new Date(editing.occurred_at));
    } else if (hold !== null && hold !== undefined) {
      // A parked bot capture: everything it did resolve is prefilled, so
      // the user only fills the gap the bot asked about.
      const seed = holdSeed(hold);
      setDirection(seed.direction);
      setAmountMinor(seed.amountMinor);
      setSourceId(seed.sourceId);
      setDestinationId(seed.destinationId);
      setCategoryId(seed.categoryId);
      setMerchant(seed.merchant);
      setNote("");
      setNoteOpen(false);
      setDate(seed.date);
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
      setNoteOpen(false);
      setDate(new Date());
    }
  }

  const activeCategories = useMemo(
    () => categories.filter((category) => category.archived_at === null),
    [categories],
  );
  // Editing a row whose category has since been archived: keep that one
  // option so the field shows what the row has instead of a blank.
  const pickableCategories = useMemo(() => {
    const current = editing?.category_id;
    if (
      current === undefined ||
      current === null ||
      activeCategories.some((category) => category.id === current)
    ) {
      return activeCategories;
    }
    const archived = categories.find((category) => category.id === current);
    // The picker marks the archived row itself, so the name stays real.
    return archived === undefined ? activeCategories : [...activeCategories, archived];
  }, [activeCategories, categories, editing]);
  const activeSources = useMemo(
    () => sources.filter((source) => source.archived_at === null),
    [sources],
  );
  const isEditing = editing !== null && editing !== undefined;
  const isHold = hold !== null && hold !== undefined;
  const isAdjustment = editing?.type === "adjustment";
  const pending = createTx.isPending || updateTx.isPending || resolveHold.isPending;

  // The gaps the bot refused to guess, so the form can point at them.
  const missingParam = hold?.params.missing;
  const holdMissing: string[] = Array.isArray(missingParam) ? missingParam.map(String) : [];
  function missingHint(field: string): string | undefined {
    return holdMissing.includes(field) ? "diminta bot" : undefined;
  }

  const yesterday = new Date(Date.now() - DAY_MS);
  const dateQuick =
    date === undefined
      ? ""
      : jakartaDateKey(date) === todayJakartaKey()
        ? "today"
        : jakartaDateKey(date) === jakartaDateKey(yesterday)
          ? "yesterday"
          : "";

  /** An error stops being true the moment the user answers it. */
  function clearError(field: string) {
    setFieldErrors((prev) => {
      if (!(field in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

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
      } else {
        toastError(error instanceof Error ? error.message : "Gagal menyimpan transaksi", submit);
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

    if (hold) {
      // Confirming runs the backend's executor, so the body is a patch on
      // the parked draft, not a fresh write.
      const overrides: HoldOverrides = {
        amount_minor: minor,
        source_id: sourceId,
        merchant: merchant === "" ? undefined : merchant,
        note: note === "" ? undefined : note,
        occurred_date: date === undefined ? undefined : jakartaDateKey(date),
      };
      if (direction === "transfer") {
        overrides.destination_source_id = destinationId;
      } else if (categoryId !== "") {
        overrides.category_id = categoryId;
      }
      resolveHold.mutate(
        { id: hold.id, action: "confirm", overrides },
        {
          onError,
          onSuccess: () => {
            toast.success("Draft dikonfirmasi");
            onOpenChange(false);
          },
        },
      );
      return;
    }

    // A name the user picked out of the datalist is already canonical, so
    // it travels as an id: the backend then skips resolution entirely and
    // no second spelling can be created.
    const knownMerchantId = merchantIdByKey.get(merchantKey(merchant));
    const body: Record<string, unknown> = {
      type: direction,
      amount_minor: minor,
      source_id: sourceId,
      merchant_id: knownMerchantId,
      merchant: merchant === "" || knownMerchantId !== undefined ? undefined : merchant,
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

  const showDestination = direction === "transfer" && !isEditing;
  const showCategory = direction !== "transfer" && (!isEditing || !isAdjustment);

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Ubah Transaksi" : isHold ? "Konfirmasi draft" : "Tambah Transaksi"}
      description={
        isHold
          ? "Lengkapi draft dari WhatsApp, lalu simpan ke buku besar."
          : "Catat uang keluar, masuk, atau pindah antar sumber."
      }
      footer={
        <>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="submit" form="tx-form" disabled={pending} className="min-w-24">
            {isEditing ? "Ubah" : "Simpan"}
          </Button>
        </>
      }
    >
      {/* `contents` keeps the sheet's own grid gap applying to the fields. */}
      <form
        id="tx-form"
        className="contents"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        {isEditing ? null : (
          <SegmentedControl
            aria-label="Arah transaksi"
            value={direction}
            onValueChange={(value) => setDirection(value as Direction)}
            options={DIRECTIONS}
            stretch
            className="w-full"
          />
        )}

        <FormField
          label="Nominal"
          htmlFor="tx-amount"
          error={fieldErrors.amount_minor}
          hint={missingHint("amount")}
        >
          <AmountInput
            id="tx-amount"
            size="lg"
            valueMinor={amountMinor}
            onChangeMinor={(minor) => {
              setAmountMinor(minor);
              clearError("amount_minor");
            }}
            autoFocus={!isHold || holdMissing.includes("amount")}
            aria-invalid={fieldErrors.amount_minor !== undefined}
            aria-describedby={fieldErrors.amount_minor === undefined ? undefined : "tx-amount-error"}
          />
        </FormField>

        {/* The merchant is the row's title, so it is typed right after the
            amount — the same order as the bot's `kopi 25k`. */}
        <FormField label="Merchant" htmlFor="tx-merchant" hint="opsional">
          <Input
            id="tx-merchant"
            list="merchant-options"
            value={merchant}
            onChange={(event) => setMerchant(event.target.value)}
            placeholder="mis. Kopi Kenangan, Gojek"
          />
          {/* Suggestions only: the field stays free text, and a name that
              matches one of these is sent as its id on save. */}
          <datalist id="merchant-options">
            {merchantNames.map((item) => (
              <option key={item.id} value={item.name} />
            ))}
          </datalist>
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <div
            className={showDestination || showCategory ? "min-w-0" : "min-w-0 sm:col-span-2"}
          >
            <FormField
              label={direction === "transfer" ? "Dari" : "Sumber"}
              htmlFor="tx-source"
              error={fieldErrors.source_id}
              hint={
                isEditing ? "tidak bisa diubah — balikkan lalu catat ulang" : missingHint("source")
              }
            >
              <Select
                value={sourceId}
                onValueChange={(value) => {
                  setSourceId(value);
                  clearError("source_id");
                }}
                disabled={isEditing}
              >
                <SelectTrigger
                  id="tx-source"
                  className="w-full"
                  aria-invalid={fieldErrors.source_id !== undefined}
                >
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
          </div>

          {showDestination ? (
            <FormField
              label="Ke"
              htmlFor="tx-destination"
              error={fieldErrors.destination_source_id}
              hint={missingHint("destination")}
            >
              <Select
                value={destinationId}
                onValueChange={(value) => {
                  setDestinationId(value);
                  clearError("destination_source_id");
                }}
              >
                <SelectTrigger
                  id="tx-destination"
                  className="w-full"
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
          ) : showCategory ? (
            <FormField
              label="Kategori"
              htmlFor="tx-category"
              error={fieldErrors.category_id}
              hint={missingHint("category")}
            >
              <CategoryPicker
                value={categoryId}
                onChange={(id) => {
                  setCategoryId(id);
                  clearError("category_id");
                }}
                categories={pickableCategories}
                id="tx-category"
                invalid={fieldErrors.category_id !== undefined}
                className="w-full"
              />
            </FormField>
          ) : null}
        </div>

        <FormField label="Tanggal" htmlFor="tx-date">
          <div className="flex items-center gap-2">
            <SegmentedControl
              aria-label="Tanggal cepat"
              value={dateQuick}
              onValueChange={(value) =>
                setDate(value === "today" ? new Date() : new Date(Date.now() - DAY_MS))
              }
              options={DATE_QUICK}
            />
            <DatePicker
              id="tx-date"
              date={date}
              onChange={setDate}
              disableFuture
              className="min-w-0 flex-1"
            />
          </div>
        </FormField>

        {noteOpen ? (
          <FormField label="Catatan" htmlFor="tx-note">
            <Textarea
              id="tx-note"
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
  );
}
