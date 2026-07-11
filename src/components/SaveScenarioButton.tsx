"use client";

import { useState } from "react";
import Link from "next/link";
import { BookmarkPlus, Check, Lock, LogIn } from "lucide-react";
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
  buildSavedScenario,
  parseSavedScenarios,
  serializeSavedScenarios,
  WATCHLIST_STORAGE_KEY,
  watchlistChangedEvent,
} from "@/lib/watchlist";
import type { ScenarioInput } from "@/lib/types";
import { PurchasingPowerCommitmentPrompt } from "./PurchasingPowerCommitmentPrompt";
import { SignupPrompt } from "./SignupPrompt";

export function SaveScenarioButton({
  scenario,
  realAccountsEnabled = false,
}: {
  scenario: ScenarioInput;
  realAccountsEnabled?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [accountRequired, setAccountRequired] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
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

  async function continueSaveScenario() {
    setAccountRequired(false);
    setSyncError("");
    setLimitReached(false);

    if (realAccountsEnabled) {
      await saveScenarioToAccount();
      return;
    }

    saveScenarioLocally();
  }

  function saveScenarioLocally() {
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

    const savedScenario = buildSavedScenario(scenario);
    const next = [savedScenario, ...current];

    window.localStorage.setItem(
      WATCHLIST_STORAGE_KEY,
      serializeSavedScenarios(next),
    );
    window.dispatchEvent(new Event(watchlistChangedEvent));
    setLimitReached(false);
    showSavedState();
  }

  async function saveScenarioToAccount() {
    const savedScenario = buildSavedScenario(scenario);

    setIsSaving(true);

    try {
      const response = await fetch("/api/scenarios/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedScenario }),
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        code?: string;
      } | null;

      if (!response.ok) {
        if (response.status === 401) {
          setAccountRequired(true);
          return;
        }

        if (payload?.code === "SAVE_LIMIT_REACHED") {
          setLimitReached(true);
          return;
        }

        setSyncError(
          payload?.error ??
            "Saved scenario account sync is not ready yet. Please try again later.",
        );
        return;
      }

      showSavedState();
    } catch {
      setSyncError("Saved scenario account sync failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
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
        disabled={isSaving}
        onClick={saveScenario}
      >
        {saved ? <Check size={18} /> : <BookmarkPlus size={18} />}
        {isSaving
          ? "Saving..."
          : saved
            ? realAccountsEnabled
              ? "Saved to Account"
              : "Saved to Watchlist"
            : "Save Scenario"}
      </button>

      {accountRequired ? (
        <div className="mt-3 max-w-xl rounded-md border border-[rgba(240,163,111,0.26)] bg-black/24 p-4 text-sm leading-6 text-[#b9ab9a]">
          <p className="flex items-start gap-2">
            <LogIn className="mt-0.5 shrink-0 text-[#f0a36f]" size={16} />
            <span>
              <span className="block font-medium text-[#efe6da]">
                Sign in to save this scenario
              </span>
              <span className="mt-1 block">
                The calculator stays free. Account saving keeps this scenario
                tied to you across devices.
              </span>
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link className="text-[#f0a36f]" href="/sign-up">
              Create account
            </Link>
            <Link className="text-[#d9ccbd]" href="/sign-in">
              Sign in
            </Link>
          </div>
        </div>
      ) : null}

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

      {syncError ? (
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#f0a36f]">
          {syncError}
        </p>
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
