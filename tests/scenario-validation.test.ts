import test from "node:test";
import assert from "node:assert/strict";
import { calculateScenario } from "../src/lib/calculations";
import { normalizeScenario } from "../src/lib/scenario-validation";
import { defaultScenario } from "../src/lib/scenarios";

test("extreme horizons and destructive rates cannot produce unbounded charts or invalid results", () => {
  for (const years of [10_000, Infinity, -1, 1.5]) {
    for (const btcGrowthRate of [-100, -200, Infinity, 1e308]) {
      const result = calculateScenario({ ...defaultScenario, years, btcGrowthRate });
      assert.ok(result.yearlyData.length <= 101);
      for (const value of [result.currentItemCostBTC, result.futureItemPriceUSD, result.futureBTCPriceUSD, result.futureItemCostBTC, result.btcCostChangePercent]) {
        assert.ok(Number.isFinite(value));
      }
      assert.ok(result.futureItemCostBTC >= 0);
    }
  }
});

test("ordinary calculations retain their expected mathematical result", () => {
  const result = calculateScenario({ ...defaultScenario, currentItemPriceUSD: 1200, currentBTCPriceUSD: 80000, years: 5, btcGrowthRate: 10, itemInflationRate: 4 });
  assert.equal(result.currentItemCostBTC, 0.015);
  assert.equal(result.futureItemPriceUSD, 1200 * 1.04 ** 5);
  assert.equal(result.futureItemCostBTC, (1200 * 1.04 ** 5) / (80000 * 1.1 ** 5));
});

test("names and numeric ranges are bounded at the shared scenario boundary", () => {
  const normalized = normalizeScenario({ ...defaultScenario, itemName: "x".repeat(1000), years: 10000, currentItemPriceUSD: 1e300 });
  assert.equal(normalized.itemName.length, 90);
  assert.equal(normalized.years, 100);
  assert.equal(normalized.currentItemPriceUSD, 1e12);
});
