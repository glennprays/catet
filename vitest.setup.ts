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
}
