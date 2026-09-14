"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Generic list row: 48px touch target, hairline separator, optional
 * indent for trees. When `onClick` is given the title area becomes a
 * real button so keyboard users reach it (WCAG 2.1.1); trailing
 * controls stay separately focusable.
 */
export function ListRow({
  leading,
  title,
  caption,
  trailing,
  actions,
  indent = 0,
  onClick,
  flash = false,
  className,
}: {
  leading?: ReactNode;
  title: ReactNode;
  caption?: ReactNode;
  trailing?: ReactNode;
  actions?: ReactNode;
  indent?: number;
  onClick?: () => void;
  flash?: boolean;
  className?: string;
}) {
  const body = (
    <>
      <span className="block truncate text-[13px] text-ink">{title}</span>
      {caption !== undefined ? (
        <span className="block truncate text-xs text-muted-foreground">{caption}</span>
      ) : null}
    </>
  );

  return (
    <div
      className={cn(
        "flex min-h-12 items-center gap-3 border-b border-border pr-1",
        flash && "catet-flash",
        className,
      )}
      style={{ paddingLeft: 12 + indent * 20 }}
    >
      {leading !== undefined ? <span className="shrink-0">{leading}</span> : null}
      {onClick === undefined ? (
        <span className="min-w-0 flex-1 leading-tight">{body}</span>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="min-w-0 flex-1 rounded-sm py-1 text-left leading-tight focus-visible:ring-[3px] focus-visible:ring-safe-wash focus-visible:outline-none"
        >
          {body}
        </button>
      )}
      {trailing !== undefined ? <span className="shrink-0">{trailing}</span> : null}
      {actions}
    </div>
  );
}
