"use client";

import { useSyncExternalStore } from "react";

/**
 * Chromium fires `beforeinstallprompt` exactly once per page load, long
 * before Settings is mounted, so the event is captured by PwaBridge at the
 * root and parked in this module-level store. The Settings install row
 * reads it from here; `appinstalled` clears it.
 */
export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function setDeferredPrompt(event: InstallPromptEvent | null): void {
  if (deferred === event) {
    return;
  }
  deferred = event;
  notify();
}

export function getDeferredPrompt(): InstallPromptEvent | null {
  return deferred;
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

/** The parked install prompt, or null when the browser offers none. */
export function useInstallPrompt(): InstallPromptEvent | null {
  return useSyncExternalStore(subscribe, getDeferredPrompt, () => null);
}
