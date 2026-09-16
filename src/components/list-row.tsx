"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Generic list row: 44px touch target below lg, 36px at lg+, hairline
 * separator, optional indent for trees. When `onClick` is given the
 * title area becomes a real button so keyboard users reach it (WCAG
 * 2.1.1); trailing controls stay separately focusable.
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
      <span className="block truncate text-body font-medium text-ink">{title}</span>
      {caption !== undefined ? (
        <span className="block truncate text-meta text-ash">{caption}</span>
      ) : null}
    </>
  );

  return (
    <div
      className={cn(
        "flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 border-b border-border py-1 pr-4 last:border-b-0 lg:min-h-9",
        flash && "catet-flash",
        className,
      )}
      style={{ paddingLeft: 16 + indent * 20 }}
    >
      {leading !== undefined ? <span className="shrink-0">{leading}</span> : null}
      {onClick === undefined ? (
        <span className="min-w-0 flex-1 basis-40 leading-tight">{body}</span>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="min-w-0 flex-1 basis-40 rounded-md py-1 text-left leading-tight focus-visible:ring-[4px] focus-visible:ring-primary/10 focus-visible:outline-none"
        >
          {body}
        </button>
      )}
      {trailing !== undefined ? <span className="shrink-0">{trailing}</span> : null}
      {actions}
    </div>
  );
}
