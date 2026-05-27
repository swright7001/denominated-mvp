import Image from "next/image";
import { formatBTC } from "@/lib/calculations";
import { ScenarioInput, ScenarioResult } from "@/lib/types";

export function ShareableResultCard({
  scenario,
  result,
}: {
  scenario: ScenarioInput;
  result: ScenarioResult;
}) {
  const direction =
    result.btcCostChangePercent < 0 ? "cheaper" : "more expensive";

  return (
    <div className="overflow-hidden rounded-lg border border-[rgba(240,163,111,0.28)] bg-[#0b0907]">
      <div className="relative min-h-[230px] p-5">
        <Image
          src="/brand/logo.png"
          alt="Denominated branded background"
          fill
          sizes="480px"
          className="object-cover opacity-18"
        />
        <div className="relative z-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-md">
              <Image
                src="/brand/logo.png"
                alt="Denominated logo"
                fill
                sizes="40px"
                className="brand-logo-crop scale-[2.8]"
              />
            </div>
            <div>
              <p className="font-semibold text-[#efe6da]">Denominated</p>
              <p className="text-xs text-[#f0a36f]">
                Measure life in purchasing power.
              </p>
            </div>
          </div>
          <p className="max-w-md text-xl leading-8 text-[#efe6da]">
            {scenario.itemName} could move from{" "}
            <span className="copper-text">
              {formatBTC(result.currentItemCostBTC)} BTC
            </span>{" "}
            today to{" "}
            <span className="copper-text">
              {formatBTC(result.futureItemCostBTC)} BTC
            </span>{" "}
            in {scenario.years} years.
          </p>
          <p className="mt-5 text-lg text-[#f0a36f]">
            {Math.abs(result.btcCostChangePercent).toFixed(1)}% {direction} in
            Bitcoin terms.
          </p>
        </div>
      </div>
    </div>
  );
}
