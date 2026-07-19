import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFallbackFiatRates,
  convertCurrency,
  getFiatReferenceRates,
  isObservationStale,
  parseEcbReferenceRates,
} from "../src/lib/fiat-rates";

const payload = {
  dataSets: [
    {
      series: {
        "0:0:0:0:0": { observations: { "0": [0.95] } },
        "0:1:0:0:0": { observations: { "0": [0.85] } },
        "0:2:0:0:0": { observations: { "0": [180] } },
        "0:3:0:0:0": { observations: { "0": [1.1] } },
      },
    },
  ],
  structure: {
    dimensions: {
      series: [
        { id: "FREQ", values: [{ id: "D" }] },
        {
          id: "CURRENCY",
          values: [{ id: "CHF" }, { id: "GBP" }, { id: "JPY" }, { id: "USD" }],
        },
        { id: "CURRENCY_DENOM", values: [{ id: "EUR" }] },
        { id: "EXR_TYPE", values: [{ id: "SP00" }] },
        { id: "EXR_SUFFIX", values: [{ id: "A" }] },
      ],
      observation: [
        { id: "TIME_PERIOD", values: [{ id: "2026-07-17" }] },
      ],
    },
  },
};

test("ECB payload maps EUR-base rates and supports cross-rate conversion", () => {
  const result = parseEcbReferenceRates(payload, new Date("2026-07-18T12:00:00Z"));
  assert.deepEqual(result.ratesPerEUR, {
    USD: 1.1,
    EUR: 1,
    GBP: 0.85,
    CHF: 0.95,
    JPY: 180,
  });
  assert.ok(
    Math.abs(convertCurrency(110, "USD", "EUR", result.ratesPerEUR) - 100) <
      1e-10,
  );
  assert.ok(
    Math.abs(
      convertCurrency(110, "USD", "JPY", result.ratesPerEUR) - 18000,
    ) < 1e-10,
  );
});

test("weekend observations stay usable until the 48-hour threshold", () => {
  assert.equal(isObservationStale("2026-07-17", new Date("2026-07-19T12:00:00Z")), false);
  assert.equal(isObservationStale("2026-07-17", new Date("2026-07-20T12:00:00Z")), true);
});

test("provider outages return an explicit fallback state", async () => {
  const result = await getFiatReferenceRates({
    fetchedAt: new Date("2026-07-18T12:00:00Z"),
    fetcher: async () => {
      throw new Error("offline");
    },
  });
  assert.equal(result.status, "fallback");
  assert.equal(result.stale, true);
  assert.match(result.error ?? "", /offline/);
});

test("fallback rates never claim to be executable quotes", () => {
  const result = buildFallbackFiatRates("offline");
  assert.equal(result.provider, "European Central Bank");
  assert.equal(result.status, "fallback");
});
