import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { PwaBridge } from "@/components/pwa-bridge";
import { Providers } from "./providers";
import "./globals.css";

/*
 * Both faces are self-hosted (`src/fonts/*.woff2`, latin subsets pulled from
 * the Fontsource packages): a production build must not depend on a live
 * fetch to fonts.googleapis.com, and the box that runs this build cannot
 * reach it at all.
 */
const inter = localFont({
  src: "../fonts/inter-latin-variable.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-inter",
  fallback: ["system-ui", "sans-serif"],
});

// Brand face — the wordmark only (DESIGN.md §4 Brand).
const bricolage = localFont({
  src: "../fonts/bricolage-grotesque-latin-700.woff2",
  weight: "700",
  display: "swap",
  variable: "--font-brand",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "catet",
  description: "Pelacak keuangan pribadi",
  applicationName: "catet",
  manifest: "/manifest.webmanifest",
  // iOS ignores the manifest: `capable` is what makes an Add-to-Home-Screen
  // launch standalone, and `default` keeps an opaque status bar (so the 48px
  // PageHeader needs no top inset).
  appleWebApp: { capable: true, title: "catet", statusBarStyle: "default" },
  // Next emits only the standard `mobile-web-app-capable` for the line above;
  // iOS below 16.4 reads the Apple-prefixed name, so both are shipped.
  other: { "apple-mobile-web-app-capable": "yes" },
};

/*
 * `viewportFit: "cover"` is what activates the env(safe-area-inset-*) padding
 * already carried by the bottom nav, the app shell and the sheet footers.
 * No `maximumScale`: iOS focus-zoom is prevented by the 16px --text-control
 * token (DESIGN.md §3), never by blocking pinch-zoom.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f2f4f7",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <PwaBridge />
          {children}
        </Providers>
      </body>
    </html>
  );
}
