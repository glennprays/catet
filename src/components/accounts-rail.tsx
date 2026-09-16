"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarClock,
  Inbox,
  LayoutDashboard,
  PiggyBank,
  ReceiptText,
  Settings,
  Tags,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { Brand } from "@/components/brand";
import { GroupLabel } from "@/components/group-label";
import { IconTile } from "@/components/icon-tile";
import { MoneyText } from "@/components/money-text";
import { Well } from "@/components/well";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { sourceGlyph } from "@/lib/source-glyph";
import { sourceHue } from "@/lib/hue";
import { useBadges, useSources, type Source, type SourcesData } from "@/lib/api/hooks";

type NavLink = { href: string; label: string; icon: LucideIcon; badge?: "inbox" | "bills" };

const NAV: NavLink[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ReceiptText },
  { href: "/inbox", label: "Inbox", icon: Inbox, badge: "inbox" },
  { href: "/sources", label: "Sources", icon: Wallet },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/bills", label: "Bills & Calendar", icon: CalendarClock, badge: "bills" },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const FOOTER_NAV: NavLink[] = [{ href: "/settings", label: "Settings", icon: Settings }];

/**
 * The rail is navigation first, balances second: the nine-link "Kelola"
 * block used to sit below the money, so the primary control of the app
 * was the last thing on the page. Balances live in the client cache
 * seeded by the server render, so bot writes and local mutations both
 * refresh them. A failed fetch says so instead of rendering Rp0, which
 * would read as "you are broke" (truthfulness law, DESIGN.md §4).
 */
export function AccountsRail({ initialSources }: { initialSources: SourcesData | undefined }) {
  const pathname = usePathname();
  const query = useSources(false, initialSources);
  const badges = useBadges().data;
  const data = query.data;
  const assets = data?.sources.filter((source) => !source.is_debt) ?? [];
  const debts = data?.sources.filter((source) => source.is_debt) ?? [];
  const inboxCount = badges === undefined ? 0 : badges.needs_review + badges.hold_queue;
  // An overdue bill is money already owed: it earns the same pill as an
  // unreviewed capture, on its own screen.
  const billsCount = badges?.bills_overdue ?? 0;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col overflow-y-auto border-r border-border bg-surface px-2 py-3 lg:flex">
      <div className="flex h-8 items-center px-2">
        <Link
          href="/"
          aria-label="catet — Overview"
          className="rounded-[6px] focus-visible:ring-[4px] focus-visible:ring-primary/10 focus-visible:outline-none"
        >
          <Brand />
        </Link>
      </div>

      <nav aria-label="Navigasi utama" className="mt-3 grid gap-0.5">
        {NAV.map((link) => (
          <NavRow
            key={link.href}
            link={link}
            active={pathname === link.href}
            count={link.badge === "inbox" ? inboxCount : link.badge === "bills" ? billsCount : 0}
          />
        ))}
      </nav>

      <div className="mt-4">
        <div className="flex items-center justify-between px-2">
          <GroupLabel className="px-0 pt-0 pb-0">Akun</GroupLabel>
          <Link
            href="/sources"
            className="text-label font-medium text-primary hover:underline"
          >
            Kelola
          </Link>
        </div>

        {data === undefined ? (
          query.isError ? (
            <div className="mt-1 grid gap-1.5">
              <p role="alert" className="rounded-[6px] bg-over-wash px-2 py-1.5 text-meta text-over-text">
                Saldo tidak bisa dimuat.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="justify-self-start"
                onClick={() => query.refetch()}
              >
                Muat ulang
              </Button>
            </div>
          ) : (
            <div className="mt-1 grid gap-0.5 px-1">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-7 w-full rounded-[6px]" />
              ))}
            </div>
          )
        ) : (
          <Well className="mt-1 p-2">
            <div className="flex items-baseline justify-between px-1">
              <span className="text-meta text-ash">Bersih</span>
              <MoneyText
                minor={data.total_available_minor - data.total_debt_minor}
                size="lg"
                tone="neutral"
                className="font-semibold"
              />
            </div>

            <ul className="mt-2 grid gap-0.5">
              {assets.map((source) => (
                <AccountMini key={source.id} source={source} />
              ))}
              {assets.length === 0 ? (
                <li className="px-1 text-meta text-ash">Belum ada aset</li>
              ) : null}
              {debts.length === 0 ? null : (
                <>
                  <li className="px-1 pt-1 text-[10px] font-medium uppercase tracking-[0.06em] text-ash">
                    Utang
                  </li>
                  {debts.map((source) => (
                    <AccountMini key={source.id} source={source} />
                  ))}
                </>
              )}
            </ul>
          </Well>
        )}
      </div>

      <div className="mt-auto grid gap-0.5 pt-3">
        {FOOTER_NAV.map((link) => (
          <NavRow key={link.href} link={link} active={pathname === link.href} count={0} />
        ))}
      </div>
    </aside>
  );
}

function NavRow({ link, active, count }: { link: NavLink; active: boolean; count: number }) {
  return (
    <Link
      href={link.href}
      aria-current={active ? "page" : undefined}
      className={`flex h-8 items-center gap-2.5 rounded-[6px] px-2 text-body font-medium ${
        active
          ? "bg-primary-wash text-primary [&_svg]:text-primary"
          : "text-ink-soft hover:bg-surface-100"
      }`}
    >
      <link.icon className="size-4 shrink-0 text-ash" strokeWidth={1.75} />
      <span className="min-w-0 flex-1 truncate">{link.label}</span>
      {count > 0 ? (
        <span className="rounded-full bg-over-wash px-1.5 text-label font-medium tabular-nums text-over-text">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

function AccountMini({ source }: { source: Source }) {
  return (
    <li>
      <Link
        href="/sources"
        className="flex h-8 items-center gap-2 rounded-[6px] px-1 hover:bg-surface-200"
      >
        <IconTile size="sm" tone={sourceHue(source)} icon={sourceGlyph(source.type)} />
        <span className="min-w-0 flex-1 truncate text-meta text-ink-soft">{source.name}</span>
        <MoneyText
          minor={source.balance_minor}
          size="xs"
          tone={source.is_debt ? "over" : "neutral"}
        />
      </Link>
    </li>
  );
}
