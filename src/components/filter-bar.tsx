"use client";

import { useCallback, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Sticky filter toolbar. It measures itself and publishes `--toolbar-h`
 * so sticky day headers can sit exactly below it instead of guessing
 * with magic offsets that drift when the bar wraps.
 */
export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (node === null) {
      return;
    }
    const publish = () => {
      node.parentElement?.style.setProperty("--toolbar-h", `${node.offsetHeight}px`);
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "sticky top-14 z-10 -mx-4 mb-3 border-b border-border bg-canvas px-4 py-2 lg:-mx-6 lg:px-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
