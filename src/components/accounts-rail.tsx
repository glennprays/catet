"use client";

import { createElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { sourceGlyph } from "@/lib/source-glyph";
import { formatIDR } from "@/lib/money";
import type { Source } from "@/lib/api/hooks";
import type { BadgeCounts } from "@/lib/api/hooks";

const MANAGE_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/transactions", label: "Transactions" },
  { href: "/categories", label: "Categories" },
  { href: "/bills", label: "Bills & Calendar" },
  { href: "/budgets", label: "Budgets" },
  { href: "/analytics", label: "Analytics" },
  { href: "/needs-review", label: "Needs-Review", badge: "needs_review" as const },
  { href: "/hold-queue", label: "Hold Queue", badge: "hold_queue" as const },
  { href: "/settings", label: "Settings" },
];

export function AccountsRail({
  sources,
  totalAvailableMinor,
  totalDebtMinor,
  badges,
}: {
  sources: Source[];
  totalAvailableMinor: number;
  totalDebtMinor: number;
  badges: BadgeCounts;
}) {
  const pathname = usePathname();
  const assets = sources.filter((source) => !source.is_debt);
  const debts = sources.filter((source) => source.is_debt);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col overflow-y-auto border-r border-border bg-canvas px-4 py-5 lg:flex">
      <p className="px-2 text-[20px] font-medium leading-[1.2] tracking-[-0.01em]">catet</p>

      <GroupLabel>Aset</GroupLabel>
      <ul className="grid gap-0.5">
        {assets.map((source) => (
          <li key={source.id} className="flex h-8 items-center gap-2 rounded-sm px-2">
            <SourceGlyphIcon type={source.type} />
            <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{source.name}</span>
            <span className="text-[13px] font-medium tabular-nums text-ink">
              {formatIDR(source.balance_minor)}
            </span>
          </li>
        ))}
        {assets.length === 0 ? (
          <li className="px-2 text-xs text-muted-foreground">Belum ada aset</li>
        ) : null}
      </ul>

      {debts.length > 0 ? (
        <>
          <GroupLabel>Utang</GroupLabel>
          <ul className="grid gap-0.5">
            {debts.map((source) => (
              <li key={source.id} className="flex h-8 items-center gap-2 rounded-sm px-2">
                <SourceGlyphIcon type={source.type} />
                <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{source.name}</span>
                <span className="text-[13px] font-medium tabular-nums text-over-text">
                  {formatIDR(source.balance_minor)}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <div className="mt-3 border-t border-border px-2 pt-3 text-[13px]">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total tersedia</span>
          <span className="font-medium tabular-nums text-ink">{formatIDR(totalAvailableMinor)}</span>
        </div>
        {totalDebtMinor > 0 ? (
          <div className="mt-1 flex items-center justify-between">
            <span className="text-muted-foreground">Utang</span>
            <span className="font-medium tabular-nums text-over-text">−{formatIDR(totalDebtMinor)}</span>
          </div>
        ) : null}
      </div>

      <GroupLabel>Kelola</GroupLabel>
      <nav className="grid gap-0.5">
        {MANAGE_LINKS.map((link) => {
          const active = pathname === link.href;
          const count = link.badge ? badges[link.badge] : 0;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex h-8 items-center justify-between rounded-sm px-2 text-[13px] ${
                active
                  ? "border border-border bg-surface text-ink"
                  : "text-ink-soft hover:bg-surface-100"
              }`}
            >
              <span>{link.label}</span>
              {count > 0 ? (
                <Badge variant="over" className="h-5 min-w-5 justify-center px-1.5 tabular-nums">
                  {count}
                </Badge>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 mt-5 px-2 text-[11px] font-medium uppercase leading-[1.3] tracking-[0.05em] text-muted-foreground">
      {children}
    </p>
  );
}

function SourceGlyphIcon({ type }: { type: string }) {
  // createElement avoids the dynamic-component JSX pattern lint flags.
  return createElement(sourceGlyph(type), {
    className: "size-3.5 shrink-0 text-ash",
    strokeWidth: 1.75,
  });
}
