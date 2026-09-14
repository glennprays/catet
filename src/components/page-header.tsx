import type { ReactNode } from "react";

/**
 * PageHeader: the 56px sticky header with the screen title (DESIGN.md
 * §5 — sticky toolbar sits under it).
 */
export function PageHeader({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 -mx-4 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-canvas px-4 lg:-mx-6 lg:px-6">
      <h1 className="text-[20px] font-medium leading-[1.2] tracking-[-0.01em]">{title}</h1>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
