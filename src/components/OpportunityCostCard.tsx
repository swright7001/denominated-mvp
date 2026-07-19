import { formatBTC } from "@/lib/calculations";
import { formatCurrency, normalizeCurrencyCode } from "@/lib/currency";
import { ScenarioInput, ScenarioResult } from "@/lib/types";

export function OpportunityCostCard({
  scenario,
  result,
}: {
  scenario: ScenarioInput;
  result: ScenarioResult;
}) {
  const todayBtcFutureValue =
    result.currentItemCostBTC * result.futureBTCPriceUSD;
  const currencyCode = normalizeCurrencyCode(scenario.currencyCode);

  return (
    <section className="panel rounded-lg p-5">
      <p className="eyebrow mb-3">Opportunity cost</p>
      <p className="text-lg leading-7 text-[#efe6da]">
        Buying {scenario.itemName} today costs{" "}
        <span className="copper-text">{formatBTC(result.currentItemCostBTC)} BTC</span>.
        If that same amount of Bitcoin followed your growth assumption, it would
        represent about{" "}
        <span className="copper-text">
          {formatCurrency(todayBtcFutureValue, currencyCode)}
        </span> in{" "}
        {scenario.years} years.
      </p>
    </section>
  );
}
