/*
 * catet service worker — installability and an offline shell, nothing else
 * (ADR-0007). Hand-written on purpose: the whole contract fits on one screen.
 *
 * What is cached: the offline page and the app icon at install time, plus
 * hashed /_next/static/ build assets on demand. What is never cached:
 * navigations (always network, offline page on failure), /api/* responses,
 * RSC payloads, anything cross-origin. Authenticated JSON therefore never
 * lands on disk, and a logged-out device cannot read a stale ledger.
 */
const VERSION = new URL(self.location.href).searchParams.get("v") ?? "dev";
const SHELL = "catet-shell-" + VERSION;
const STATIC = "catet-static-" + VERSION;
const PRECACHE = ["/offline", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  // No skipWaiting: a new worker waits until the user accepts the update
  // toast, so a running session is never swapped out mid-interaction.
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name !== SHELL && name !== STATIC)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match("/offline");
        return (
          cached ??
          new Response("Tidak ada koneksi", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          })
        );
      }),
    );
    return;
  }

  const url = new URL(request.url);
  if (
    url.origin === self.location.origin &&
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC);
        const hit = await cache.match(request);
        if (hit !== undefined) {
          return hit;
        }
        const response = await fetch(request);
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      })(),
    );
  }

  // Everything else: no respondWith, so the browser does exactly what it
  // would do without a worker.
});
