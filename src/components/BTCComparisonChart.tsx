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
import { formatBTC, formatUSD } from "@/lib/calculations";
import { ScenarioResult } from "@/lib/types";

export function BTCComparisonChart({ result }: { result: ScenarioResult }) {
  return (
    <section className="panel min-w-0 rounded-lg p-5 sm:p-7">
      <p className="eyebrow mb-5">Cost over time</p>
      <div className="h-80 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={result.yearlyData}
            margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              stroke="rgba(239,230,218,0.12)"
              strokeDasharray="3 6"
            />
            <XAxis
              dataKey="year"
              stroke="#b9ab9a"
              tickLine={false}
              axisLine={{ stroke: "rgba(239,230,218,0.16)" }}
            />
            <YAxis
              yAxisId="usd"
              width={44}
              stroke="#b9ab9a"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatUSD(Number(value), true)}
            />
            <YAxis
              yAxisId="btc"
              width={48}
              orientation="right"
              stroke="#b9ab9a"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${formatBTC(Number(value))}`}
            />
            <Tooltip
              contentStyle={{
                background: "#15110e",
                border: "1px solid rgba(240,163,111,0.28)",
                borderRadius: 8,
                color: "#efe6da",
              }}
              formatter={(value, name) =>
                name === "USD cost"
                  ? [formatUSD(Number(value)), name]
                  : [`${formatBTC(Number(value))} BTC`, name]
              }
            />
            <Legend />
            <Bar
              yAxisId="usd"
              dataKey="usdCost"
              name="USD cost"
              fill="#a55f38"
              radius={[4, 4, 0, 0]}
            />
            <Area
              yAxisId="btc"
              type="monotone"
              dataKey="btcCost"
              name="BTC cost"
              stroke="#efe6da"
              fill="rgba(239,230,218,0.12)"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
