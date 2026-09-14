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

function jakartaDateKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

/** "08.14" in Asia/Jakarta. */
export function timeLabel(iso: string): string {
  return timeFmt.format(new Date(iso)).replace(":", ".");
}

/** Day label: Hari ini / Kemarin / Senin, 12 Agt. */
export function dayLabel(iso: string): string {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date());
  const key = jakartaDateKey(iso);
  if (key === today) {
    return "Hari ini";
  }
  const yesterday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date(Date.now() - 86_400_000));
  if (key === yesterday) {
    return "Kemarin";
  }
  return `${weekdayFmt.format(new Date(iso))}, ${dayFmt.format(new Date(iso))}`;
}
