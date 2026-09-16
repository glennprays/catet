"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { shortDateLabel } from "@/lib/time";

/** Day picker rendering Jakarta dates; `disableFuture` for capture. */
export function DatePicker({
  id,
  date,
  onChange,
  disableFuture = false,
  className,
}: {
  id: string;
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disableFuture?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="secondary"
          className={cn(
            "w-full justify-start font-normal",
            className,
            date === undefined && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-4 text-ash" strokeWidth={1.75} />
          {date !== undefined ? shortDateLabel(date) : "Pilih tanggal"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selected) => {
            onChange(selected);
            setOpen(false);
          }}
          disabled={disableFuture ? { after: new Date() } : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}
