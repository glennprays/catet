"use client";

import { Eye, EyeOff } from "lucide-react";

import { usePrivacy } from "@/components/privacy-provider";
import { Button } from "@/components/ui/button";

/**
 * The one global privacy control, pinned to the right of every `PageHeader`.
 * The icon shows the *current* state — a crossed eye means amounts are
 * hidden — which is also what `aria-pressed` reports.
 */
export function PrivacyToggle() {
  const { masked, toggle } = usePrivacy();
  const label = masked ? "Tampilkan nominal" : "Sembunyikan nominal";
  const Icon = masked ? EyeOff : Eye;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-pressed={masked}
      aria-label={label}
      title={`${label} (.)`}
      onClick={toggle}
    >
      <Icon className="size-4" strokeWidth={1.75} />
    </Button>
  );
}
