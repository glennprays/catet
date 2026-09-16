import { Banknote, Landmark, Smartphone, Wallet, type LucideIcon } from "lucide-react";

import type { Source } from "@/lib/api/hooks";

const GLYPH_BY_TYPE: Record<string, LucideIcon> = {
  bank: Landmark,
  cash: Banknote,
  ewallet: Smartphone,
  custom: Wallet,
};

/** One vocabulary for source types — rail, rows, and the create form. */
export const SOURCE_TYPE_LABEL: Record<Source["type"], string> = {
  bank: "Bank",
  cash: "Tunai",
  ewallet: "E-Wallet",
  custom: "Lainnya",
};

export function sourceGlyph(type: string): LucideIcon {
  return GLYPH_BY_TYPE[type] ?? Wallet;
}
