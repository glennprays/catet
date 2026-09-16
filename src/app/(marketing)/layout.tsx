import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "catet — Catat keuangan lewat WhatsApp",
  description:
    "Ketik pengeluaranmu di WhatsApp; catet mencatat, mengategorikan, dan memberi tahu berapa yang masih aman dipakai.",
};

/** Public shell: no rail, no bottom nav, no session — just the canvas. */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-full bg-canvas text-ink">{children}</div>;
}
