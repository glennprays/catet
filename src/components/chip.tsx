import type { ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Category/source chip: 6px radius, surface-200 fill, ink-soft text,
 * 12px (DESIGN.md §4). Source chips pass a leading glyph.
 *
 * `onRemove` turns it into an applied-filter chip: the trailing X is a
 * real 28px button (44px reach through the hit-area expander), so the
 * chip grows to hold it instead of hiding a tap target in decoration.
 */
export function Chip({
  children,
  glyph,
  onRemove,
  removeLabel,
}: {
  children: ReactNode;
  glyph?: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-36 items-center gap-1 rounded-sm bg-surface-200 px-2 py-0.5 text-meta text-ink-soft",
        onRemove !== undefined && "max-w-48 pr-0.5",
      )}
    >
      {glyph}
      <span className="truncate">{children}</span>
      {onRemove !== undefined ? (
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-ash hover:bg-surface-300 hover:text-ink"
          aria-label={removeLabel}
          onClick={onRemove}
        >
          <X strokeWidth={1.75} />
        </Button>
      ) : null}
    </span>
  );
}
