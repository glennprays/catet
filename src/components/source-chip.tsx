import { createElement } from "react";

import { Chip } from "@/components/chip";
import { sourceGlyph } from "@/lib/source-glyph";
import type { Source } from "@/lib/api/hooks";

/** Source pill with its type glyph, when the type is known. */
export function SourceChip({ name, type }: { name: string; type?: Source["type"] }) {
  return (
    <Chip
      glyph={
        type === undefined
          ? undefined
          : createElement(sourceGlyph(type), {
              className: "size-3.5 shrink-0 text-ash",
              strokeWidth: 1.75,
            })
      }
    >
      {name}
    </Chip>
  );
}
