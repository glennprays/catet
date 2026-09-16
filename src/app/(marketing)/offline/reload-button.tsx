"use client";

import { RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/** A reload, not a router navigation: the app shell itself failed to load. */
export function ReloadButton() {
  return (
    <Button
      variant="secondary"
      className="w-full sm:w-auto sm:justify-self-start"
      onClick={() => window.location.reload()}
    >
      <RotateCw strokeWidth={1.75} /> Coba lagi
    </Button>
  );
}
