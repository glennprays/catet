"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Chip } from "@/components/chip";
import { MoneyText } from "@/components/money-text";
import { QueryBoundary } from "@/components/query-boundary";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { SectionHeader } from "@/components/section-header";
import { SourceChip } from "@/components/source-chip";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useReverseTransaction,
  useSourceTypeMap,
  useTransaction,
  useVoidTransaction,
  type Transaction,
} from "@/lib/api/hooks";
import { toastError } from "@/lib/toast";
import { dateTimeLabel, shortDateLabel } from "@/lib/time";

const TYPE_LABEL: Record<Transaction["type"], string> = {
  expense: "Keluar",
  income: "Masuk",
  transfer: "Pindah",
  adjustment: "Koreksi",
};

const ORIGIN_LABEL: Record<Transaction["origin"], string> = {
  whatsapp_text: "WhatsApp",
  whatsapp_photo: "Foto WhatsApp",
  dashboard_manual: "Dashboard",
  import: "Impor",
};

const PROVENANCE_LABEL: Record<string, string> = {
  rules: "aturan",
  llm: "AI",
  user: "kamu",
  import: "impor",
};

/**
 * Detail sheet: the read view the API always had and the UI never
 * showed — legs, provenance, edit history — and the only place the
 * consequential actions live.
 */
export function TransactionDetailSheet({
  id,
  onOpenChange,
  onEdit,
  onOpenDetail,
}: {
  id: string | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (transaction: Transaction) => void;
  onOpenDetail: (id: string) => void;
}) {
  const query = useTransaction(id);

  return (
    <ResponsiveSheet
      open={id !== null}
      onOpenChange={onOpenChange}
      title="Detail transaksi"
      size="md"
    >
      <QueryBoundary
        query={query}
        errorMessage="Detail transaksi gagal dimuat."
        skeleton={
          <div className="grid gap-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-8 w-full rounded-md" />
            ))}
          </div>
        }
        empty={null}
      >
        {(transaction) => (
          <DetailBody
            transaction={transaction}
            onClose={() => onOpenChange(false)}
            onEdit={onEdit}
            onOpenDetail={onOpenDetail}
          />
        )}
      </QueryBoundary>
    </ResponsiveSheet>
  );
}

