import { MoneyText } from "@/components/money-text";
import { shortDateLabel } from "@/lib/time";

const LABELS: Record<string, string> = {
  amount_minor: "Nominal",
  source: "Sumber",
  source_name: "Sumber",
  source_id: "Sumber",
  destination: "Tujuan",
  destination_source_name: "Tujuan",
  destination_source_id: "Tujuan",
  category: "Kategori",
  category_name: "Kategori",
  category_id: "Kategori",
  merchant: "Merchant",
  note: "Catatan",
  occurred_at: "Tanggal",
  occurred_date: "Tanggal",
  type: "Jenis",
};

const TYPE_LABELS: Record<string, string> = {
  expense: "Keluar",
  income: "Masuk",
  transfer: "Pindah",
  adjustment: "Koreksi",
};

/**
 * Bot-proposed writes are confirmed off this, so it must be readable:
 * a labelled two-column list, never a raw JSON blob.
 */
export function PendingActionParams({ params }: { params: Record<string, unknown> }) {
  const entries = Object.entries(params);
  if (entries.length === 0) {
    return <p className="text-xs text-muted-foreground">Tidak ada parameter.</p>;
  }

  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 text-[13px]">
      {entries.map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="text-muted-foreground">{LABELS[key] ?? key}</dt>
          <dd className="min-w-0 truncate text-ink">{renderValue(key, value, params)}</dd>
        </div>
      ))}
    </dl>
  );
}

function renderValue(key: string, value: unknown, params: Record<string, unknown>) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }
  if (key === "amount_minor" && typeof value === "number") {
    // Bot params carry an unsigned amount; the direction decides the
    // sign, and confirming money must show the sign it will write.
    const outgoing = params.type === "expense" || params.type === "transfer";
    return <MoneyText minor={outgoing ? -Math.abs(value) : value} signed size="sm" />;
  }
  if ((key === "occurred_at" || key === "occurred_date") && typeof value === "string") {
    return shortDateLabel(key === "occurred_date" ? `${value}T00:00:00+07:00` : value);
  }
  if (key === "type" && typeof value === "string") {
    return TYPE_LABELS[value] ?? value;
  }
  return String(value);
}
