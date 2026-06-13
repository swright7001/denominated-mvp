"use client";

import { FormEvent, useState } from "react";
import { BookmarkPlus, Check, Mail, X } from "lucide-react";
import {
  addSavedScenario,
  parseSavedScenarios,
  serializeSavedScenarios,
  WATCHLIST_STORAGE_KEY,
} from "@/lib/watchlist";
import type { ScenarioInput } from "@/lib/types";

const watchlistChangedEvent = "denominated-watchlist-changed";
const freeScenarioCompletedKey = "denominated.freeScenarioCompleted.v1";
const signupEmailKey = "denominated.signupEmail.v1";
const signupPromptDismissedKey = "denominated.signupPromptDismissed.v1";

export function SaveScenarioButton({ scenario }: { scenario: ScenarioInput }) {
  const [saved, setSaved] = useState(false);
  const [isSignupPromptOpen, setIsSignupPromptOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [signedUp, setSignedUp] = useState(false);

  function saveScenario() {
    const current = parseSavedScenarios(
      window.localStorage.getItem(WATCHLIST_STORAGE_KEY),
    );
    const next = addSavedScenario(current, scenario);

    window.localStorage.setItem(
      WATCHLIST_STORAGE_KEY,
      serializeSavedScenarios(next),
    );
    window.dispatchEvent(new Event(watchlistChangedEvent));
    maybePromptForSignup();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  }

  function maybePromptForSignup() {
    const hasCompletedFreeScenario = window.localStorage.getItem(
      freeScenarioCompletedKey,
    );
    const hasSignupEmail = window.localStorage.getItem(signupEmailKey);
    const hasDismissedPrompt = window.localStorage.getItem(
      signupPromptDismissedKey,
    );

    if (!hasCompletedFreeScenario) {
      window.localStorage.setItem(freeScenarioCompletedKey, "true");
    }

    if (!hasSignupEmail && !hasDismissedPrompt) {
      setIsSignupPromptOpen(true);
    }
  }

  function submitSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Enter an email address to save updates.");
      return;
    }

    window.localStorage.setItem(signupEmailKey, trimmedEmail);
    window.localStorage.removeItem(signupPromptDismissedKey);
    setEmailError("");
    setSignedUp(true);
  }

  function continueWithoutAccount() {
    window.localStorage.setItem(signupPromptDismissedKey, "true");
    setIsSignupPromptOpen(false);
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

      {isSignupPromptOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/72 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signup-prompt-title"
        >
          <div className="panel relative w-full max-w-lg overflow-hidden rounded-lg p-6 shadow-2xl sm:p-7">
            <button
              type="button"
              className="outline-button absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-md text-[#f0a36f]"
              aria-label="Close signup prompt"
              onClick={continueWithoutAccount}
            >
              <X size={18} />
            </button>

            {signedUp ? (
              <div>
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-full border border-[rgba(240,163,111,0.34)] bg-[#2a1810]/55 text-[#f0a36f]">
                  <Check size={22} />
                </div>
                <p className="eyebrow mb-3">You&apos;re on the list</p>
                <h2
                  id="signup-prompt-title"
                  className="text-2xl font-medium text-[#efe6da]"
                >
                  We&apos;ll build your watchlist foundation here.
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#b9ab9a]">
                  Your scenario is saved locally for now. When accounts are
                  connected, this email becomes the starting point for saved
                  scenarios and purchasing-power updates.
                </p>
                <button
                  type="button"
                  className="copper-button mt-6 w-full rounded-md px-4 py-3 font-semibold"
                  onClick={() => setIsSignupPromptOpen(false)}
                >
                  Continue
                </button>
              </div>
            ) : (
              <form onSubmit={submitSignup}>
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-full border border-[rgba(240,163,111,0.34)] bg-[#2a1810]/55 text-[#f0a36f]">
                  <Mail size={22} />
                </div>
                <p className="eyebrow mb-3">Save this scenario</p>
                <h2
                  id="signup-prompt-title"
                  className="pr-8 text-2xl font-medium text-[#efe6da]"
                >
                  Want Denominated to track this over time?
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#b9ab9a]">
                  Create a free account foundation with your email so you can
                  save scenarios, track purchasing power, get updates, and build
                  a personal watchlist.
                </p>

                <label className="mt-5 block text-sm text-[#d9ccbd]">
                  Email address
                  <input
                    className="field mt-2"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setEmailError("");
                    }}
                    placeholder="you@example.com"
                  />
                </label>
                {emailError && (
                  <p className="mt-2 text-sm text-[#f0a36f]">{emailError}</p>
                )}

                <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <button
                    type="submit"
                    className="copper-button rounded-md px-4 py-3 font-semibold"
                  >
                    Save and Track
                  </button>
                  <button
                    type="button"
                    className="outline-button rounded-md px-4 py-3 text-[#f0a36f]"
                    onClick={continueWithoutAccount}
                  >
                    Continue without account
                  </button>
                </div>
                <p className="mt-4 text-xs leading-5 text-[#b9ab9a]">
                  Educational only. No financial advice. Phone alerts can come
                  later, but phone number is not required now.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
