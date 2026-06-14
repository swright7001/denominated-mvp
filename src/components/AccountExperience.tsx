"use client";

import Link from "next/link";
import { FormEvent, useSyncExternalStore, useState } from "react";
import { Check, LogOut, Mail, ShieldCheck, Sparkles } from "lucide-react";
import {
  accountChangedEvent,
  getStoredAccountEmail,
  saveLocalAccountEmail,
  signupEmailKey,
} from "@/lib/account";
import {
  getMockPlanTierFromStorage,
  getPlanEntitlements,
  mockPlanTierKey,
  planOrder,
  type PlanTier,
} from "@/lib/entitlements";
import {
  parseSavedScenarios,
  WATCHLIST_STORAGE_KEY,
  watchlistChangedEvent,
} from "@/lib/watchlist";

export function AccountExperience() {
  const email = useSyncExternalStore(
    subscribeToAccount,
    getAccountEmailSnapshot,
    getServerAccountEmailSnapshot,
  );
  const planTier = useSyncExternalStore(
    subscribeToAccount,
    getPlanTierSnapshot,
    getServerPlanTierSnapshot,
  );
  const savedScenarioCount = useSyncExternalStore(
    subscribeToAccount,
    getSavedScenarioCountSnapshot,
    getServerSavedScenarioCountSnapshot,
  );
  const [draftEmail, setDraftEmail] = useState(email);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const plan = getPlanEntitlements(planTier);

  function submitAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const normalizedEmail = saveLocalAccountEmail(
        window.localStorage,
        draftEmail,
      );
      setDraftEmail(normalizedEmail);
      setError("");
      setMessage("Account foundation saved.");
      notifyAccountChanged();
    } catch (caughtError) {
      setMessage("");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save this email.",
      );
    }
  }

  function signOut() {
    window.localStorage.removeItem(signupEmailKey);
    window.localStorage.removeItem(mockPlanTierKey);
    setDraftEmail("");
    setError("");
    setMessage("Signed out locally. Saved scenarios remain on this device.");
    notifyAccountChanged();
  }

  function setMockPlan(tier: PlanTier) {
    window.localStorage.setItem(mockPlanTierKey, tier);
    setMessage(`MVP test plan set to ${getPlanEntitlements(tier).label}.`);
    setError("");
    notifyAccountChanged();
  }

  return (
    <section className="container py-10">
      <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="mt-3 text-4xl font-medium text-[#efe6da] md:text-6xl">
            Your Denominated account foundation
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#b9ab9a]">
            This local-first account layer keeps saved scenarios and future
            billing ready without blocking the free calculator.
          </p>
        </div>
        <Link
          className="copper-button inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 font-semibold"
          href="/calculator"
        >
          <Sparkles size={18} />
          Run a Scenario
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="panel rounded-lg p-5 sm:p-7">
          <div className="mb-5 flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[rgba(240,163,111,0.34)] bg-[#2a1810]/55 text-[#f0a36f]">
              <Mail size={20} />
            </div>
            <div>
              <p className="eyebrow mb-3">Sign in</p>
              <h2 className="text-2xl font-medium text-[#efe6da]">
                {email ? "Local account active" : "Create a free account"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#b9ab9a]">
                {email
                  ? `Signed in locally as ${email}.`
                  : "Use email only for now. Clerk is the selected production auth provider once the marketplace integration is configured."}
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={submitAccount}>
            <label className="block text-sm text-[#d9ccbd]">
              Email address
              <input
                className="field mt-2"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={draftEmail}
                onChange={(event) => {
                  setDraftEmail(event.target.value);
                  setMessage("");
                  setError("");
                }}
                placeholder="you@example.com"
              />
            </label>
            {message ? (
              <p className="flex items-center gap-2 text-sm text-[#f0a36f]">
                <Check size={16} />
                {message}
              </p>
            ) : null}
            {error ? <p className="text-sm text-[#f0a36f]">{error}</p> : null}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className="copper-button rounded-md px-4 py-3 font-semibold"
                type="submit"
              >
                {email ? "Update account" : "Create account"}
              </button>
              {email ? (
                <button
                  className="outline-button inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-[#f0a36f]"
                  type="button"
                  onClick={signOut}
                >
                  <LogOut size={16} />
                  Sign out locally
                </button>
              ) : null}
            </div>
          </form>
          <p className="mt-5 text-xs leading-5 text-[#8f8172]">
            Phone number is not required. This is a local placeholder until
            Clerk and Convex are connected.
          </p>
        </section>

        <section className="panel rounded-lg p-5 sm:p-7">
          <div className="mb-5 flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[rgba(240,163,111,0.34)] bg-[#2a1810]/55 text-[#f0a36f]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="eyebrow mb-3">Access</p>
              <h2 className="text-2xl font-medium text-[#efe6da]">
                {plan.label}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#b9ab9a]">
                {plan.positioning}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <AccountMetric
              label="Saved scenarios"
              value={`${savedScenarioCount}`}
            />
            <AccountMetric
              label="Save allowance"
              value={
                plan.savedScenarioLimit === "unlimited"
                  ? "Unlimited"
                  : `${plan.savedScenarioLimit}`
              }
            />
          </div>

          <div className="mt-5 rounded-md border border-[rgba(239,230,218,0.14)] bg-black/18 p-4">
            <p className="text-sm leading-6 text-[#b9ab9a]">
              MVP test controls let us verify Pro/Lifetime gates before real
              billing is connected. Stripe webhooks will replace this local
              switch later.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {planOrder.map((tier) => (
                <button
                  key={tier}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    tier === planTier
                      ? "border-[#f0a36f] bg-[#2a1810] text-[#f0a36f]"
                      : "border-[rgba(239,230,218,0.18)] text-[#d9ccbd]"
                  }`}
                  type="button"
                  onClick={() => setMockPlan(tier)}
                >
                  {getPlanEntitlements(tier).label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              className="outline-button inline-flex items-center justify-center rounded-md px-4 py-3 text-[#f0a36f]"
              href="/watchlist"
            >
              Open Watchlist
            </Link>
            <Link
              className="outline-button inline-flex items-center justify-center rounded-md px-4 py-3 text-[#f0a36f]"
              href="/plans"
            >
              Compare Plans
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}

function AccountMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[rgba(239,230,218,0.14)] bg-black/18 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-[#b9ab9a]">
        {label}
      </p>
      <p className="mt-2 text-2xl text-[#efe6da]">{value}</p>
    </div>
  );
}

function subscribeToAccount(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(accountChangedEvent, onStoreChange);
  window.addEventListener(watchlistChangedEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(accountChangedEvent, onStoreChange);
    window.removeEventListener(watchlistChangedEvent, onStoreChange);
  };
}

function notifyAccountChanged() {
  window.dispatchEvent(new Event(accountChangedEvent));
}

function getAccountEmailSnapshot() {
  return getStoredAccountEmail(window.localStorage);
}

function getServerAccountEmailSnapshot() {
  return "";
}

function getPlanTierSnapshot() {
  return getMockPlanTierFromStorage(window.localStorage);
}

function getServerPlanTierSnapshot(): PlanTier {
  return "noAccount";
}

function getSavedScenarioCountSnapshot() {
  return parseSavedScenarios(
    window.localStorage.getItem(WATCHLIST_STORAGE_KEY),
  ).length;
}

function getServerSavedScenarioCountSnapshot() {
  return 0;
}
