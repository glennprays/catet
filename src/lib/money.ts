const idrFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

/**
 * formatIDR renders minor units as Indonesian rupiah per DESIGN.md §3:
 * `Rp8.003.500`, negative with a true minus sign (`−Rp685.000`).
 */
export function formatIDR(minor: number): string {
  const abs = idrFormatter.format(Math.abs(minor));
  return minor < 0 ? `−Rp${abs}` : `Rp${abs}`;
}

/** signed variant: shows `+` for positive income amounts. */
export function formatSignedIDR(minor: number): string {
  if (minor > 0) {
    return `+${formatIDR(minor)}`;
  }
  return formatIDR(minor);
}

/**
 * parseAmountToMinor converts user input ("25.000", "25000", "25 000")
 * into minor units. Digits are grouped as thousands separators in IDR,
 * so stripping non-digits is the parse. Returns null when the input
 * holds no digits.
 */
export function parseAmountToMinor(input: string): number | null {
  const digits = input.replace(/[^\d]/g, "");
  if (digits === "") {
    return null;
  }
  return Number.parseInt(digits, 10);
}

/** Parses an IDR amount while preserving an optional leading minus sign. */
export function parseSignedAmountToMinor(input: string): number | null {
  const amount = parseAmountToMinor(input);
  if (amount === null) {
    return null;
  }
  return /^\s*[-−]/.test(input) ? -amount : amount;
}
