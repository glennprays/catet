"use client";

import { Switch } from "@/components/ui/switch";

/** Label + switch in one 44px row; the whole row is the label. */
export function SwitchRow({
  id,
  label,
  caption,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  id: string;
  label: string;
  caption?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label htmlFor={id} className="flex min-h-11 items-center justify-between gap-3">
      <span className="min-w-0">
        <span className="block text-body text-ink">{label}</span>
        {caption !== undefined ? (
          <span className="block text-meta text-muted-foreground">{caption}</span>
        ) : null}
      </span>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </label>
  );
}
