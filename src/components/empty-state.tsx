import { AlertCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
/**
 * Empty-state pattern (DESIGN.md §4): 32px ash glyph, heading-sm copy,
 * one caption, optional action. No illustrations.
 */
export function EmptyState({
  icon: Icon,
  heading,
  caption,
  action,
}: {
  icon: LucideIcon;
  heading: string;
  caption: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <Icon className="size-8 text-ash" strokeWidth={1.5} />
      <p className="text-amount-lg font-medium tracking-[-0.01em]">{heading}</p>
      <p className="text-body text-muted-foreground">{caption}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function QueryErrorState({
  message = "Gagal memuat data.",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <AlertCircle className="size-8 text-over-text" strokeWidth={1.5} />
      <p className="text-amount font-medium text-ink">{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        Coba lagi
      </Button>
    </div>
  );
}
