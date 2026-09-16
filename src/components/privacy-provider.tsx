"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { formatIDR, formatSignedIDR } from "@/lib/money";

/** sessionStorage: "1" when the user revealed amounts in this tab. */
const REVEAL_KEY = "catet.reveal";

/** Fixed width: leaks neither magnitude nor sign. */
export const MASKED_AMOUNT = "Rp••••••";

/** Chart axis tick replacement. */
export const MASKED_TICK = "•••";

type Privacy = { masked: boolean; toggle: () => void };

/**
 * Default is *unmasked* so `MoneyText` keeps rendering digits outside the app
 * shell (unit tests, `/login`). Inside the shell the provider owns the state
 * and starts masked.
 */
const PrivacyContext = createContext<Privacy>({ masked: false, toggle: () => {} });

/**
 * The reveal lives outside React: it is one boolean shared by every subtree,
 * and `useSyncExternalStore` is the only way to read it that hydrates masked
 * (server snapshot) and then settles on the stored value without a
 * setState-in-effect cascade.
 */
const listeners = new Set<() => void>();
// Private-mode browsers throw on storage access; the tab still gets a working
// toggle from this mirror.
let memoryRevealed = false;

function readRevealed(): boolean {
  try {
    return window.sessionStorage.getItem(REVEAL_KEY) === "1";
  } catch {
    return memoryRevealed;
  }
}

function writeRevealed(revealed: boolean): void {
  memoryRevealed = revealed;
  try {
    if (revealed) {
      window.sessionStorage.setItem(REVEAL_KEY, "1");
    } else {
      window.sessionStorage.removeItem(REVEAL_KEY);
    }
  } catch {
    // Nothing to do: the reveal just does not survive a reload.
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Server and first client render agree: masked is the safe direction. */
function serverSnapshot(): boolean {
  return false;
}

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

/**
 * Privacy mode: the dashboard opens masked on every load so it is safe to open
 * in public, and a reveal lasts for the tab only (sessionStorage, not
 * localStorage — a shared machine forgets).
 */
export function PrivacyProvider({ children }: { children: ReactNode }) {
  const revealed = useSyncExternalStore(subscribe, readRevealed, serverSnapshot);

  const toggle = useCallback(() => {
    writeRevealed(!readRevealed());
    for (const listener of listeners) {
      listener();
    }
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.key !== "." ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.defaultPrevented ||
        isTypingTarget(event.target)
      ) {
        return;
      }
      event.preventDefault();
      toggle();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  /*
   * Installed app only: leaving it (app switcher, lock screen) re-masks, so
   * a revealed balance is never what the next person sees on resume. A
   * browser tab keeps the reveal — the tab is already the user's context.
   */
  useEffect(() => {
    if (!window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    function onVisibilityChange() {
      if (document.visibilityState !== "hidden" || !readRevealed()) {
        return;
      }
      writeRevealed(false);
      for (const listener of listeners) {
        listener();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const value = useMemo<Privacy>(() => ({ masked: !revealed, toggle }), [revealed, toggle]);

  return <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>;
}

export function usePrivacy(): Privacy {
  return useContext(PrivacyContext);
}

/** Format for display: digits when revealed, MASKED_AMOUNT when masked. */
export function useFormatIDR(): (minor: number, signed?: boolean) => string {
  const { masked } = usePrivacy();
  return useCallback(
    (minor: number, signed = false) =>
      masked ? MASKED_AMOUNT : signed ? formatSignedIDR(minor) : formatIDR(minor),
    [masked],
  );
}
