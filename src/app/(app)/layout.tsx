import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AccountsRail } from "@/components/accounts-rail";
import { CaptureSheetProvider } from "@/components/capture-sheet-provider";
import { PrivacyProvider } from "@/components/privacy-provider";
import { LiveRegion } from "@/components/live-region";
import { BottomNav } from "@/components/bottom-nav";
import { OfflineBanner } from "@/components/offline-banner";
import { backendFetch } from "@/lib/api/backend-fetch";
import type { components } from "@/lib/api/schema";
import { getSessionToken } from "@/lib/session";

type SourcesEnvelope = components["schemas"]["SourcesEnvelope"];

/**
 * App shell (server): the sources fetch seeds the rail's client cache
 * so the first paint has balances. A failed fetch seeds nothing — the
 * rail retries client-side and reports failure rather than zeros.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const token = await getSessionToken();
  if (!token) {
    redirect("/login");
  }

  let sources: SourcesEnvelope["data"] | undefined;
  try {
    // backendFetch returns the full envelope; unwrap data here.
    const sourcesEnv = await backendFetch<SourcesEnvelope>("/api/v1/sources", { token });
    sources = sourcesEnv.data;
  } catch {
    // A dead backend still renders the shell; the rail owns the retry.
    sources = undefined;
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
            <AccountsRail initialSources={sources} />
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
