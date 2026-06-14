"use client";

import { useState } from "react";
import Link from "next/link";
import { BookmarkPlus, Check, Lock } from "lucide-react";
import { signupEmailKey } from "@/lib/account";
import {
  canSaveScenario,
  getMockPlanTierFromStorage,
} from "@/lib/entitlements";
import {
  addSavedScenario,
  parseSavedScenarios,
  serializeSavedScenarios,
  WATCHLIST_STORAGE_KEY,
  watchlistChangedEvent,
} from "@/lib/watchlist";
import type { ScenarioInput } from "@/lib/types";
import { SignupPrompt } from "./SignupPrompt";

export function SaveScenarioButton({ scenario }: { scenario: ScenarioInput }) {
  const [saved, setSaved] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");
  const [isSignupPromptOpen, setIsSignupPromptOpen] = useState(false);

  function saveScenario() {
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
      setLimitMessage(
        decision.reason === "limit-reached"
          ? "Free accounts can save 1 scenario. Pro and Lifetime will unlock unlimited saved scenarios."
          : "Create a free account to save your first scenario.",
      );
      return;
    }

    const next = addSavedScenario(current, scenario);

    window.localStorage.setItem(
      WATCHLIST_STORAGE_KEY,
      serializeSavedScenarios(next),
    );
    window.dispatchEvent(new Event(watchlistChangedEvent));
    setLimitMessage("");
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

      {limitMessage ? (
        <div className="mt-3 max-w-xl rounded-md border border-[rgba(240,163,111,0.26)] bg-black/24 p-4 text-sm leading-6 text-[#b9ab9a]">
          <p className="flex items-start gap-2">
            <Lock className="mt-0.5 shrink-0 text-[#f0a36f]" size={16} />
            <span>{limitMessage}</span>
          </p>
          <Link className="mt-3 inline-block text-[#f0a36f]" href="/plans">
            Compare plans
          </Link>
        </div>
      ) : null}

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
