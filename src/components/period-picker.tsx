"use client";

import { DateRangePicker } from "@/components/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERIOD_LABELS, type Period, type PeriodPreset } from "@/lib/period";
import { cn } from "@/lib/utils";

/**
 * The one window control every list and chart shares. `inline` is the
 * desktop toolbar shape (control hugs its label, range beside it); without
 * it the parts stack full-width, which is what the phone filter sheet and
 * a `FormField` want.
 */
export function PeriodPicker({
  value,
  onChange,
  presets,
  maxCustomDays,
  id,
  inline = false,
}: {
  value: Period;
  onChange: (p: Period) => void;
  presets: PeriodPreset[];
  maxCustomDays?: number;
  id?: string;
  inline?: boolean;
}) {
  // A `FormField` label already names the control; a second accessible name
  // would only fight it (same rule as the Transactions filter selects).
  const controlClass = inline ? "sm:w-auto" : "w-full";
  return (
    <div className={cn("flex gap-2", inline ? "items-center" : "flex-col")}>
      <Select
        value={value.preset}
        onValueChange={(next) => {
          const preset = next as PeriodPreset;
          // Leaving "Kustom" drops the dates it owned; returning to it keeps
          // whatever the user had picked.
          onChange(preset === "custom" ? { preset, from: value.from, to: value.to } : { preset });
        }}
      >
        <SelectTrigger
          id={id}
          className={controlClass}
          aria-label={id === undefined ? "Rentang waktu" : undefined}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset} value={preset}>
              {PERIOD_LABELS[preset]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value.preset === "custom" ? (
        <DateRangePicker
          from={value.from}
          to={value.to}
          maxDays={maxCustomDays}
          className={controlClass}
          onChange={(from, to) => onChange({ preset: "custom", from, to })}
        />
      ) : null}
    </div>
  );
}
