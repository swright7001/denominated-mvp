"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import {
  signupEmailKey,
  signupPromptDismissedKey,
  signupPromptShownKey,
} from "@/lib/account";
import { calculateScenario } from "@/lib/calculations";
import {
  normalizeCurrencyCode,
  roundCurrencyAmount,
} from "@/lib/currency";
import { defaultScenario } from "@/lib/scenarios";
import type { BTCPriceResult } from "@/lib/btc-price";
import type { ScenarioInput } from "@/lib/types";
import { AssumptionsPanel } from "./AssumptionsPanel";
import { BTCComparisonChart } from "./BTCComparisonChart";
import { CopyScenarioLinkButton } from "./CopyScenarioLinkButton";
import { CopyTweetButton } from "./CopyTweetButton";
import { OpportunityCostCard } from "./OpportunityCostCard";
import { ResultCards } from "./ResultCards";
import { SaveScenarioButton } from "./SaveScenarioButton";
import { ScenarioForm } from "./ScenarioForm";
import { ShareableResultCard } from "./ShareableResultCard";
import { SignupPrompt } from "./SignupPrompt";

type CalculatorExperienceProps = {
  initialScenario?: ScenarioInput;
  hasSharedScenario?: boolean;
  realAccountsEnabled?: boolean;
  isSignedIn?: boolean;
  multiCurrencyEnabled?: boolean;
};

