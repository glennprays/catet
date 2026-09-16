import type { Source } from "@/lib/api/hooks";

/**
 * The eight identity hues (DESIGN.md §2 "Hue palette"). A hue says *which*
 * account or category a thing is; status stays with safe/warn/over.
 */
export const HUES = ["blue", "indigo", "violet", "teal", "green", "amber", "rose", "sky"] as const;

export type Hue = (typeof HUES)[number];

/**
 * djb2 over the uuid, so a source or category keeps its colour across list
 * order, refetches and reloads without the backend owning a colour field.
 */
export function hueFor(id: string): Hue {
  let hash = 5381;
  for (let index = 0; index < id.length; index += 1) {
    hash = ((hash << 5) + hash + id.charCodeAt(index)) | 0;
  }
  return HUES[Math.abs(hash) % HUES.length];
}

/** Debt sources are always the ink card — a liability is not an identity colour. */
export function sourceHue(source: Pick<Source, "id" | "is_debt">): Hue | "ink" {
  return source.is_debt ? "ink" : hueFor(source.id);
}
