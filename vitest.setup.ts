import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom-only wiring: node-environment test files load this file too.
if (typeof document !== "undefined") {
  afterEach(cleanup);

  if (window.matchMedia === undefined) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  }

  // jsdom has no layout, so it has no ResizeObserver. Radix measures a
  // Switch's control with one whenever the switch sits inside a form
  // (the hidden bubble input mirrors its size).
  if (window.ResizeObserver === undefined) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof window.ResizeObserver;
  }

  // Same reason: an open Radix Select scrolls its checked item into
  // view, which jsdom does not implement at all.
  if (Element.prototype.scrollIntoView === undefined) {
    Element.prototype.scrollIntoView = () => undefined;
  }
}
