import assert from "node:assert/strict";
import test from "node:test";
import {
  parseScenarioSearchParams,
  scenarioToShareUrl,
} from "../src/lib/share-url";
import { defaultScenario } from "../src/lib/scenarios";

test("scenarioToShareUrl encodes calculator state", () => {
  const url = scenarioToShareUrl(defaultScenario, "https://denominated.test");

  assert.equal(
    url,
    "https://denominated.test/calculator?item=Tesla+Model+3&currency=USD&price=41000&btc=80000&years=5&inflation=4&growth=15&type=one-time",
  );
});

test("parseScenarioSearchParams restores a shared scenario", () => {
  const scenario = parseScenarioSearchParams(
    "?item=Rent&price=1589&btc=90000&years=7&inflation=4.5&growth=12&type=monthly",
    defaultScenario,
  );

  assert.deepEqual(scenario, {
      itemName: "Rent",
      currencyCode: "USD",
    currentItemPriceUSD: 1589,
    currentBTCPriceUSD: 90000,
    years: 7,
    itemInflationRate: 4.5,
    btcGrowthRate: 12,
    purchaseType: "monthly",
  });
});

test("parseScenarioSearchParams falls back on invalid values", () => {
  const scenario = parseScenarioSearchParams(
    "?price=nope&btc=-1&type=bad",
    defaultScenario,
  );

  assert.equal(scenario?.currentItemPriceUSD, defaultScenario.currentItemPriceUSD);
  assert.equal(scenario?.currentBTCPriceUSD, defaultScenario.currentBTCPriceUSD);
  assert.equal(scenario?.purchaseType, defaultScenario.purchaseType);
});

test("parseScenarioSearchParams returns null without scenario params", () => {
  assert.equal(parseScenarioSearchParams("", defaultScenario), null);
});
