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
  priceUSD: number;
  fallbackPriceUSD: number;
  fetchedAt: string;
  lastUpdatedAt: string | null;
  stale: boolean;
  staleAfterSeconds: number;
  sourceUrl: string;
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
};

export async function getBTCPrice({
  fetcher = fetch,
  fetchedAt = new Date(),
}: GetBTCPriceOptions = {}): Promise<BTCPriceResult> {
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
    const response = await fetcher(requestUrl, {
      headers,
      signal: controller.signal,
      next: {
        revalidate: BTC_PRICE_REVALIDATE_SECONDS,
        tags: ["btc-price"],
      },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko responded with ${response.status}`);
    }

    return parseCoinGeckoBTCPrice(await response.json(), fetchedAt);
  } catch (error) {
    return buildFallbackBTCPrice(getErrorMessage(error), fetchedAt);
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
    priceUSD,
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
    priceUSD: BTC_PRICE_FALLBACK_USD,
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
    priceUSD: price.priceUSD,
    fetchedAt: price.fetchedAt,
    lastUpdatedAt: price.lastUpdatedAt,
    staleAfterSeconds: price.staleAfterSeconds,
    sourceUrl: price.sourceUrl,
    errorCode: price.error ? "provider_unavailable" : null,
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to fetch BTC/USD price";
}
