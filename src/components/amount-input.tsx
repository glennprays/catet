"use client";

import { Input } from "@/components/ui/input";
import { parseAmountToMinor, parseSignedAmountToMinor } from "@/lib/money";

const grouping = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

/**
 * Rupiah entry: `Rp` prefix, right-aligned tabular figures, live
 * thousands grouping. The caller holds minor units — the string shape
 * never escapes this component.
 */
export function AmountInput({
  id,
  valueMinor,
  onChangeMinor,
  allowNegative = false,
  placeholder = "0",
  disabled = false,
  autoFocus = false,
  "aria-describedby": describedBy,
}: {
  id: string;
  valueMinor: number | null;
  onChangeMinor: (minor: number | null) => void;
  allowNegative?: boolean;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  "aria-describedby"?: string;
}) {
  const display =
    valueMinor === null
      ? ""
      : `${valueMinor < 0 ? "−" : ""}${grouping.format(Math.abs(valueMinor))}`;

  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[13px] text-muted-foreground">
        Rp
      </span>
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        autoFocus={autoFocus}
        disabled={disabled}
        aria-describedby={describedBy}
        value={display}
        placeholder={placeholder}
        onChange={(event) => {
          const raw = event.target.value;
          onChangeMinor(allowNegative ? parseSignedAmountToMinor(raw) : parseAmountToMinor(raw));
        }}
        className="pr-3 pl-9 text-right text-[15px] font-medium tabular-nums"
      />
    </div>
  );
}
