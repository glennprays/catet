"use client";

import { createElement, useState } from "react";
import { Plus, Send, Wallet } from "lucide-react";
import { toast } from "sonner";

import { AmountInput } from "@/components/amount-input";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState, QueryErrorState } from "@/components/empty-state";
import { FormField } from "@/components/form-field";
import { MoneyText } from "@/components/money-text";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { RowActions } from "@/components/row-actions";
import { SwitchRow } from "@/components/switch-row";
import { useCaptureSheet } from "@/components/capture-sheet-provider";
import { Button } from "@/components/ui/button";
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
  useAdjustSource,
  useArchiveSource,
  useCreateSource,
  useSources,
  useUpdateSource,
  type Source,
} from "@/lib/api/hooks";
import { sourceGlyph } from "@/lib/source-glyph";
import { toastError } from "@/lib/toast";

const SOURCE_TYPES = [
  { value: "bank", label: "Bank" },
  { value: "cash", label: "Tunai" },
  { value: "ewallet", label: "E-Wallet" },
  { value: "custom", label: "Lainnya" },
];

export default function SourcesPage() {
  const sources = useSources();
  const archive = useArchiveSource();
  const { openCreate } = useCaptureSheet();
  const list = sources.data?.sources ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Source | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<Source | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Source | null>(null);

  function openForm(target: Source | null) {
    setEditing(target);
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
            <Button onClick={() => openForm(null)}>
              <Plus className="size-4" /> Tambah
            </Button>
          </>
        }
      />

      <div className="py-4">
        {sources.isPending ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-md" />
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
              <Button variant="secondary" onClick={() => openForm(null)}>
                Tambah sumber
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {list.map((source) => (
              <li key={source.id} id={source.id}>
                <Panel density="compact">
                  <div className="flex items-center gap-2.5">
                    {createElement(sourceGlyph(source.type), {
                      className: "size-4 shrink-0 text-ash",
                      strokeWidth: 1.75,
                    })}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] text-ink">{source.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {SOURCE_TYPES.find((item) => item.value === source.type)?.label ??
                          source.type}
                        {source.is_debt ? " · utang" : ""}
                      </p>
                    </div>
                    <MoneyText
                      minor={source.balance_minor}
                      size="lg"
                      tone={source.balance_minor < 0 ? "over" : "neutral"}
                    />
                  </div>
                  <div className="mt-2">
                    <RowActions
                      actions={[
                        { label: "Ubah", onClick: () => openForm(source) },
                        { label: "Koreksi saldo", onClick: () => setAdjustTarget(source) },
                        ...(source.archived_at === null
                          ? [
                              {
                                label: "Arsipkan",
                                tone: "danger" as const,
                                onClick: () => setArchiveTarget(source),
                              },
                            ]
                          : []),
                      ]}
                    />
                  </div>
                </Panel>
              </li>
            ))}
          </ul>
        )}

        {sources.data !== undefined && sources.data.total_debt_minor > 0 ? (
          <p className="mt-4 text-[13px] text-over-text">
            Total utang {<MoneyText minor={-sources.data.total_debt_minor} size="sm" tone="over" />}
          </p>
        ) : null}
      </div>

      <SourceFormSheet open={formOpen} onOpenChange={setFormOpen} editing={editing} />
      <AdjustSheet source={adjustTarget} onClose={() => setAdjustTarget(null)} />

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
            onError: (error) => toastError(error.message),
          });
        }}
      />
    </>
  );
}

/**
 * Create writes the opening balance as an adjustment right after the
 * source exists: a new source that starts at Rp0 corrupts Safe-to-Spend
 * until someone notices.
 */
