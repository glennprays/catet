/**
 * The window every list and chart asks the API for. A period is a pair of
 * Jakarta calendar days (`yyyy-MM-dd`, `to` inclusive) — the same shape the
 * backend's range resolver speaks — so the arithmetic here is done on
 * calendar keys, never on UTC `Date` offsets that would slip a day for a
 * browser sitting west of WIB.
 */

import { jakartaDateKey } from "./time";

export type PeriodPreset = "7d" | "30d" | "month" | "last_month" | "90d" | "custom" | "all";

export const PERIOD_LABELS: Record<PeriodPreset, string> = {
  "7d": "7 hari",
  "30d": "30 hari",
  month: "Bulan ini",
  last_month: "Bulan lalu",
  "90d": "90 hari",
  custom: "Kustom",
  all: "Semua",
};

/** A chosen window: `from`/`to` are Jakarta `yyyy-MM-dd` and only meaningful for `custom`. */
export type Period = { preset: PeriodPreset; from?: string; to?: string };

/** What the API takes; both ends absent means "all of history". */
export type PeriodRange = { from?: string; to?: string };

const DAY_MS = 86_400_000;

/** Default when the URL says nothing, or says something we do not know. */
const FALLBACK_PRESET: PeriodPreset = "30d";

const rangeDayFmt = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "numeric",
  month: "short",
});

const rangeDayYearFmt = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Moves a Jakarta day key by whole days. The key is already a calendar
 * date, so anchoring it at UTC midnight makes the shift exact — no DST or
 * offset can bend a whole-day step.
 */
function shiftKey(key: string, days: number): string {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day) + days * DAY_MS).toISOString().slice(0, 10);
}

/** First day of the month the key falls in. */
function monthStart(key: string): string {
  return `${key.slice(0, 7)}-01`;
}

/** Trailing window of `days` days ending today, matching the backend's convention. */
function trailing(today: string, days: number): PeriodRange {
  return { from: shiftKey(today, -(days - 1)), to: today };
}

function isPreset(value: string): value is PeriodPreset {
  return Object.prototype.hasOwnProperty.call(PERIOD_LABELS, value);
}

/**
 * The concrete Jakarta window for a period. A `custom` period missing an
 * end is not an error the user should see — it resolves to the default
 * window until they pick both dates.
 */
export function resolvePeriod(p: Period, now: Date = new Date()): PeriodRange {
  const today = jakartaDateKey(now);
  switch (p.preset) {
    case "all":
      return {};
    case "custom":
      return p.from !== undefined && p.to !== undefined
        ? { from: p.from, to: p.to }
        : trailing(today, 30);
    case "month":
      return { from: monthStart(today), to: today };
    case "last_month": {
      const end = shiftKey(monthStart(today), -1);
      return { from: monthStart(end), to: end };
    }
    case "7d":
      return trailing(today, 7);
    case "90d":
      return trailing(today, 90);
    case "30d":
      return trailing(today, 30);
  }
}

/** "30 hari" for presets, "1 Agu – 31 Agu" once a custom range is complete. */
export function periodLabel(p: Period): string {
  if (p.preset !== "custom" || p.from === undefined || p.to === undefined) {
    return PERIOD_LABELS[p.preset];
  }
  const fmt = p.from.slice(0, 4) === p.to.slice(0, 4) ? rangeDayFmt : rangeDayYearFmt;
  // UTC midnight of a calendar key falls on that same day in Jakarta (UTC+7).
  const from = fmt.format(new Date(`${p.from}T00:00:00Z`));
  const to = fmt.format(new Date(`${p.to}T00:00:00Z`));
  return `${from} – ${to}`;
}

/**
 * Reads a period out of URL search params. An unknown preset falls back to
 * the default window; a half-filled custom range is carried through so the
 * picker can stay open on it.
 */
export function parsePeriod(
  preset: string | null,
  from: string | null,
  to: string | null,
): Period {
  if (preset === null || !isPreset(preset)) return { preset: FALLBACK_PRESET };
  if (preset !== "custom") return { preset };
  return { preset, from: from ?? undefined, to: to ?? undefined };
}
