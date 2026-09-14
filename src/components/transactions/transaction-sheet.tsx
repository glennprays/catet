"use client";

import { useMemo, useState, type ReactNode } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api/client";
import { useCreateTransaction, useUpdateTransaction } from "@/lib/api/hooks";
import type { Category, LedgerItem, Source } from "@/lib/api/hooks";
import { parseAmountToMinor } from "@/lib/money";

export type Direction = "expense" | "income" | "transfer";
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
  const [amount, setAmount] = useState("");
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
      setAmount(String(Math.abs(editing.amount_minor)));
      setSourceId(editing.source_id);
      setDestinationId("");
      setCategoryId(editing.category_id ?? "");
      setMerchant(editing.merchant ?? "");
      setNote(editing.note ?? "");
      setDate(new Date(editing.occurred_at));
    } else {
      setDirection(initialDirection ?? "expense");
      setAmount("");
      setSourceId("");
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
    const minor = parseAmountToMinor(amount);
    if (minor === null || minor === 0) {
      errors.amount_minor = "Nominal harus lebih dari nol";
    }
    Object.assign(
      errors,
      validateTransactionFields({
        editing: editing !== null && editing !== undefined,
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
    const minor = parseAmountToMinor(amount) ?? 0;

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
      if (direction !== "transfer" && !isAdjustment && categoryId !== "" && categoryId !== editing.category_id) {
        body.category_id = categoryId;
      }
      if (note !== (editing.note ?? "")) {
        body.note = note;
      }
      if (merchant !== (editing.merchant ?? "")) {
        body.merchant = merchant;
      }
      updateTx.mutate({ id: editing.transaction_id, ...body }, {
        onError,
        onSuccess: () => {
          onOpenChange(false);
        },
      });
      return;
    }

    const body: Record<string, unknown> = {
      type: direction,
      amount_minor: minor,
      source_id: sourceId,
      merchant: merchant === "" ? undefined : merchant,
      note: note === "" ? undefined : note,
      occurred_date: date === undefined ? undefined : format(date, "yyyy-MM-dd"),
    };
    if (direction === "transfer") {
      body.destination_source_id = destinationId;
    } else {
      body.category_id = categoryId;
    }

    createTx.mutate(body, {
      onError,
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md" side="right">
        <SheetHeader>
          <SheetTitle>{editing === null || editing === undefined ? "Tambah Transaksi" : "Ubah Transaksi"}</SheetTitle>
          <SheetDescription>Catat uang keluar, masuk, atau pindah antar sumber.</SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 py-2">
          {!editing ? (
            <Tabs
              value={direction}
              onValueChange={(value) => setDirection(value as Direction)}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="expense">Keluar</TabsTrigger>
                <TabsTrigger value="income">Masuk</TabsTrigger>
                <TabsTrigger value="transfer">Pindah</TabsTrigger>
              </TabsList>
            </Tabs>
          ) : null}

          <Field label="Nominal" error={fieldErrors.amount_minor}>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[13px] text-muted-foreground">
                Rp
              </span>
              <Input
                inputMode="numeric"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
                className="pr-3 pl-9 text-right text-[15px] font-medium tabular-nums"
                autoFocus
              />
            </div>
          </Field>

          <Field label={direction === "transfer" ? "Dari" : "Sumber"} error={fieldErrors.source_id}>
            <Select value={sourceId} onValueChange={setSourceId} disabled={isEditing}>
              <SelectTrigger className="w-full">
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
          </Field>

          {direction === "transfer" && !isEditing ? (
            <Field label="Ke" error={fieldErrors.destination_source_id}>
              <Select value={destinationId} onValueChange={setDestinationId}>
                <SelectTrigger className="w-full">
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
            </Field>
          ) : direction !== "transfer" && (!isEditing || !isAdjustment) ? (
            <Field label="Kategori" error={fieldErrors.category_id}>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
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
            </Field>
          ) : null}

          <Field label="Tanggal">
            <DatePicker date={date} onChange={setDate} />
          </Field>

          <Field label="Merchant" hint="opsional">
            <Input
              value={merchant}
              onChange={(event) => setMerchant(event.target.value)}
              placeholder="mis. Kopi Kenangan"
            />
          </Field>

          <Field label="Catatan" hint="opsional">
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              placeholder="detail kecil"
            />
          </Field>
        </div>

        <Separator />
        <SheetFooter className="mt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={pending} className="min-w-24">
            {editing === null || editing === undefined ? "Simpan" : "Ubah"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="flex items-baseline justify-between">
        <span>{label}</span>
        {hint !== undefined ? (
          <span className="text-xs font-normal text-muted-foreground">{hint}</span>
        ) : null}
      </Label>
      {children}
      {error !== undefined ? (
        <p className="text-xs text-over-text" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function DatePicker({
  date,
  onChange,
}: {
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className={cn("w-full justify-start font-normal", date === undefined && "text-muted-foreground")}
        >
          <CalendarIcon className="size-4 text-ash" />
          {date !== undefined ? format(date, "d MMM yyyy") : "Pilih tanggal"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selected) => {
            onChange(selected);
            setPickerOpen(false);
          }}
          disabled={{ after: new Date() }}
        />
      </PopoverContent>
    </Popover>
  );
}
