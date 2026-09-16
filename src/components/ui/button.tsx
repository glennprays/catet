import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

/*
 * Density rule (DESIGN.md §4): controls are 32px at ≥640px and 44px below,
 * so touch never costs the desktop its density. Compact sizes (`sm`,
 * `icon-sm`) stay 28px and restore reach with a transparent hit-area
 * expander (`before:inset-[-8px]` → 44px) instead of a min-height that
 * would defeat every small size.
 */
const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-control font-medium whitespace-nowrap transition-colors outline-none focus-visible:border-primary focus-visible:ring-[4px] focus-visible:ring-primary/10 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-hover",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",
        secondary:
          "border border-border-strong bg-surface text-ink hover:bg-surface-100",
        ghost: "text-ink-soft hover:bg-surface-200",
        dangerGhost: "text-over-text hover:bg-over-wash",
      },
      size: {
        default: "h-11 px-3 text-control has-[>svg]:px-2.5 sm:h-8",
        sm: "h-7 gap-1 px-2.5 text-meta has-[>svg]:px-2 before:absolute before:inset-[-8px] before:content-['']",
        lg: "h-11 px-4 text-control has-[>svg]:px-3.5 sm:h-10",
        icon: "size-11 sm:size-8",
        "icon-sm": "size-7 before:absolute before:inset-[-8px] before:content-['']",
        "icon-lg": "size-11 sm:size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
