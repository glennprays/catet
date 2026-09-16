import { createElement } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const TONE_CLASS = {
  neutral: "bg-surface-200 text-ink-soft",
  safe: "bg-safe-wash text-safe-text",
  warn: "bg-warn-wash text-warn-text",
  over: "bg-over-wash text-over-text",
  primary: "bg-primary-wash text-primary",
  // DESIGN.md §2 "Hue palette" — identity tones: pastel wash + saturated
  // glyph. Classes stay literal so Tailwind can see them.
  blue: "bg-hue-blue-wash text-hue-blue",
  indigo: "bg-hue-indigo-wash text-hue-indigo",
  violet: "bg-hue-violet-wash text-hue-violet",
  teal: "bg-hue-teal-wash text-hue-teal",
  green: "bg-hue-green-wash text-hue-green",
  amber: "bg-hue-amber-wash text-hue-amber",
  rose: "bg-hue-rose-wash text-hue-rose",
  sky: "bg-hue-sky-wash text-hue-sky",
  ink: "bg-hue-ink text-white",
} as const;

export type IconTone = keyof typeof TONE_CLASS;

const SIZE_CLASS = {
  sm: "size-6",
  md: "size-8",
} as const;

const GLYPH_CLASS = {
  sm: "size-3.5",
  md: "size-4",
} as const;

/**
 * Leading glyph tile (DESIGN.md §4). A tinted square carries the row's
 * kind without spending a colour on the row itself; the tone is the
 * only place a status colour appears on an otherwise neutral list.
 */
export function IconTile({
  icon,
  tone = "neutral",
  size = "sm",
  className,
}: {
  icon: LucideIcon;
  tone?: IconTone;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md",
        SIZE_CLASS[size],
        TONE_CLASS[tone],
        className,
      )}
    >
      {createElement(icon, {
        className: GLYPH_CLASS[size],
        strokeWidth: 1.75,
        "aria-hidden": true,
      })}
    </span>
  );
}
