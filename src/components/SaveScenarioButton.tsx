"use client";

import { useState } from "react";
import Link from "next/link";
import { BookmarkPlus, Check, Lock } from "lucide-react";
import {
  hasAcceptedPurchasingPowerCommitment,
  signupEmailKey,
} from "@/lib/account";
import {
  canSaveScenario,
  getMockPlanTierFromStorage,
} from "@/lib/entitlements";
import { getProConversionCopy } from "@/lib/pro-copy";
import {
  addSavedScenario,
  parseSavedScenarios,
  serializeSavedScenarios,
  WATCHLIST_STORAGE_KEY,
  watchlistChangedEvent,
} from "@/lib/watchlist";
import type { ScenarioInput } from "@/lib/types";
import { PurchasingPowerCommitmentPrompt } from "./PurchasingPowerCommitmentPrompt";
import { SignupPrompt } from "./SignupPrompt";

export function SaveScenarioButton({ scenario }: { scenario: ScenarioInput }) {
  const [saved, setSaved] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [isCommitmentPromptOpen, setIsCommitmentPromptOpen] = useState(false);
  const [isSignupPromptOpen, setIsSignupPromptOpen] = useState(false);
  const saveLimitCopy = getProConversionCopy("saveLimitReached");

  function saveScenario() {
    if (!hasAcceptedPurchasingPowerCommitment(window.localStorage)) {
      setIsCommitmentPromptOpen(true);
      return;
    }

    continueSaveScenario();
  }

  function continueSaveScenario() {
    const hasSignupEmail = window.localStorage.getItem(signupEmailKey);
    const planTier = getMockPlanTierFromStorage(window.localStorage);

    if (!hasSignupEmail) {
      setIsSignupPromptOpen(true);
      return;
    }

    const current = parseSavedScenarios(
      window.localStorage.getItem(WATCHLIST_STORAGE_KEY),
    );
    const decision = canSaveScenario(planTier, current.length);

    if (!decision.allowed) {
      setLimitReached(decision.reason === "limit-reached");
      return;
    }

    const next = addSavedScenario(current, scenario);

    window.localStorage.setItem(
      WATCHLIST_STORAGE_KEY,
      serializeSavedScenarios(next),
    );
    window.dispatchEvent(new Event(watchlistChangedEvent));
    setLimitReached(false);
    showSavedState();
  }

  function showSavedState() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  }

  return (
    <>
      <button
        type="button"
        className="copper-button inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-semibold transition hover:brightness-110 sm:w-auto"
        onClick={saveScenario}
      >
        {saved ? <Check size={18} /> : <BookmarkPlus size={18} />}
        {saved ? "Saved to Watchlist" : "Save Scenario"}
      </button>

      {limitReached ? (
        <div className="mt-3 max-w-xl rounded-md border border-[rgba(240,163,111,0.26)] bg-black/24 p-4 text-sm leading-6 text-[#b9ab9a]">
          <p className="flex items-start gap-2">
            <Lock className="mt-0.5 shrink-0 text-[#f0a36f]" size={16} />
            <span>
              <span className="block font-medium text-[#efe6da]">
                {saveLimitCopy.title}
              </span>
              <span className="mt-1 block">{saveLimitCopy.body}</span>
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link className="text-[#f0a36f]" href="/plans">
              {saveLimitCopy.primaryCta}
            </Link>
            <Link className="text-[#d9ccbd]" href="/calculator">
              {saveLimitCopy.secondaryCta}
            </Link>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#8f8172]">
            {saveLimitCopy.footnote}
          </p>
        </div>
      ) : null}

      <PurchasingPowerCommitmentPrompt
        isOpen={isCommitmentPromptOpen}
        onAccept={() => {
          setIsCommitmentPromptOpen(false);
          continueSaveScenario();
        }}
        onClose={() => setIsCommitmentPromptOpen(false)}
      />

      <SignupPrompt
        isOpen={isSignupPromptOpen}
        scenario={scenario}
        onClose={() => setIsSignupPromptOpen(false)}
        onSaved={showSavedState}
        persistDismissalOnContinue={false}
      />
    </>
  );
}
