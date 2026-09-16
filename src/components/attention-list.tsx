import Link from "next/link";
import { AlertCircle, AlertTriangle, ChevronRight, Info, type LucideIcon } from "lucide-react";

import { IconTile } from "@/components/icon-tile";

export type AttentionItem = {
  label: string;
  href: string;
  tone: "warn" | "over" | "neutral";
};

const ICON: Record<AttentionItem["tone"], LucideIcon> = {
  over: AlertCircle,
  warn: AlertTriangle,
  neutral: Info,
};

/**
 * "What needs me" on the Overview: the only list on the screen allowed
 * to demand action, ordered by risk. Empty is a sentence, not an empty
 * box. The card around it belongs to the caller.
 */
export function AttentionList({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return <p className="px-4 py-3 text-meta text-ash">Semua beres — tidak ada yang perlu ditindak.</p>;
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item.href + item.label}>
          <Link
            href={item.href}
            className="flex min-h-11 items-center gap-2.5 px-4 hover:bg-surface-100 sm:h-9 sm:min-h-0"
          >
            <IconTile size="sm" tone={item.tone} icon={ICON[item.tone]} />
            <span className="flex-1 truncate text-body text-ink">{item.label}</span>
            <ChevronRight className="size-3.5 shrink-0 text-ash" strokeWidth={1.75} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
