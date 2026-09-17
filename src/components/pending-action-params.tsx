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
  original_text: "Pesan",
  message_id: "ID pesan",
  missing: "Belum ada",
  reverses_transaction_id: "Membalik",
  external_id: "ID eksternal",
  category_source: "Sumber kategori",
  category_confidence: "Keyakinan",
  document_type: "Jenis dokumen",
  total_minor: "Total",
  items: "Rincian",
  receipt_date: "Tanggal struk",
  payment_method: "Pembayaran",
  content_hash: "Sidik jari",
  duplicate_of: "Mungkin duplikat dari",
  inconsistent: "Rincian tidak konsisten",
  // `payment_method` is already "Pembayaran" (what the paper printed);
  // a split says which Sources actually paid it.
  payments: "Dibayar dari",
  source_basis: "Dasar sumber",
};

const TYPE_LABELS: Record<string, string> = {
  expense: "Keluar",
  income: "Masuk",
  transfer: "Pindah",
  adjustment: "Koreksi",
};

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  receipt: "Struk",
  payment_screenshot: "Bukti bayar",
};

/**
 * How the bot decided which Source paid. Showing the basis is what makes
 * a remembered guess distinguishable from a fact printed on the paper.
 */
export const SOURCE_BASIS_LABELS: Record<string, string> = {
  printed: "Tertulis di struk",
  hint: "Caption",
  memory: "Kebiasaan merchant",
  default: "Default struk",
  guess: "Tebakan",
  user: "Dipilih kamu",
};

/** Addressing details the bot needs and the user does not. */
const HIDDEN_KEYS = new Set(["chat", "from"]);

/** How many receipt lines the confirm dialog shows before it summarises. */
const MAX_ITEM_ROWS = 12;

/** One parked receipt line, as the bot stored it. */
type ReceiptItemRow = {
  n?: number;
  name?: string;
  qty?: number;
  amount_minor?: number;
  category_name?: string;
  source_name?: string;
  part?: string;
};

/** One share of a bill split across several Sources. */
type ReceiptPaymentRow = {
  source_name?: string;
  amount_minor?: number;
};

/** The gap names the bot uses in `missing`; the Inbox badges them too. */
export const FIELD_LABELS: Record<string, string> = {
  amount: "Nominal",
  source: "Sumber",
  destination: "Tujuan",
  category: "Kategori",
};

/**
 * Bot-proposed writes are confirmed off this, so it must be readable:
 * a labelled two-column list, never a raw JSON blob.
 */
export function PendingActionParams({ params }: { params: Record<string, unknown> }) {
  // A raw uuid tells the user nothing; drop it whenever the bot also
  // stored the resolved name.
  const entries = Object.entries(params).filter(
    ([key]) =>
      !HIDDEN_KEYS.has(key) &&
      !(key.endsWith("_id") && typeof params[`${key.slice(0, -3)}_name`] === "string"),
  );
  if (entries.length === 0) {
    return <p className="text-meta text-muted-foreground">Tidak ada parameter.</p>;
  }

  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-0.5 text-meta">
      {entries.map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="text-muted-foreground">{LABELS[key] ?? key}</dt>
          <dd className={key === "items" ? "min-w-0 text-ink" : "min-w-0 truncate text-ink"}>
            {renderValue(key, value, params)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function renderValue(key: string, value: unknown, params: Record<string, unknown>) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>;
  }
  if ((key === "amount_minor" || key === "total_minor") && typeof value === "number") {
    // Bot params carry an unsigned amount; the direction decides the
    // sign, and confirming money must show the sign it will write.
    const outgoing = params.type === "expense" || params.type === "transfer";
    return <MoneyText minor={outgoing ? -Math.abs(value) : value} signed size="sm" />;
  }
  if (
    (key === "occurred_at" || key === "occurred_date" || key === "receipt_date") &&
    typeof value === "string"
  ) {
    return shortDateLabel(key === "occurred_at" ? value : `${value}T00:00:00+07:00`);
  }
  if (key === "document_type" && typeof value === "string") {
    return DOCUMENT_TYPE_LABELS[value] ?? value;
  }
  if (key === "source_basis" && typeof value === "string") {
    return SOURCE_BASIS_LABELS[value] ?? value;
  }
  // A split bill: who paid which share. The dashboard shows a split but
  // cannot enter one — that conversation happens in chat.
  if (key === "payments" && Array.isArray(value)) {
    const payments = value as ReceiptPaymentRow[];
    return (
      <span className="flex flex-wrap items-baseline gap-x-1.5">
        {payments.map((payment, index) => (
          <span key={`${payment.source_name ?? index}`} className="whitespace-nowrap">
            {index > 0 ? "\u00b7 " : ""}
            {payment.source_name ?? "—"}{" "}
            <MoneyText minor={-Math.abs(payment.amount_minor ?? 0)} signed size="sm" />
          </span>
        ))}
      </span>
    );
  }
  if (typeof value === "boolean") {
    return value ? "Ya" : <span className="text-muted-foreground">—</span>;
  }
  // A receipt's lines are the thing being confirmed: show them, priced,
  // one per row.
  if (key === "items" && Array.isArray(value)) {
    const items = value as ReceiptItemRow[];
    const shown = items.slice(0, MAX_ITEM_ROWS);
    return (
      <ul className="grid gap-0.5">
        {shown.map((item, index) => (
          <li key={`${item.n ?? index}${item.part ?? ""}`} className="flex justify-between gap-3">
            <span className="truncate">
              {`${item.n ?? index + 1}${item.part ?? ""}. ${item.name ?? "—"}`}
              {typeof item.qty === "number" && item.qty > 1 ? ` \u00d7${item.qty}` : ""}
              {item.category_name ? ` \u00b7 ${item.category_name}` : ""}
              {item.source_name ? ` \u00b7 ${item.source_name}` : ""}
            </span>
            <MoneyText minor={-Math.abs(item.amount_minor ?? 0)} signed size="sm" />
          </li>
        ))}
        {items.length > shown.length ? (
          <li className="text-muted-foreground">{`…dan ${items.length - shown.length} lainnya`}</li>
        ) : null}
      </ul>
    );
  }
  if (key === "type" && typeof value === "string") {
    return TYPE_LABELS[value] ?? value;
  }
  if (Array.isArray(value)) {
    // `missing` names the fields the bot refused to guess.
    return value.map((entry) => FIELD_LABELS[String(entry)] ?? String(entry)).join(", ");
  }
  return String(value);
}
