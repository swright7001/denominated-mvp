import { formatBTC } from "./calculations";
import type { ScenarioInput, ScenarioResult } from "./types";

export const shareImageSize = {
  width: 1200,
  height: 630,
};

export function isShareImageScenarioSafe(scenario: ScenarioInput) {
  return (
    scenario.years <= 100 &&
    scenario.currentItemPriceUSD <= 1_000_000_000_000_000 &&
    scenario.currentBTCPriceUSD <= 1_000_000_000_000_000 &&
    scenario.itemInflationRate <= 1_000 &&
    scenario.btcGrowthRate <= 1_000
  );
}

export function shareImageAlt(scenario: ScenarioInput, result: ScenarioResult) {
  const direction =
    result.btcCostChangePercent < 0 ? "cheaper" : "more expensive";

  return `${scenario.itemName}: ${formatBTC(result.currentItemCostBTC)} BTC today and ${formatBTC(result.futureItemCostBTC)} BTC in ${scenario.years} years, ${Math.abs(result.btcCostChangePercent).toFixed(1)}% ${direction} in Bitcoin terms.`;
}

export function ShareImage({
  scenario,
  result,
}: {
  scenario: ScenarioInput;
  result: ScenarioResult;
}) {
  const direction =
    result.btcCostChangePercent < 0 ? "cheaper" : "more expensive";
  const titleFontSize =
    scenario.itemName.length > 60
      ? 38
      : scenario.itemName.length > 36
        ? 46
        : 56;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        padding: "58px 64px",
        color: "#efe6da",
        background:
          "radial-gradient(circle at 88% 12%, rgba(199,119,66,0.38), transparent 35%), linear-gradient(135deg, #171411 0%, #090806 58%, #201914 100%)",
        border: "2px solid #7b3f24",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 58,
              height: 58,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              color: "#140b06",
              background: "linear-gradient(135deg, #f0a36f, #9b512d)",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            D
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 700 }}>Denominated</div>
            <div
              style={{
                marginTop: 4,
                color: "#f0a36f",
                fontSize: 17,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Measure life in purchasing power
            </div>
          </div>
        </div>
        <div style={{ display: "flex", color: "#b9ab9a", fontSize: 18 }}>
          {scenario.years}-year scenario
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 1000,
            minWidth: 0,
            color: "#efe6da",
            fontSize: titleFontSize,
            fontWeight: 650,
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            wordBreak: "break-word",
          }}
        >
          {scenario.itemName}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 22,
            marginTop: 34,
          }}
        >
          <Metric label="Today" value={`${formatBTC(result.currentItemCostBTC)} BTC`} />
          <div
            style={{
              width: 1,
              display: "flex",
              background: "rgba(240,163,111,0.3)",
            }}
          />
          <Metric
            label={`In ${scenario.years} years`}
            value={`${formatBTC(result.futureItemCostBTC)} BTC`}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 25,
          borderTop: "1px solid rgba(239,230,218,0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#f0a36f",
            fontSize: 27,
            fontWeight: 650,
          }}
        >
          {Math.abs(result.btcCostChangePercent).toFixed(1)}% {direction} in
          Bitcoin terms
        </div>
        <div style={{ color: "#8f8172", fontSize: 15 }}>
          Educational scenario · Assumptions, not guarantees
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        width: 425,
        display: "flex",
        flexDirection: "column",
        padding: "18px 22px",
        borderRadius: 14,
        background: "rgba(8,8,7,0.5)",
      }}
    >
      <div
        style={{
          color: "#b9ab9a",
          fontSize: 17,
          letterSpacing: "0.13em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          color: "#f0a36f",
          fontSize: value.length > 17 ? 30 : 42,
        }}
      >
        {value}
      </div>
    </div>
  );
}
