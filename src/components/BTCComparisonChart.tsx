 "use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBTC, formatUSD } from "@/lib/calculations";
import { ScenarioResult } from "@/lib/types";

export function BTCComparisonChart({ result }: { result: ScenarioResult }) {
  return (
    <section className="panel rounded-lg p-5 sm:p-7">
      <p className="eyebrow mb-5">Cost over time</p>
      <div className="w-full overflow-x-auto">
        <ComposedChart width={820} height={320} data={result.yearlyData}>
          <CartesianGrid stroke="rgba(239,230,218,0.12)" strokeDasharray="3 6" />
          <XAxis
            dataKey="year"
            stroke="#b9ab9a"
            tickLine={false}
            axisLine={{ stroke: "rgba(239,230,218,0.16)" }}
          />
          <YAxis
            yAxisId="usd"
            stroke="#b9ab9a"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatUSD(Number(value), true)}
          />
          <YAxis
            yAxisId="btc"
            orientation="right"
            stroke="#b9ab9a"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${formatBTC(Number(value))} BTC`}
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
      </div>
    </section>
  );
}
