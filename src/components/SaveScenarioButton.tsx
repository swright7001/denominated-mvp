"use client";

import { useState } from "react";
import { BookmarkPlus, Check } from "lucide-react";
import { signupEmailKey } from "@/lib/account";
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
  const [isSignupPromptOpen, setIsSignupPromptOpen] = useState(false);

  function saveScenario() {
    const hasSignupEmail = window.localStorage.getItem(signupEmailKey);

    if (!hasSignupEmail) {
      setIsSignupPromptOpen(true);
      return;
    }

    const current = parseSavedScenarios(
      window.localStorage.getItem(WATCHLIST_STORAGE_KEY),
    );
    const next = addSavedScenario(current, scenario);

    window.localStorage.setItem(
      WATCHLIST_STORAGE_KEY,
      serializeSavedScenarios(next),
    );
    window.dispatchEvent(new Event(watchlistChangedEvent));
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
