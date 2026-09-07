import {
  defaultCurrencyCode,
  normalizeCurrencyCode,
  type CurrencyCode,
} from "./currency";
import {
  convertUsdReferencePrice,
  getFiatReferenceRates,
  type FiatRateObservation,
  type FiatRateStatus,
} from "./fiat-rates";

const COINGECKO_SIMPLE_PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price";

export const BTC_PRICE_FALLBACK_USD = 80000;
export const BTC_PRICE_REVALIDATE_SECONDS = 60;
export const BTC_PRICE_STALE_AFTER_SECONDS = 5 * 60;
export const BTC_PRICE_STALE_WHILE_REVALIDATE_SECONDS = 4 * 60;
export const BTC_PRICE_FETCH_TIMEOUT_MS = 4500;
export const BTC_PRICE_BROWSER_CACHE_CONTROL =
  "public, max-age=0, must-revalidate";
export const BTC_PRICE_CDN_CACHE_CONTROL = `public, s-maxage=${BTC_PRICE_REVALIDATE_SECONDS}, stale-while-revalidate=${BTC_PRICE_STALE_WHILE_REVALIDATE_SECONDS}`;
export const BTC_PRICE_VERCEL_CDN_CACHE_CONTROL = `public, max-age=${BTC_PRICE_REVALIDATE_SECONDS}, stale-while-revalidate=${BTC_PRICE_STALE_WHILE_REVALIDATE_SECONDS}`;

export type BTCPriceResult = {
  status: "live" | "fallback";
  provider: "CoinGecko";
  currencyCode: CurrencyCode;
  price: number;
  priceUSD: number;
  fallbackPrice: number;
  fallbackPriceUSD: number;
  fetchedAt: string;
  lastUpdatedAt: string | null;
  stale: boolean;
  staleAfterSeconds: number;
  sourceUrl: string;
  fiatRateStatus?: FiatRateStatus;
  fiatRateProvider?: "European Central Bank";
  fiatRateObservedAt?: string;
  fiatRateSourceUrl?: string;
  manualPriceRequired?: boolean;
  error?: string;
};

type CoinGeckoSimplePriceResponse = {
  bitcoin?: {
    usd?: number;
    last_updated_at?: number;
  };
};

type BTCPriceFetch = typeof fetch;

type GetBTCPriceOptions = {
  fetcher?: BTCPriceFetch;
  fetchedAt?: Date;
  currencyCode?: CurrencyCode;
  fiatRateFetcher?: () => Promise<FiatRateObservation>;
};

export async function getBTCPrice({
  fetcher = fetch,
  fetchedAt = new Date(),
  currencyCode = defaultCurrencyCode,
  fiatRateFetcher = () => getFiatReferenceRates({ fetchedAt }),
}: GetBTCPriceOptions = {}): Promise<BTCPriceResult> {
  const normalizedCurrency = normalizeCurrencyCode(currencyCode);
  const requestUrl = new URL(COINGECKO_SIMPLE_PRICE_URL);
  requestUrl.searchParams.set("ids", "bitcoin");
  requestUrl.searchParams.set("vs_currencies", "usd");
  requestUrl.searchParams.set("include_last_updated_at", "true");

  const apiKey = process.env.COINGECKO_API_KEY;
  const headers = apiKey ? { "x-cg-demo-api-key": apiKey } : undefined;
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    BTC_PRICE_FETCH_TIMEOUT_MS,
  );

  try {
    const requestOptions = {
      headers,
      signal: controller.signal,
      next: {
        revalidate: BTC_PRICE_REVALIDATE_SECONDS,
        tags: ["btc-price"],
      },
    };
    const response = await fetcher(requestUrl, requestOptions);

    if (!response.ok) {
      throw new Error(`CoinGecko responded with ${response.status}`);
    }

    const usdPrice = parseCoinGeckoBTCPrice(await response.json(), fetchedAt);
    return await localizeBTCPrice(usdPrice, normalizedCurrency, fiatRateFetcher);
  } catch (error) {
    const fallback = buildFallbackBTCPrice(getErrorMessage(error), fetchedAt);
    return await localizeBTCPrice(fallback, normalizedCurrency, fiatRateFetcher);
  } finally {
    clearTimeout(timeout);
  }
}

