import type { SavedScenario, Scenario, ScenarioInput } from "./types";

export type ConvexSavedScenarioInput = {
  clientId: string;
  scenario: ScenarioInput;
  savedAt: string;
  baselineBTCPriceUSD: number;
  baselineItemCostBTC: number;
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
  return {
    clientId: savedScenario.id,
    scenario: savedScenario.scenario,
    savedAt: savedScenario.savedAt,
    baselineBTCPriceUSD: savedScenario.baselineBTCPriceUSD,
    baselineItemCostBTC: savedScenario.baselineItemCostBTC,
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
  return {
    slug: scenario.slug,
    scenario: {
      itemName: scenario.itemName,
      currentItemPriceUSD: scenario.currentItemPriceUSD,
      currentBTCPriceUSD: scenario.currentBTCPriceUSD,
      years: scenario.years,
      itemInflationRate: scenario.itemInflationRate,
      btcGrowthRate: scenario.btcGrowthRate,
      purchaseType: scenario.purchaseType,
    },
    shortDescription: scenario.shortDescription,
    category: scenario.category,
    icon: scenario.icon,
    ...sourceMetadata,
  };
}
