/*
 * catet service worker — installability, an offline page, and a cached
 * app shell (ADR-0007). Hand-written on purpose: the whole contract fits
 * on one screen.
 *
 * What is cached: the offline page and the app icon at install time,
 * hashed /_next/static/ build assets on demand, and the HTML of `(app)`
 * pages the user has visited. That HTML is a shell — every `(app)` page
 * is client-rendered and the layout fetches nothing, so it carries no
 * balances, no ledger, no name. What is never cached: /api/* responses,
 * RSC payloads, redirected navigations (the anonymous → /login bounce),
 * the unauthenticated pages, anything cross-origin. Authenticated JSON
 * therefore never lands on disk, and signing out clears the shell.
 */
const VERSION = new URL(self.location.href).searchParams.get("v") ?? "dev";
const SHELL = "catet-shell-" + VERSION;
const STATIC = "catet-static-" + VERSION;
const PRECACHE = ["/offline", "/icons/icon-192.png"];
// Pages that exist for signed-out visitors: caching them would hand a
// returning user the marketing or login HTML for their own URL.
const NO_SHELL = ["/login", "/register", "/reset", "/welcome", "/offline"];

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
  if (!event.data) {
    return;
  }
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data.type === "CLEAR_SHELL") {
    // Sign-out: drop every cached page, keep the offline fallback.
    event.waitUntil(
      caches
        .delete(SHELL)
        .then(() => caches.open(SHELL))
        .then((cache) => cache.addAll(PRECACHE)),
    );
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    const offline = async () => {
      const cached = await caches.match("/offline");
      return (
        cached ??
        new Response("Tidak ada koneksi", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        })
      );
    };

    const skip =
      url.origin !== self.location.origin ||
      NO_SHELL.some((path) => url.pathname === path || url.pathname.startsWith(path + "/"));
    if (skip) {
      event.respondWith(fetch(request).catch(offline));
      return;
    }

    // Stale-while-revalidate on the pathname only, so `/?source=pwa`
    // (the home-screen launch) and `/` share one entry.
    const key = new Request(url.pathname);
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL);
        const hit = await cache.match(key);
        const network = fetch(request).then((response) => {
          const type = response.headers.get("content-type") ?? "";
          if (response.ok && !response.redirected && type.includes("text/html")) {
            cache.put(key, response.clone());
          }
          return response;
        });
        if (hit !== undefined) {
          event.waitUntil(network.catch(() => undefined));
          return hit;
        }
        return network.catch(offline);
      })(),
    );
    return;
  }

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
