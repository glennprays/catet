"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Download, Share, SquarePlus } from "lucide-react";

import { IconTile } from "@/components/icon-tile";
import { ResponsiveSheet } from "@/components/responsive-sheet";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/lib/install-prompt";
import { useIsStandalone } from "@/lib/use-media-query";

const IOS_STEPS = [
  { icon: Share, text: "Buka catet di Safari, ketuk tombol Bagikan." },
  { icon: SquarePlus, text: "Pilih 'Tambah ke Layar Utama'." },
  { icon: Check, text: "Ketuk 'Tambah'. catet muncul di layar utama." },
] as const;

/** The user agent never changes under us, so there is nothing to subscribe to. */
const subscribe = () => () => {};

/**
 * Settings row that installs the dashboard on the home screen. Three
 * capabilities, one row: Chromium hands us a deferred `beforeinstallprompt`
 * (native dialog), iOS Safari has no API at all (a sheet walks the Share
 * menu), and anything else gets the browser-menu sentence. Inside the
 * installed app the row is gone — there is nothing left to install.
 */
export function InstallAppRow() {
  const standalone = useIsStandalone();
  const prompt = useInstallPrompt();
  // Read on the client only: the server snapshot is false, so the server
  // markup and the first client frame agree (same shape as useMediaQuery).
  const isIos = useSyncExternalStore(
    subscribe,
    () => /iPhone|iPad|iPod/.test(navigator.userAgent),
    () => false,
  );
  const [open, setOpen] = useState(false);

  if (standalone) {
    return null;
  }

  return (
    <div className="grid gap-2 p-4 sm:grid-cols-[220px_minmax(0,1fr)]">
      <div>
        <h3 className="text-body font-medium text-ink">Pasang di layar utama</h3>
        <p className="text-meta text-ash">Buka catet seperti aplikasi, tanpa bar alamat.</p>
      </div>
      <div>
        {prompt !== null ? (
          <Button variant="secondary" onClick={() => void prompt.prompt()}>
            <Download className="size-4" strokeWidth={1.75} /> Pasang
          </Button>
        ) : isIos ? (
          <>
            <Button variant="secondary" onClick={() => setOpen(true)}>
              <Share className="size-4" strokeWidth={1.75} /> Lihat caranya
            </Button>
            <ResponsiveSheet open={open} onOpenChange={setOpen} title="Pasang di iPhone">
              <ol className="grid gap-3" aria-label="Langkah pemasangan">
                {IOS_STEPS.map((step) => (
                  <li key={step.text} className="flex items-start gap-3">
                    <IconTile icon={step.icon} />
                    <span className="min-w-0 text-body text-ink">{step.text}</span>
                  </li>
                ))}
              </ol>
              <p className="text-meta text-ash">
                Setelah terpasang, masuk sekali lagi — sesi Safari tidak ikut.
              </p>
            </ResponsiveSheet>
          </>
        ) : (
          <p className="text-meta text-ash">
            Gunakan menu browser → “Install app” / “Add to Home screen”.
          </p>
        )}
      </div>
    </div>
  );
}
