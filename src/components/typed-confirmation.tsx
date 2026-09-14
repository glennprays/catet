"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TypedConfirmation({
  phrase,
  label,
  pending = false,
  onConfirm,
}: {
  phrase: string;
  label: string;
  pending?: boolean;
  onConfirm: () => void;
}) {
  const inputId = useId();
  const [value, setValue] = useState("");
  const confirmed = value.trim().toUpperCase() === phrase.toUpperCase();

  return (
    <div className="grid min-w-0 flex-1 gap-1.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <div className="grid gap-1.5">
        <Label htmlFor={inputId} className="text-xs">
          Ketik {phrase} untuk melanjutkan
        </Label>
        <Input
          id={inputId}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder={phrase}
        />
      </div>
      <Button type="button" variant="destructive" disabled={!confirmed || pending} onClick={onConfirm}>
        {label}
      </Button>
    </div>
  );
}
