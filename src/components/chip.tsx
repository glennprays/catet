import type { ReactNode } from "react";

/**
 * Category/source chip: pill, surface-200 fill, ink-soft text, 12px,
 * 3px 10px padding (DESIGN.md §4). Source chips pass a leading glyph.
 */
export function Chip({ children, glyph }: { children: ReactNode; glyph?: ReactNode }) {
  return (
    <span className="inline-flex max-w-36 items-center gap-1 rounded-full bg-surface-200 px-2.5 py-[3px] text-xs text-ink-soft">
      {glyph}
      <span className="truncate">{children}</span>
    </span>
  );
}
