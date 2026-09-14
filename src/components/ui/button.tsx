import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

/*
 * Density rule (DESIGN.md §4): compact sizes are genuinely compact.
 * Touch reach is restored with a transparent hit-area expander
 * (`before:inset-[-6px]`) instead of a min-height that would defeat
 * every small size.
 */
const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-[13px] font-medium whitespace-nowrap transition-all outline-none focus-visible:border-border-strong focus-visible:ring-[3px] focus-visible:ring-safe-wash active:scale-[0.98] disabled:pointer-events-none disabled:bg-surface-300 disabled:text-smoke aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-sheet hover:bg-destructive/90 focus-visible:ring-destructive/20",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-ink-soft hover:bg-surface-200",
        dangerGhost: "text-over-text hover:bg-over-wash",
      },
      size: {
        default: "h-11 px-4 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-2.5 text-xs has-[>svg]:px-2 before:absolute before:inset-[-6px] before:content-['']",
        lg: "h-11 px-6 has-[>svg]:px-4",
        icon: "size-11",
        "icon-sm": "size-8 before:absolute before:inset-[-6px] before:content-['']",
        "icon-lg": "size-11",
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
