import { formatBTC, formatUSD, getChangeCopy } from "@/lib/calculations";
import { ASSUMPTION_CAVEAT } from "@/lib/legal";
import { ScenarioInput, ScenarioResult } from "@/lib/types";

export function ResultCards({
  scenario,
  result,
}: {
  scenario: ScenarioInput;
  result: ScenarioResult;
}) {
  const changeLabel =
    result.btcCostChangePercent < 0 ? "You'll pay less" : "You'll pay more";

  return (
    <section className="panel min-w-0 rounded-lg p-5 sm:p-7">
      <p className="eyebrow mb-6">Results ({scenario.years} years)</p>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Today"
          value={formatBTC(result.currentItemCostBTC)}
          suffix="BTC"
        />
        <MetricCard
          label="Future USD price"
          value={formatUSD(result.futureItemPriceUSD)}
          sub={`in ${scenario.years} years`}
        />
        <MetricCard
          label="Future BTC price"
          value={formatUSD(result.futureBTCPriceUSD)}
          sub={`in ${scenario.years} years`}
        />
        <MetricCard
          label="Future cost"
          value={formatBTC(result.futureItemCostBTC)}
          suffix="BTC"
        />
        <div className="rounded-md border border-[rgba(240,163,111,0.2)] bg-black/20 p-4 text-center">
          <p className="text-sm text-[#f0a36f]">{changeLabel}</p>
          <p className="metric mt-2 text-4xl text-[#efe6da]">
            {Math.abs(result.btcCostChangePercent).toFixed(0)}%
          </p>
          <p className="mt-1 text-sm text-[#d9ccbd]">
            {result.btcCostChangePercent < 0 ? "cheaper" : "more expensive"}
          </p>
        </div>
      </div>
      <p className="mt-6 rounded-md border border-[rgba(240,163,111,0.18)] bg-[#2a1810]/45 p-4 text-sm break-words text-[#f0c19f]">
        {getChangeCopy(result.btcCostChangePercent)}
      </p>
      <p className="mt-3 text-xs leading-5 text-[#8f8172]">
        {ASSUMPTION_CAVEAT}
      </p>
    </section>
  );
}

function MetricCard({
  label,
  value,
  suffix,
  sub,
}: {
  label: string;
  value: string;
  suffix?: string;
  sub?: string;
}) {
  return (
    <div className="min-w-0 rounded-md border border-[rgba(239,230,218,0.14)] bg-black/18 p-4">
      <p className="text-sm text-[#cfc1b1]">{label}</p>
      <p className="metric mt-3 text-3xl break-words text-[#efe6da] sm:text-4xl">
        {value}
      </p>
      {suffix && <p className="mt-1 text-xl text-[#f0a36f]">{suffix}</p>}
      {sub && <p className="mt-2 text-sm text-[#f0a36f]">{sub}</p>}
    </div>
  );
}
