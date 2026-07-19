"use client";

import { useState } from "react";
import { formatUSD } from "@/lib/calculations";
import {
  normalizeNumericInputDraft,
  parseNumericInputDraft,
} from "@/lib/numeric-input";
import type { ScenarioInput } from "@/lib/types";
import type { BTCPriceLoadState } from "./CalculatorExperience";

type ScenarioFormProps = {
  value: ScenarioInput;
  btcPriceStatus: BTCPriceLoadState;
  btcPriceWasManuallyEdited: boolean;
  onBTCPriceManualChange: () => void;
  onChange: (value: ScenarioInput) => void;
};

type NumericField = Extract<
  keyof ScenarioInput,
  | "currentItemPriceUSD"
  | "currentBTCPriceUSD"
  | "years"
  | "itemInflationRate"
  | "btcGrowthRate"
>;

const fieldMinimums: Partial<Record<NumericField, number>> = {
  currentItemPriceUSD: 0,
  currentBTCPriceUSD: 1,
  years: 0,
};

export function ScenarioForm({
  value,
  btcPriceStatus,
  btcPriceWasManuallyEdited,
  onBTCPriceManualChange,
  onChange,
}: ScenarioFormProps) {
  const [activeNumericField, setActiveNumericField] =
    useState<NumericField | null>(null);
  const [numericDrafts, setNumericDrafts] = useState<
    Partial<Record<NumericField, string>>
  >({});

  const update = <K extends keyof ScenarioInput>(
    key: K,
    nextValue: ScenarioInput[K],
  ) => onChange({ ...value, [key]: nextValue });

  const numberUpdate = (key: NumericField, nextValue: string) => {
    setNumericDrafts((current) => ({ ...current, [key]: nextValue }));

    const parsed = parseNumericInputDraft(nextValue);
    if (parsed === null) return;

    const minimum = fieldMinimums[key];
    update(
      key,
      (minimum === undefined ? parsed : Math.max(minimum, parsed)) as never,
    );
  };

  const normalizeNumber = (key: NumericField) => {
    const normalized = normalizeNumericInputDraft({
      draft: numericDrafts[key] ?? String(value[key]),
      fallback: value[key],
      min: fieldMinimums[key],
    });

    update(key, normalized as never);
    setNumericDrafts((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setActiveNumericField(null);
  };

  const getNumberValue = (key: NumericField) =>
    activeNumericField === key
      ? (numericDrafts[key] ?? String(value[key]))
      : String(value[key]);

  const startNumberEdit = (key: NumericField) => {
    setActiveNumericField(key);
    setNumericDrafts((current) => ({ ...current, [key]: String(value[key]) }));
  };

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
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <div className="grid content-start">
              <label
                className="text-sm text-[#d9ccbd] sm:min-h-10"
                htmlFor="currentItemPriceUSD"
              >
                Current item price in USD
              </label>
              <input
                id="currentItemPriceUSD"
                className="field mt-2"
                inputMode="decimal"
                type="text"
                value={getNumberValue("currentItemPriceUSD")}
                onBlur={() => normalizeNumber("currentItemPriceUSD")}
                onChange={(event) =>
                  numberUpdate("currentItemPriceUSD", event.target.value)
                }
                onFocus={() => startNumberEdit("currentItemPriceUSD")}
              />
            </div>
            <div className="grid content-start">
              <label
                className="text-sm text-[#d9ccbd] sm:min-h-10"
                htmlFor="currentBTCPriceUSD"
              >
                Current Bitcoin price in USD
              </label>
              <input
                id="currentBTCPriceUSD"
                className="field mt-2"
                inputMode="decimal"
                type="text"
                value={getNumberValue("currentBTCPriceUSD")}
                onBlur={() => normalizeNumber("currentBTCPriceUSD")}
                onChange={(event) => {
                  onBTCPriceManualChange();
                  numberUpdate("currentBTCPriceUSD", event.target.value);
                }}
                onFocus={() => startNumberEdit("currentBTCPriceUSD")}
              />
              <BTCPriceStatusNote
                btcPriceStatus={btcPriceStatus}
                btcPriceWasManuallyEdited={btcPriceWasManuallyEdited}
              />
            </div>
          </div>
        </div>

        <div>
          <p className="eyebrow mb-4">3. Your assumptions</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-[#d9ccbd]">
              Time horizon in years
              <input
                className="field mt-2"
                inputMode="numeric"
                type="text"
                value={getNumberValue("years")}
                onBlur={() => normalizeNumber("years")}
                onChange={(event) => numberUpdate("years", event.target.value)}
                onFocus={() => startNumberEdit("years")}
              />
            </label>
            <label className="text-sm text-[#d9ccbd]">
              Annual item inflation rate
              <input
                className="field mt-2"
                inputMode="decimal"
                type="text"
                value={getNumberValue("itemInflationRate")}
                onBlur={() => normalizeNumber("itemInflationRate")}
                onChange={(event) =>
                  numberUpdate("itemInflationRate", event.target.value)
                }
                onFocus={() => startNumberEdit("itemInflationRate")}
              />
            </label>
            <label className="text-sm text-[#d9ccbd]">
              Annual BTC growth assumption
              <input
                className="field mt-2"
                inputMode="decimal"
                type="text"
                value={getNumberValue("btcGrowthRate")}
                onBlur={() => normalizeNumber("btcGrowthRate")}
                onChange={(event) =>
                  numberUpdate("btcGrowthRate", event.target.value)
                }
                onFocus={() => startNumberEdit("btcGrowthRate")}
              />
            </label>
            <div className="rounded-md border border-[rgba(239,230,218,0.18)] p-4 text-sm leading-5 text-[#b9ab9a]">
              BTC spot price is fetched server-side when available. Item prices
              and future assumptions remain editable local inputs.
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

function BTCPriceStatusNote({
  btcPriceStatus,
  btcPriceWasManuallyEdited,
}: {
  btcPriceStatus: BTCPriceLoadState;
  btcPriceWasManuallyEdited: boolean;
}) {
  if (btcPriceWasManuallyEdited) {
    return (
      <span className="mt-2 block text-xs leading-5 text-[#f0a36f]">
        Manual BTC price active. Live updates will not replace this value.
      </span>
    );
  }

  if (btcPriceStatus.status === "loading") {
    return (
      <span className="mt-2 block text-xs leading-5 text-[#b9ab9a]">
        Loading live BTC price...
      </span>
    );
  }

  if (btcPriceStatus.status === "error") {
    return (
      <span className="mt-2 block text-xs leading-5 text-[#f0a36f]">
        Live price unavailable. Your current BTC value is still editable.
      </span>
    );
  }

  const { data } = btcPriceStatus;
  const updatedAt = data.lastUpdatedAt
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(data.lastUpdatedAt))
    : "update time unavailable";

  if (data.status === "fallback") {
    return (
      <span className="mt-2 block text-xs leading-5 text-[#f0a36f]">
        CoinGecko is unavailable. Keeping your current editable BTC value;{" "}
        {formatUSD(data.fallbackPriceUSD)} remains the fallback reference.
      </span>
    );
  }

  return (
    <span className="mt-2 block text-xs leading-5 text-[#b9ab9a]">
      CoinGecko live price loaded
      {data.stale ? " but may be stale" : ""}: updated {updatedAt}.
    </span>
  );
}
