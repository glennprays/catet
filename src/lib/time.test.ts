import { describe, expect, it } from "vitest";

import { dateTimeLabel, daysUntilJakarta, jakartaDateKey, shortDateLabel, todayJakartaKey } from "./time";

describe("jakartaDateKey", () => {
  it("rolls an evening UTC instant into the next Jakarta day", () => {
    expect(jakartaDateKey("2026-09-08T17:30:00Z")).toBe("2026-09-09");
  });

  it("keeps a morning UTC instant on the same Jakarta day", () => {
    expect(jakartaDateKey("2026-09-08T01:00:00Z")).toBe("2026-09-08");
  });
});

describe("dateTimeLabel", () => {
  it("ends with WIB", () => {
    expect(dateTimeLabel("2026-09-08T05:00:00Z").endsWith("WIB")).toBe(true);
  });

  it("renders the Jakarta clock time, not UTC", () => {
    expect(dateTimeLabel("2026-09-08T05:00:00Z")).toContain("12.00");
  });
});

describe("shortDateLabel", () => {
  it("renders day, short month, and year", () => {
    expect(shortDateLabel("2026-09-08T05:00:00Z")).toBe("8 Sep 2026");
  });
});

describe("daysUntilJakarta", () => {
  it("returns 0 for today", () => {
    expect(daysUntilJakarta(todayJakartaKey())).toBe(0);
  });

  it("counts whole days across a month boundary", () => {
    expect(daysUntilJakarta("2026-10-01") - daysUntilJakarta("2026-09-28")).toBe(3);
  });
});