export function CalculatorExperience({
  initialScenario = defaultScenario,
  hasSharedScenario = false,
  realAccountsEnabled = false,
  isSignedIn = false,
  multiCurrencyEnabled = false,
}: CalculatorExperienceProps) {
  const [scenario, setScenario] = useState<ScenarioInput>({
    ...initialScenario,
    currencyCode: normalizeCurrencyCode(initialScenario.currencyCode),
  });
  const [btcPriceStatus, setBtcPriceStatus] = useState<BTCPriceLoadState>({
    status: "loading",
  });
  const [btcPriceWasManuallyEdited, setBtcPriceWasManuallyEdited] =
    useState(hasSharedScenario);
  const [isSoftSignupPromptOpen, setIsSoftSignupPromptOpen] = useState(false);
  const btcPriceWasEdited = useRef(hasSharedScenario);
  const itemPriceWasEdited = useRef(hasSharedScenario);
  const result = useMemo(() => calculateScenario(scenario), [scenario]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBTCPrice() {
      try {
        const currencyCode = normalizeCurrencyCode(initialScenario.currencyCode);
        const response = await fetch(
          `/api/prices/bitcoin?currency=${currencyCode}`,
          {
          signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Live BTC price request failed");
        }

        const data = (await response.json()) as BTCPriceResult;
        setBtcPriceStatus({ status: "ready", data });

        if (!btcPriceWasEdited.current && data.status !== "fallback") {
          setScenario((current) => ({
            ...current,
            currentBTCPriceUSD: Math.round(data.price),
          }));
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        setBtcPriceStatus({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Live BTC price request failed",
        });
      }
    }

    loadBTCPrice();

    return () => controller.abort();
  }, [initialScenario.currencyCode]);

  async function changeCurrency(nextCurrencyValue: ScenarioInput["currencyCode"]) {
    const nextCurrency = normalizeCurrencyCode(nextCurrencyValue);
    const currentCurrency = normalizeCurrencyCode(scenario.currencyCode);
    if (nextCurrency === currentCurrency) return;

    setBtcPriceStatus({ status: "loading" });

    try {
      const response = await fetch(
        `/api/prices/bitcoin?currency=${nextCurrency}`,
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error("Currency reference request failed");

      const data = (await response.json()) as BTCPriceResult;
      setBtcPriceStatus({ status: "ready", data });

      const hasManualValues = itemPriceWasEdited.current || btcPriceWasEdited.current;
      const shouldConvert =
        !hasManualValues ||
        window.confirm(
          `Convert your current values from ${currentCurrency} to ${nextCurrency} using the current reference rate? Cancel keeps the numbers unchanged.`,
        );

      setScenario((current) => {
        if (!shouldConvert || data.manualPriceRequired) {
          return { ...current, currencyCode: nextCurrency };
        }

        const conversionRate = data.price / Math.max(current.currentBTCPriceUSD, 1);
        return {
          ...current,
          currencyCode: nextCurrency,
          currentItemPriceUSD: roundCurrencyAmount(
            current.currentItemPriceUSD * conversionRate,
            nextCurrency,
          ),
          currentBTCPriceUSD: roundCurrencyAmount(data.price, nextCurrency),
        };
      });

      btcPriceWasEdited.current = !shouldConvert || Boolean(data.manualPriceRequired);
      itemPriceWasEdited.current = !shouldConvert && itemPriceWasEdited.current;
      setBtcPriceWasManuallyEdited(btcPriceWasEdited.current);
      track("calculator_currency_changed", {
        currencyCode: nextCurrency,
        providerStatus: data.fiatRateStatus ?? data.status,
        surface: "calculator",
      });
    } catch (error) {
      setScenario((current) => ({ ...current, currencyCode: nextCurrency }));
      setBtcPriceWasManuallyEdited(true);
      btcPriceWasEdited.current = true;
      setBtcPriceStatus({
        status: "error",
        message: error instanceof Error ? error.message : "Currency reference request failed",
      });
      track("calculator_currency_changed", {
        currencyCode: nextCurrency,
        providerStatus: "error",
        surface: "calculator",
      });
    }
  }

  useEffect(() => {
    if (isSignedIn) return;

    const hasSignupEmail = window.localStorage.getItem(signupEmailKey);
    const hasDismissedPrompt = window.localStorage.getItem(
      signupPromptDismissedKey,
    );
    const hasShownPrompt = window.localStorage.getItem(signupPromptShownKey);

    if (hasSignupEmail || hasDismissedPrompt || hasShownPrompt) return;

    const promptTimer = window.setTimeout(() => {
      window.localStorage.setItem(signupPromptShownKey, "true");
      setIsSoftSignupPromptOpen(true);
    }, 1400);

    return () => window.clearTimeout(promptTimer);
  }, [isSignedIn]);

  return (
    <div className="container py-10">
      <div className="mb-8">
        <p className="eyebrow">Calculator</p>
        <h1 className="mt-3 text-4xl font-medium text-[#efe6da] md:text-6xl">
          Run a purchasing-power scenario
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#b9ab9a]">
          Change the price, timeline, and assumptions to see whether an expense
          gets more expensive in dollars but cheaper in Bitcoin terms.
        </p>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[420px_1fr]">
        <ScenarioForm
          value={scenario}
          btcPriceStatus={btcPriceStatus}
          btcPriceWasManuallyEdited={btcPriceWasManuallyEdited}
          multiCurrencyEnabled={multiCurrencyEnabled}
          onCurrencyChange={changeCurrency}
          onItemPriceManualChange={() => {
            itemPriceWasEdited.current = true;
          }}
          onBTCPriceManualChange={() => {
            btcPriceWasEdited.current = true;
            setBtcPriceWasManuallyEdited(true);
          }}
          onChange={setScenario}
        />
        <div className="min-w-0 space-y-6">
          <ResultCards scenario={scenario} result={result} />
          <BTCComparisonChart scenario={scenario} result={result} />
          <div className="grid min-w-0 gap-6 lg:grid-cols-[1fr_1fr]">
            <OpportunityCostCard scenario={scenario} result={result} />
            <AssumptionsPanel scenario={scenario} />
          </div>
          <section className="panel min-w-0 overflow-hidden rounded-lg p-5 sm:p-7">
            <div className="grid min-w-0 gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div className="min-w-0">
                <p className="eyebrow mb-3">Share your results</p>
                <p className="mb-5 max-w-full text-sm leading-6 break-words text-[#b9ab9a]">
                  Spread the message in a format that is easy to screenshot and
                  plain enough for everyday people.
                </p>
                <div className="grid gap-3 sm:flex sm:flex-row sm:flex-wrap">
                  <SaveScenarioButton
                    scenario={scenario}
                    realAccountsEnabled={realAccountsEnabled}
                    isSignedIn={isSignedIn}
                  />
                  <CopyTweetButton scenario={scenario} result={result} />
                  <CopyScenarioLinkButton scenario={scenario} />
                </div>
              </div>
              <ShareableResultCard scenario={scenario} result={result} />
            </div>
          </section>
        </div>
      </div>
      <SignupPrompt
        isOpen={isSoftSignupPromptOpen}
        scenario={scenario}
        realAccountsEnabled={realAccountsEnabled}
        onClose={() => setIsSoftSignupPromptOpen(false)}
      />
    </div>
  );
}

export type BTCPriceLoadState =
  | { status: "loading" }
  | { status: "ready"; data: BTCPriceResult }
  | { status: "error"; message: string };
