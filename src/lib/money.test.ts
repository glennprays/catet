import { describe, expect, test } from "vitest";

import { parseSignedAmountToMinor } from "./money";

describe("parseSignedAmountToMinor", () => {
  test("preserves a leading minus sign", () => {
    expect(parseSignedAmountToMinor("-15.000")).toBe(-15000);
  });

  test("keeps unsigned amounts positive", () => {
    expect(parseSignedAmountToMinor("50.000")).toBe(50000);
  });
});
