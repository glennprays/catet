/**
 * Every date the dashboard renders or sends is a Jakarta date. The
 * ledger's day boundaries (Safe-to-Spend, daily allowance, bill due
 * dates) are defined in Asia/Jakarta, so formatting in the browser's
 * timezone would silently move money between days.
 */

const timeFmt = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
});

const dayFmt = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "numeric",
  month: "short",
});

const weekdayFmt = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  weekday: "long",
});

const shortDateFmt = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateKeyFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** `yyyy-MM-dd` of the instant as seen in Jakarta. */
export function jakartaDateKey(iso: string | Date): string {
  return dateKeyFmt.format(new Date(iso));
}

/** Today's `yyyy-MM-dd` in Jakarta. */
export function todayJakartaKey(): string {
  return dateKeyFmt.format(new Date());
}

/** Arbitrary Jakarta-pinned formatting for one-off layouts. */
export function formatJakartaDate(iso: string | Date, opts: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("id-ID", { ...opts, timeZone: "Asia/Jakarta" }).format(
    new Date(iso),
  );
}

/** "08.14" in Asia/Jakarta. Accepts epoch millis for cache timestamps. */
export function timeLabel(iso: string | number | Date): string {
  return timeFmt.format(new Date(iso)).replace(":", ".");
}

/** "8 Sep 2026" in Asia/Jakarta. */
export function shortDateLabel(iso: string | Date): string {
  return shortDateFmt.format(new Date(iso));
}

/** "Sel, 8 Sep 2026 · 12.00 WIB" — absolute timestamps always carry WIB. */
export function dateTimeLabel(iso: string | Date): string {
  return `${dateTimeFmt.format(new Date(iso))} · ${timeLabel(iso)} WIB`;
}

/** Day label: Hari ini / Kemarin / Senin, 12 Agt. */
export function dayLabel(iso: string | Date): string {
  const key = jakartaDateKey(iso);
  if (key === todayJakartaKey()) {
    return "Hari ini";
  }
  if (key === jakartaDateKey(new Date(Date.now() - 86_400_000))) {
    return "Kemarin";
  }
  return `${weekdayFmt.format(new Date(iso))}, ${dayFmt.format(new Date(iso))}`;
}

/**
 * Whole days from today to a date, in Jakarta. Accepts either a
 * `yyyy-MM-dd` key or a full instant (the API sends both shapes).
 * Negative = in the past.
 */
export function daysUntilJakarta(date: string | Date): number {
  const key = /^\d{4}-\d{2}-\d{2}$/.test(String(date)) ? String(date) : jakartaDateKey(date);
  const target = Date.parse(`${key}T00:00:00+07:00`);
  const today = Date.parse(`${todayJakartaKey()}T00:00:00+07:00`);
  return Math.round((target - today) / 86_400_000);
}
