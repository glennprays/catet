"use client";

import { useState } from "react";
import { CalendarPlus, CalendarX } from "lucide-react";
import { toast } from "sonner";

import { AmountInput } from "@/components/amount-input";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DatePicker } from "@/components/date-picker";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { FormField } from "@/components/form-field";
import { GroupLabel } from "@/components/group-label";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { QueryBoundary } from "@/components/query-boundary";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { RowMenu } from "@/components/row-menu";
import { SegmentedControl } from "@/components/segmented-control";
import { CADENCE_LABEL, UpcomingBillRow } from "@/components/upcoming-bill-row";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBillPayments,
  useBills,
  useCategories,
  useCreateBill,
  useDeactivateBill,
  usePayBill,
  useReactivateBill,
  useSources,
  useUpdateBill,
  type Bill,
} from "@/lib/api/hooks";
import { occurrencesInRange } from "@/lib/bill-occurrences";
import { formatIDR } from "@/lib/money";
import { daysUntilJakarta, formatJakartaDate, jakartaDateKey, todayJakartaKey } from "@/lib/time";
import { toastError } from "@/lib/toast";
import { cn } from "@/lib/utils";

const CADENCES = (Object.keys(CADENCE_LABEL) as Bill["cadence"][]).map((value) => ({
  value,
  label: CADENCE_LABEL[value],
}));

// The three offsets the API accepts, in the order a human reads them.
const REMINDER_OFFSETS: { value: 0 | 1 | 3; label: string }[] = [
  { value: 3, label: "3 hari sebelum" },
  { value: 1, label: "1 hari sebelum" },
  { value: 0, label: "Hari-H" },
];

/**
 * Bills, list-first: a 6-column horizontal-scroll table put status and
 * actions off-screen at 360px. Each bill is now one 40px row keyed by
 * its due date; the calendar is the secondary view.
 */
