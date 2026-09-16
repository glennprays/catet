import { cn } from "@/lib/utils";

/**
 * The mark: an ink tile holding a stack of three offset cards — a wallet with
 * a bank card, an e-wallet and a paylater in it. Fills are literal because the
 * same markup is the favicon (`src/app/icon.svg`), which cannot read CSS
 * tokens: tile `--hue-ink`, amber and teal behind, `--primary` in front with
 * one white stripe (DESIGN.md §4 Brand).
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-6 shrink-0", className)}>
      <rect width="24" height="24" rx="6" fill="#111827" />
      <rect x="6" y="5" width="12" height="7.5" rx="2" fill="#f59e0b" />
      <rect x="5" y="8.75" width="14" height="7.5" rx="2" fill="#14b8a6" />
      <rect x="4" y="12.5" width="16" height="7.5" rx="2" fill="#0052ff" />
      <path d="M7 16.25h4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Mark + wordmark lockup. `size="rail"` = 24px mark / 16px word;
 * `size="login"` = 32px mark / 24px word.
 *
 * The wordmark is `--ink`, not `--primary`: the blue lives in the tile so the
 * lockup carries one colour accent, not two. The 700 weight is the single
 * documented exception to the §3 weight ceiling (DESIGN.md §4 Brand).
 */
export function Brand({
  size = "rail",
  className,
}: {
  size?: "rail" | "login";
  className?: string;
}) {
  const login = size === "login";
  return (
    <span className={cn("inline-flex items-center", login ? "gap-2.5" : "gap-2", className)}>
      <BrandMark className={login ? "size-8" : "size-6"} />
      <span
        className={cn(
          "font-brand font-bold lowercase tracking-[-0.03em] text-ink",
          login ? "text-[24px] leading-none" : "text-[16px] leading-none",
        )}
      >
        catet
      </span>
    </span>
  );
}
