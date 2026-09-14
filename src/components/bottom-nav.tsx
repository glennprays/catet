"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, LayoutDashboard, MoreHorizontal, Plus, ReceiptText } from "lucide-react";

import { useCaptureSheet } from "@/components/capture-sheet-provider";
import { MoreSheet } from "@/components/more-sheet";
import { useBadges } from "@/lib/api/hooks";

const ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ReceiptText },
  { href: "/inbox", label: "Inbox", icon: Inbox },
];

/** Mobile bottom navigation with the center Add FAB (DESIGN.md §8). */
export function BottomNav() {
  const pathname = usePathname();
  const { openCreate } = useCaptureSheet();
  const badges = useBadges().data;
  const [moreOpen, setMoreOpen] = useState(false);

  const pending =
    badges === undefined ? 0 : badges.needs_review + badges.hold_queue;

  return (
    <>
      <nav
        aria-label="Navigasi bawah"
        className="fixed inset-x-0 bottom-0 z-30 flex h-[calc(4rem+env(safe-area-inset-bottom))] items-stretch border-t border-border bg-canvas pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {ITEMS.slice(0, 2).map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}

        <button
          type="button"
          aria-label="Tambah transaksi"
          className="flex flex-1 items-center justify-center"
          onClick={() => openCreate()}
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-ink text-canvas">
            <Plus className="size-5" strokeWidth={2} />
          </span>
        </button>

        <NavLink
          item={ITEMS[2]}
          active={pathname === ITEMS[2].href}
          badge={pending > 0 ? pending : undefined}
        />

        <button
          type="button"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground"
          onClick={() => setMoreOpen(true)}
        >
          <MoreHorizontal className="size-5" strokeWidth={1.75} />
          More
        </button>
      </nav>

      <MoreSheet open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}

function NavLink({
  item,
  active,
  badge,
}: {
  item: (typeof ITEMS)[number];
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-xs ${
        active ? "text-ink" : "text-muted-foreground"
      }`}
    >
      <span className="relative">
        <item.icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
        {badge === undefined ? null : (
          <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-over px-1 text-[10px] font-medium tabular-nums text-sheet">
            {badge}
          </span>
        )}
      </span>
      {item.label}
    </Link>
  );
}
