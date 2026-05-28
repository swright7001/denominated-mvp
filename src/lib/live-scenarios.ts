import type { Scenario, ScenarioInput } from "./types";

export function applyBTCPriceToScenario<T extends ScenarioInput>(
  scenario: T,
  btcPriceUSD: number,
): T {
  return {
    ...scenario,
    currentBTCPriceUSD: normalizeBTCPrice(btcPriceUSD, scenario.currentBTCPriceUSD),
  };
}

export function applyBTCPriceToScenarios<T extends Scenario>(
  scenarios: T[],
  btcPriceUSD: number,
) {
  return scenarios.map((scenario) =>
    applyBTCPriceToScenario(scenario, btcPriceUSD),
  );
}

function normalizeBTCPrice(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
