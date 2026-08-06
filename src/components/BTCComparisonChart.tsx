"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBTC } from "@/lib/calculations";
import { formatCurrency, normalizeCurrencyCode } from "@/lib/currency";
import { comparisonChartInitialDimension } from "@/lib/chart-layout";
import { ScenarioInput, ScenarioResult } from "@/lib/types";

export function BTCComparisonChart({
  scenario,
  result,
}: {
  scenario: ScenarioInput;
  result: ScenarioResult;
}) {
  const currencyCode = normalizeCurrencyCode(scenario.currencyCode);
  return (
    <section className="panel min-w-0 rounded-lg p-5 sm:p-7">
      <p className="eyebrow mb-5">Cost over time</p>
      <div className="h-80 min-h-80 w-full min-w-0">
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={comparisonChartInitialDimension}
        >
          <ComposedChart
            data={result.yearlyData}
            margin={{ top: 8, right: 4, bottom: 0, left: 4 }}
          >
            <CartesianGrid
              stroke="var(--chart-grid)"
              strokeDasharray="3 6"
            />
            <XAxis
              dataKey="year"
              stroke="var(--chart-axis)"
              tickLine={false}
              axisLine={{ stroke: "var(--chart-line)" }}
            />
            <YAxis
              yAxisId="usd"
              width={68}
              stroke="var(--chart-axis)"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                formatCurrency(Number(value), currencyCode, true)
              }
            />
            <YAxis
              yAxisId="btc"
              width={56}
              orientation="right"
              stroke="var(--chart-axis)"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${formatBTC(Number(value))}`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--chart-tooltip)",
                border: "1px solid var(--accent-line)",
                borderRadius: 8,
                color: "var(--text-primary)",
              }}
              itemStyle={{ color: "var(--text-primary)" }}
              labelStyle={{ color: "var(--text-primary)" }}
              formatter={(value, name) =>
                name === `${currencyCode} cost`
                  ? [formatCurrency(Number(value), currencyCode), name]
                  : [`${formatBTC(Number(value))} BTC`, name]
              }
            />
            <Legend wrapperStyle={{ color: "var(--text-muted)" }} />
            <Bar
              yAxisId="usd"
              dataKey="usdCost"
              name={`${currencyCode} cost`}
              fill="var(--chart-bar)"
              radius={[4, 4, 0, 0]}
            />
            <Area
              yAxisId="btc"
              type="monotone"
              dataKey="btcCost"
              name="BTC cost"
              stroke="var(--chart-btc)"
              fill="var(--chart-btc-fill)"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
