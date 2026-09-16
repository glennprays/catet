import type { Metadata } from "next";
import { WifiOff } from "lucide-react";

import { Brand } from "@/components/brand";

import { ReloadButton } from "./reload-button";

export const metadata: Metadata = {
  title: "Tidak ada koneksi — catet",
};

/*
 * The one page the service worker precaches (ADR-0007). It lives in the
 * public marketing shell on purpose: no session, no query client, no data —
 * it has to render from cache with the network gone.
 */
export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[420px] flex-col justify-center gap-4 px-4 py-10">
      <Brand />
      <span className="flex size-11 items-center justify-center rounded-lg bg-surface-200 text-ink-soft">
        <WifiOff className="size-5" strokeWidth={1.75} />
      </span>
      <h1 className="text-title font-semibold text-ink">Tidak ada koneksi</h1>
      <p className="text-body text-ash">
        catet butuh internet untuk menampilkan datamu. Pencatatan lewat WhatsApp tetap jalan
        dan akan muncul saat tersambung lagi.
      </p>
      <ReloadButton />
    </main>
  );
}
