import assert from "node:assert/strict";
import test from "node:test";
import {
  BTC_PRICE_FALLBACK_USD,
  buildFallbackBTCPrice,
  parseCoinGeckoBTCPrice,
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
