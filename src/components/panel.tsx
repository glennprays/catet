import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Panel: the one boxed surface (DESIGN.md §4, §6) — white, `--shadow-card`,
 * 12px radius, no border. `compact` (12px) and `comfortable` (14px) pad
 * their own content; `list` pads nothing so rows run flush to the card edge
 * and the header becomes a 40px ruled bar. The caption rides the title's
 * baseline: a card header is one line, never two.
 *
 * The card is a container-query context, so a row can drop a column when
 * *this card* is narrow (Overview's 4-of-12 Anggaran) while keeping it on
 * a full-width one — viewport breakpoints cannot tell those apart.
 */
export function Panel({
  title,
  caption,
  action,
  density = "compact",
  className,
  children,
}: {
  title?: string;
  caption?: string;
  action?: ReactNode;
  density?: "compact" | "comfortable" | "list";
  className?: string;
  children: ReactNode;
}) {
  const hasHeader = title !== undefined || action !== undefined;
  const list = density === "list";
  return (
    <section
      className={cn(
        "@container rounded-lg bg-surface shadow-card",
        density === "compact" ? "p-3" : density === "comfortable" ? "p-3.5" : "p-0",
        className,
      )}
    >
      {hasHeader ? (
        <div
          className={cn(
            "flex items-center justify-between gap-3",
            list ? "h-10 border-b border-border px-4" : "mb-2",
          )}
        >
          {title === undefined ? (
            <span />
          ) : (
            <h2 className="min-w-0 truncate text-body font-semibold text-ink">
              {title}
              {caption !== undefined ? (
                <span className="ml-2 text-meta font-normal text-ash">{caption}</span>
              ) : null}
            </h2>
          )}
          {action !== undefined ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
