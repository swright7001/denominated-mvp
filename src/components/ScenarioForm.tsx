"use client";

import { ScenarioInput } from "@/lib/types";

type ScenarioFormProps = {
  value: ScenarioInput;
  onChange: (value: ScenarioInput) => void;
};

export function ScenarioForm({ value, onChange }: ScenarioFormProps) {
  const update = <K extends keyof ScenarioInput>(
    key: K,
    nextValue: ScenarioInput[K],
  ) => onChange({ ...value, [key]: nextValue });

  const numberUpdate = (key: keyof ScenarioInput, nextValue: string) =>
    update(key, Number(nextValue) as never);

  return (
    <section className="panel rounded-lg p-5 sm:p-7">
      <div className="space-y-7">
        <div>
          <p className="eyebrow mb-4">1. What are you calculating?</p>
          <label className="text-sm text-[#d9ccbd]" htmlFor="itemName">
            Item name
          </label>
          <input
            id="itemName"
            className="field mt-2"
            value={value.itemName}
            onChange={(event) => update("itemName", event.target.value)}
          />
        </div>

        <div>
          <p className="eyebrow mb-4">2. Today&apos;s prices</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-[#d9ccbd]">
              Current item price in USD
              <input
                className="field mt-2"
                min="0"
                type="number"
                value={value.currentItemPriceUSD}
                onChange={(event) =>
                  numberUpdate("currentItemPriceUSD", event.target.value)
                }
              />
            </label>
            <label className="text-sm text-[#d9ccbd]">
              Current Bitcoin price in USD
              <input
                className="field mt-2"
                min="1"
                type="number"
                value={value.currentBTCPriceUSD}
                onChange={(event) =>
                  numberUpdate("currentBTCPriceUSD", event.target.value)
                }
              />
            </label>
          </div>
        </div>

        <div>
          <p className="eyebrow mb-4">3. Your assumptions</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-[#d9ccbd]">
              Time horizon in years
              <input
                className="field mt-2"
                min="0"
                type="number"
                value={value.years}
                onChange={(event) => numberUpdate("years", event.target.value)}
              />
            </label>
            <label className="text-sm text-[#d9ccbd]">
              Annual item inflation rate
              <input
                className="field mt-2"
                type="number"
                value={value.itemInflationRate}
                onChange={(event) =>
                  numberUpdate("itemInflationRate", event.target.value)
                }
              />
            </label>
            <label className="text-sm text-[#d9ccbd]">
              Annual BTC growth assumption
              <input
                className="field mt-2"
                type="number"
                value={value.btcGrowthRate}
                onChange={(event) =>
                  numberUpdate("btcGrowthRate", event.target.value)
                }
              />
            </label>
            <div className="rounded-md border border-[rgba(239,230,218,0.18)] p-4 text-sm leading-5 text-[#b9ab9a]">
              These assumptions project future prices locally. No live APIs are
              used in this MVP.
            </div>
          </div>
        </div>

        <div>
          <p className="eyebrow mb-4">4. Purchase type</p>
          <div className="grid overflow-hidden rounded-md border border-[rgba(239,230,218,0.18)] sm:grid-cols-2">
            {[
              ["one-time", "One-time purchase", "Buying the item once"],
              ["monthly", "Monthly expense", "Recurring monthly cost"],
            ].map(([type, label, description]) => (
              <button
                key={type}
                type="button"
                className={`p-4 text-left transition ${
                  value.purchaseType === type
                    ? "border border-[#f0a36f] bg-[#3a2115]/55 text-[#f0a36f]"
                    : "text-[#d9ccbd] hover:bg-white/5"
                }`}
                onClick={() =>
                  update("purchaseType", type as ScenarioInput["purchaseType"])
                }
              >
                <span className="block font-medium">{label}</span>
                <span className="mt-1 block text-sm text-[#b9ab9a]">
                  {description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
