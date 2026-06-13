import assert from "node:assert/strict";
import test from "node:test";
import { defaultScenario } from "../src/lib/scenarios";
import {
  buildSavedScenarioImpactCopy,
  buildScenarioChangeInsight,
  calculateScenarioImpact,
} from "../src/lib/scenario-insights";
import { buildSavedScenario } from "../src/lib/watchlist";

test("calculateScenarioImpact compares current BTC price to saved baseline", () => {
  const savedScenario = buildSavedScenario(defaultScenario, {
    id: "saved-1",
    savedAt: "2026-06-13T00:00:00.000Z",
  });
  const impact = calculateScenarioImpact(savedScenario, 100000);

  assert.equal(impact.currentBTCCost, 0.41);
  assert.equal(impact.priorBTCCost, 0.5125);
  assert.ok(Math.abs(impact.btcDifference - -0.1025) < 0.0000001);
  assert.ok(Math.abs(impact.percentDifference - -20) < 0.0000001);
});

test("buildScenarioChangeInsight handles cheaper, higher, and neutral copy", () => {
  assert.equal(
    buildScenarioChangeInsight({
      itemName: "truck",
      btcDifference: -0.42,
      percentDifference: -8,
      windowLabel: "than last month",
    }),
    "Your truck is now 0.4200 BTC cheaper than last month.",
  );

  assert.equal(
    buildScenarioChangeInsight({
      itemName: "tuition goal",
      btcDifference: 0.18,
      percentDifference: 4.2,
      windowLabel: "this week",
    }),
    "Your tuition goal is now 0.1800 BTC higher this week.",
  );

  assert.equal(
    buildScenarioChangeInsight({
      itemName: "home down payment",
      btcDifference: -0.02,
      percentDifference: -6.2,
      windowLabel: "today",
      usePercent: true,
    }),
    "Your saved home down payment is 6.2% cheaper in BTC terms today.",
  );

  assert.equal(
    buildScenarioChangeInsight({
      itemName: "laptop",
      btcDifference: 0,
      percentDifference: 0,
      windowLabel: "today",
    }),
    "Your saved laptop is basically unchanged in BTC terms today.",
  );
});

test("buildSavedScenarioImpactCopy avoids advice and handles direction", () => {
  assert.equal(
    buildSavedScenarioImpactCopy({
      itemName: "Truck",
      currentBTCCost: 0.58,
      priorBTCCost: 1,
      btcDifference: -0.42,
      percentDifference: -42,
      currentBTCPriceUSD: 100000,
      priorBTCPriceUSD: 58000,
      comparisonDate: "2026-06-13T00:00:00.000Z",
    }),
    "This is 0.4200 BTC cheaper since you saved it.",
  );

  assert.equal(
    buildSavedScenarioImpactCopy({
      itemName: "Tuition",
      currentBTCCost: 1.083,
      priorBTCCost: 1,
      btcDifference: 0.083,
      percentDifference: 8.3,
      currentBTCPriceUSD: 76000,
      priorBTCPriceUSD: 83000,
      comparisonDate: "2026-06-13T00:00:00.000Z",
    }),
    "This costs 8.3% more in BTC terms since you saved it.",
  );
});
