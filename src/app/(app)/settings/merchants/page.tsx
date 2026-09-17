"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Store } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { FormField } from "@/components/form-field";
import { ListRow } from "@/components/list-row";
import { MoneyText } from "@/components/money-text";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { QueryBoundary } from "@/components/query-boundary";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api/client";
import {
  useMerchants,
  useMergeMerchant,
  useRenameMerchant,
  type MerchantSummary,
} from "@/lib/api/hooks";
import { shortDateLabel } from "@/lib/time";
import { toastError } from "@/lib/toast";

/** Row skeletons in the final geometry (DESIGN.md §4 truthfulness law). */
function RowSkeleton({ rows }: { rows: number }) {
  return (
    <Panel density="list">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="catet-shimmer m-2 h-9 rounded-md" />
      ))}
    </Panel>
  );
}

export default function MerchantsPage() {
  const merchants = useMerchants();
  const [renameTarget, setRenameTarget] = useState<MerchantSummary | null>(null);
  const [mergeTarget, setMergeTarget] = useState<MerchantSummary | null>(null);

  const list = merchants.data?.merchants ?? [];

  return (
    <>
      <PageHeader
        title="Merchant"
        subtitle="Nama kanonis yang dipakai bot dan dashboard setiap kali mencatat"
      />

      <div className="py-2.5">
        <QueryBoundary
          query={merchants}
          errorMessage="Merchant gagal dimuat."
          skeleton={<RowSkeleton rows={6} />}
          isEmpty={(data) => data.merchants.length === 0}
          empty={
            <Panel density="list" title="Merchant">
              <EmptyState
                icon={Store}
                heading="Belum ada merchant."
                caption="Nama merchant muncul di sini begitu ada transaksi yang mencatatnya."
              />
            </Panel>
          }
        >
          {(data) => (
            <Panel density="list" title="Merchant" caption={`${data.merchants.length} nama`}>
              <div className="hidden h-8 grid-cols-[minmax(0,1fr)_88px_112px_40px] items-center border-b border-border px-4 text-label font-medium uppercase text-ash md:grid">
                <span>Nama</span>
                <span className="text-right">Transaksi</span>
                <span className="text-right">Total</span>
                <span />
              </div>
              <ul aria-label="Merchant">
                {data.merchants.map((merchant) => (
                  <li key={merchant.id}>
                    <ListRow
                      title={merchant.name}
                      caption={
                        merchant.last_used_at === null || merchant.last_used_at === undefined
                          ? "Belum dipakai"
                          : `Terakhir ${shortDateLabel(merchant.last_used_at)}`
                      }
                      trailing={
                        <div className="grid grid-cols-[88px_112px_40px] items-center">
                          <span className="text-right text-figure-md font-medium tabular-nums text-ink-soft">
                            {merchant.tx_count}
                          </span>
                          <span className="text-right">
                            <MoneyText minor={merchant.total_minor} tone="neutral" />
                          </span>
                          <MerchantRowMenu
                            merchant={merchant}
                            onRename={() => setRenameTarget(merchant)}
                            onMerge={() => setMergeTarget(merchant)}
                          />
                        </div>
                      }
                    />
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </QueryBoundary>
      </div>

      <RenameSheet
        merchant={renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        onDone={() => setRenameTarget(null)}
      />
      <MergeSheet
        merchant={mergeTarget}
        merchants={list}
        onOpenChange={(open) => !open && setMergeTarget(null)}
        onDone={() => setMergeTarget(null)}
      />
    </>
  );
}

/**
 * Same `⋯` affordance as every other list screen (DESIGN.md §4 action
 * hierarchy), built on the menu primitives directly because one item is a
 * navigation and therefore has to render as a real anchor.
 */
function MerchantRowMenu({
  merchant,
  onRename,
  onMerge,
}: {
  merchant: MerchantSummary;
  onRename: () => void;
  onMerge: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Aksi ${merchant.name}`}
        >
          <MoreHorizontal className="size-4" strokeWidth={1.75} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onRename}>Ubah nama</DropdownMenuItem>
        <DropdownMenuItem onSelect={onMerge}>Gabungkan ke…</DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/transactions?period=all&merchant_id=${merchant.id}`}>
            Lihat transaksi
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RenameSheet({
  merchant,
  onOpenChange,
  onDone,
}: {
  merchant: MerchantSummary | null;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const rename = useRenameMerchant();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [initializedFor, setInitializedFor] = useState("closed");

  const sessionKey = merchant === null ? "closed" : merchant.id;
  if (initializedFor !== sessionKey) {
    setInitializedFor(sessionKey);
    setName(merchant?.name ?? "");
    setError(undefined);
  }

  function submit() {
    if (merchant === null) {
      return;
    }
    setError(undefined);
    rename.mutate(
      { id: merchant.id, name: name.trim() },
      {
        onSuccess: () => {
          toast.success("Nama merchant diubah");
          onDone();
        },
        onError: (caught) => {
          if (caught instanceof ApiError) {
            // A duplicate name is not a typo to fix in place: the user
            // wanted these two to be one merchant, which is a merge.
            if (caught.code === "CONFLICT") {
              toastError("Nama itu sudah ada — gabungkan saja");
              return;
            }
            const detail = caught.details?.find((item) => item.field === "name");
            setError(detail?.message ?? caught.message);
            return;
          }
          toastError(caught.message);
        },
      },
    );
  }

  return (
    <ResponsiveSheet
      open={merchant !== null}
      onOpenChange={onOpenChange}
      title="Ubah nama merchant"
      description="Nama baru langsung dipakai di semua transaksi merchant ini."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={submit}
            disabled={rename.isPending || name.trim() === "" || name.trim() === merchant?.name}
          >
            Simpan
          </Button>
        </>
      }
    >
      <FormField label="Nama" htmlFor="merchant-name" hint="maks. 80 karakter" error={error}>
        <Input
          id="merchant-name"
          value={name}
          maxLength={80}
          onChange={(event) => setName(event.target.value)}
          placeholder="mis. Kopi Kenangan"
        />
      </FormField>
    </ResponsiveSheet>
  );
}

function MergeSheet({
  merchant,
  merchants,
  onOpenChange,
  onDone,
}: {
  merchant: MerchantSummary | null;
  merchants: MerchantSummary[];
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const merge = useMergeMerchant();
  const [intoId, setIntoId] = useState("");
  const [initializedFor, setInitializedFor] = useState("closed");

  const sessionKey = merchant === null ? "closed" : merchant.id;
  if (initializedFor !== sessionKey) {
    setInitializedFor(sessionKey);
    setIntoId("");
  }

  const targets = merchants.filter((item) => item.id !== merchant?.id);

  function submit() {
    if (merchant === null || intoId === "") {
      return;
    }
    merge.mutate(
      { id: merchant.id, intoMerchantId: intoId },
      {
        onSuccess: () => {
          toast.success("Merchant digabungkan");
          onDone();
        },
        onError: (caught) => toastError(caught.message),
      },
    );
  }

  return (
    <ResponsiveSheet
      open={merchant !== null}
      onOpenChange={onOpenChange}
      title={`Gabungkan ${merchant?.name ?? "merchant"}`}
      description="Semua transaksinya pindah ke merchant tujuan, dan namanya jadi alias — catatan berikutnya dengan nama itu langsung masuk ke tujuan."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={merge.isPending || intoId === ""}>
            Gabungkan
          </Button>
        </>
      }
    >
      <FormField
        label="Gabungkan ke"
        htmlFor="merchant-merge-target"
        hint={targets.length === 0 ? "belum ada merchant lain" : undefined}
      >
        <Select value={intoId} onValueChange={setIntoId} disabled={targets.length === 0}>
          <SelectTrigger id="merchant-merge-target" className="w-full">
            <SelectValue placeholder="Pilih merchant tujuan" />
          </SelectTrigger>
          <SelectContent>
            {targets.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    </ResponsiveSheet>
  );
}
