import type { ReactNode } from "react";

import { PrivacyToggle } from "@/components/privacy-toggle";

/**
 * PageHeader: a 48px sticky bar on the canvas, not a white slab
 * (DESIGN.md §5). The subtitle rides the title's baseline so chrome
 * stays one line tall and the biggest number on the page is the data,
 * never the header.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 -mx-4 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-canvas px-4 lg:-mx-5 lg:px-5">
      <h1 className="min-w-0 truncate text-title font-semibold text-ink">
        {title}
        {subtitle !== undefined ? (
          <span className="ml-2 hidden text-meta font-normal text-ash sm:inline">{subtitle}</span>
        ) : null}
      </h1>
      <div className="flex items-center gap-2">
        <PrivacyToggle />
        {actions}
      </div>
    </header>
  );
}
