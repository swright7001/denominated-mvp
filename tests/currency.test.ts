import assert from "node:assert/strict";
import test from "node:test";
import {
  formatCurrency,
  normalizeCurrencyCode,
  parseCurrencyInputDraft,
} from "../src/lib/currency";
import { calculateScenario } from "../src/lib/calculations";
import { defaultScenario } from "../src/lib/scenarios";

test("unsupported and missing currency codes migrate to USD", () => {
  assert.equal(normalizeCurrencyCode(undefined), "USD");
  assert.equal(normalizeCurrencyCode("CAD"), "USD");
  assert.equal(normalizeCurrencyCode("EUR"), "EUR");
});

test("locale currency input accepts supported decimal and group separators", () => {
  assert.equal(parseCurrencyInputDraft("41,000.50", "USD"), 41000.5);
  assert.equal(parseCurrencyInputDraft("41.000,50 EUR", "EUR"), 41000.5);
  assert.equal(parseCurrencyInputDraft("CHF 41’000.50", "CHF"), 41000.5);
  assert.equal(parseCurrencyInputDraft("￥41,000", "JPY"), 41000);
  assert.equal(parseCurrencyInputDraft("not a price", "GBP"), null);
});

test("currency formatting preserves precision rules at display boundaries", () => {
  assert.match(formatCurrency(41000.5, "USD"), /41,000\.5/);
  assert.match(formatCurrency(41000.5, "EUR"), /41\.000,5/);
  assert.equal(formatCurrency(41000.5, "JPY").includes(".5"), false);
});

test("formula parity holds when both fiat values use the same cross rate", () => {
  const usd = calculateScenario({ ...defaultScenario, currencyCode: "USD" });
  const eur = calculateScenario({
    ...defaultScenario,
    currencyCode: "EUR",
    currentItemPriceUSD: defaultScenario.currentItemPriceUSD * 0.92,
    currentBTCPriceUSD: defaultScenario.currentBTCPriceUSD * 0.92,
  });

  assert.ok(Math.abs(usd.currentItemCostBTC - eur.currentItemCostBTC) < 1e-12);
  assert.ok(Math.abs(usd.futureItemCostBTC - eur.futureItemCostBTC) < 1e-12);
});
