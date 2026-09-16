"use client";

import { parseAmountToMinor, parseSignedAmountToMinor } from "@/lib/money";
import { cn } from "@/lib/utils";

const grouping = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

/**
 * Rupiah entry: `Rp` prefix, right-aligned tabular figures, live
 * thousands grouping. The caller holds minor units — the string shape
 * never escapes this component.
 *
 * The wrapper owns the control chrome (copied from `Input`) so the
 * prefix can be a flex sibling of the field at the same font size:
 * two centred line boxes of one size share a baseline, which an
 * absolutely positioned smaller prefix never does.
 */
export function AmountInput({
  id,
  valueMinor,
  onChangeMinor,
  allowNegative = false,
  placeholder = "0",
  disabled = false,
  autoFocus = false,
  size = "md",
  className,
  "aria-describedby": describedBy,
  "aria-invalid": invalid = false,
}: {
  id: string;
  valueMinor: number | null;
  onChangeMinor: (minor: number | null) => void;
  allowNegative?: boolean;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  /** `lg` is the hero amount field of the capture sheet. */
  size?: "md" | "lg";
  className?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}) {
  const display =
    valueMinor === null
      ? ""
      : `${valueMinor < 0 ? "−" : ""}${grouping.format(Math.abs(valueMinor))}`;

  return (
    <div
      data-invalid={invalid ? "" : undefined}
      className={cn(
        "flex items-center rounded-md border border-border-strong bg-surface transition-[color,box-shadow]",
        "focus-within:border-primary focus-within:ring-[4px] focus-within:ring-primary/10",
        "data-[invalid]:border-destructive data-[invalid]:focus-within:ring-destructive/20",
        "has-[input:disabled]:opacity-50",
        size === "lg" ? "h-11" : "h-9 sm:h-8",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "shrink-0 select-none pl-2.5 text-muted-foreground",
          size === "lg" ? "text-amount-lg" : "text-amount",
        )}
      >
        Rp
      </span>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        autoFocus={autoFocus}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={invalid ? true : undefined}
        value={display}
        placeholder={placeholder}
        onChange={(event) => {
          const raw = event.target.value;
          onChangeMinor(allowNegative ? parseSignedAmountToMinor(raw) : parseAmountToMinor(raw));
        }}
        className={cn(
          // `w-full` (as the old `Input` carried) keeps the field's
          // intrinsic width out of `auto` grid-track sizing: without it
          // the flex shell grows past its cell.
          "h-full w-full min-w-0 flex-1 bg-transparent px-2.5 text-right font-medium tabular-nums outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
          size === "lg" ? "text-amount-lg tracking-[-0.01em]" : "text-amount",
        )}
      />
    </div>
  );
}
