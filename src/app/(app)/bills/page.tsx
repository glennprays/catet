"use client";

import { useState } from "react";
import { CalendarPlus, CalendarX } from "lucide-react";
import { toast } from "sonner";

import { AmountInput } from "@/components/amount-input";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DatePicker } from "@/components/date-picker";
import { EmptyState } from "@/components/empty-state";
import { FormField } from "@/components/form-field";
import { GroupLabel } from "@/components/group-label";
import { ListRow } from "@/components/list-row";
import { MoneyText } from "@/components/money-text";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { QueryBoundary } from "@/components/query-boundary";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { RowActions } from "@/components/row-actions";
import { SectionHeader } from "@/components/section-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBills,
  useCategories,
  useCreateBill,
  useDeactivateBill,
  useSources,
  useUpdateBill,
  type Bill,
} from "@/lib/api/hooks";
import { daysUntilJakarta, jakartaDateKey } from "@/lib/time";
import { toastError } from "@/lib/toast";

const CADENCES = [
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
  { value: "annual", label: "Tahunan" },
];

function dueLabel(days: number): string {
  if (days === 0) {
    return "Jatuh tempo hari ini";
  }
  return days < 0 ? `terlambat ${-days} hari` : `dalam ${days} hari`;
}

function dueTone(days: number): "over" | "warn" | "neutral" {
  if (days < 0) {
    return "over";
  }
  return days <= 3 ? "warn" : "neutral";
}

/**
 * Bills, list-first: a 6-column horizontal-scroll table put status and
 * actions off-screen at 360px. The calendar is the secondary view.
 */
export default function BillsPage() {
  const bills = useBills();
  const sources = useSources();
  const categories = useCategories();
  const deactivate = useDeactivateBill();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Bill | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Bill | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [month, setMonth] = useState<Date>(new Date());

  const list = bills.data?.bills ?? [];
  const active = list
    .filter((bill) => bill.active)
    .sort((a, b) => jakartaDateKey(a.next_due_date).localeCompare(jakartaDateKey(b.next_due_date)));
  const inactive = list.filter((bill) => !bill.active);

  // Due dates are `yyyy-MM-dd` in Jakarta terms; match calendar cells on
  // the full key so other months never light up.
  const dueKeys = new Set(active.map((bill) => jakartaDateKey(bill.next_due_date)));
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const dueInMonthCount = [...dueKeys].filter((key) => key.startsWith(monthKey)).length;

  function openForm(target: Bill | null) {
    setEditing(target);
    setFormOpen(true);
  }

  const calendarPanel = (
    <Panel density="compact" title="Kalender" caption={`${dueInMonthCount} jatuh tempo bulan ini`}>
      <Calendar
        mode="single"
        month={month}
        onMonthChange={setMonth}
        modifiers={{ due: (date) => dueKeys.has(jakartaDateKey(date)) }}
        modifiersClassNames={{ due: "bg-warn-wash text-warn-text font-medium" }}
      />
    </Panel>
  );

  return (
    <>
      <PageHeader
        title="Bills & Calendar"
        actions={
          <Button onClick={() => openForm(null)}>
            <CalendarPlus className="size-4" strokeWidth={1.75} /> Tambah tagihan
          </Button>
        }
      />

      <div className="grid gap-6 py-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section aria-label="Daftar tagihan">
          <SectionHeader
            title="Tagihan berikutnya"
            action={
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setCalendarOpen((open) => !open)}
              >
                {calendarOpen ? "Sembunyikan kalender" : "Lihat kalender"}
              </Button>
            }
          />

          {calendarOpen ? <div className="mb-3 lg:hidden">{calendarPanel}</div> : null}

          <QueryBoundary
            query={bills}
            isEmpty={(data) => data.bills.length === 0}
            errorMessage="Tagihan gagal dimuat."
            skeleton={
              <div className="grid gap-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="h-12 w-full rounded-md" />
                ))}
              </div>
            }
            empty={
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
            }
          >
            {() => (
              <>
                {active.map((bill) => {
                  const days = daysUntilJakarta(bill.next_due_date);
                  return (
                    <ListRow
                      key={bill.id}
                      title={bill.name}
                      caption={`${
                        CADENCES.find((cadence) => cadence.value === bill.cadence)?.label ??
                        bill.cadence
                      } · ${dueLabel(days)}`}
                      trailing={
                        <span className="flex items-center gap-2">
                          <AmountRange bill={bill} />
                          <StatusBadge tone={dueTone(days)}>
                            {days < 0 ? "Terlambat" : days === 0 ? "Hari ini" : `${days} hari`}
                          </StatusBadge>
                        </span>
                      }
                      actions={
                        <RowActions
                          actions={[
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
                  );
                })}

                {inactive.length > 0 ? (
                  <>
                    <GroupLabel>Nonaktif</GroupLabel>
                    {inactive.map((bill) => (
                      <ListRow
                        key={bill.id}
                        title={bill.name}
                        caption={
                          CADENCES.find((cadence) => cadence.value === bill.cadence)?.label ??
                          bill.cadence
                        }
                        trailing={
                          <span className="flex items-center gap-2">
                            <AmountRange bill={bill} />
                            <StatusBadge tone="neutral">Nonaktif</StatusBadge>
                          </span>
                        }
                      />
                    ))}
                  </>
                ) : null}
              </>
            )}
          </QueryBoundary>
        </section>

        <aside className="hidden lg:block" aria-label="Kalender jatuh tempo">
          {calendarPanel}
        </aside>
      </div>

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

function AmountRange({ bill }: { bill: Bill }) {
  if (bill.amount_min_minor === bill.amount_max_minor) {
    return <MoneyText minor={bill.amount_min_minor} size="sm" tone="neutral" />;
  }
  return (
    <span className="whitespace-nowrap">
      <MoneyText minor={bill.amount_min_minor} size="sm" tone="neutral" />
      <span className="text-muted-foreground">–</span>
      <MoneyText minor={bill.amount_max_minor} size="sm" tone="neutral" />
    </span>
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
  }

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
            disabled={pending || name.trim() === "" || due === undefined || minMinor === null}
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

      <FormField label="Jatuh tempo berikutnya" htmlFor="bill-due">
        <DatePicker id="bill-due" date={due} onChange={setDue} />
      </FormField>

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
