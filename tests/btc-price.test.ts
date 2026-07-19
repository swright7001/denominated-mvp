import assert from "node:assert/strict";
import test from "node:test";
import {
  BTC_PRICE_BROWSER_CACHE_CONTROL,
  BTC_PRICE_CDN_CACHE_CONTROL,
  BTC_PRICE_FALLBACK_USD,
  BTC_PRICE_VERCEL_CDN_CACHE_CONTROL,
  buildBTCPriceLogEvent,
  buildFallbackBTCPrice,
  getBTCPrice,
  parseCoinGeckoBTCPrice,
  localizeBTCPrice,
} from "../src/lib/btc-price";

test("parseCoinGeckoBTCPrice maps a valid CoinGecko response", () => {
  const fetchedAt = new Date("2026-05-27T22:00:00.000Z");
  const result = parseCoinGeckoBTCPrice(
    {
      bitcoin: {
        usd: 101234.56,
        last_updated_at: fetchedAt.getTime() / 1000,
      },
    },
    fetchedAt,
  );

  assert.equal(result.status, "live");
  assert.equal(result.provider, "CoinGecko");
  assert.equal(result.priceUSD, 101234.56);
  assert.equal(result.lastUpdatedAt, "2026-05-27T22:00:00.000Z");
  assert.equal(result.stale, false);
});

test("parseCoinGeckoBTCPrice flags old provider timestamps as stale", () => {
  const result = parseCoinGeckoBTCPrice(
    {
      bitcoin: {
        usd: 99000,
        last_updated_at: Date.parse("2026-05-27T21:50:00.000Z") / 1000,
      },
    },
    new Date("2026-05-27T22:00:00.000Z"),
  );

  assert.equal(result.stale, true);
});

test("parseCoinGeckoBTCPrice rejects unusable provider payloads", () => {
  assert.throws(
    () => parseCoinGeckoBTCPrice({ bitcoin: { usd: 0 } }),
    /usable BTC\/USD price/,
  );
});

test("buildFallbackBTCPrice returns the editable default price", () => {
  const result = buildFallbackBTCPrice(
    "network unavailable",
    new Date("2026-05-27T22:00:00.000Z"),
  );

  assert.equal(result.status, "fallback");
  assert.equal(result.priceUSD, BTC_PRICE_FALLBACK_USD);
  assert.equal(result.error, "network unavailable");
  assert.equal(result.stale, true);
});

test("getBTCPrice falls back when the provider request fails", async () => {
  const result = await getBTCPrice({
    fetchedAt: new Date("2026-05-27T22:00:00.000Z"),
    fetcher: (async () => {
      throw new Error("network unavailable");
    }) as typeof fetch,
  });

  assert.equal(result.status, "fallback");
  assert.equal(result.priceUSD, BTC_PRICE_FALLBACK_USD);
  assert.equal(result.error, "network unavailable");
});

test("getBTCPrice maps a provider response with injected fetch", async () => {
  const fetchedAt = new Date("2026-05-27T22:00:00.000Z");
  const result = await getBTCPrice({
    fetchedAt,
    fetcher: (async () =>
      Response.json({
        bitcoin: {
          usd: 101000,
          last_updated_at: fetchedAt.getTime() / 1000,
        },
      })) as typeof fetch,
  });

  assert.equal(result.status, "live");
  assert.equal(result.priceUSD, 101000);
  assert.equal(result.stale, false);
});

test("BTC price localizes through official EUR-base cross rates", async () => {
  const usdPrice = parseCoinGeckoBTCPrice(
    { bitcoin: { usd: 110000, last_updated_at: 1784354400 } },
    new Date("2026-07-18T12:00:00.000Z"),
  );
  const localized = await localizeBTCPrice(usdPrice, "GBP", async () => ({
    ratesPerEUR: { USD: 1.1, EUR: 1, GBP: 0.85, CHF: 0.95, JPY: 180 },
    observedAt: "2026-07-17",
    fetchedAt: "2026-07-18T12:00:00.000Z",
    status: "live",
    provider: "European Central Bank",
    sourceUrl: "https://data-api.ecb.europa.eu",
    stale: false,
  }));

  assert.equal(localized.currencyCode, "GBP");
  assert.ok(Math.abs(localized.price - 85000) < 1e-10);
  assert.equal(localized.fiatRateStatus, "live");
  assert.equal(localized.manualPriceRequired, undefined);
});

test("buildBTCPriceLogEvent returns structured route log data", () => {
  const price = buildFallbackBTCPrice(
    "network unavailable",
    new Date("2026-05-27T22:00:00.000Z"),
  );
  const event = buildBTCPriceLogEvent(price);

  assert.equal(event.event, "btc_price_lookup");
  assert.equal(event.status, "fallback");
  assert.equal(event.errorCode, "provider_unavailable");
  assert.equal("error" in event, false);
});

test("BTC cache control separates browser and CDN caching", () => {
  assert.match(BTC_PRICE_BROWSER_CACHE_CONTROL, /max-age=0/);
  assert.match(BTC_PRICE_CDN_CACHE_CONTROL, /s-maxage=60/);
  assert.match(BTC_PRICE_CDN_CACHE_CONTROL, /stale-while-revalidate=240/);
  assert.match(BTC_PRICE_VERCEL_CDN_CACHE_CONTROL, /max-age=60/);
  assert.match(
    BTC_PRICE_VERCEL_CDN_CACHE_CONTROL,
    /stale-while-revalidate=240/,
  );
});
