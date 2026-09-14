"use client";

import { Button } from "@/components/ui/button";

export type RowAction = {
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
  pending?: boolean;
  disabled?: boolean;
};

/**
 * Row action cluster: always visible (no hover-only affordances), one
 * height everywhere, per-action pending state.
 */
export function RowActions({ actions }: { actions: RowAction[] }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      {actions.map((action) => (
        <Button
          key={action.label}
          type="button"
          size="sm"
          variant={action.tone === "danger" ? "dangerGhost" : "ghost"}
          disabled={action.disabled === true || action.pending === true}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
