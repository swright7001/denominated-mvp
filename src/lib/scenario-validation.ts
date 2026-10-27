import type { ScenarioInput } from "./types";

export const scenarioLimits = {
  currentItemPriceUSD: { min: 0, max: 1_000_000_000_000 },
  currentBTCPriceUSD: { min: 1, max: 1_000_000_000_000 },
  years: { min: 0, max: 100 },
  itemInflationRate: { min: -99, max: 100 },
  btcGrowthRate: { min: -99, max: 100 },
} as const;

export type NumericScenarioField = keyof typeof scenarioLimits;

export function boundScenarioNumber(key: NumericScenarioField, value: number) {
  const { min, max } = scenarioLimits[key];
  const bounded = Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
  return key === "years" ? Math.round(bounded) : bounded;
}

export function normalizeScenario(scenario: ScenarioInput): ScenarioInput {
  return {
    ...scenario,
    itemName: scenario.itemName.trim().slice(0, 90) || "My expense",
    ...Object.fromEntries(
      Object.keys(scenarioLimits).map((key) => [
        key,
        boundScenarioNumber(key as NumericScenarioField, scenario[key as NumericScenarioField]),
      ]),
    ),
  };
}
