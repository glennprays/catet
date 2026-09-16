"use client";

import { useState } from "react";
import { Plus, Send, Wallet } from "lucide-react";
import { toast } from "sonner";

import { AmountInput } from "@/components/amount-input";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState, QueryErrorState } from "@/components/empty-state";
import { FormField } from "@/components/form-field";
import { Metric } from "@/components/metric";
import { MoneyText } from "@/components/money-text";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { RowMenu } from "@/components/row-menu";
import { SourceCard } from "@/components/source-card";
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
import {
  useAdjustSource,
  useArchiveSource,
  useCreateSource,
  useDeleteSource,
  useRestoreSource,
  useSources,
  useUpdateSource,
  type Source,
} from "@/lib/api/hooks";
import { formatIDR } from "@/lib/money";
import { SOURCE_TYPE_LABEL } from "@/lib/source-glyph";
import { toastError } from "@/lib/toast";

const SOURCE_TYPES = (Object.keys(SOURCE_TYPE_LABEL) as Source["type"][]).map((value) => ({
  value,
  label: SOURCE_TYPE_LABEL[value],
}));

// Neutral ink ramp: the allocation bar is a proportion, not six
// categories, so it never borrows a semantic colour (DESIGN.md §2).
const ALLOC = ["#050f1a", "#374151", "#8a919e", "#d1d5db"];