function SourceFormSheet({
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
  const adjust = useAdjustSource();

  const [name, setName] = useState("");
  const [type, setType] = useState("bank");
  const [isDebt, setIsDebt] = useState(false);
  const [openingMinor, setOpeningMinor] = useState<number | null>(null);
  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  const sessionKey = `${open ? "open" : "closed"}-${editing?.id ?? "new"}`;
  if (open && initializedFor !== sessionKey) {
    setInitializedFor(sessionKey);
    setName(editing?.name ?? "");
    setType(editing?.type ?? "bank");
    setIsDebt(editing?.is_debt ?? false);
    setOpeningMinor(null);
  }

  const pending = create.isPending || update.isPending || adjust.isPending;

  async function submit() {
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
      try {
        await update.mutateAsync({ id: editing.id, ...body });
        toast.success("Sumber diubah");
        onOpenChange(false);
      } catch (error) {
        toastError(error instanceof Error ? error.message : "Gagal menyimpan");
      }
      return;
    }

    let created: Source;
    try {
      created = await create.mutateAsync({ name: name.trim(), type, is_debt: isDebt });
    } catch (error) {
      toastError(error instanceof Error ? error.message : "Gagal menyimpan");
      return;
    }

    if (openingMinor !== null && openingMinor !== 0) {
      try {
        await adjust.mutateAsync({
          id: created.id,
          amount_minor: openingMinor,
          note: "Saldo awal",
        });
      } catch {
        toastError("Sumber dibuat, saldo awal gagal — pakai Koreksi saldo");
        onOpenChange(false);
        return;
      }
    }
    toast.success("Sumber ditambahkan");
    onOpenChange(false);
  }

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={editing === null ? "Tambah sumber" : "Ubah sumber"}
      description="Tempat uang tinggal: rekening, tunai, atau e-wallet."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={pending || (editing === null && name.trim() === "")}>
            Simpan
          </Button>
        </>
      }
    >
      <FormField label="Nama" htmlFor="source-name">
        <Input
          id="source-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="mis. BCA"
        />
      </FormField>

      {editing === null ? (
        <FormField label="Jenis" htmlFor="source-type">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="source-type" className="w-full">
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
        </FormField>
      ) : null}

      <SwitchRow
        id="source-debt"
        label="Sumber utang"
        caption="Boleh minus (paylater, kartu kredit)"
        checked={isDebt}
        onCheckedChange={setIsDebt}
      />

      {editing === null ? (
        <FormField label="Saldo saat ini" htmlFor="opening-balance" hint="opsional">
          <AmountInput
            id="opening-balance"
            valueMinor={openingMinor}
            onChangeMinor={setOpeningMinor}
            allowNegative={isDebt}
          />
        </FormField>
      ) : null}
    </ResponsiveSheet>
  );
}

/**
 * Correction takes the counted balance, not a signed delta: the user
 * should never do the arithmetic the ledger can do.
 */
function AdjustSheet({ source, onClose }: { source: Source | null; onClose: () => void }) {
  const adjust = useAdjustSource();
  const [countedMinor, setCountedMinor] = useState<number | null>(null);
  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  if (source !== null && initializedFor !== source.id) {
    setInitializedFor(source.id);
    setCountedMinor(null);
  }

  const delta = source === null || countedMinor === null ? null : countedMinor - source.balance_minor;

  function submit() {
    if (source === null || delta === null || delta === 0) {
      return;
    }
    adjust.mutate(
      { id: source.id, amount_minor: delta, note: "Koreksi saldo" },
      {
        onSuccess: () => {
          toast.success("Saldo dikoreksi");
          onClose();
        },
        onError: (error) => toastError(error.message),
      },
    );
  }

  return (
    <ResponsiveSheet
      open={source !== null}
      onOpenChange={(open) => !open && onClose()}
      title={`Koreksi saldo — ${source?.name ?? ""}`}
      description="Samakan saldo catet dengan kenyataan. Isi saldo sebenarnya, selisihnya dihitung otomatis."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={submit} disabled={adjust.isPending || delta === null || delta === 0}>
            Simpan koreksi
          </Button>
        </>
      }
    >
      <FormField label="Saldo sebenarnya sekarang" htmlFor="counted-balance">
        <AmountInput
          id="counted-balance"
          valueMinor={countedMinor}
          onChangeMinor={setCountedMinor}
          allowNegative
        />
      </FormField>
      <p className="text-[13px] text-muted-foreground">
        Saldo tercatat{" "}
        <MoneyText minor={source?.balance_minor ?? 0} size="sm" tone="neutral" />
        {delta === null ? null : (
          <>
            {" · "}Selisih: <MoneyText minor={delta} size="sm" signed />
          </>
        )}
      </p>
    </ResponsiveSheet>
  );
}
