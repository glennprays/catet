import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";

/**
 * Labelled form control. `htmlFor` is required: every control that can
 * take an id gets one, including Radix `SelectTrigger` (WCAG 1.3.1).
 */
export function FormField({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor} className="flex items-baseline justify-between gap-2">
        <span>{label}</span>
        {hint !== undefined ? (
          <span className="text-meta font-normal text-muted-foreground">{hint}</span>
        ) : null}
      </Label>
      {children}
      {error !== undefined ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-meta text-over-text">
          {error}
        </p>
      ) : null}
    </div>
  );
}
