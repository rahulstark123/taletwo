import { countries as countryData } from "countries-list";

/**
 * Countries and currencies a couple can choose from. Client-safe.
 *
 * Countries come from the open-source `countries-list` package (MIT): ISO 3166-1 codes, names and each
 * country's ISO 4217 currency. Currency names come from the browser's built-in Intl data, so every
 * currency in the standard list is available, with its name in English.
 */

export interface CountryOption {
  code: string;
  name: string;
  currency: string;
}

export const COUNTRIES: CountryOption[] = Object.entries(countryData)
  .map(([code, info]) => ({ code, name: info.name, currency: info.currency[0] ?? "" }))
  .filter((c) => Boolean(c.currency))
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

const currencyNames = new Intl.DisplayNames(["en"], { type: "currency" });

function allCurrencyCodes(): string[] {
  try {
    return Intl.supportedValuesOf("currency");
  } catch {
    return [...new Set(COUNTRIES.map((c) => c.currency))];
  }
}

export const CURRENCIES: { code: string; name: string }[] = allCurrencyCodes()
  .map((code) => ({ code, name: currencyNames.of(code) ?? code }))
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

export const DEFAULT_COUNTRY = "IN";
export const DEFAULT_CURRENCY = "INR";

export function currencyForCountry(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.currency ?? DEFAULT_CURRENCY;
}

/** Formats an amount in whole units of the given currency, e.g. ₹1,200 or $1,200. */
export function formatMoney(amount: number, currency: string): string {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(locale)}`;
  }
}

/** The symbol only, for input labels, e.g. ₹ or $. */
export function currencySymbol(currency: string): string {
  try {
    const part = new Intl.NumberFormat("en-US", { style: "currency", currency }).formatToParts(0).find((p) => p.type === "currency");
    return part?.value ?? currency;
  } catch {
    return currency;
  }
}
