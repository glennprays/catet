import { formatIDR, formatSignedIDR } from "@/lib/money";
import { cn } from "@/lib/utils";

type Tone = "auto" | "neutral" | "safe" | "warn" | "over" | "muted";

const SIZE_CLASS = {
  xl: "text-[28px] leading-[1.05] tracking-[-0.01em] sm:text-[32px] lg:text-[40px]",
  lg: "text-[20px] leading-[1.2]",
  md: "text-[15px]",
  sm: "text-[13px]",
} as const;

const TONE_CLASS = {
  neutral: "text-ink",
  safe: "text-safe-text",
  warn: "text-warn-text",
  over: "text-over-text",
  muted: "text-muted-foreground",
} as const;

/**
 * Every rupiah figure on screen. Tone `auto` reads the sign: money out
 * is ink, money in is teal, zero is muted — colour carries meaning, not
 * decoration (DESIGN.md §2).
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
      {signed ? formatSignedIDR(minor) : formatIDR(minor)}
    </span>
  );
}
