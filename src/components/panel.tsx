import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Panel: the one boxed surface (DESIGN.md §4). `compact` (12px) for
 * lists, `comfortable` (16px) for forms and settings.
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
  density?: "compact" | "comfortable";
  className?: string;
  children: ReactNode;
}) {
  const hasHeader = title !== undefined || action !== undefined;
  return (
    <section
      className={cn(
        "rounded-md border border-border bg-surface",
        density === "compact" ? "p-3" : "p-4",
        className,
      )}
    >
      {hasHeader ? (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            {title !== undefined ? (
              <h2 className="text-[15px] font-medium text-ink">{title}</h2>
            ) : null}
            {caption !== undefined ? (
              <p className="text-xs text-muted-foreground">{caption}</p>
            ) : null}
          </div>
          {action !== undefined ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
