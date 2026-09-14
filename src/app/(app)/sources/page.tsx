"use client";

import { useState } from "react";
import { Banknote, Landmark, Plus, Send, Smartphone, Wallet } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, QueryErrorState } from "@/components/empty-state";

import { PageHeader } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useCaptureSheet } from "@/components/capture-sheet-provider";

import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useAdjustSource,
  useArchiveSource,
  useCreateSource,
  useSources,
  useUpdateSource,
  type Source,
} from "@/lib/api/hooks";
import { formatIDR, parseSignedAmountToMinor } from "@/lib/money";


const SOURCE_TYPES = [
  { value: "bank", label: "Bank", icon: Landmark },
  { value: "cash", label: "Tunai", icon: Banknote },
  { value: "ewallet", label: "E-Wallet", icon: Smartphone },
  { value: "custom", label: "Lainnya", icon: Wallet },
];

function typeIcon(type: string) {
  return SOURCE_TYPES.find((item) => item.value === type)?.icon ?? Wallet;
}

export default function SourcesPage() {
  const sources = useSources();
  const archive = useArchiveSource();
  const { openCreate } = useCaptureSheet();
  const list = sources.data?.sources ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Source | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<Source | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Source | null>(null);
  function openForm() {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Sources"
        actions={
          <>
            <Button variant="secondary" onClick={() => openCreate("transfer")}>
              <Send className="size-4" /> Transfer
            </Button>
            <Button onClick={openForm}>
              <Plus className="size-4" /> Tambah
            </Button>
          </>
        }
      />

      <div className="py-4">
        {sources.isPending ? (
          <div className="grid gap-2">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : sources.isError ? (
          <QueryErrorState message="Sumber gagal dimuat." onRetry={() => sources.refetch()} />
        ) : list.length === 0 ? (
          <EmptyState
            icon={Wallet}
            heading="Belum ada sumber dana"
            caption="Rekening, tunai, atau e-wallet — ini titik awal catet."
            action={
              <Button variant="secondary" onClick={openForm}>
                Tambah sumber
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {list.map((source) => {
              const Icon = typeIcon(source.type);
              return (
                <li
                  key={source.id}
                  className="group rounded-md border border-border bg-surface p-3 transition-colors hover:border-border-strong"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="size-4 text-ash" strokeWidth={1.75} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] text-ink">{source.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {SOURCE_TYPES.find((item) => item.value === source.type)?.label ??
                          source.type}
                        {source.is_debt ? " · utang" : ""}
                      </p>
                    </div>
                    <p
                      className={`text-[15px] font-medium tabular-nums ${
                        source.balance_minor < 0 ? "text-over-text" : "text-ink"
                      }`}
                    >
                      {formatIDR(source.balance_minor)}
                    </p>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(source);
                        setFormOpen(true);
                      }}
                    >
                      Ubah
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAdjustTarget(source)}
                    >
                      Koreksi saldo
                    </Button>
                    {source.archived_at === null ? (
                      <Button
                        variant="dangerGhost"
                        size="sm"
                        onClick={() => setArchiveTarget(source)}
                      >
                        Arsipkan
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {(sources.data?.total_debt_minor ?? 0) > 0 && sources.data !== undefined ? (
          <p className="mt-4 text-[13px] text-over-text">
            Total utang {formatIDR(-sources.data.total_debt_minor)}
          </p>
        ) : null}
      </div>

      <SourceFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />
      <AdjustDialog source={adjustTarget} onClose={() => setAdjustTarget(null)} />

      <ConfirmDialog
        open={archiveTarget !== null}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title={`Arsipkan ${archiveTarget?.name ?? "sumber"}?`}
        description="Sumber diarsipkan dan hilang dari daftar aktif. Riwayat transaksinya tetap ada."
        confirmLabel="Arsipkan"
        tone="danger"
        pending={archive.isPending}
        onConfirm={() => {
          if (archiveTarget === null) {
            return;
          }
          archive.mutate(archiveTarget.id, {
            onSuccess: () => {
              toast.success("Sumber diarsipkan");
              setArchiveTarget(null);
            },
            onError: (error) => toast.error(error.message, { duration: Infinity }),
          });
        }}
      />
    </>
  );
}

function SourceFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Source | null;
}) {
  const create = useCreateSource();
  const update = useUpdateSource();

  // Fields initialize from the target each time the dialog opens.
  const [name, setName] = useState("");
  const [type, setType] = useState("bank");
  const [isDebt, setIsDebt] = useState(false);
  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  const sessionKey = `${open ? "open" : "closed"}-${editing?.id ?? "new"}`;
  if (open && initializedFor !== sessionKey) {
    setInitializedFor(sessionKey);
    setName(editing?.name ?? "");
    setType(editing?.type ?? "bank");
    setIsDebt(editing?.is_debt ?? false);
  }

  const pending = create.isPending || update.isPending;
  const displayName = editing !== null && name === "" ? editing.name : name;

  function submit() {
    if (editing !== null) {
      const body: { name?: string; is_debt?: boolean } = {};
      if (name.trim() !== "" && name !== editing.name) {
        body.name = name.trim();
      }
      if (isDebt !== editing.is_debt) {
        body.is_debt = isDebt;
      }
      if (Object.keys(body).length === 0) {
        onOpenChange(false);
        return;
      }
      update.mutate(
        { id: editing.id, ...body },
        {
          onSuccess: () => {
            toast.success("Sumber diubah");
            onOpenChange(false);
          },
          onError: (error) => toast.error(error.message),
        },
      );
      return;
    }
    create.mutate(
      { name: name.trim(), type, is_debt: isDebt },
      {
        onSuccess: () => {
          toast.success("Sumber ditambahkan");
          setName("");
          onOpenChange(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing === null ? "Tambah sumber" : "Ubah sumber"}</DialogTitle>
          <DialogDescription>Tempat uang tinggal: rekening, tunai, atau e-wallet.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="source-name">Nama</Label>
            <Input
              id="source-name"
              value={displayName}
              onChange={(event) => setName(event.target.value)}
              placeholder="mis. BCA"
            />
          </div>
          {editing === null ? (
            <div className="grid gap-1.5">
              <Label>Jenis</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_TYPES.map((sourceType) => (
                    <SelectItem key={sourceType.value} value={sourceType.value}>
                      {sourceType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="flex items-center justify-between rounded-md bg-surface-100 px-3 py-2.5">
            <div>
              <Label htmlFor="source-debt">Sumber utang</Label>
              <p className="text-xs text-muted-foreground">Boleh minus (paylater, kartu kredit)</p>
            </div>
            <label htmlFor="source-debt" className="flex size-11 shrink-0 items-center justify-center">
              <Switch id="source-debt" checked={isDebt} onCheckedChange={setIsDebt} />
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={pending || (editing === null && name.trim() === "")}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdjustDialog({ source, onClose }: { source: Source | null; onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const adjust = useAdjustSource();

  function submit() {
    if (source === null) {
      return;
    }
    const minor = parseSignedAmountToMinor(amount);
    if (minor === null || minor === 0) {
      toast.error("Isi nominal koreksi");
      return;
    }
    adjust.mutate(
      { id: source.id, amount_minor: minor, note: "Setor koreksi" },
      {
        onSuccess: () => {
          toast.success("Koreksi dicatat");
          setAmount("");
          onClose();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <Dialog open={source !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Setor koreksi — {source?.name}</DialogTitle>
          <DialogDescription>
            Samakan saldo catet dengan kenyataan. Positif menambah, negatif mengurangi
            (mis. −15000).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor="adjust-amount">Nominal koreksi</Label>
          <Input
            id="adjust-amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="mis. 50000 atau -15000"
            className="tabular-nums"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={submit} disabled={adjust.isPending}>
            Catat koreksi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
