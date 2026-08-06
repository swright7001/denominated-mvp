"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Check, Mail, X } from "lucide-react";
import {
  defaultEmailPreferences,
  emailPreferencesKey,
  isValidEmail,
  serializeEmailPreferences,
  signupEmailKey,
  signupPromptDismissedKey,
} from "@/lib/account";
import { getProConversionCopy } from "@/lib/pro-copy";
import type { ScenarioInput } from "@/lib/types";
import {
  addSavedScenario,
  parseSavedScenarios,
  serializeSavedScenarios,
  WATCHLIST_STORAGE_KEY,
  watchlistChangedEvent,
} from "@/lib/watchlist";

export function SignupPrompt({
  isOpen,
  scenario,
  onClose,
  onSaved,
  persistDismissalOnContinue = true,
  realAccountsEnabled = false,
}: {
  isOpen: boolean;
  scenario?: ScenarioInput;
  onClose: () => void;
  onSaved?: () => void;
  persistDismissalOnContinue?: boolean;
  realAccountsEnabled?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [signedUp, setSignedUp] = useState(false);
  const saveFirstScenarioCopy = getProConversionCopy("saveFirstScenario");

  if (!isOpen) return null;

  function submitSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!isValidEmail(trimmedEmail)) {
      setEmailError("Enter an email address to save this scenario.");
      return;
    }

    window.localStorage.setItem(signupEmailKey, trimmedEmail);
    window.localStorage.setItem(
      emailPreferencesKey,
      serializeEmailPreferences(defaultEmailPreferences),
    );
    window.localStorage.removeItem(signupPromptDismissedKey);

    if (scenario) {
      const current = parseSavedScenarios(
        window.localStorage.getItem(WATCHLIST_STORAGE_KEY),
      );
      const next = addSavedScenario(current, scenario);

      window.localStorage.setItem(
        WATCHLIST_STORAGE_KEY,
        serializeSavedScenarios(next),
      );
      window.dispatchEvent(new Event(watchlistChangedEvent));
      onSaved?.();
    }

    setEmailError("");
    setSignedUp(true);
  }

  function continueWithoutAccount() {
    if (persistDismissalOnContinue) {
      window.localStorage.setItem(signupPromptDismissedKey, "true");
    }

    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[var(--surface-overlay)] px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-prompt-title"
    >
      <div className="panel relative w-full max-w-lg overflow-hidden rounded-lg p-6 shadow-2xl sm:p-7">
        <button
          type="button"
          className="outline-button absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-md text-[var(--accent-text)]"
          aria-label="Close signup prompt"
          onClick={continueWithoutAccount}
        >
          <X size={18} />
        </button>

        {signedUp && !realAccountsEnabled ? (
          <div>
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-surface)] text-[var(--accent-text)]">
              <Check size={22} />
            </div>
            <p className="eyebrow mb-3">Scenario saved</p>
            <h2
              id="signup-prompt-title"
              className="text-2xl font-medium text-[var(--text-primary)]"
            >
              Your purchasing-power watchlist is started.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              Your scenario is saved locally for now. When accounts and email
              delivery are connected, this address can power saved scenarios,
              snapshots, and purchasing-power updates.
            </p>
            <button
              type="button"
              className="copper-button mt-6 w-full rounded-md px-4 py-3 font-semibold"
              onClick={onClose}
            >
              Continue
            </button>
          </div>
        ) : realAccountsEnabled ? (
          <div>
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-surface)] text-[var(--accent-text)]">
              <Mail size={22} />
            </div>
            <p className="eyebrow mb-3">{saveFirstScenarioCopy.eyebrow}</p>
            <h2
              id="signup-prompt-title"
              className="pr-8 text-2xl font-medium text-[var(--text-primary)]"
            >
              {saveFirstScenarioCopy.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              {saveFirstScenarioCopy.body}
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {saveFirstScenarioCopy.features.map((feature) => (
                <p
                  key={feature}
                  className="rounded-md border border-[var(--neutral-line-soft)] bg-[var(--surface-soft)] p-3 text-xs leading-5 text-[var(--text-secondary)]"
                >
                  {feature}
                </p>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <Link
                className="copper-button rounded-md px-4 py-3 text-center font-semibold"
                href="/sign-up"
              >
                {saveFirstScenarioCopy.primaryCta}
              </Link>
              <button
                type="button"
                className="outline-button rounded-md px-4 py-3 text-[var(--accent-text)]"
                onClick={continueWithoutAccount}
              >
                {saveFirstScenarioCopy.secondaryCta}
              </button>
            </div>
            <p className="mt-4 text-xs leading-5 text-[var(--text-muted)]">
              Email is required when you create an account. Phone number is not
              required. {saveFirstScenarioCopy.footnote}
            </p>
          </div>
        ) : (
          <form onSubmit={submitSignup}>
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-surface)] text-[var(--accent-text)]">
              <Mail size={22} />
            </div>
            <p className="eyebrow mb-3">{saveFirstScenarioCopy.eyebrow}</p>
            <h2
              id="signup-prompt-title"
              className="pr-8 text-2xl font-medium text-[var(--text-primary)]"
            >
              {saveFirstScenarioCopy.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              {saveFirstScenarioCopy.body}
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {saveFirstScenarioCopy.features.map((feature) => (
                <p
                  key={feature}
                  className="rounded-md border border-[var(--neutral-line-soft)] bg-[var(--surface-soft)] p-3 text-xs leading-5 text-[var(--text-secondary)]"
                >
                  {feature}
                </p>
              ))}
            </div>

            <label className="mt-5 block text-sm text-[var(--text-secondary)]">
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
              <p className="mt-2 text-sm text-[var(--accent-text)]">{emailError}</p>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <button
                type="submit"
                className="copper-button rounded-md px-4 py-3 font-semibold"
              >
                {saveFirstScenarioCopy.primaryCta}
              </button>
              <button
                type="button"
                className="outline-button rounded-md px-4 py-3 text-[var(--accent-text)]"
                onClick={continueWithoutAccount}
              >
                {saveFirstScenarioCopy.secondaryCta}
              </button>
            </div>
            <p className="mt-4 text-xs leading-5 text-[var(--text-muted)]">
              {saveFirstScenarioCopy.footnote}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
