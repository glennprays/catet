import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AccountsRail } from "@/components/accounts-rail";
import { BottomNav } from "@/components/bottom-nav";
import { ShellRefresher } from "@/components/shell-refresher";
import { backendFetch } from "@/lib/api/backend-fetch";
import type { components } from "@/lib/api/schema";
import { getSessionToken } from "@/lib/session";

type SourcesEnvelope = components["schemas"]["SourcesEnvelope"];
type BadgesEnvelope = components["schemas"]["BadgesEnvelope"];

/**
 * App shell (server): the accounts rail is a money view fed directly
 * by the Go API — balances, totals, and badge counts are ready to
 * render, never recomputed client-side.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const token = await getSessionToken();
  if (!token) {
    redirect("/login");
  }

  let sources: SourcesEnvelope["data"] | undefined;
  let badges: BadgesEnvelope["data"] | undefined;
  try {
    // backendFetch returns the full envelope; unwrap data here.
    const [sourcesEnv, badgesEnv] = await Promise.all([
      backendFetch<SourcesEnvelope>("/api/v1/sources", { token }),
      backendFetch<BadgesEnvelope>("/api/v1/badges", { token }),
    ]);
    sources = sourcesEnv.data;
    badges = badgesEnv.data;
  } catch {
    // A dead backend still renders the shell; data surfaces show
    // their error states.
    sources = undefined;
    badges = undefined;
  }

  return (
    <div className="flex min-h-full">
      <AccountsRail
        sources={sources?.sources ?? []}
        totalAvailableMinor={sources?.total_available_minor ?? 0}
        totalDebtMinor={sources?.total_debt_minor ?? 0}
        badges={badges ?? { needs_review: 0, hold_queue: 0 }}
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
