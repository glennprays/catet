import { describe, expect, it } from "vitest";

import { parsePeriod, periodLabel, resolvePeriod } from "./period";

describe("resolvePeriod", () => {
  it("starts the month on the Jakarta day, not the UTC one", () => {
    // 31 Aug 17:30 UTC is already 1 Sep in Jakarta.
    const now = new Date("2026-08-31T17:30:00Z");
    expect(resolvePeriod({ preset: "month" }, now)).toEqual({
      from: "2026-09-01",
      to: "2026-09-01",
    });
  });

  it("keeps the month on the current Jakarta day mid-month", () => {
    expect(resolvePeriod({ preset: "month" }, new Date("2026-09-17T02:00:00Z"))).toEqual({
      from: "2026-09-01",
      to: "2026-09-17",
    });
  });

  it("covers the whole previous month, February length included", () => {
    expect(resolvePeriod({ preset: "last_month" }, new Date("2026-03-15T02:00:00Z"))).toEqual({
      from: "2026-02-01",
      to: "2026-02-28",
    });
  });

  it("crosses the year boundary for last_month in January", () => {
    expect(resolvePeriod({ preset: "last_month" }, new Date("2026-01-05T02:00:00Z"))).toEqual({
      from: "2025-12-01",
      to: "2025-12-31",
    });
  });

  it("makes 30d a 30-day inclusive window ending today", () => {
    expect(resolvePeriod({ preset: "30d" }, new Date("2026-09-17T02:00:00Z"))).toEqual({
      from: "2026-08-19",
      to: "2026-09-17",
    });
  });

  it("makes 7d and 90d trailing windows ending today", () => {
    const now = new Date("2026-09-17T02:00:00Z");
    expect(resolvePeriod({ preset: "7d" }, now)).toEqual({ from: "2026-09-11", to: "2026-09-17" });
    expect(resolvePeriod({ preset: "90d" }, now)).toEqual({ from: "2026-06-20", to: "2026-09-17" });
  });

  it("passes a complete custom range through", () => {
    const now = new Date("2026-09-17T02:00:00Z");
    expect(resolvePeriod({ preset: "custom", from: "2026-08-01", to: "2026-08-31" }, now)).toEqual({
      from: "2026-08-01",
      to: "2026-08-31",
    });
  });

  it("falls back to the 30d window when a custom end is missing", () => {
    const now = new Date("2026-09-17T02:00:00Z");
    expect(resolvePeriod({ preset: "custom", from: "2026-08-01" }, now)).toEqual({
      from: "2026-08-19",
      to: "2026-09-17",
    });
  });

  it("asks for all of history with no bounds", () => {
    expect(resolvePeriod({ preset: "all" }, new Date("2026-09-17T02:00:00Z"))).toEqual({});
  });
});

describe("periodLabel", () => {
  it("names a preset", () => {
    expect(periodLabel({ preset: "30d" })).toBe("30 hari");
  });

  it("renders a custom range inside one year without the year", () => {
    expect(periodLabel({ preset: "custom", from: "2026-08-01", to: "2026-08-31" })).toBe(
      "1 Agu – 31 Agu",
    );
  });

  it("carries the year on both ends when the range crosses one", () => {
    expect(periodLabel({ preset: "custom", from: "2025-12-28", to: "2026-01-03" })).toBe(
      "28 Des 2025 – 3 Jan 2026",
    );
  });

  it("falls back to the preset name while a custom range is half-picked", () => {
    expect(periodLabel({ preset: "custom", from: "2026-08-01" })).toBe("Kustom");
  });
});

describe("parsePeriod", () => {
  it("defaults to 30d when the URL says nothing", () => {
    expect(parsePeriod(null, null, null)).toEqual({ preset: "30d" });
  });

  it("rejects an unknown preset", () => {
    expect(parsePeriod("forever", null, null)).toEqual({ preset: "30d" });
  });

  it("keeps a known preset and drops its stale bounds", () => {
    expect(parsePeriod("last_month", "2026-01-01", "2026-01-31")).toEqual({ preset: "last_month" });
  });

  it("carries custom bounds through", () => {
    expect(parsePeriod("custom", "2026-08-01", "2026-08-31")).toEqual({
      preset: "custom",
      from: "2026-08-01",
      to: "2026-08-31",
    });
  });

  it("carries a half-filled custom range through", () => {
    expect(parsePeriod("custom", "2026-08-01", null)).toEqual({
      preset: "custom",
      from: "2026-08-01",
      to: undefined,
    });
  });
});
