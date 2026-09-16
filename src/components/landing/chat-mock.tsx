import { Check } from "lucide-react";

import { BrandMark } from "@/components/brand";

/**
 * The capture surface, drawn in CSS: a phone showing two WhatsApp exchanges.
 * Money strings are literal here — the mock is copy, not data, so it neither
 * fetches nor masks (DESIGN.md §5 "Landing").
 */
function Bubble({
  side,
  children,
  time,
}: {
  side: "user" | "bot";
  children: React.ReactNode;
  time: string;
}) {
  const user = side === "user";
  return (
    <div className={user ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] text-ink shadow-card ${
          user ? "rounded-br-sm bg-safe-wash" : "rounded-bl-sm bg-surface"
        }`}
      >
        {children}
        <span className="mt-1 block text-right text-[10px] text-ash">{time}</span>
      </div>
    </div>
  );
}

export function ChatMock() {
  return (
    <div className="w-[300px] max-w-full overflow-hidden rounded-[28px] bg-surface shadow-float ring-8 ring-ink/90">
      <div className="flex h-12 items-center gap-2 border-b border-border bg-surface px-3">
        <BrandMark className="size-7" />
        <span className="flex-1 text-[13px] font-semibold text-ink">catet</span>
        <span className="text-[11px] text-safe-text">online</span>
      </div>

      <div className="grid gap-2 bg-surface-200 p-3">
        <Bubble side="user" time="08.14">
          kopi kenangan 25rb
        </Bubble>

        <Bubble side="bot" time="08.14">
          <span className="flex items-start gap-1.5">
            <Check className="mt-0.5 size-3.5 shrink-0 text-safe-text" strokeWidth={2} aria-hidden />
            <span>
              <span className="block">Tercatat: −Rp25.000 · Makanan &amp; Minuman · Cash</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Safe-to-Spend hari ini Rp266.800 · runway 34 hari
              </span>
            </span>
          </span>
        </Bubble>

        <Bubble side="user" time="09.02">
          gaji masuk 8jt
        </Bubble>

        <Bubble side="bot" time="09.02">
          <span className="flex items-start gap-1.5">
            <Check className="mt-0.5 size-3.5 shrink-0 text-safe-text" strokeWidth={2} aria-hidden />
            <span>Tercatat: +Rp8.000.000 · Pemasukan · BCA</span>
          </span>
        </Bubble>
      </div>
    </div>
  );
}
