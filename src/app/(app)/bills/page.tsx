"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarPlus, CalendarX } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useBills,
  useCategories,
  useCreateBill,
  useDeactivateBill,
  useSources,
  useUpdateBill,
  type Bill,
} from "@/lib/api/hooks";
import { formatIDR } from "@/lib/money";

const CADENCES = [
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
  { value: "annual", label: "Tahunan" },
];

export default function BillsPage() {
  const bills = useBills();
  const sources = useSources();
  const categories = useCategories();
  const deactivate = useDeactivateBill();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Bill | null>(null);
  const [month, setMonth] = useState<Date>(new Date());

  const list = bills.data?.bills ?? [];
  const dueInMonth = list.filter(
    (bill) =>
      bill.active &&
      format(new Date(bill.next_due_date), "yyyy-MM") === format(month, "yyyy-MM"),
  );
  const dueDays = new Set(dueInMonth.map((bill) => new Date(bill.next_due_date).getDate()));

  return (
    <>
      <PageHeader
        title="Bills & Calendar"
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <CalendarPlus className="size-4" /> Tambah tagihan
          </Button>
        }
      />

      <div className="grid gap-4 py-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <section aria-label="Kalender jatuh tempo" className="rounded-md border border-border bg-surface p-3">
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            modifiers={{ due: (date) => dueDays.has(date.getDate()) }}
            modifiersClassNames={{ due: "bg-warn-wash text-warn-text font-medium" }}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Hari berwarna punya tagihan jatuh tempo bulan ini ({dueInMonth.length}).
          </p>
        </section>

        <section aria-label="Daftar tagihan">
          {bills.isPending ? (
            <p className="text-[13px] text-muted-foreground">Memuat…</p>
          ) : list.length === 0 ? (
            <EmptyState
              icon={CalendarX}
              heading="Belum ada tagihan"
              caption="Sewa, langganan, cicilan — cadangkan nominalnya di Safe-to-Spend."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                >
                  Buat tagihan
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px] uppercase tracking-[0.05em]">Nama</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.05em]">Band</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.05em]">Kadence</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-[0.05em]">Jatuh tempo</TableHead>
                  <TableHead className="text-right text-[11px] uppercase tracking-[0.05em]">Status</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((bill) => (
                  <TableRow key={bill.id} className={bill.active ? "" : "opacity-50"}>
                    <TableCell className="text-[13px]">{bill.name}</TableCell>
                    <TableCell className="tabular-nums text-[13px]">
                      {formatIDR(bill.amount_min_minor)}–{formatIDR(bill.amount_max_minor)}
                    </TableCell>
                    <TableCell className="text-[13px]">
                      {CADENCES.find((cadence) => cadence.value === bill.cadence)?.label ??
                        bill.cadence}
                    </TableCell>
                    <TableCell className="tabular-nums text-[13px]">
                      {format(new Date(bill.next_due_date), "d MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      {bill.active ? (
                        <Badge variant="safe">aktif</Badge>
                      ) : (
                        <Badge variant="secondary">nonaktif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => {
                            setEditing(bill);
                            setFormOpen(true);
                          }}
                        >
                          Ubah
                        </Button>
                        {bill.active ? (
                          <Button
                            variant="ghost"
                            className="h-7 px-2 text-xs text-over-text hover:bg-over-wash"
                            disabled={deactivate.isPending}
                            onClick={() =>
                              deactivate.mutate(bill.id, {
                                onSuccess: () => toast.success("Tagihan dinonaktifkan"),
                                onError: (error) => toast.error(error.message),
                              })
                            }
                          >
                            Nonaktifkan
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </div>

      <BillFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        sources={sources.data?.sources ?? []}
        categories={categories.data?.categories ?? []}
      />
    </>
  );
}

function BillFormDialog({
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
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [cadence, setCadence] = useState("monthly");
  const [due, setDue] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  const sessionKey = `${open ? "open" : "closed"}-${editing?.id ?? "new"}`;
  if (open && initializedFor !== sessionKey) {
    setInitializedFor(sessionKey);
    setName(editing?.name ?? "");
    setMin(editing === null ? "" : String(editing.amount_min_minor));
    setMax(editing === null ? "" : String(editing.amount_max_minor));
    setCadence(editing?.cadence ?? "monthly");
    setDue(editing === null ? "" : format(new Date(editing.next_due_date), "yyyy-MM-dd"));
    setSourceId(editing?.linked_source_id ?? "");
    setCategoryId(editing?.category_id ?? "");
  }

  const pending = create.isPending || update.isPending;

  function submit() {
    const body: Record<string, unknown> = {
      name: name.trim(),
      amount_min_minor: Number.parseInt(min.replace(/\D/g, ""), 10) || 0,
      amount_max_minor: Number.parseInt(max.replace(/\D/g, ""), 10) || 0,
      cadence,
      next_due_date: due === "" ? undefined : due,
      linked_source_id: sourceId === "" ? undefined : sourceId,
      category_id: categoryId === "" ? undefined : categoryId,
    };
    if (editing !== null) {
      update.mutate(
        { id: editing.id, ...body },
        {
          onSuccess: () => {
            toast.success("Tagihan diubah");
            onOpenChange(false);
          },
          onError: (error) => toast.error(error.message),
        },
      );
      return;
    }
    create.mutate(body, {
      onSuccess: () => {
        toast.success("Tagihan dibuat");
        onOpenChange(false);
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing === null ? "Tambah tagihan" : "Ubah tagihan"}</DialogTitle>
          <DialogDescription>
            Band min–max: reservasi memakai batas atas (konservatif).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="bill-name">Nama</Label>
            <Input
              id="bill-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="mis. Listrik"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="bill-min">Band min</Label>
              <Input
                id="bill-min"
                value={min}
                onChange={(event) => setMin(event.target.value)}
                inputMode="numeric"
                className="text-right tabular-nums"
                placeholder="100000"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bill-max">Band max</Label>
              <Input
                id="bill-max"
                value={max}
                onChange={(event) => setMax(event.target.value)}
                inputMode="numeric"
                className="text-right tabular-nums"
                placeholder="250000"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Kadence</Label>
              <Select value={cadence} onValueChange={setCadence}>
                <SelectTrigger className="w-full">
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
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bill-due">Jatuh tempo berikutnya</Label>
              <Input
                id="bill-due"
                type="date"
                value={due}
                onChange={(event) => setDue(event.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Sumber terhubung</Label>
              <Select value={sourceId} onValueChange={(value) => setSourceId(value === "none" ? "" : value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Opsional" />
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
            </div>
            <div className="grid gap-1.5">
              <Label>Kategori</Label>
              <Select value={categoryId} onValueChange={(value) => setCategoryId(value === "none" ? "" : value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Opsional" />
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
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={submit}
            disabled={pending || name.trim() === "" || due === ""}
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