function DetailBody({
  transaction,
  onClose,
  onEdit,
  onOpenDetail,
}: {
  transaction: Transaction;
  onClose: () => void;
  onEdit: (transaction: Transaction) => void;
  onOpenDetail: (id: string) => void;
}) {
  const sourceTypes = useSourceTypeMap();
  const voidTx = useVoidTransaction();
  const reverseTx = useReverseTransaction();
  const [confirm, setConfirm] = useState<"void" | "reverse" | null>(null);

  const primaryLeg = transaction.legs.find((leg) => leg.source_id !== null && leg.source_id !== undefined);
  const signedAmount =
    primaryLeg?.signed_amount ??
    (transaction.type === "income" ? transaction.amount_minor : -transaction.amount_minor);
  const title = transaction.merchant ?? transaction.note ?? TYPE_LABEL[transaction.type];
  const provenance =
    transaction.category_source === null || transaction.category_source === undefined
      ? null
      : PROVENANCE_LABEL[transaction.category_source];

  return (
    <>
      <div className="grid gap-1">
        <MoneyText
          minor={signedAmount}
          signed
          size="xl"
          strike={transaction.voided}
          tone={transaction.voided ? "muted" : "auto"}
        />
        <p className="text-amount text-ink">{title}</p>
        <p className="text-meta text-muted-foreground">{dateTimeLabel(transaction.occurred_at)}</p>
      </div>

      {transaction.voided ? (
        <p role="status" className="rounded-md bg-over-wash px-3 py-2 text-body text-over-text">
          Transaksi ini sudah di-void: tidak dihitung di mana pun.
        </p>
      ) : null}

      <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 text-body">
        <dt className="text-muted-foreground">Jenis</dt>
        <dd className="text-ink">{TYPE_LABEL[transaction.type]}</dd>

        <dt className="text-muted-foreground">Sumber</dt>
        <dd>
          {primaryLeg?.source_name === null || primaryLeg?.source_name === undefined ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <SourceChip
              name={primaryLeg.source_name}
              type={
                primaryLeg.source_id === null || primaryLeg.source_id === undefined
                  ? undefined
                  : sourceTypes.get(primaryLeg.source_id)
              }
            />
          )}
        </dd>

        <dt className="text-muted-foreground">Kategori</dt>
        <dd className="flex flex-wrap items-center gap-1.5">
          {transaction.category_name === null || transaction.category_name === undefined ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <Chip>{transaction.category_name}</Chip>
          )}
          {provenance === null ? null : (
            <StatusBadge tone="neutral">
              {provenance}
              {transaction.category_confidence === null ||
              transaction.category_confidence === undefined
                ? ""
                : ` · ${Math.round(transaction.category_confidence * 100)}%`}
            </StatusBadge>
          )}
        </dd>

        {transaction.note === null || transaction.note === undefined ? null : (
          <>
            <dt className="text-muted-foreground">Catatan</dt>
            <dd className="text-ink">{transaction.note}</dd>
          </>
        )}

        <dt className="text-muted-foreground">Asal</dt>
        <dd className="text-ink">{ORIGIN_LABEL[transaction.origin]}</dd>

        {transaction.bill_id === null || transaction.bill_id === undefined ? null : (
          <>
            <dt className="text-muted-foreground">Tagihan</dt>
            <dd className="text-ink">
              {transaction.bill_name}
              <span className="block text-meta text-ash">
                Menghapus transaksi ini mengembalikan jadwal tagihan.
              </span>
            </dd>
          </>
        )}
      </dl>

      <div>
        <SectionHeader title="Legs" as="h3" />
        <ul>
          {transaction.legs.map((leg) => (
            <li
              key={leg.id}
              className="flex min-h-9 items-center justify-between gap-3 border-b border-border text-body"
            >
              <span className="min-w-0 truncate text-ink">
                {leg.source_name ?? leg.category_name ?? "—"}
              </span>
              <MoneyText minor={leg.signed_amount} signed size="sm" />
            </li>
          ))}
        </ul>
      </div>

      {transaction.reverses_transaction_id === null ||
      transaction.reverses_transaction_id === undefined ? null : (
        <Button
          variant="ghost"
          size="sm"
          className="justify-self-start"
          onClick={() => onOpenDetail(transaction.reverses_transaction_id as string)}
        >
          Membalikkan: {transaction.reverses_merchant ?? "transaksi"}
        </Button>
      )}

      <div>
        <SectionHeader title="Riwayat ubahan" as="h3" />
        {transaction.edit_history.length === 0 ? (
          <p className="text-meta text-muted-foreground">Belum pernah diubah.</p>
        ) : (
          <ul className="grid gap-1.5">
            {transaction.edit_history.map((entry, index) => (
              <li key={entry.edited_at ?? index} className="text-meta text-muted-foreground">
                <span className="text-ink-soft">
                  {entry.edited_at === undefined ? "—" : shortDateLabel(entry.edited_at)}
                </span>
                {Object.entries(entry.changes ?? {}).map(([field, change]) => (
                  <span key={field} className="block">
                    {field}: {String(change.from ?? "—")} → {String(change.to ?? "—")}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>

      {transaction.voided ? null : (
        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
          <Button
            variant="secondary"
            onClick={() => {
              onEdit(transaction);
            }}
          >
            Ubah
          </Button>
          <Button variant="ghost" onClick={() => setConfirm("reverse")}>
            Balikkan
          </Button>
          <Button variant="dangerGhost" onClick={() => setConfirm("void")}>
            Hapus
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirm === "reverse"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Balikkan transaksi ini?"
        description={
          <p>
            Akan dibuat transaksi kebalikan sebesar{" "}
            <MoneyText size="sm" signed minor={-signedAmount} /> pada{" "}
            {primaryLeg?.source_name ?? "sumber yang sama"}. Transaksi asli tetap ada.
          </p>
        }
        confirmLabel="Buat pembalikan"
        pending={reverseTx.isPending}
        onConfirm={() =>
          reverseTx.mutate(
            { id: transaction.id },
            {
              onSuccess: () => {
                toast.success("Pembalikan dibuat");
                setConfirm(null);
                onClose();
              },
              onError: (error) => toastError(error.message),
            },
          )
        }
      />

      <ConfirmDialog
        open={confirm === "void"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Void transaksi ini?"
        description="Transaksi di-void: hilang dari semua hitungan, tetap terlihat di riwayat."
        confirmLabel="Void"
        tone="danger"
        typedPhrase="HAPUS"
        pending={voidTx.isPending}
        onConfirm={() =>
          voidTx.mutate(transaction.id, {
            onSuccess: () => {
              toast.success("Transaksi di-void");
              setConfirm(null);
            },
            onError: (error) => toastError(error.message),
          })
        }
      />
    </>
  );
}
