"use client";

import Link from "next/link";
import {
  BarChart3,
  CalendarClock,
  PiggyBank,
  Settings,
  Tags,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { ResponsiveSheet } from "@/components/responsive-sheet";

const LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/sources", label: "Sources", icon: Wallet },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/bills", label: "Bills & Calendar", icon: CalendarClock },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** The six screens the bottom bar has no room for. */
export function MoreSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <ResponsiveSheet open={open} onOpenChange={onOpenChange} title="Lainnya">
      <nav aria-label="Navigasi tambahan">
        <ul>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => onOpenChange(false)}
                className="flex min-h-12 items-center gap-3 border-b border-border text-[15px] text-ink"
              >
                <link.icon className="size-4 text-ash" strokeWidth={1.75} />
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </ResponsiveSheet>
  );
}
