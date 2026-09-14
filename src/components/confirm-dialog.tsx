"use client";

import { useId, useState, type ReactNode } from "react";

import { TypedConfirmation, matchesPhrase } from "@/components/typed-confirmation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/lib/use-media-query";

/**
 * The whole destructive ladder lives here (DESIGN.md §8): plain confirm
 * for reversible actions, a preview in `description` for consequential
 * ones, `typedPhrase` only for what cannot be undone.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  tone = "default",
  typedPhrase,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  tone?: "default" | "danger";
  typedPhrase?: string;
  pending: boolean;
  onConfirm: () => void;
}) {
  const inputId = useId();
  const [typed, setTyped] = useState("");
  const isPhone = useMediaQuery("(max-width: 639px)");
  const gated = typedPhrase !== undefined && !matchesPhrase(typed, typedPhrase);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setTyped("");
    }
    onOpenChange(next);
  }

  const body =
    typedPhrase === undefined ? null : (
      <TypedConfirmation id={inputId} phrase={typedPhrase} value={typed} onChange={setTyped} />
    );

  const actions = (
    <>
      <Button variant="ghost" onClick={() => handleOpenChange(false)}>
        Batal
      </Button>
      <Button
        variant={tone === "danger" ? "destructive" : "default"}
        disabled={pending || gated}
        onClick={onConfirm}
      >
        {confirmLabel}
      </Button>
    </>
  );

  if (isPhone) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="bottom" className="rounded-t-lg">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="grid gap-3 px-4 text-[13px] text-muted-foreground">
            {description}
            {body}
          </div>
          <SheetFooter className="flex-row justify-end gap-2">{actions}</SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            <div className="text-[13px] text-muted-foreground">{description}</div>
          </DialogDescription>
        </DialogHeader>
        {body}
        <DialogFooter>{actions}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
