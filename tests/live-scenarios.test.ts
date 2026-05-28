import assert from "node:assert/strict";
import test from "node:test";
import {
  applyBTCPriceToScenario,
  applyBTCPriceToScenarios,
} from "../src/lib/live-scenarios";
import { defaultScenario, scenarios } from "../src/lib/scenarios";

test("applyBTCPriceToScenario overlays the live BTC price", () => {
  const scenario = applyBTCPriceToScenario(defaultScenario, 73000);

  assert.equal(scenario.currentBTCPriceUSD, 73000);
  assert.equal(defaultScenario.currentBTCPriceUSD, 80000);
});

test("applyBTCPriceToScenario falls back to the scenario BTC price when unusable", () => {
  const scenario = applyBTCPriceToScenario(defaultScenario, Number.NaN);

  assert.equal(scenario.currentBTCPriceUSD, defaultScenario.currentBTCPriceUSD);
});

test("applyBTCPriceToScenarios applies one live BTC price to every preset", () => {
  const pricedScenarios = applyBTCPriceToScenarios(scenarios, 73181);

  assert.equal(pricedScenarios.length, scenarios.length);
  assert.equal(pricedScenarios[0].currentBTCPriceUSD, 73181);
  assert.equal(pricedScenarios.at(-1)?.currentBTCPriceUSD, 73181);
});
