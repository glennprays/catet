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

import { IconTile } from "@/components/icon-tile";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { useBadges } from "@/lib/api/hooks";

const LINKS: { href: string; label: string; icon: LucideIcon; badge?: "bills" }[] = [
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/sources", label: "Sources", icon: Wallet },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/bills", label: "Bills & Calendar", icon: CalendarClock, badge: "bills" },
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
  const billsOverdue = useBadges().data?.bills_overdue ?? 0;

  return (
    <ResponsiveSheet open={open} onOpenChange={onOpenChange} title="Lainnya">
      <nav aria-label="Navigasi tambahan">
        <ul>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => onOpenChange(false)}
                className="flex h-11 items-center gap-3 border-b border-border text-body font-medium text-ink last:border-b-0"
              >
                <IconTile size="sm" icon={link.icon} />
                <span className="flex-1">{link.label}</span>
                {link.badge === "bills" && billsOverdue > 0 ? (
                  <span className="min-w-5 rounded-full bg-over-wash px-1.5 text-center text-label font-medium tabular-nums text-over-text">
                    {billsOverdue}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </ResponsiveSheet>
  );
}
