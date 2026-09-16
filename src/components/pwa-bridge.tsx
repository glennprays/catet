"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { setDeferredPrompt, type InstallPromptEvent } from "@/lib/install-prompt";

/**
 * Drops the cached app shell. Called on every sign-out path: the shell
 * carries no user data, but a signed-out device should not paint the
 * app frame either.
 */
export function clearShellCache() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }
  navigator.serviceWorker.controller?.postMessage({ type: "CLEAR_SHELL" });
}

/*
 * Service-worker registration and the install-prompt capture (ADR-0007).
 * Mounted at the root so it also runs on /login — Chromium only treats the
 * app as installable once a worker controls the page, and the first visit is
 * usually the login screen.
 *
 * Production only: dev chunk URLs are unhashed, so a cache-first worker would
 * serve stale JavaScript and break HMR.
 */
export function PwaBridge() {
  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      // Suppressing the mini-infobar is what lets Settings own the moment.
      event.preventDefault();
      setDeferredPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => setDeferredPrompt(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return;
    }

    // First install also fires `controllerchange` (the worker calls
    // clients.claim()), and reloading then would bounce every first visit.
    // Only an update — a controller that was already there being replaced —
    // is worth a reload.
    const hadController = navigator.serviceWorker.controller !== null;
    let reloading = false;
    const onControllerChange = () => {
      if (!hadController || reloading) {
        return;
      }
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const announce = (worker: ServiceWorker) => {
      toast("Versi baru tersedia", {
        description: "Muat ulang untuk memakai versi terbaru.",
        duration: Number.POSITIVE_INFINITY,
        action: {
          label: "Muat ulang",
          onClick: () => worker.postMessage({ type: "SKIP_WAITING" }),
        },
      });
    };

    void navigator.serviceWorker
      .register(`/sw.js?v=${process.env.NEXT_PUBLIC_BUILD_ID ?? "dev"}`)
      .then((registration) => {
        if (registration.waiting !== null && navigator.serviceWorker.controller !== null) {
          announce(registration.waiting);
        }

        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (installing === null) {
            return;
          }
          installing.addEventListener("statechange", () => {
            // `controller` present means this is an update, not a first
            // install — only then is there a version worth announcing.
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller !== null
            ) {
              announce(installing);
            }
          });
        });
      })
      .catch(() => {
        // A failed registration costs the offline page, nothing else.
      });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  return null;
}
