import {
  defaultCurrencyCode,
  normalizeCurrencyCode,
  supportedCurrencyCodes,
  type CurrencyCode,
} from "./currency";

export const ECB_REFERENCE_RATE_URL =
  "https://data-api.ecb.europa.eu/service/data/EXR/D.USD+GBP+CHF+JPY.EUR.SP00.A?format=jsondata&lastNObservations=1&detail=dataonly";
export const FIAT_RATE_REVALIDATE_SECONDS = 6 * 60 * 60;
export const FIAT_RATE_STALE_AFTER_SECONDS = 48 * 60 * 60;
export const FIAT_RATE_FETCH_TIMEOUT_MS = 4_500;

export type FiatRateStatus = "live" | "stale" | "fallback" | "manual";

export type FiatRateObservation = {
  ratesPerEUR: Record<CurrencyCode, number>;
  observedAt: string;
  fetchedAt: string;
  status: Exclude<FiatRateStatus, "manual">;
  provider: "European Central Bank";
  sourceUrl: string;
  stale: boolean;
  error?: string;
};

type FiatRateFetch = typeof fetch;
type EcbPayload = {
  dataSets?: Array<{
    series?: Record<string, { observations?: Record<string, [number?]> }>;
  }>;
  structure?: {
    dimensions?: {
      series?: Array<{
        id?: string;
        values?: Array<{ id?: string }>;
      }>;
      observation?: Array<{
        id?: string;
        values?: Array<{ id?: string }>;
      }>;
    };
  };
};

let lastKnownObservation: FiatRateObservation | null = null;

export async function getFiatReferenceRates({
  fetcher = fetch,
  fetchedAt = new Date(),
}: {
  fetcher?: FiatRateFetch;
  fetchedAt?: Date;
} = {}): Promise<FiatRateObservation> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FIAT_RATE_FETCH_TIMEOUT_MS);

  try {
    const requestOptions = {
      signal: controller.signal,
      headers: { Accept: "application/vnd.sdmx.data+json;version=1.0.0-wd" },
      next: {
        revalidate: FIAT_RATE_REVALIDATE_SECONDS,
        tags: ["fiat-reference-rates"],
      },
    };
    const response = await fetcher(ECB_REFERENCE_RATE_URL, requestOptions);

    if (!response.ok) {
      throw new Error(`ECB responded with ${response.status}`);
    }

    const observation = parseEcbReferenceRates(await response.json(), fetchedAt);
    lastKnownObservation = observation;
    return observation;
  } catch (error) {
    if (lastKnownObservation) {
      return {
        ...lastKnownObservation,
        fetchedAt: fetchedAt.toISOString(),
        status: "fallback",
        stale: isObservationStale(lastKnownObservation.observedAt, fetchedAt),
        error: getErrorMessage(error),
      };
    }

    return buildFallbackFiatRates(getErrorMessage(error), fetchedAt);
  } finally {
    clearTimeout(timeout);
  }
}

export function parseEcbReferenceRates(
  payload: unknown,
  fetchedAt = new Date(),
): FiatRateObservation {
  const data = payload as EcbPayload;
  const seriesDimensions = data.structure?.dimensions?.series ?? [];
  const currencyDimensionIndex = seriesDimensions.findIndex(
    (dimension) => dimension.id === "CURRENCY",
  );
  const currencies = seriesDimensions[currencyDimensionIndex]?.values ?? [];
  const series = data.dataSets?.[0]?.series ?? {};
  const observedAt = data.structure?.dimensions?.observation
    ?.find((dimension) => dimension.id === "TIME_PERIOD")
    ?.values?.at(-1)?.id;

  if (currencyDimensionIndex < 0 || !observedAt) {
    throw new Error("ECB response did not include currency dimensions");
  }

  const rates: Partial<Record<CurrencyCode, number>> = { EUR: 1 };

  for (const [seriesKey, entry] of Object.entries(series)) {
    const dimensionIndexes = seriesKey.split(":").map(Number);
    const code = currencies[dimensionIndexes[currencyDimensionIndex]]?.id;
    const value = Object.values(entry.observations ?? {})[0]?.[0];

    if (code && supportedCurrencyCodes.includes(code as CurrencyCode)) {
      if (Number.isFinite(value) && Number(value) > 0) {
        rates[code as CurrencyCode] = Number(value);
      }
    }
  }

  for (const code of supportedCurrencyCodes) {
    if (!rates[code]) throw new Error(`ECB response did not include ${code}`);
  }

  const stale = isObservationStale(observedAt, fetchedAt);
  return {
    ratesPerEUR: rates as Record<CurrencyCode, number>,
    observedAt,
    fetchedAt: fetchedAt.toISOString(),
    status: stale ? "stale" : "live",
    provider: "European Central Bank",
    sourceUrl: ECB_REFERENCE_RATE_URL,
    stale,
  };
}

export function convertCurrency(
  value: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  ratesPerEUR: Record<CurrencyCode, number>,
) {
  if (fromCurrency === toCurrency) return value;
  return (value / ratesPerEUR[fromCurrency]) * ratesPerEUR[toCurrency];
}

export function convertUsdReferencePrice(
  priceUSD: number,
  currencyCode: CurrencyCode,
  ratesPerEUR: Record<CurrencyCode, number>,
) {
  return convertCurrency(priceUSD, defaultCurrencyCode, currencyCode, ratesPerEUR);
}

export function buildFallbackFiatRates(
  error: string,
  fetchedAt = new Date(),
): FiatRateObservation {
  return {
    ratesPerEUR: { USD: 1, EUR: 1, GBP: 1, CHF: 1, JPY: 1 },
    observedAt: fetchedAt.toISOString().slice(0, 10),
    fetchedAt: fetchedAt.toISOString(),
    status: "fallback",
    provider: "European Central Bank",
    sourceUrl: ECB_REFERENCE_RATE_URL,
    stale: true,
    error,
  };
}

export function isObservationStale(observedAt: string, now = new Date()) {
  const observedTime = new Date(`${observedAt}T23:59:59Z`).getTime();
  return now.getTime() - observedTime > FIAT_RATE_STALE_AFTER_SECONDS * 1000;
}

export function parseRequestedCurrency(value: unknown) {
  return normalizeCurrencyCode(value);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to fetch ECB rates";
}
