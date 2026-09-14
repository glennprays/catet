import { Banknote, Landmark, Smartphone, Wallet, type LucideIcon } from "lucide-react";

const GLYPH_BY_TYPE: Record<string, LucideIcon> = {
  bank: Landmark,
  cash: Banknote,
  ewallet: Smartphone,
  custom: Wallet,
};

export function sourceGlyph(type: string): LucideIcon {
  return GLYPH_BY_TYPE[type] ?? Wallet;
}
