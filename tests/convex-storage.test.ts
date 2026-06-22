import assert from "node:assert/strict";
import test from "node:test";
import { defaultScenario } from "../src/lib/scenarios";
import {
  toConvexPresetInput,
  toConvexSavedScenarioInput,
} from "../src/lib/convex-storage";
import { buildSavedScenario } from "../src/lib/watchlist";

test("toConvexSavedScenarioInput preserves local saved scenario baseline data", () => {
  const savedScenario = buildSavedScenario(defaultScenario, {
    id: "saved-local-1",
    savedAt: "2026-06-22T12:00:00.000Z",
  });

  assert.deepEqual(toConvexSavedScenarioInput(savedScenario), {
    clientId: "saved-local-1",
    scenario: savedScenario.scenario,
    savedAt: "2026-06-22T12:00:00.000Z",
    baselineBTCPriceUSD: 80000,
    baselineItemCostBTC: 0.5125,
    sourceType: "custom",
  });
});

test("toConvexPresetInput strips UI-only fields and keeps source metadata", () => {
  assert.deepEqual(
    toConvexPresetInput(defaultScenario, {
      sourceName: "Internal launch preset",
      sourceUrl: "https://example.com/source",
      sourceLastUpdatedAt: "2026-06-22",
    }),
    {
      slug: "tesla-model-3",
      scenario: {
        itemName: "Tesla Model 3",
        currentItemPriceUSD: 41000,
        currentBTCPriceUSD: 80000,
        years: 5,
        itemInflationRate: 4,
        btcGrowthRate: 15,
        purchaseType: "one-time",
      },
      shortDescription: "New from Tesla",
      category: "Vehicle",
      icon: "Car",
      sourceName: "Internal launch preset",
      sourceUrl: "https://example.com/source",
      sourceLastUpdatedAt: "2026-06-22",
    },
  );
});
