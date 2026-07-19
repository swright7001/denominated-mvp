import type { CurrencyCode } from "./currency";

export type PurchaseType = "one-time" | "monthly";

export type ScenarioInput = {
  itemName: string;
  currencyCode?: CurrencyCode;
  currentItemPriceUSD: number;
  currentBTCPriceUSD: number;
  years: number;
  itemInflationRate: number;
  btcGrowthRate: number;
  purchaseType: PurchaseType;
};

export type Scenario = ScenarioInput & {
  slug: string;
  shortDescription: string;
  category: string;
  icon: string;
  image?: string;
  imageAlternates?: string[];
  sourceCountry?: string;
  sourceCurrencyCode?: CurrencyCode;
};

export type ScenarioResult = {
  currentItemCostBTC: number;
  futureItemPriceUSD: number;
  futureBTCPriceUSD: number;
  futureItemCostBTC: number;
  btcCostChangePercent: number;
  yearlyData: Array<{
    year: number;
    usdCost: number;
    btcPrice: number;
    btcCost: number;
  }>;
};

export type SavedScenario = {
  id: string;
  scenario: ScenarioInput;
  savedAt: string;
  baselineBTCPriceUSD: number;
  baselineItemCostBTC: number;
  baselineCurrencyCode?: CurrencyCode;
};
