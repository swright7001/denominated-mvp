import { formatBTC, getChangeCopy } from "@/lib/calculations";
import { formatCurrency, normalizeCurrencyCode } from "@/lib/currency";
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
  const currencyCode = normalizeCurrencyCode(scenario.currencyCode);

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
          label={`Future ${currencyCode} price`}
          value={formatCurrency(result.futureItemPriceUSD, currencyCode)}
          sub={`in ${scenario.years} years`}
        />
        <MetricCard
          label="Future BTC price"
          value={formatCurrency(result.futureBTCPriceUSD, currencyCode)}
          sub={`in ${scenario.years} years`}
        />
        <MetricCard
          label="Future cost"
          value={formatBTC(result.futureItemCostBTC)}
          suffix="BTC"
        />
        <div className="rounded-md border border-[var(--accent-line)] bg-[var(--surface-soft)] p-4 text-center">
          <p className="text-sm text-[var(--accent-text)]">{changeLabel}</p>
          <p className="metric mt-2 text-4xl text-[var(--text-primary)]">
            {Math.abs(result.btcCostChangePercent).toFixed(0)}%
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {result.btcCostChangePercent < 0 ? "cheaper" : "more expensive"}
          </p>
        </div>
      </div>
      <p className="mt-6 rounded-md border border-[var(--accent-line-soft)] bg-[var(--accent-surface)] p-4 text-sm break-words text-[var(--accent-soft-text)]">
        {getChangeCopy(result.btcCostChangePercent)}
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
    <div className="min-w-0 rounded-md border border-[var(--neutral-line-soft)] bg-[var(--surface-soft)] p-4">
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="metric mt-3 text-3xl break-words text-[var(--text-primary)] sm:text-4xl">
        {value}
      </p>
      {suffix && <p className="mt-1 text-xl text-[var(--accent-text)]">{suffix}</p>}
      {sub && <p className="mt-2 text-sm text-[var(--accent-text)]">{sub}</p>}
    </div>
  );
}
