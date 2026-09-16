"use client";

import type { ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsPhone } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

/**
 * Forms and detail views: a right sheet on desktop, a bottom sheet on
 * phones (DESIGN.md §8). One component so no screen invents its own.
 */
export function ResponsiveSheet({
  open,
  onOpenChange,
  title,
  description,
  footer,
  size = "md",
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  footer?: ReactNode;
  size?: "md" | "lg";
  children: ReactNode;
}) {
  const isPhone = useIsPhone();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isPhone ? "bottom" : "right"}
        className={cn(
          isPhone
            ? "h-[92dvh] rounded-t-lg"
            : cn("w-full", size === "lg" ? "sm:max-w-lg" : "sm:max-w-md"),
        )}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description !== undefined ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
        </SheetHeader>
        {/* `content-start`: fields hug the top instead of the grid
            stretching its rows when the form is shorter than the sheet. */}
        <div
          className={cn(
            "grid flex-1 content-start gap-4 overflow-y-auto px-4 py-2",
            isPhone && "pb-[env(safe-area-inset-bottom)]",
          )}
        >
          {children}
        </div>
        {footer !== undefined ? (
          <SheetFooter
            className={cn(
              "flex-row justify-end gap-2 border-t border-border",
              isPhone && "pb-[calc(1rem+env(safe-area-inset-bottom))]",
            )}
          >
            {footer}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
