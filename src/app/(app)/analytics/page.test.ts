import { describe, expect, test } from "vitest";

import { runwayChartValue } from "./page";

describe("runwayChartValue", () => {
  test("maps the infinite runway sentinel to the capped axis", () => {
    expect(runwayChartValue(0)).toBe(90);
  });

  test("keeps finite runway values unchanged", () => {
    expect(runwayChartValue(42)).toBe(42);
  });
});
