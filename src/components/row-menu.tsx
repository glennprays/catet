"use client";

import { MoreHorizontal } from "lucide-react";

import type { RowAction } from "@/components/row-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Action hierarchy law (DESIGN.md §4): rare and destructive per-row
 * actions live behind one `⋯`, never as three equal-weight text buttons
 * that outshout the row's own content. Destructive items sit last,
 * below a rule, in `--over-text`.
 */
export function RowMenu({ label, actions }: { label: string; actions: RowAction[] }) {
  const safe = actions.filter((action) => action.tone !== "danger");
  const danger = actions.filter((action) => action.tone === "danger");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={label}>
          <MoreHorizontal className="size-4" strokeWidth={1.75} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {safe.map((action) => (
          <DropdownMenuItem
            key={action.label}
            disabled={action.disabled === true || action.pending === true}
            onSelect={action.onClick}
          >
            {action.pending === true ? `${action.label}…` : action.label}
          </DropdownMenuItem>
        ))}
        {danger.length === 0 ? null : (
          <>
            {safe.length === 0 ? null : <DropdownMenuSeparator />}
            {danger.map((action) => (
              <DropdownMenuItem
                key={action.label}
                variant="destructive"
                disabled={action.disabled === true || action.pending === true}
                onSelect={action.onClick}
              >
                {action.pending === true ? `${action.label}…` : action.label}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
