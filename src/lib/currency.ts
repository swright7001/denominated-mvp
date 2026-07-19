export const supportedCurrencyCodes = [
  "USD",
  "EUR",
  "GBP",
  "CHF",
  "JPY",
] as const;

export type CurrencyCode = (typeof supportedCurrencyCodes)[number];

export const defaultCurrencyCode: CurrencyCode = "USD";

export const currencyMetadata: Record<
  CurrencyCode,
  { label: string; locale: string; minorUnits: number }
> = {
  USD: { label: "U.S. dollar", locale: "en-US", minorUnits: 2 },
  EUR: { label: "Euro", locale: "de-DE", minorUnits: 2 },
  GBP: { label: "Pound sterling", locale: "en-GB", minorUnits: 2 },
  CHF: { label: "Swiss franc", locale: "de-CH", minorUnits: 2 },
  JPY: { label: "Japanese yen", locale: "ja-JP", minorUnits: 0 },
};

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return (
    typeof value === "string" &&
    supportedCurrencyCodes.includes(value as CurrencyCode)
  );
}

export function normalizeCurrencyCode(value: unknown): CurrencyCode {
  return isCurrencyCode(value) ? value : defaultCurrencyCode;
}

export function formatCurrency(
  value: number,
  currencyCode: CurrencyCode = defaultCurrencyCode,
  compact = false,
) {
  const metadata = currencyMetadata[currencyCode];

  return new Intl.NumberFormat(metadata.locale, {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "symbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: metadata.minorUnits,
    notation: compact && Math.abs(value) >= 1_000_000 ? "compact" : "standard",
  }).format(value);
}

export function roundCurrencyAmount(
  value: number,
  currencyCode: CurrencyCode = defaultCurrencyCode,
) {
  const factor = 10 ** currencyMetadata[currencyCode].minorUnits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function parseCurrencyInputDraft(
  draft: string,
  currencyCode: CurrencyCode = defaultCurrencyCode,
) {
  const value = draft.trim();
  if (!value) return null;

  const parts = new Intl.NumberFormat(currencyMetadata[currencyCode].locale)
    .formatToParts(12345.6);
  const decimal = parts.find((part) => part.type === "decimal")?.value ?? ".";
  const groups = new Set(
    parts.filter((part) => part.type === "group").map((part) => part.value),
  );
  groups.add(" ");
  groups.add("\u00a0");
  groups.add("\u202f");
  groups.add("'");
  groups.add("’");

  let normalized = value;
  for (const group of groups) {
    normalized = normalized.split(group).join("");
  }

  normalized = normalized
    .replace(new RegExp(`[^0-9+\\-${escapeForCharacterClass(decimal)}]`, "g"), "")
    .replace(decimal, ".");

  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function escapeForCharacterClass(value: string) {
  return value.replace(/[\\\]\-^]/g, "\\$&");
}
