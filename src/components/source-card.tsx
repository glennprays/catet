import { createElement, type ReactNode } from "react";
import Link from "next/link";

import { MoneyText } from "@/components/money-text";
import { sourceHue, type Hue } from "@/lib/hue";
import { sourceGlyph, SOURCE_TYPE_LABEL } from "@/lib/source-glyph";
import type { Source } from "@/lib/api/hooks";
import { cn } from "@/lib/utils";

/**
 * Solid-hue background per identity (DESIGN.md §2 "Hue palette"). Written out
 * so Tailwind sees every class literally — a template string would compile to
 * nothing.
 */
const CARD_BG: Record<Hue | "ink", string> = {
  blue: "bg-hue-blue",
  indigo: "bg-hue-indigo",
  violet: "bg-hue-violet",
  teal: "bg-hue-teal",
  green: "bg-hue-green",
  amber: "bg-hue-amber",
  rose: "bg-hue-rose",
  sky: "bg-hue-sky",
  ink: "bg-hue-ink",
};

/**
 * One account as a wallet card (DESIGN.md §4 "Source Card"). `row` is the
 * 56px card in Overview's Akun module, `tile` the 112px card on Sources.
 *
 * `share` is caller-computed so the card never guesses which total it belongs
 * to — assets divide by assets, debts by debts, so a paylater balance never
 * claims a share of cash. The balance rides the card in white (`tone="inherit"`);
 * status colour would fight the identity hue, and the hue already says "debt"
 * by being ink.
 *
 * `onSelect` makes the whole card the primary tap target (Sources opens
 * "Ubah"); the `⋯` menu stops propagation so it never triggers it.
 */
export function SourceCard({
  source,
  share,
  size = "row",
  href,
  trailing,
  onSelect,
}: {
  source: Source;
  share: number;
  size?: "row" | "tile";
  href?: string;
  trailing?: ReactNode;
  onSelect?: () => void;
}) {
  const tile = size === "tile";
  const clamped = Number.isFinite(share) ? Math.min(Math.max(share, 0), 1) : 0;

  const glyph = createElement(sourceGlyph(source.type), {
    className: "size-4 shrink-0 text-white/80",
    strokeWidth: 1.75,
    "aria-hidden": true,
  });

  const identity = (
    <span className="min-w-0 flex-1">
      <span className={cn("block truncate font-semibold", tile ? "text-figure-md" : "text-body")}>
        {source.name}
      </span>
      {/* white/90 is the quietest legal step: at 70% the label is 3.5:1 on
          --hue-green, which §2's text law forbids. */}
      <span className="block text-label leading-tight text-white/90">
        {SOURCE_TYPE_LABEL[source.type]}
      </span>
    </span>
  );

  const balance = (
    <MoneyText
      minor={source.balance_minor}
      size={tile ? "lg" : "md"}
      tone="inherit"
      className="font-semibold"
    />
  );

  const menu =
    trailing === undefined ? null : (
      <span
        className="-mt-1 -mr-1 shrink-0 text-white"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {trailing}
      </span>
    );

  const bar = (
    <span
      aria-hidden
      className={cn(
        "block w-full overflow-hidden rounded-full bg-white/25",
        tile ? "mt-2 h-[3px]" : "mt-1.5 h-[2px]",
      )}
    >
      <span
        className="block h-full rounded-full bg-white"
        style={{ width: `${Math.round(clamped * 100)}%` }}
      />
    </span>
  );

  // `row` is one 56px line — identity left, figure right, bar underneath.
  // `tile` is the 112px card: identity on top, figure pinned to the bottom.
  const body = tile ? (
    <>
      <div className="flex min-w-0 items-start gap-2">
        {glyph}
        {identity}
        {menu}
      </div>
      <span className="mt-auto block pt-2">{balance}</span>
      {bar}
    </>
  ) : (
    <>
      <div className="flex min-w-0 items-center gap-2">
        {glyph}
        {identity}
        {balance}
        {menu}
      </div>
      {bar}
    </>
  );

  const className = cn(
    "flex flex-col justify-center rounded-lg text-white shadow-card",
    CARD_BG[sourceHue(source)],
    tile ? "h-28 px-3.5 py-3" : "h-14 px-3 py-2",
  );
  const interactive =
    "transition-opacity hover:opacity-95 focus-visible:ring-[4px] focus-visible:ring-white/40 focus-visible:outline-none";

  if (href !== undefined) {
    return (
      <Link href={href} className={cn(className, interactive)}>
        {body}
      </Link>
    );
  }

  if (onSelect !== undefined) {
    return (
      <div
        role="button"
        tabIndex={0}
        className={cn(className, interactive, "cursor-pointer")}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect();
          }
        }}
      >
        {body}
      </div>
    );
  }

  return <div className={className}>{body}</div>;
}
