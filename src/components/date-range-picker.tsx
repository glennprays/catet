"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { periodLabel } from "@/lib/period";
import { cn } from "@/lib/utils";

/**
 * The calendar speaks browser-local `Date`s while the API speaks Jakarta
 * day keys. A picked day is simply the day the user clicked, so the
 * conversion reads the local calendar fields instead of re-projecting the
 * instant through Asia/Jakarta, which would slide the day for a browser
 * east of WIB.
 */
function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Local midnight of a `yyyy-MM-dd` key — the shape the calendar selects. */
function dayDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Two-ended day picker for a custom period. A half-picked range is local
 * draft state: the caller only ever hears about a complete range.
 */
export function DateRangePicker({
  id,
  from,
  to,
  onChange,
  maxDays,
  className,
}: {
  id?: string;
  from?: string;
  to?: string;
  onChange: (from: string, to: string) => void;
  maxDays?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>(undefined);

  const committed: DateRange | undefined =
    from === undefined
      ? undefined
      : { from: dayDate(from), to: to === undefined ? undefined : dayDate(to) };
  const selected = draft ?? committed;
  const complete = from !== undefined && to !== undefined;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        // Reopening starts from what is actually applied, never from an
        // abandoned half-pick.
        if (next) setDraft(undefined);
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="secondary"
          aria-label={id === undefined ? "Rentang tanggal" : undefined}
          className={cn(
            "w-full justify-start font-normal",
            className,
            !complete && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-4 text-ash" strokeWidth={1.75} />
          {complete ? periodLabel({ preset: "custom", from, to }) : "Pilih tanggal"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={selected}
          defaultMonth={selected?.from}
          max={maxDays}
          disabled={{ after: new Date() }}
          onSelect={(range, triggerDate) => {
            if (draft === undefined) {
              // The first click after opening starts a new range. Letting
              // the calendar stretch the applied one would commit a window
              // the user never asked for on a single click.
              setDraft({ from: triggerDate, to: undefined });
              return;
            }
            setDraft(range);
            if (range?.from === undefined || range.to === undefined) return;
            onChange(dayKey(range.from), dayKey(range.to));
            setDraft(undefined);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
