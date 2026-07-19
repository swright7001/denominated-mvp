import type { SavedScenario, Scenario, ScenarioInput } from "./types";
import { normalizeScenarioCurrency } from "./watchlist";

export type ConvexSavedScenarioInput = {
  clientId: string;
  scenario: ScenarioInput;
  savedAt: string;
  baselineBTCPriceUSD: number;
  baselineItemCostBTC: number;
  baselineCurrencyCode: NonNullable<ScenarioInput["currencyCode"]>;
  sourceType: "custom" | "preset";
  presetSlug?: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceLastUpdatedAt?: string;
};

export type ConvexPresetInput = {
  slug: string;
  scenario: ScenarioInput;
  shortDescription: string;
  category: string;
  icon: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceLastUpdatedAt?: string;
};

export function toConvexSavedScenarioInput(
  savedScenario: SavedScenario,
): ConvexSavedScenarioInput {
  const scenario = normalizeScenarioCurrency(savedScenario.scenario);

  return {
    clientId: savedScenario.id,
    scenario: {
      itemName: scenario.itemName,
      currencyCode: scenario.currencyCode,
      currentItemPriceUSD: scenario.currentItemPriceUSD,
      currentBTCPriceUSD: scenario.currentBTCPriceUSD,
      years: scenario.years,
      itemInflationRate: scenario.itemInflationRate,
      btcGrowthRate: scenario.btcGrowthRate,
      purchaseType: scenario.purchaseType,
    },
    savedAt: savedScenario.savedAt,
    baselineBTCPriceUSD: savedScenario.baselineBTCPriceUSD,
    baselineItemCostBTC: savedScenario.baselineItemCostBTC,
    baselineCurrencyCode: scenario.currencyCode,
    sourceType: "custom",
  };
}

export function toConvexPresetInput(
  scenario: Scenario,
  sourceMetadata: {
    sourceName?: string;
    sourceUrl?: string;
    sourceLastUpdatedAt?: string;
  } = {},
): ConvexPresetInput {
  const normalizedScenario = normalizeScenarioCurrency(scenario);

  return {
    slug: scenario.slug,
    scenario: {
      itemName: normalizedScenario.itemName,
      currencyCode: normalizedScenario.currencyCode,
      currentItemPriceUSD: normalizedScenario.currentItemPriceUSD,
      currentBTCPriceUSD: normalizedScenario.currentBTCPriceUSD,
      years: normalizedScenario.years,
      itemInflationRate: normalizedScenario.itemInflationRate,
      btcGrowthRate: normalizedScenario.btcGrowthRate,
      purchaseType: normalizedScenario.purchaseType,
    },
    shortDescription: scenario.shortDescription,
    category: scenario.category,
    icon: scenario.icon,
    ...sourceMetadata,
  };
}
