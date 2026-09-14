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
import { useMediaQuery } from "@/lib/use-media-query";
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
  const isPhone = useMediaQuery("(max-width: 639px)");

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
        <div className="grid flex-1 gap-4 overflow-y-auto px-4 py-2">{children}</div>
        {footer !== undefined ? (
          <SheetFooter className="flex-row justify-end gap-2 border-t border-border">
            {footer}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
