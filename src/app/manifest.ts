import type { MetadataRoute } from "next";

/*
 * Installable dashboard (ADR-0007). `start_url` carries `?source=pwa` so the
 * middleware can send an anonymous home-screen launch straight to /login
 * instead of the marketing page. Served by Next at /manifest.webmanifest.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "catet",
    short_name: "catet",
    description: "Pelacak keuangan pribadi",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f2f4f7",
    theme_color: "#f2f4f7",
    lang: "id",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
