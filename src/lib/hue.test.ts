import { describe, expect, test } from "vitest";

import { HUES, hueFor, sourceHue } from "./hue";

describe("hueFor", () => {
  test("is stable for the same id", () => {
    expect(hueFor("demo-bca")).toBe(hueFor("demo-bca"));
  });

  test("always lands inside the palette", () => {
    for (const id of ["", "a", "demo-gopay", "9f1d2c3b-4a5e-6f70-8192-a3b4c5d6e7f8"]) {
      expect(HUES).toContain(hueFor(id));
    }
  });

  test("spreads distinct ids across more than one hue", () => {
    const ids = Array.from({ length: 64 }, (_, index) => `source-${index}`);
    expect(new Set(ids.map(hueFor)).size).toBeGreaterThan(1);
  });
});

describe("sourceHue", () => {
  test("debt is always the ink card, whatever its id hashes to", () => {
    expect(sourceHue({ id: "demo-spaylater", is_debt: true })).toBe("ink");
  });

  test("an asset keeps its identity hue", () => {
    expect(sourceHue({ id: "demo-bca", is_debt: false })).toBe(hueFor("demo-bca"));
  });
});
