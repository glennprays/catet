"use client";

import { useFormatIDR } from "@/components/privacy-provider";
import { cn } from "@/lib/utils";

type Tone = "auto" | "neutral" | "safe" | "warn" | "over" | "muted" | "inherit";

const SIZE_CLASS = {
  xl: "text-hero",
  lg: "text-figure-lg",
  md: "text-figure-md",
  sm: "text-body leading-tight",
  xs: "text-meta leading-tight",
} as const;

const TONE_CLASS = {
  neutral: "text-ink",
  safe: "text-safe-text",
  warn: "text-warn-text",
  over: "text-over-text",
  muted: "text-muted-foreground",
  // `inherit` applies no colour at all: the figure takes its parent's colour,
  // which is how white figures ride a solid hue card (DESIGN.md §4 Source Card).
  inherit: "",
} as const;

/**
 * Every rupiah figure on screen. Tone `auto` reads the sign: money out
 * is ink, money in is teal, zero is muted — colour carries meaning, not
 * decoration (DESIGN.md §2). Privacy mode swaps the digits for `Rp••••••`
 * and keeps everything else — size, weight and tone still say what kind of
 * figure this is (DESIGN.md §4 Privacy mode).
 */
export function MoneyText({
  minor,
  signed = false,
  size = "md",
  tone = "auto",
  strike = false,
  className,
}: {
  minor: number;
  signed?: boolean;
  size?: keyof typeof SIZE_CLASS;
  tone?: Tone;
  strike?: boolean;
  className?: string;
}) {
  const format = useFormatIDR();
  const resolved =
    tone !== "auto" ? tone : minor > 0 ? "safe" : minor === 0 ? "muted" : "neutral";
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        SIZE_CLASS[size],
        TONE_CLASS[resolved],
        strike && "line-through",
        className,
      )}
    >
      {format(minor, signed)}
    </span>
  );
}
