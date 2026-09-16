import {
  ArrowLeftRight,
  Banknote,
  Car,
  Clapperboard,
  GraduationCap,
  HeartPulse,
  Home,
  PiggyBank,
  Receipt,
  ShoppingBag,
  Tag,
  Utensils,
  type LucideIcon,
} from "lucide-react";

/**
 * Keyword → glyph, first hit wins. The generated `Category.icon` field is
 * unused and untyped by the backend, so the Indonesian category *name* is the
 * deterministic source of a glyph until the contract types it.
 */
const RULES: [RegExp, LucideIcon][] = [
  [/makan|minum|kopi|kuliner/, Utensils],
  [/transport|bensin|ojek|parkir/, Car],
  [/belanja|shop/, ShoppingBag],
  [/hiburan|langganan|streaming/, Clapperboard],
  [/tagihan|listrik|air|internet|pulsa/, Receipt],
  [/sehat|obat|dokter/, HeartPulse],
  [/pendidikan|kursus|buku/, GraduationCap],
  [/rumah|sewa|kos/, Home],
  [/gaji|penghasilan|pemasukan|bonus/, Banknote],
  [/transfer|pindah/, ArrowLeftRight],
  [/tabung|investasi/, PiggyBank],
];

export function categoryGlyph(name: string): LucideIcon {
  const key = name.toLowerCase();
  for (const [pattern, icon] of RULES) {
    if (pattern.test(key)) return icon;
  }
  return Tag;
}
