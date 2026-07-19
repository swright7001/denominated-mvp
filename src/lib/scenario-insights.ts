import { formatBTC } from "./calculations";
import { normalizeCurrencyCode, type CurrencyCode } from "./currency";
import type { SavedScenario } from "./types";

export type ScenarioImpact = {
  itemName: string;
  currentBTCCost: number;
  priorBTCCost: number;
  btcDifference: number;
  percentDifference: number;
  currentBTCPriceUSD: number;
  priorBTCPriceUSD: number;
  comparisonDate: string;
  currencyCode: CurrencyCode;
};

export function calculateScenarioImpact(
  savedScenario: SavedScenario,
  currentBTCPriceUSD = savedScenario.scenario.currentBTCPriceUSD,
): ScenarioImpact {
  const normalizedBTCPrice = Math.max(1, Number(currentBTCPriceUSD) || 1);
  const currentBTCCost =
    savedScenario.scenario.currentItemPriceUSD / normalizedBTCPrice;
  const priorBTCCost = savedScenario.baselineItemCostBTC;
  const btcDifference = currentBTCCost - priorBTCCost;
  const percentDifference =
    priorBTCCost === 0 ? 0 : (btcDifference / priorBTCCost) * 100;

  return {
    itemName: savedScenario.scenario.itemName,
    currentBTCCost,
    priorBTCCost,
    btcDifference,
    percentDifference,
    currentBTCPriceUSD: normalizedBTCPrice,
    priorBTCPriceUSD: savedScenario.baselineBTCPriceUSD,
    comparisonDate: savedScenario.savedAt,
    currencyCode: normalizeCurrencyCode(savedScenario.scenario.currencyCode),
  };
}

export function buildScenarioChangeInsight({
  itemName,
  btcDifference,
  percentDifference,
  windowLabel = "today",
  usePercent = false,
}: {
  itemName: string;
  btcDifference: number;
  percentDifference: number;
  windowLabel?: string;
  usePercent?: boolean;
}) {
  const normalizedName = normalizeItemName(itemName);

  if (Math.abs(btcDifference) < 0.00005 || Math.abs(percentDifference) < 0.05) {
    return `Your saved ${normalizedName} is basically unchanged in BTC terms ${windowLabel}.`;
  }

  const isCheaper = btcDifference < 0;

  if (usePercent) {
    return `Your saved ${normalizedName} is ${Math.abs(percentDifference).toFixed(
      1,
    )}% ${isCheaper ? "cheaper" : "more expensive"} in BTC terms ${windowLabel}.`;
  }

  return `Your ${normalizedName} is now ${formatBTC(
    Math.abs(btcDifference),
  )} BTC ${isCheaper ? "cheaper" : "higher"} ${windowLabel}.`;
}

export function buildSavedScenarioImpactCopy(
  impact: ScenarioImpact,
  windowLabel = "since you saved it",
) {
  if (Math.abs(impact.btcDifference) < 0.00005) {
    return `This is basically unchanged in BTC terms ${windowLabel}.`;
  }

  if (impact.btcDifference < 0) {
    return `This is ${formatBTC(Math.abs(impact.btcDifference))} BTC cheaper ${windowLabel}.`;
  }

  return `This costs ${Math.abs(impact.percentDifference).toFixed(
    1,
  )}% more in BTC terms ${windowLabel}.`;
}

export function getBiggestImpact(impacts: ScenarioImpact[]) {
  return impacts.reduce<ScenarioImpact | null>((biggest, impact) => {
    if (!biggest) return impact;

    return Math.abs(impact.percentDifference) >
      Math.abs(biggest.percentDifference)
      ? impact
      : biggest;
  }, null);
}

function normalizeItemName(itemName: string) {
  const trimmed = itemName.trim();
  return trimmed.length > 0 ? trimmed : "scenario";
}
