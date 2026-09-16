import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AccountsRail } from "@/components/accounts-rail";
import { CaptureSheetProvider } from "@/components/capture-sheet-provider";
import { PrivacyProvider } from "@/components/privacy-provider";
import { LiveRegion } from "@/components/live-region";
import { BottomNav } from "@/components/bottom-nav";
import { OfflineBanner } from "@/components/offline-banner";
import { getSessionToken } from "@/lib/session";

/**
 * App shell (server): nothing but the session guard. The rail fetches
 * its own sources client-side, so this HTML carries no balances — which
 * is what lets the service worker cache it as a plain shell and paint
 * it before any network (ADR-0007).
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const token = await getSessionToken();
  if (!token) {
    redirect("/login");
  }

  return (
    <PrivacyProvider>
      <CaptureSheetProvider>
        <LiveRegion>
          <a
            href="#main"
            className="sr-only rounded-md bg-primary px-3 py-2 text-body text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
          >
            Lompat ke konten
          </a>
          <div className="flex min-h-full">
            <AccountsRail />
            <div className="flex min-h-full w-full flex-col lg:pl-56">
              <main
                id="main"
                className="mx-auto w-full max-w-[1600px] flex-1 px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-0 lg:px-5 lg:pb-6"
              >
                {children}
              </main>
            </div>
            <BottomNav />
            <OfflineBanner />
          </div>
        </LiveRegion>
      </CaptureSheetProvider>
    </PrivacyProvider>
  );
}
