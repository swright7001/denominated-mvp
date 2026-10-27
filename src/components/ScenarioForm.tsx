"use client";

import { useState } from "react";
import {
  formatCurrency,
  currencyMetadata,
  normalizeCurrencyCode,
  parseCurrencyInputDraft,
} from "@/lib/currency";
import { parseNumericInputDraft } from "@/lib/numeric-input";
import { boundScenarioNumber, scenarioLimits } from "@/lib/scenario-validation";
import type { ScenarioInput } from "@/lib/types";
import type { BTCPriceLoadState } from "./CalculatorExperience";

type ScenarioFormProps = {
  value: ScenarioInput;
  btcPriceStatus: BTCPriceLoadState;
  btcPriceWasManuallyEdited: boolean;
  multiCurrencyEnabled: boolean;
  onCurrencyChange: (currencyCode: ScenarioInput["currencyCode"]) => void;
  onItemPriceManualChange: () => void;
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

export function ScenarioForm({
  value,
  btcPriceStatus,
  btcPriceWasManuallyEdited,
  multiCurrencyEnabled,
  onCurrencyChange,
  onItemPriceManualChange,
  onBTCPriceManualChange,
  onChange,
}: ScenarioFormProps) {
  const [errors, setErrors] = useState<Partial<Record<NumericField, string>>>({});
  const [activeNumericField, setActiveNumericField] =
    useState<NumericField | null>(null);
  const [numericDrafts, setNumericDrafts] = useState<
    Partial<Record<NumericField, string>>
  >({});

  const update = <K extends keyof ScenarioInput>(
    key: K,
    nextValue: ScenarioInput[K],
  ) => onChange({ ...value, [key]: nextValue });

  const parseFieldDraft = (key: NumericField, draft: string) =>
    key === "currentItemPriceUSD" || key === "currentBTCPriceUSD"
      ? parseCurrencyInputDraft(draft, normalizeCurrencyCode(value.currencyCode))
      : parseNumericInputDraft(draft);

  const isValidNumber = (key: NumericField, parsed: number | null) => {
    const { min, max } = scenarioLimits[key];
    return (
      parsed !== null &&
      Number.isFinite(parsed) &&
      parsed >= min &&
      parsed <= max &&
      (key !== "years" || Number.isInteger(parsed))
    );
  };

  const numberUpdate = (key: NumericField, nextValue: string) => {
    setNumericDrafts((current) => ({ ...current, [key]: nextValue }));

    const parsed = parseFieldDraft(key, nextValue);
    const { min, max } = scenarioLimits[key];
    const valid = isValidNumber(key, parsed);
    setErrors((current) => ({
      ...current,
      [key]: valid
        ? ""
        : `Enter ${key === "years" ? "a whole number" : "a number"} from ${min} to ${max}. Results keep the last valid value.`,
    }));
    if (valid && parsed !== null) update(key, parsed);
  };

  const fieldNumber = (key: NumericField) =>
    key === "currentItemPriceUSD" || key === "currentBTCPriceUSD"
      ? new Intl.NumberFormat(currencyMetadata[normalizeCurrencyCode(value.currencyCode)].locale, {
          useGrouping: false, maximumFractionDigits: 20,
        }).format(value[key])
      : String(value[key]);

  const normalizeNumber = (key: NumericField) => {
    const parsed = parseFieldDraft(key, numericDrafts[key] ?? fieldNumber(key));
    if (!isValidNumber(key, parsed) || parsed === null) return;

    update(key, boundScenarioNumber(key, parsed));
    setNumericDrafts((current) => ({ ...current, [key]: undefined }));
    setActiveNumericField(null);
  };

  const getNumberValue = (key: NumericField) =>
    activeNumericField === key || Boolean(errors[key])
      ? (numericDrafts[key] ?? fieldNumber(key))
      : fieldNumber(key);

  const startNumberEdit = (key: NumericField) => {
    setActiveNumericField(key);
    setNumericDrafts((current) => ({
      ...current,
      [key]: current[key] ?? fieldNumber(key),
    }));
  };

  return (
    <section className="panel min-w-0 rounded-lg p-5 sm:p-7">
      <div className="space-y-7">
        <div>
          <p className="eyebrow mb-4">1. What are you calculating?</p>
          <label className="text-sm text-[var(--text-secondary)]" htmlFor="itemName">
            Item name
          </label>
          <input
            id="itemName"
            maxLength={90}
            className="field mt-2"
            value={value.itemName}
            onChange={(event) => update("itemName", event.target.value)}
          />
        </div>

        <div>
          <p className="eyebrow mb-4">2. Today&apos;s prices</p>
          {multiCurrencyEnabled ? (
            <div className="mb-4">
              <label className="text-sm text-[var(--text-secondary)]" htmlFor="currencyCode">
                Local currency
              </label>
              <select
                id="currencyCode"
                className="field mt-2"
                value={normalizeCurrencyCode(value.currencyCode)}
                onChange={(event) =>
                  onCurrencyChange(
                    event.target.value as ScenarioInput["currencyCode"],
                  )
                }
              >
                <option value="USD">USD - U.S. dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - Pound sterling</option>
                <option value="CHF">CHF - Swiss franc</option>
                <option value="JPY">JPY - Japanese yen</option>
              </select>
              <p className="mt-2 text-xs leading-5 text-[var(--text-subtle)]">
                Bitcoin remains the benchmark. Fiat reference rates are educational,
                not executable exchange quotes.
              </p>
            </div>
          ) : null}
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <div className="grid content-start">
              <label
                className="text-sm text-[var(--text-secondary)] sm:min-h-10"
                htmlFor="currentItemPriceUSD"
              >
                Current item price in {normalizeCurrencyCode(value.currencyCode)}
              </label>
              <input
                id="currentItemPriceUSD"
                className="field mt-2"
                inputMode="decimal"
                type="text"
                aria-label={`Current item price in ${normalizeCurrencyCode(value.currencyCode)}`}
                value={getNumberValue("currentItemPriceUSD")}
                aria-invalid={Boolean(errors.currentItemPriceUSD)}
                aria-describedby={errors.currentItemPriceUSD ? "currentItemPriceUSD-error" : undefined}
                onBlur={() => normalizeNumber("currentItemPriceUSD")}
                onChange={(event) => {
                  onItemPriceManualChange();
                  numberUpdate("currentItemPriceUSD", event.target.value);
                }}
                onFocus={() => startNumberEdit("currentItemPriceUSD")}
              />
              {errors.currentItemPriceUSD && (
                <span id="currentItemPriceUSD-error" role="alert" className="mt-2 block text-xs leading-5 text-[var(--accent-text)]">
                  {errors.currentItemPriceUSD}
                </span>
              )}
            </div>
            <div className="grid content-start">
              <label
                className="text-sm text-[var(--text-secondary)] sm:min-h-10"
                htmlFor="currentBTCPriceUSD"
              >
                Current Bitcoin price in {normalizeCurrencyCode(value.currencyCode)}
              </label>
              <input
                id="currentBTCPriceUSD"
                className="field mt-2"
                inputMode="decimal"
                type="text"
                aria-label={`Current Bitcoin price in ${normalizeCurrencyCode(value.currencyCode)}`}
                value={getNumberValue("currentBTCPriceUSD")}
                aria-invalid={Boolean(errors.currentBTCPriceUSD)}
                aria-describedby={errors.currentBTCPriceUSD ? "currentBTCPriceUSD-error" : undefined}
                onBlur={() => normalizeNumber("currentBTCPriceUSD")}
                onChange={(event) => {
                  onBTCPriceManualChange();
                  numberUpdate("currentBTCPriceUSD", event.target.value);
                }}
                onFocus={() => startNumberEdit("currentBTCPriceUSD")}
              />
              {errors.currentBTCPriceUSD && (
                <span id="currentBTCPriceUSD-error" role="alert" className="mt-2 block text-xs leading-5 text-[var(--accent-text)]">
                  {errors.currentBTCPriceUSD}
                </span>
              )}
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
            <label className="text-sm text-[var(--text-secondary)]">
              Time horizon in years
              <input
                className="field mt-2"
                inputMode="numeric"
                type="text"
                aria-label="Time horizon in years"
                value={getNumberValue("years")}
                aria-invalid={Boolean(errors.years)}
                aria-describedby={errors.years ? "years-error" : undefined}
                onBlur={() => normalizeNumber("years")}
                onChange={(event) => numberUpdate("years", event.target.value)}
                onFocus={() => startNumberEdit("years")}
              />
              {errors.years && (
                <span id="years-error" role="alert" className="mt-2 block text-xs leading-5 text-[var(--accent-text)]">
                  {errors.years}
                </span>
              )}
            </label>
            <label className="text-sm text-[var(--text-secondary)]">
              Annual item inflation rate (%)
              <input
                className="field mt-2"
                inputMode="decimal"
                type="text"
                aria-label="Annual item inflation rate (%)"
                value={getNumberValue("itemInflationRate")}
                aria-invalid={Boolean(errors.itemInflationRate)}
                aria-describedby={errors.itemInflationRate ? "itemInflationRate-error" : undefined}
                onBlur={() => normalizeNumber("itemInflationRate")}
                onChange={(event) =>
                  numberUpdate("itemInflationRate", event.target.value)
                }
                onFocus={() => startNumberEdit("itemInflationRate")}
              />
              {errors.itemInflationRate && (
                <span id="itemInflationRate-error" role="alert" className="mt-2 block text-xs leading-5 text-[var(--accent-text)]">
                  {errors.itemInflationRate}
                </span>
              )}
            </label>
            <label className="text-sm text-[var(--text-secondary)]">
              Annual BTC growth assumption (%)
              <input
                className="field mt-2"
                inputMode="decimal"
                type="text"
                aria-label="Annual BTC growth assumption (%)"
                value={getNumberValue("btcGrowthRate")}
                aria-invalid={Boolean(errors.btcGrowthRate)}
                aria-describedby={errors.btcGrowthRate ? "btcGrowthRate-error" : undefined}
                onBlur={() => normalizeNumber("btcGrowthRate")}
                onChange={(event) =>
                  numberUpdate("btcGrowthRate", event.target.value)
                }
                onFocus={() => startNumberEdit("btcGrowthRate")}
              />
              {errors.btcGrowthRate && (
                <span id="btcGrowthRate-error" role="alert" className="mt-2 block text-xs leading-5 text-[var(--accent-text)]">
                  {errors.btcGrowthRate}
                </span>
              )}
            </label>
            <div className="rounded-md border border-[var(--neutral-line)] p-4 text-sm leading-5 text-[var(--text-muted)]">
              Enter rates as percentages: 4 means 4% per year. Negative rates
              model a decrease. These are assumptions, not predictions.
            </div>
          </div>
        </div>

        <div>
          <p className="eyebrow mb-4">4. Purchase type</p>
          <div className="grid overflow-hidden rounded-md border border-[var(--neutral-line)] sm:grid-cols-2">
            {[
              ["one-time", "One-time purchase", "Buying the item once"],
              ["monthly", "Monthly expense", "Recurring monthly cost"],
            ].map(([type, label, description]) => (
              <button
                key={type}
                aria-pressed={value.purchaseType === type}
                type="button"
                className={`p-4 text-left transition ${
                  value.purchaseType === type
                    ? "border border-[var(--accent)] bg-[var(--accent-surface-strong)] text-[var(--accent-text)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                }`}
                onClick={() =>
                  update("purchaseType", type as ScenarioInput["purchaseType"])
                }
              >
                <span className="block font-medium">{label}</span>
                <span className="mt-1 block text-sm text-[var(--text-muted)]">
                  {description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <a
        href="#scenario-results"
        className="copper-button mt-6 block rounded-md px-4 py-3 text-center font-semibold xl:hidden"
      >
        View results
      </a>
      <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
        Results update automatically. No Calculate button is needed.
      </p>
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
      <span className="mt-2 block text-xs leading-5 text-[var(--accent-text)]">
        Manual BTC price active. Live updates will not replace this value.
      </span>
    );
  }

  if (btcPriceStatus.status === "loading") {
    return (
      <span className="mt-2 block text-xs leading-5 text-[var(--text-muted)]">
        Loading live BTC price...
      </span>
    );
  }

  if (btcPriceStatus.status === "error") {
    return (
      <span className="mt-2 block text-xs leading-5 text-[var(--accent-text)]">
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

  if (data.manualPriceRequired) {
    return (
      <span className="mt-2 block text-xs leading-5 text-[var(--accent-text)]">
        The local-currency reference rate is unavailable. Enter a Bitcoin price
        in {data.currencyCode} manually; the app will not label it as live.
      </span>
    );
  }

  if (data.status === "fallback") {
    return (
      <span className="mt-2 block text-xs leading-5 text-[var(--accent-text)]">
        Reference pricing is unavailable. Keeping your current editable BTC value;{" "}
        {formatCurrency(data.fallbackPrice, data.currencyCode)} remains the fallback reference.
      </span>
    );
  }

  return (
    <span className="mt-2 block text-xs leading-5 text-[var(--text-muted)]">
      CoinGecko BTC price loaded
      {data.stale ? " but may be stale" : ""}: updated {updatedAt}.
      {data.currencyCode !== "USD" && data.fiatRateProvider
        ? ` ${data.currencyCode} conversion uses ${data.fiatRateProvider} reference rates.`
        : ""}
    </span>
  );
}
