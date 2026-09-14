import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Panel } from "@/components/panel";

export type AttentionItem = {
  label: string;
  href: string;
  tone: "warn" | "over" | "neutral";
};

const DOT = {
  over: "bg-over",
  warn: "bg-warn",
  neutral: "bg-ash",
} as const;

/**
 * "What needs me" on the Overview: the only list on the screen that is
 * allowed to demand action, ordered by risk. Empty is a sentence, not
 * an empty box.
 */
export function AttentionStrip({ items }: { items: AttentionItem[] }) {
  return (
    <Panel density="compact">
      {items.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          Semua beres — tidak ada yang perlu ditindak.
        </p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.href + item.label}>
              <Link
                href={item.href}
                className="flex min-h-11 items-center gap-3 border-b border-border text-[13px] text-ink last:border-b-0"
              >
                <span aria-hidden className={`size-2 shrink-0 rounded-full ${DOT[item.tone]}`} />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <ChevronRight className="size-4 shrink-0 text-ash" strokeWidth={1.75} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
