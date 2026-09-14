import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AccountsRail } from "@/components/accounts-rail";
import { BottomNav } from "@/components/bottom-nav";
import { ShellRefresher } from "@/components/shell-refresher";
import { backendFetch } from "@/lib/api/backend-fetch";
import type { components } from "@/lib/api/schema";
import { getSessionToken } from "@/lib/session";

type SourcesEnvelope = components["schemas"]["SourcesEnvelope"];

/**
 * App shell (server): the accounts rail is a money view fed directly
 * by the Go API. A failed fetch is reported as a failure — the rail
 * never falls back to zeros. Badge counts are client-side (they change
 * while the page is open, driven by the WhatsApp bot).
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const token = await getSessionToken();
  if (!token) {
    redirect("/login");
  }

  let sources: SourcesEnvelope["data"] | undefined;
  let railFailed = false;
  try {
    // backendFetch returns the full envelope; unwrap data here.
    const sourcesEnv = await backendFetch<SourcesEnvelope>("/api/v1/sources", { token });
    sources = sourcesEnv.data;
  } catch {
    // A dead backend still renders the shell; data surfaces show
    // their error states.
    railFailed = true;
  }

  return (
    <div className="flex min-h-full">
      <AccountsRail
        sources={sources?.sources ?? []}
        totals={
          sources === undefined
            ? null
            : { available: sources.total_available_minor, debt: sources.total_debt_minor }
        }
        failed={railFailed}
      />
      <div className="flex min-h-full w-full flex-col lg:pl-60">
        <main className="mx-auto w-full max-w-[1160px] flex-1 px-4 pb-24 pt-0 lg:px-6 lg:pb-10">
          {children}
        </main>
      </div>
      <BottomNav />
      <ShellRefresher />
    </div>
  );
}
