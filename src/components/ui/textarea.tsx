import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-sm border border-transparent bg-surface-200 px-3 py-2.5 text-[13px] transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-border-strong focus-visible:ring-[3px] focus-visible:ring-safe-wash disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
