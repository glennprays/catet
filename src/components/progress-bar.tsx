const FILL = {
  safe: "bg-safe",
  warn: "bg-warn",
  over: "bg-over",
} as const;

/** Budget/goal progress with a real progressbar role. */
export function ProgressBar({
  ratio,
  tone,
  label,
}: {
  ratio: number;
  tone: keyof typeof FILL;
  label: string;
}) {
  const pct = Math.min(100, Math.max(0, Math.round(ratio * 100)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-300"
    >
      <div className={`h-full rounded-full ${FILL[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
