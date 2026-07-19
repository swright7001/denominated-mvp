import type { Scenario, ScenarioInput } from "./types";

export function applyBTCPriceToScenario<T extends ScenarioInput>(
  scenario: T,
  btcPrice: number,
): T {
  return {
    ...scenario,
    currentBTCPriceUSD: normalizeBTCPrice(btcPrice, scenario.currentBTCPriceUSD),
  };
}

export function applyBTCPriceToScenarios<T extends Scenario>(
  scenarios: T[],
  btcPrice: number,
) {
  return scenarios.map((scenario) =>
    applyBTCPriceToScenario(scenario, btcPrice),
  );
}

function normalizeBTCPrice(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