export function parseCoinGeckoBTCPrice(
  payload: unknown,
  fetchedAt = new Date(),
): BTCPriceResult {
  const data = payload as CoinGeckoSimplePriceResponse;
  const priceUSD = data.bitcoin?.usd;

  if (!Number.isFinite(priceUSD) || !priceUSD || priceUSD <= 0) {
    throw new Error("CoinGecko response did not include a usable BTC/USD price");
  }

  const lastUpdatedAt = data.bitcoin?.last_updated_at
    ? new Date(data.bitcoin.last_updated_at * 1000)
    : null;

  return {
    status: "live",
    provider: "CoinGecko",
    currencyCode: "USD",
    price: priceUSD,
    priceUSD,
    fallbackPrice: BTC_PRICE_FALLBACK_USD,
    fallbackPriceUSD: BTC_PRICE_FALLBACK_USD,
    fetchedAt: fetchedAt.toISOString(),
    lastUpdatedAt: lastUpdatedAt?.toISOString() ?? null,
    stale: lastUpdatedAt
      ? fetchedAt.getTime() - lastUpdatedAt.getTime() >
        BTC_PRICE_STALE_AFTER_SECONDS * 1000
      : true,
    staleAfterSeconds: BTC_PRICE_STALE_AFTER_SECONDS,
    sourceUrl: COINGECKO_SIMPLE_PRICE_URL,
  };
}

export function buildFallbackBTCPrice(
  error: string,
  fetchedAt = new Date(),
): BTCPriceResult {
  return {
    status: "fallback",
    provider: "CoinGecko",
    currencyCode: "USD",
    price: BTC_PRICE_FALLBACK_USD,
    priceUSD: BTC_PRICE_FALLBACK_USD,
    fallbackPrice: BTC_PRICE_FALLBACK_USD,
    fallbackPriceUSD: BTC_PRICE_FALLBACK_USD,
    fetchedAt: fetchedAt.toISOString(),
    lastUpdatedAt: null,
    stale: true,
    staleAfterSeconds: BTC_PRICE_STALE_AFTER_SECONDS,
    sourceUrl: COINGECKO_SIMPLE_PRICE_URL,
    error,
  };
}

export function buildBTCPriceLogEvent(price: BTCPriceResult) {
  return {
    event: "btc_price_lookup",
    provider: price.provider,
    status: price.status,
    stale: price.stale,
    currencyCode: price.currencyCode,
    price: price.price,
    priceUSD: price.priceUSD,
    fetchedAt: price.fetchedAt,
    lastUpdatedAt: price.lastUpdatedAt,
    staleAfterSeconds: price.staleAfterSeconds,
    sourceUrl: price.sourceUrl,
    fiatRateStatus: price.fiatRateStatus,
    fiatRateObservedAt: price.fiatRateObservedAt,
    manualPriceRequired: price.manualPriceRequired,
    errorCode: price.error ? "provider_unavailable" : undefined,
  };
}

export async function localizeBTCPrice(
  usdPrice: BTCPriceResult,
  currencyCode: CurrencyCode,
  fiatRateFetcher: () => Promise<FiatRateObservation>,
): Promise<BTCPriceResult> {
  if (currencyCode === "USD") return usdPrice;

  const fiatRates = await fiatRateFetcher();
  const unavailable = fiatRates.status === "fallback" && fiatRates.error;

  if (unavailable) {
    return {
      ...usdPrice,
      currencyCode,
      fiatRateStatus: "manual",
      fiatRateProvider: fiatRates.provider,
      fiatRateObservedAt: fiatRates.observedAt,
      fiatRateSourceUrl: fiatRates.sourceUrl,
      manualPriceRequired: true,
      stale: true,
      error: [usdPrice.error, fiatRates.error].filter(Boolean).join("; "),
    };
  }

  const price = convertUsdReferencePrice(
    usdPrice.priceUSD,
    currencyCode,
    fiatRates.ratesPerEUR,
  );
  const fallbackPrice = convertUsdReferencePrice(
    usdPrice.fallbackPriceUSD,
    currencyCode,
    fiatRates.ratesPerEUR,
  );

  return {
    ...usdPrice,
    currencyCode,
    price,
    fallbackPrice,
    fiatRateStatus: fiatRates.status,
    fiatRateProvider: fiatRates.provider,
    fiatRateObservedAt: fiatRates.observedAt,
    fiatRateSourceUrl: fiatRates.sourceUrl,
    stale: usdPrice.stale || fiatRates.stale,
    error: [usdPrice.error, fiatRates.error].filter(Boolean).join("; ") || undefined,
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to fetch BTC/USD price";
}
