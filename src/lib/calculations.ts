import { ScenarioInput, ScenarioResult } from "./types";

export function calculateScenario(input: ScenarioInput): ScenarioResult {
  const years = Math.max(0, Number(input.years) || 0);
  const itemInflation = (Number(input.itemInflationRate) || 0) / 100;
  const btcGrowth = (Number(input.btcGrowthRate) || 0) / 100;
  const itemPrice = Math.max(0, Number(input.currentItemPriceUSD) || 0);
  const btcPrice = Math.max(1, Number(input.currentBTCPriceUSD) || 1);

  const currentItemCostBTC = itemPrice / btcPrice;
  const futureItemPriceUSD = itemPrice * Math.pow(1 + itemInflation, years);
  const futureBTCPriceUSD = btcPrice * Math.pow(1 + btcGrowth, years);
  const futureItemCostBTC = futureItemPriceUSD / futureBTCPriceUSD;
  const btcCostChangePercent =
    currentItemCostBTC === 0
      ? 0
      : ((futureItemCostBTC - currentItemCostBTC) / currentItemCostBTC) * 100;

  const yearlyData = Array.from({ length: years + 1 }, (_, year) => {
    const usdCost = itemPrice * Math.pow(1 + itemInflation, year);
    const btcPriceAtYear = btcPrice * Math.pow(1 + btcGrowth, year);

    return {
      year,
      usdCost,
      btcPrice: btcPriceAtYear,
      btcCost: usdCost / btcPriceAtYear,
    };
  });

  return {
    currentItemCostBTC,
    futureItemPriceUSD,
    futureBTCPriceUSD,
    futureItemCostBTC,
    btcCostChangePercent,
    yearlyData,
  };
}

export function formatUSD(value: number, compact = false) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: compact && Math.abs(value) >= 1000000 ? "compact" : "standard",
  }).format(value);
}

export function formatBTC(value: number) {
  if (value >= 10) return value.toFixed(2);
  if (value >= 1) return value.toFixed(4);
  return value.toFixed(4);
}

export function getChangeCopy(percent: number) {
  const direction = percent < 0 ? "cheaper" : "more expensive";
  return `This became ${Math.abs(percent).toFixed(1)}% ${direction} in Bitcoin terms.`;
}

export function buildTweet(input: ScenarioInput, result: ScenarioResult) {
  const direction =
    result.btcCostChangePercent < 0 ? "cheaper" : "more expensive";

  return `Today, ${input.itemName} costs ${formatBTC(result.currentItemCostBTC)} BTC.

In ${input.years} years, it could cost ${formatBTC(result.futureItemCostBTC)} BTC.

That means it became ${Math.abs(result.btcCostChangePercent).toFixed(1)}% ${direction} in Bitcoin terms.

That's purchasing power.`;
}
