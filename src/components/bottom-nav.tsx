"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutDashboard, MoreHorizontal, Plus, ReceiptText } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ReceiptText },
  { href: "add", label: "Tambah", icon: Plus },
  { href: "/analytics", label: "Analitik", icon: BarChart3 },
  { href: "/settings", label: "Lainnya", icon: MoreHorizontal },
];

/** Mobile bottom navigation with the center Add FAB (DESIGN.md §8). */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-border bg-canvas/95 pb-[env(safe-area-inset-bottom)] lg:hidden">
      {ITEMS.map((item) => {
        if (item.href === "add") {
          return (
            <Link
              key="add"
              href="/transactions?add=1"
              aria-label="Tambah transaksi"
              className="flex flex-1 items-center justify-center"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-ink text-canvas">
                <item.icon className="size-5" strokeWidth={2} />
              </span>
            </Link>
          );
        }
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-xs ${
              active ? "text-ink" : "text-muted-foreground"
            }`}
          >
            <item.icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