export default function SourcesPage() {
  // Archived sources come down with the list so the Arsip section can
  // exist at all; the active grid filters them back out.
  const sources = useSources(true);
  const archive = useArchiveSource();
  const restore = useRestoreSource();
  const remove = useDeleteSource();
  const { openCreate } = useCaptureSheet();
  const all = sources.data?.sources ?? [];
  const list = all.filter((source) => source.archived_at === null);
  const archived = all.filter((source) => source.archived_at !== null);
  const assets = [...list.filter((source) => !source.is_debt)].sort(
    (a, b) => b.balance_minor - a.balance_minor,
  );
  const debts = list.filter((source) => source.is_debt);
  const totalAvailable = sources.data?.total_available_minor ?? 0;
  const totalDebt = sources.data?.total_debt_minor ?? 0;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Source | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<Source | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Source | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Source | null>(null);
  const [showArchive, setShowArchive] = useState(false);

  function openForm(target: Source | null) {
    setEditing(target);
    setFormOpen(true);
  }

  /**
   * Archiving a source that still holds money would strand the balance,
   * so the server refuses it. Say so before the round trip and hand the
   * user the tool that fixes it.
   */
  function requestArchive(source: Source) {
    if (source.balance_minor !== 0) {
      toastError(
        `Saldo masih ${formatIDR(source.balance_minor)} — kosongkan dulu lewat Transfer atau Koreksi saldo`,
      );
      setAdjustTarget(source);
      return;
    }
    setArchiveTarget(source);
  }

  function deleteAction(source: Source) {
    // Permanent delete is only ever legal for a source the ledger
    // never touched.
    return source.has_transactions
      ? []
      : [{ label: "Hapus", tone: "danger" as const, onClick: () => setDeleteTarget(source) }];
  }

  function menuFor(source: Source) {
    return (
      <RowMenu
        label={`Aksi ${source.name}`}
        tone="onColor"
        actions={[
          { label: "Ubah", onClick: () => openForm(source) },
          { label: "Koreksi saldo", onClick: () => setAdjustTarget(source) },
          { label: "Arsipkan", tone: "danger" as const, onClick: () => requestArchive(source) },
          ...deleteAction(source),
        ]}
      />
    );
  }

  function archivedMenuFor(source: Source) {
    return (
      <RowMenu
        label={`Aksi ${source.name}`}
        tone="onColor"
        actions={[
          {
            label: "Pulihkan",
            pending: restore.isPending,
            onClick: () =>
              restore.mutate(source.id, {
                onSuccess: () => toast.success("Sumber dipulihkan"),
                onError: (error) => toastError(error.message),
              }),
          },
          ...deleteAction(source),
        ]}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Sources"
        actions={
          <>
            {/* Two labelled actions plus the 18px phone title overflow a
                360px header; below 640px the glyph carries Transfer. */}
            <Button
              variant="secondary"
              aria-label="Transfer"
              className="max-sm:w-11 max-sm:px-0"
              onClick={() => openCreate("transfer")}
            >
              <Send className="size-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Transfer</span>
            </Button>
            <Button onClick={() => openForm(null)}>
              <Plus className="size-4" strokeWidth={1.75} /> Tambah
            </Button>
          </>
        }
      />

      <div className="grid gap-2.5 py-2.5">
        {sources.isPending ? (
          <>
            <div className="catet-shimmer h-[88px] rounded-md" />
            <Panel density="list">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="catet-shimmer m-2 h-10 rounded-md" />
              ))}
            </Panel>
          </>
        ) : sources.isError ? (
          <QueryErrorState message="Sumber gagal dimuat." onRetry={() => sources.refetch()} />
        ) : all.length === 0 ? (
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
          <>
            <Panel density="compact">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
                <Metric
                  label="Total aset"
                  inlineOnPhone
                  value={
                    <MoneyText
                      minor={totalAvailable}
                      size="lg"
                      tone="neutral"
                      className="font-semibold"
                    />
                  }
                />
                <Metric
                  label="Total utang"
                  inlineOnPhone
                  value={
                    <MoneyText
                      minor={-totalDebt}
                      size="lg"
                      tone={totalDebt > 0 ? "over" : "muted"}
                      className="font-semibold"
                    />
                  }
                />
                <Metric
                  label="Posisi bersih"
                  align="right"
                  inlineOnPhone
                  value={
                    <MoneyText
                      minor={totalAvailable - totalDebt}
                      size="lg"
                      tone="neutral"
                      className="font-semibold"
                    />
                  }
                />
              </div>

              {assets.length >= 2 && totalAvailable > 0 ? (
                <>
                  <div
                    role="img"
                    aria-label="Sebaran aset per sumber"
                    className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-surface-300"
                  >
                    {assets.map((source, index) => (
                      <span
                        key={source.id}
                        style={{
                          width: `${(source.balance_minor / totalAvailable) * 100}%`,
                          background: ALLOC[index % ALLOC.length],
                        }}
                      />
                    ))}
                  </div>
                  <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-label text-ink-soft">
                    {assets.map((source, index) => (
                      <li key={source.id} className="flex items-center gap-1.5">
                        <span
                          aria-hidden
                          className="inline-block size-2 rounded-sm"
                          style={{ background: ALLOC[index % ALLOC.length] }}
                        />
                        {source.name} {Math.round((source.balance_minor / totalAvailable) * 100)}%
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </Panel>

            {list.length === 0 ? (
              <EmptyState
                icon={Wallet}
                heading="Semua sumber diarsipkan"
                caption="Pulihkan salah satu dari Arsip, atau tambah yang baru."
                action={
                  <Button variant="secondary" onClick={() => openForm(null)}>
                    Tambah sumber
                  </Button>
                }
              />
            ) : (
              <Panel density="list" title="Aset" caption={`${assets.length} sumber`}>
                <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
                  {assets.map((source) => (
                    <SourceCard
                      key={source.id}
                      source={source}
                      size="tile"
                      share={totalAvailable === 0 ? 0 : source.balance_minor / totalAvailable}
                      trailing={menuFor(source)}
                      onSelect={() => openForm(source)}
                    />
                  ))}
                </div>
              </Panel>
            )}

            {debts.length === 0 ? null : (
              <Panel density="list" title="Utang" caption={`${debts.length} sumber`}>
                <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
                  {debts.map((source) => (
                    <SourceCard
                      key={source.id}
                      source={source}
                      size="tile"
                      share={totalDebt === 0 ? 0 : Math.abs(source.balance_minor) / totalDebt}
                      trailing={menuFor(source)}
                      onSelect={() => openForm(source)}
                    />
                  ))}
                </div>
              </Panel>
            )}

            {archived.length === 0 ? null : (
              <Panel
                density="list"
                title="Arsip"
                caption={`${archived.length} sumber`}
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowArchive((shown) => !shown)}
                  >
                    {showArchive ? "Sembunyikan" : "Tampilkan arsip"}
                  </Button>
                }
              >
                {showArchive ? (
                  <div className="grid gap-2 p-3">
                    {archived.map((source) => (
                      <SourceCard
                        key={source.id}
                        source={source}
                        size="row"
                        share={0}
                        trailing={archivedMenuFor(source)}
                      />
                    ))}
                  </div>
                ) : null}
              </Panel>
            )}
          </>
        )}
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

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Hapus ${deleteTarget?.name ?? "sumber"}?`}
        description="Sumber ini belum punya transaksi, jadi bisa dihapus permanen. Tagihan yang menautkannya akan dilepas."
        confirmLabel="Hapus permanen"
        tone="danger"
        typedPhrase="HAPUS"
        pending={remove.isPending}
        onConfirm={() => {
          if (deleteTarget === null) {
            return;
          }
          remove.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Sumber dihapus");
              setDeleteTarget(null);
            },
            onError: (error) => toastError(error.message),
          });
        }}
      />
    </>
  );
}

/**
 * One sheet for both directions. Create writes the opening balance as
 * an adjustment right after the source exists: a new source that starts
 * at Rp0 corrupts Safe-to-Spend until someone notices. Editing does the
 * same trick in reverse — a corrected balance is an Adjustment Entry,
 * never an edit of the ledger (CONTEXT.md).
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
  const [type, setType] = useState<Source["type"]>("bank");
  const [isDebt, setIsDebt] = useState(false);
  const [balanceMinor, setBalanceMinor] = useState<number | null>(null);
  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  // Re-initialise on every open, and forget the session on close — a
  // sheet that keeps the last source's debt switch lies about the next
  // one.
  const sessionKey = editing?.id ?? "new";
  if (open && initializedFor !== sessionKey) {
    setInitializedFor(sessionKey);
    setName(editing?.name ?? "");
    setType(editing?.type ?? "bank");
    setIsDebt(editing?.is_debt ?? false);
    setBalanceMinor(editing?.balance_minor ?? null);
  }
  if (!open && initializedFor !== null) {
    setInitializedFor(null);
  }

  const pending = create.isPending || update.isPending || adjust.isPending;

  async function submit() {
    if (editing !== null) {
      const body: { name?: string; type?: Source["type"]; is_debt?: boolean } = {};
      if (name.trim() !== "" && name !== editing.name) {
        body.name = name.trim();
      }
      if (type !== editing.type) {
        body.type = type;
      }
      if (isDebt !== editing.is_debt) {
        body.is_debt = isDebt;
      }
      const correction =
        balanceMinor !== null && balanceMinor !== editing.balance_minor
          ? balanceMinor - editing.balance_minor
          : 0;
      if (Object.keys(body).length === 0 && correction === 0) {
        onOpenChange(false);
        return;
      }
      if (Object.keys(body).length > 0) {
        try {
          await update.mutateAsync({ id: editing.id, ...body });
        } catch (error) {
          toastError(error instanceof Error ? error.message : "Gagal menyimpan");
          return;
        }
      }
      if (correction !== 0) {
        try {
          await adjust.mutateAsync({
            id: editing.id,
            amount_minor: correction,
            note: "Koreksi saldo",
          });
        } catch {
          toastError("Perubahan tersimpan, koreksi saldo gagal — pakai Koreksi saldo");
          onOpenChange(false);
          return;
        }
      }
      toast.success("Sumber diubah");
      onOpenChange(false);
      return;
    }

    let created: Source;
    try {
      created = await create.mutateAsync({ name: name.trim(), type, is_debt: isDebt });
    } catch (error) {
      toastError(error instanceof Error ? error.message : "Gagal menyimpan");
      return;
    }

    if (balanceMinor !== null && balanceMinor !== 0) {
      try {
        await adjust.mutateAsync({
          id: created.id,
          amount_minor: balanceMinor,
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

      <FormField label="Jenis" htmlFor="source-type">
        <Select value={type} onValueChange={(next) => setType(next as Source["type"])}>
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

      <SwitchRow
        id="source-debt"
        label="Sumber utang"
        caption="Boleh minus (paylater, kartu kredit)"
        checked={isDebt}
        onCheckedChange={setIsDebt}
      />

      {/* Flipping the flag moves where the balance is counted; the
          ledger itself is untouched. Warn, never block. */}
      {editing !== null && isDebt !== editing.is_debt && editing.has_transactions ? (
        <p className="text-meta text-over-text">
          Saldo <MoneyText minor={editing.balance_minor} size="sm" tone="inherit" /> pindah dari{" "}
          {isDebt ? "Aset ke Utang" : "Utang ke Aset"}. Riwayat transaksi tidak berubah.
        </p>
      ) : null}

      <FormField
        label={editing === null ? "Saldo saat ini" : "Saldo sebenarnya sekarang"}
        htmlFor="opening-balance"
        hint="opsional"
      >
        <AmountInput
          id="opening-balance"
          valueMinor={balanceMinor}
          onChangeMinor={setBalanceMinor}
          allowNegative={isDebt}
        />
      </FormField>
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
      <p className="text-body text-muted-foreground">
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
