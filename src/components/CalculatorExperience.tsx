"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  signupEmailKey,
  signupPromptDismissedKey,
  signupPromptShownKey,
} from "@/lib/account";
import { calculateScenario } from "@/lib/calculations";
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
};

export function CalculatorExperience({
  initialScenario = defaultScenario,
  hasSharedScenario = false,
  realAccountsEnabled = false,
}: CalculatorExperienceProps) {
  const [scenario, setScenario] = useState<ScenarioInput>(initialScenario);
  const [btcPriceStatus, setBtcPriceStatus] = useState<BTCPriceLoadState>({
    status: "loading",
  });
  const [btcPriceWasManuallyEdited, setBtcPriceWasManuallyEdited] =
    useState(hasSharedScenario);
  const [isSoftSignupPromptOpen, setIsSoftSignupPromptOpen] = useState(false);
  const btcPriceWasEdited = useRef(hasSharedScenario);
  const result = useMemo(() => calculateScenario(scenario), [scenario]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBTCPrice() {
      try {
        const response = await fetch("/api/prices/bitcoin", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Live BTC price request failed");
        }

        const data = (await response.json()) as BTCPriceResult;
        setBtcPriceStatus({ status: "ready", data });

        if (!btcPriceWasEdited.current && data.status !== "fallback") {
          setScenario((current) => ({
            ...current,
            currentBTCPriceUSD: Math.round(data.priceUSD),
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
  }, []);

  useEffect(() => {
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
  }, []);

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
          onBTCPriceManualChange={() => {
            btcPriceWasEdited.current = true;
            setBtcPriceWasManuallyEdited(true);
          }}
          onChange={setScenario}
        />
        <div className="min-w-0 space-y-6">
          <ResultCards scenario={scenario} result={result} />
          <BTCComparisonChart result={result} />
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
        onClose={() => setIsSoftSignupPromptOpen(false)}
      />
    </div>
  );
}

export type BTCPriceLoadState =
  | { status: "loading" }
  | { status: "ready"; data: BTCPriceResult }
  | { status: "error"; message: string };
