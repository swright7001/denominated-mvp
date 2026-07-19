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
    <div className="min-w-0 overflow-hidden rounded-lg border border-[rgba(240,163,111,0.28)] bg-[#0b0907]">
      <div className="relative min-h-[230px] p-4 sm:p-5">
        <Image
          src="/brand/logo.png"
          alt=""
          fill
          sizes="480px"
          className="object-cover opacity-18"
          loading="eager"
        />
        <div className="relative z-10">
          <div className="mb-8 flex min-w-0 items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
              <Image
                src="/brand/logo-mark.png"
                alt="Denominated logo"
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-[#efe6da]">
                Denominated
              </p>
              <p className="text-xs break-words text-[#f0a36f]">
                Measure life in purchasing power.
              </p>
            </div>
          </div>
          <p className="max-w-full text-lg leading-8 break-words text-[#efe6da] sm:text-xl">
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
          <p className="mt-5 text-base break-words text-[#f0a36f] sm:text-lg">
            {Math.abs(result.btcCostChangePercent).toFixed(1)}% {direction} in
            Bitcoin terms.
          </p>
        </div>
      </div>
    </div>
  );
}