export default function BillsPage() {
  const bills = useBills();
  const sources = useSources();
  const categories = useCategories();
  const deactivate = useDeactivateBill();
  const reactivate = useReactivateBill();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Bill | null>(null);
  const [payTarget, setPayTarget] = useState<Bill | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Bill | null>(null);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [month, setMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const list = bills.data?.bills ?? [];
  const byDue = (a: Bill, b: Bill) =>
    jakartaDateKey(a.next_due_date).localeCompare(jakartaDateKey(b.next_due_date));
  const active = list.filter((bill) => bill.active).sort(byDue);
  // Completed is not "off": the schedule is spent, so the bill is
  // history rather than something the user paused.
  const completed = list.filter((bill) => !bill.active && bill.completed_at).sort(byDue);
  const inactive = list.filter((bill) => !bill.active && !bill.completed_at).sort(byDue);

  // The month the calendar is showing, as a Jakarta [start, end) key
  // pair — the same window the projection and the paid markers use.
  const monthStartKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-01`;
  const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
  const monthEndKey = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-01`;
  const payments = useBillPayments(monthStartKey, monthEndKey);

  // A bill is one row with one next_due_date; the calendar shows every
  // occurrence in the visible month, projected the way the ledger does.
  const occurrencesByDay = new Map<string, Bill[]>();
  for (const bill of active) {
    for (const key of occurrencesInRange(bill, monthStartKey, monthEndKey)) {
      const at = occurrencesByDay.get(key);
      if (at === undefined) {
        occurrencesByDay.set(key, [bill]);
      } else {
        at.push(bill);
      }
    }
  }
  const today = todayJakartaKey();
  const paidList = payments.data?.payments ?? [];
  const paidByDay = new Map<string, typeof paidList>();
  for (const payment of paidList) {
    const key = jakartaDateKey(payment.paid_at);
    const at = paidByDay.get(key);
    if (at === undefined) {
      paidByDay.set(key, [payment]);
    } else {
      at.push(payment);
    }
  }
  const dueInMonthCount = [...occurrencesByDay.values()].reduce((n, at) => n + at.length, 0);

  function openForm(target: Bill | null) {
    setEditing(target);
    setFormOpen(true);
  }

  const selectedBills = selectedDay === null ? [] : (occurrencesByDay.get(selectedDay) ?? []);
  const selectedPaid = selectedDay === null ? [] : (paidByDay.get(selectedDay) ?? []);

  const calendarPanel = (
    <Panel density="compact" title="Kalender" caption={`${dueInMonthCount} jatuh tempo bulan ini`}>
      <Calendar
        mode="single"
        month={month}
        onMonthChange={setMonth}
        selected={selectedDay === null ? undefined : new Date(`${selectedDay}T00:00:00+07:00`)}
        onDayClick={(date) => {
          const key = jakartaDateKey(date);
          setSelectedDay((current) => (current === key ? null : key));
        }}
        modifiers={{
          due: (date) => {
            const key = jakartaDateKey(date);
            return occurrencesByDay.has(key) && key >= today;
          },
          overdue: (date) => {
            const key = jakartaDateKey(date);
            return occurrencesByDay.has(key) && key < today;
          },
          paid: (date) => paidByDay.has(jakartaDateKey(date)),
        }}
        modifiersClassNames={{
          due: "bg-warn-wash text-warn-text font-medium",
          overdue: "bg-over-wash text-over-text font-medium",
          paid: "underline decoration-2 decoration-safe",
        }}
      />
      {selectedDay === null ? null : (
        <div className="border-t border-border px-4 py-3">
          <p className="text-label uppercase text-ash">
            {formatJakartaDate(`${selectedDay}T00:00:00+07:00`, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          {selectedBills.length === 0 && selectedPaid.length === 0 ? (
            <p className="mt-1 text-meta text-ash">Tidak ada tagihan.</p>
          ) : (
            <ul className="mt-1.5 grid gap-1.5">
              {selectedBills.map((bill) => (
                <li key={bill.id} className="flex items-center justify-between gap-2">
                  <span className="truncate text-body text-ink">{bill.name}</span>
                  {selectedDay === jakartaDateKey(bill.next_due_date) ? (
                    <Button variant="ghost" size="sm" onClick={() => setPayTarget(bill)}>
                      Tandai lunas
                    </Button>
                  ) : (
                    <span className="shrink-0 text-label text-ash">terjadwal</span>
                  )}
                </li>
              ))}
              {selectedPaid.map((payment) => (
                <li key={payment.id} className="flex items-center justify-between gap-2">
                  <span className="truncate text-body text-ash">{payment.bill_name}</span>
                  <span className="shrink-0 text-label tabular-nums text-safe-text">
                    Dibayar · {formatIDR(payment.amount_minor)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Panel>
  );

  return (
    <>
      <PageHeader
        title="Bills & Calendar"
        actions={
          <Button onClick={() => openForm(null)}>
            <CalendarPlus className="size-4" strokeWidth={1.75} />
            {/* The 18px phone title and this label cannot share a 360px header. */}
            <span className="sm:hidden">Tambah</span>
            <span className="hidden sm:inline">Tambah tagihan</span>
          </Button>
        }
      />

      <FilterBar className="lg:hidden">
        <SegmentedControl
          stretch
          aria-label="Tampilan"
          value={view}
          onValueChange={(v) => setView(v as "list" | "calendar")}
          options={[
            { value: "list", label: "Daftar" },
            { value: "calendar", label: "Kalender" },
          ]}
          className="w-full"
        />
      </FilterBar>

      <div className="grid gap-2.5 py-2.5 lg:grid-cols-[minmax(0,1fr)_296px]">
        <section
          aria-label="Daftar tagihan"
          className={cn("min-w-0", view === "calendar" && "hidden lg:block")}
        >
          <Panel title="Tagihan" caption={`${active.length} aktif`} density="list">
            <QueryBoundary
            query={bills}
            isEmpty={(data) => data.bills.length === 0}
            errorMessage="Tagihan gagal dimuat."
            skeleton={
              <div className="grid gap-2 p-4">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="h-12 w-full rounded-md" />
                ))}
              </div>
            }
            empty={
              <div className="p-4">
                <EmptyState
                  icon={CalendarX}
                  heading="Belum ada tagihan"
                  caption="Sewa, langganan, cicilan — cadangkan nominalnya di Safe-to-Spend."
                  action={
                    <Button variant="secondary" onClick={() => openForm(null)}>
                      Buat tagihan
                    </Button>
                  }
                />
              </div>
            }
          >
            {() => (
              <>
                {active.length > 0 ? <GroupLabel>Aktif</GroupLabel> : null}
                {active.map((bill) => (
                  <UpcomingBillRow
                    key={bill.id}
                    bill={bill}
                    days={daysUntilJakarta(bill.next_due_date)}
                    trailing={
                      <RowMenu
                        label={`Aksi ${bill.name}`}
                        actions={[
                          { label: "Tandai lunas", onClick: () => setPayTarget(bill) },
                          { label: "Ubah", onClick: () => openForm(bill) },
                          {
                            label: "Nonaktifkan",
                            tone: "danger",
                            onClick: () => setDeactivateTarget(bill),
                          },
                        ]}
                      />
                    }
                  />
                ))}

                {completed.length > 0 ? (
                  <>
                    <GroupLabel>Selesai</GroupLabel>
                    {completed.map((bill) => (
                      <UpcomingBillRow
                        key={bill.id}
                        bill={bill}
                        days={daysUntilJakarta(bill.next_due_date)}
                        muted
                        trailing={
                          <RowMenu
                            label={`Aksi ${bill.name}`}
                            actions={[{ label: "Ubah", onClick: () => openForm(bill) }]}
                          />
                        }
                      />
                    ))}
                  </>
                ) : null}

                {inactive.length > 0 ? (
                  <>
                    <GroupLabel>Nonaktif</GroupLabel>
                    {inactive.map((bill) => (
                      <UpcomingBillRow
                        key={bill.id}
                        bill={bill}
                        days={daysUntilJakarta(bill.next_due_date)}
                        muted
                        trailing={
                          <RowMenu
                            label={`Aksi ${bill.name}`}
                            actions={[
                              { label: "Ubah", onClick: () => openForm(bill) },
                              {
                                label: "Aktifkan lagi",
                                onClick: () =>
                                  reactivate.mutate(bill.id, {
                                    onSuccess: () => toast.success("Tagihan diaktifkan"),
                                    onError: (error) => toastError(error.message),
                                  }),
                              },
                            ]}
                          />
                        }
                      />
                    ))}
                  </>
                ) : null}
              </>
            )}
            </QueryBoundary>
          </Panel>
        </section>

        <aside
          className={cn(view === "list" && "hidden", "lg:block")}
          aria-label="Kalender jatuh tempo"
        >
          {calendarPanel}
        </aside>
      </div>

      <PayBillSheet
        bill={payTarget}
        onOpenChange={(open) => !open && setPayTarget(null)}
        sources={sources.data?.sources ?? []}
      />

      <BillFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        sources={sources.data?.sources ?? []}
        categories={categories.data?.categories ?? []}
      />

      <ConfirmDialog
        open={deactivateTarget !== null}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        title={`Nonaktifkan tagihan ${deactivateTarget?.name ?? ""}?`}
        description="Tagihan berhenti dijadwalkan; bisa diaktifkan lagi nanti."
        confirmLabel="Nonaktifkan"
        pending={deactivate.isPending}
        onConfirm={() => {
          if (deactivateTarget === null) {
            return;
          }
          deactivate.mutate(deactivateTarget.id, {
            onSuccess: () => {
              toast.success("Tagihan dinonaktifkan");
              setDeactivateTarget(null);
            },
            onError: (error) => toastError(error.message),
          });
        }}
      />
    </>
  );
}

function BillFormSheet({
  open,
  onOpenChange,
  editing,
  sources,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Bill | null;
  sources: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const create = useCreateBill();
  const update = useUpdateBill();

  const [name, setName] = useState("");
  const [minMinor, setMinMinor] = useState<number | null>(null);
  const [maxMinor, setMaxMinor] = useState<number | null>(null);
  const [cadence, setCadence] = useState("monthly");
  const [due, setDue] = useState<Date | undefined>(undefined);
  const [sourceId, setSourceId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [remaining, setRemaining] = useState("");
  const [offsets, setOffsets] = useState<(0 | 1 | 3)[]>([]);
  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  const sessionKey = `${open ? "open" : "closed"}-${editing?.id ?? "new"}`;
  if (open && initializedFor !== sessionKey) {
    setInitializedFor(sessionKey);
    setName(editing?.name ?? "");
    setMinMinor(editing?.amount_min_minor ?? null);
    setMaxMinor(editing?.amount_max_minor ?? null);
    setCadence(editing?.cadence ?? "monthly");
    setDue(
      editing === null ? undefined : new Date(editing.next_due_date),
    );
    setSourceId(editing?.linked_source_id ?? "");
    setCategoryId(editing?.category_id ?? "");
    setRemaining(editing?.remaining_count == null ? "" : String(editing.remaining_count));
    setOffsets(editing?.reminder_offsets ?? []);
  }

  // A one-time bill has no tenor and no "next" due date to speak of.
  const once = cadence === "once";
  const tenor = remaining.trim() === "" ? null : Number.parseInt(remaining, 10);
  const tenorInvalid = tenor !== null && (Number.isNaN(tenor) || tenor < 1);

  const pending = create.isPending || update.isPending;

  function submit() {
    const body: Record<string, unknown> = {
      name: name.trim(),
      amount_min_minor: minMinor ?? 0,
      amount_max_minor: maxMinor ?? minMinor ?? 0,
      cadence,
      next_due_date: due === undefined ? undefined : jakartaDateKey(due),
      linked_source_id: sourceId === "" ? undefined : sourceId,
      category_id: categoryId === "" ? undefined : categoryId,
      // Explicit null clears a tenor; a one-time bill never carries one.
      remaining_count: once ? null : tenor,
      reminder_offsets: offsets,
    };
    const done = (message: string) => {
      toast.success(message);
      onOpenChange(false);
    };
    if (editing !== null) {
      update.mutate(
        { id: editing.id, ...body },
        { onSuccess: () => done("Tagihan diubah"), onError: (error) => toastError(error.message) },
      );
      return;
    }
    create.mutate(body, {
      onSuccess: () => done("Tagihan dibuat"),
      onError: (error) => toastError(error.message),
    });
  }

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing === null ? "Tambah tagihan" : "Ubah tagihan"}
      description="Rentang nominal min–max: reservasi memakai batas atas (konservatif)."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={submit}
            disabled={
              pending || name.trim() === "" || due === undefined || minMinor === null || tenorInvalid
            }
          >
            Simpan
          </Button>
        </>
      }
    >
      <FormField label="Nama" htmlFor="bill-name">
        <Input
          id="bill-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="mis. Listrik"
        />
      </FormField>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Minimal" htmlFor="bill-min">
          <AmountInput id="bill-min" valueMinor={minMinor} onChangeMinor={setMinMinor} />
        </FormField>
        <FormField label="Maksimal" htmlFor="bill-max">
          <AmountInput id="bill-max" valueMinor={maxMinor} onChangeMinor={setMaxMinor} />
        </FormField>
      </div>

      <FormField label="Siklus" htmlFor="bill-cadence">
        <Select value={cadence} onValueChange={setCadence}>
          <SelectTrigger id="bill-cadence" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CADENCES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label={once ? "Jatuh tempo" : "Jatuh tempo berikutnya"} htmlFor="bill-due">
        <DatePicker id="bill-due" date={due} onChange={setDue} />
      </FormField>

      {once ? null : (
        <FormField
          label="Sisa cicilan"
          htmlFor="bill-remaining"
          hint="opsional"
        >
          <Input
            id="bill-remaining"
            inputMode="numeric"
            value={remaining}
            onChange={(event) => setRemaining(event.target.value.replace(/[^0-9]/g, ""))}
            placeholder="mis. 12 kali"
          />
        </FormField>
      )}

      <fieldset className="grid gap-1.5">
        <legend className="flex w-full items-baseline justify-between gap-2 text-body font-medium">
          <span>Ingatkan via WhatsApp</span>
          <span className="text-meta font-normal text-muted-foreground">
            Pesan hanya menyebut nama tagihan, bukan nominal.
          </span>
        </legend>
        <div className="grid gap-2 pt-1">
          {REMINDER_OFFSETS.map((offset) => (
            <div key={offset.value} className="flex items-center gap-2">
              <Checkbox
                id={`bill-reminder-${offset.value}`}
                checked={offsets.includes(offset.value)}
                onCheckedChange={(checked) =>
                  setOffsets((current) =>
                    checked === true
                      ? [...current, offset.value]
                      : current.filter((value) => value !== offset.value),
                  )
                }
              />
              <Label htmlFor={`bill-reminder-${offset.value}`} className="cursor-pointer font-normal">
                {offset.label}
              </Label>
            </div>
          ))}
        </div>
      </fieldset>

      <FormField label="Sumber terhubung" htmlFor="bill-source" hint="opsional">
        <Select value={sourceId} onValueChange={(value) => setSourceId(value === "none" ? "" : value)}>
          <SelectTrigger id="bill-source" className="w-full">
            <SelectValue placeholder="Tidak ada" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Tidak ada</SelectItem>
            {sources.map((source) => (
              <SelectItem key={source.id} value={source.id}>
                {source.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Kategori" htmlFor="bill-category" hint="opsional">
        <Select
          value={categoryId}
          onValueChange={(value) => setCategoryId(value === "none" ? "" : value)}
        >
          <SelectTrigger id="bill-category" className="w-full">
            <SelectValue placeholder="Tidak ada" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Tidak ada</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    </ResponsiveSheet>
  );
}

/**
 * "Tandai lunas": the dashboard half of the paid loop. The amount is
 * prefilled with the band's upper bound because that is what the
 * reservation assumed — but it stays editable, because the band is an
 * estimate and only the user knows what actually left the account.
 */
function PayBillSheet({
  bill,
  onOpenChange,
  sources,
}: {
  bill: Bill | null;
  onOpenChange: (open: boolean) => void;
  sources: { id: string; name: string }[];
}) {
  const pay = usePayBill();
  const [amountMinor, setAmountMinor] = useState<number | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [sourceId, setSourceId] = useState("");
  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  const sessionKey = bill?.id ?? "closed";
  if (initializedFor !== sessionKey) {
    setInitializedFor(sessionKey);
    setAmountMinor(bill?.amount_max_minor ?? null);
    setDate(new Date());
    setSourceId("");
  }

  // A bill with no linked source cannot say where the money came from.
  const needsSource = bill !== null && !bill.linked_source_id;

  function submit() {
    if (bill === null || amountMinor === null) {
      return;
    }
    pay.mutate(
      {
        id: bill.id,
        amount_minor: amountMinor,
        occurred_date: date === undefined ? undefined : jakartaDateKey(date),
        source_id: sourceId === "" ? undefined : sourceId,
      },
      {
        onSuccess: () => {
          toast.success(`Lunas: ${bill.name}`);
          onOpenChange(false);
        },
        onError: (error) => toastError(error.message),
      },
    );
  }

  return (
    <ResponsiveSheet
      open={bill !== null}
      onOpenChange={onOpenChange}
      title={`Tandai lunas ${bill?.name ?? ""}`}
      description="Tercatat sebagai pengeluaran biasa, lalu tagihan maju ke jatuh tempo berikutnya."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={submit}
            disabled={
              pay.isPending ||
              amountMinor === null ||
              amountMinor <= 0 ||
              (needsSource && sourceId === "")
            }
          >
            Tandai lunas
          </Button>
        </>
      }
    >
      <FormField label="Nominal dibayar" htmlFor="pay-amount">
        <AmountInput id="pay-amount" valueMinor={amountMinor} onChangeMinor={setAmountMinor} />
      </FormField>

      <FormField label="Tanggal" htmlFor="pay-date">
        <DatePicker id="pay-date" date={date} onChange={setDate} />
      </FormField>

      {needsSource ? (
        <FormField label="Sumber" htmlFor="pay-source">
          <Select value={sourceId} onValueChange={setSourceId}>
            <SelectTrigger id="pay-source" className="w-full">
              <SelectValue placeholder="Pilih sumber" />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      ) : null}
    </ResponsiveSheet>
  );
}
