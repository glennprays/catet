"use client";

import { useOnline } from "@/lib/use-online";

/*
 * Offline is a shell-level condition, so it gets one line of chrome instead
 * of an error state in every panel. It sits above the bottom nav on phones
 * and above the bottom edge of the rail layout on desktop.
 */
export function OfflineBanner() {
  if (useOnline()) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 flex h-8 items-center justify-center bg-warn-wash text-meta font-medium text-warn-text lg:bottom-0 lg:left-56"
    >
      Tidak ada koneksi — data mungkin tidak terbaru
    </div>
  );
}
