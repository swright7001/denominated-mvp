import { ScenarioInput } from "./types";

const purchaseTypes = new Set<ScenarioInput["purchaseType"]>([
  "one-time",
  "monthly",
]);

export function scenarioToSearchParams(scenario: ScenarioInput) {
  const params = new URLSearchParams();

  params.set("item", scenario.itemName);
  params.set("price", String(scenario.currentItemPriceUSD));
  params.set("btc", String(scenario.currentBTCPriceUSD));
  params.set("years", String(scenario.years));
  params.set("inflation", String(scenario.itemInflationRate));
  params.set("growth", String(scenario.btcGrowthRate));
  params.set("type", scenario.purchaseType);

  return params;
}

export function scenarioToShareUrl(scenario: ScenarioInput, origin: string) {
  const params = scenarioToSearchParams(scenario);
  return `${origin}/calculator?${params.toString()}`;
}

export function parseScenarioSearchParams(
  search: string,
  fallback: ScenarioInput,
): ScenarioInput | null {
  const params = new URLSearchParams(search);
  const hasScenarioParam = [
    "item",
    "price",
    "btc",
    "years",
    "inflation",
    "growth",
    "type",
  ].some((key) => params.has(key));

  if (!hasScenarioParam) return null;

  const purchaseType = params.get("type");

  return {
    itemName: cleanText(params.get("item")) ?? fallback.itemName,
    currentItemPriceUSD:
      cleanNumber(params.get("price")) ?? fallback.currentItemPriceUSD,
    currentBTCPriceUSD:
      cleanNumber(params.get("btc")) ?? fallback.currentBTCPriceUSD,
    years: cleanNumber(params.get("years")) ?? fallback.years,
    itemInflationRate:
      cleanNumber(params.get("inflation")) ?? fallback.itemInflationRate,
    btcGrowthRate: cleanNumber(params.get("growth")) ?? fallback.btcGrowthRate,
    purchaseType:
      purchaseType && purchaseTypes.has(purchaseType as ScenarioInput["purchaseType"])
        ? (purchaseType as ScenarioInput["purchaseType"])
        : fallback.purchaseType,
  };
}

function cleanText(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 90) : null;
}

function cleanNumber(value: string | null) {
  if (!value) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
