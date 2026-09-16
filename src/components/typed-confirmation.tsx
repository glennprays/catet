"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Typed gate for irreversible actions. Controlled by ConfirmDialog. */
export function TypedConfirmation({
  id,
  phrase,
  value,
  onChange,
}: {
  id: string;
  phrase: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-meta">
        Ketik {phrase} untuk melanjutkan
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        spellCheck={false}
        placeholder={phrase}
      />
    </div>
  );
}

export function matchesPhrase(value: string, phrase: string): boolean {
  return value.trim().toUpperCase() === phrase.toUpperCase();
}
