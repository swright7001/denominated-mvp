"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Check, LogIn, LogOut, Mail, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { api } from "../../convex/_generated/api";
import { toConvexSavedScenarioInput } from "@/lib/convex-storage";
import { getAccountPlanLabel, isProEntitled } from "@/lib/entitlements";
import { BillingPortalButton } from "./BillingPortalButton";
import {
  parseSavedScenarios,
  WATCHLIST_STORAGE_KEY,
  watchlistChangedEvent,
} from "@/lib/watchlist";

export function AccountExperience({
  realAccountsEnabled = false,
}: {
  realAccountsEnabled?: boolean;
}) {
  if (!realAccountsEnabled) {
    return <AccountUnavailableState />;
  }

  return <AccountBackedExperience />;
}

function AccountBackedExperience() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return <AccountLoadingState />;
  if (!isSignedIn) return <AccountSignInState />;

  return (
    <SignedInAccountExperience
      email={user.primaryEmailAddress?.emailAddress ?? ""}
    />
  );
}

function SignedInAccountExperience({ email }: { email: string }) {
  const { signOut } = useAuth();
  const account = useQuery(api.accounts.getViewerAccount);
  const savedScenarios = useQuery(api.savedScenarios.list, { limit: 100 });
  const ensureAccount = useMutation(api.accounts.ensureViewerAccount);
  const importLocalWatchlist = useMutation(
    api.savedScenarios.importLocalWatchlist,
  );
  const localSavedScenarioCount = useSyncExternalStore(
    subscribeToLocalWatchlist,
    getLocalSavedScenarioCount,
    getServerSavedScenarioCount,
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  if (account === undefined || savedScenarios === undefined) {
    return <AccountLoadingState />;
  }

  async function activateAccountStorage() {
    setMessage("");
    setError("");
    setIsWorking(true);

    try {
      await ensureAccount({ email: email || undefined });
      setMessage("Account storage is active.");
    } catch {
      setError("Account storage could not be activated. Please try again.");
    } finally {
      setIsWorking(false);
    }
  }

  async function importScenariosFromDevice() {
    setMessage("");
    setError("");
    setIsWorking(true);

    try {
      const localSavedScenarios = parseSavedScenarios(
        window.localStorage.getItem(WATCHLIST_STORAGE_KEY),
      );

      if (localSavedScenarios.length === 0) {
        setMessage("No saved scenarios were found on this device.");
        return;
      }

      await importLocalWatchlist({
        savedScenarios: localSavedScenarios.map(toConvexSavedScenarioInput),
      });
      window.localStorage.removeItem(WATCHLIST_STORAGE_KEY);
      window.dispatchEvent(new Event(watchlistChangedEvent));
      setMessage(
        `Imported ${localSavedScenarios.length} scenario${localSavedScenarios.length === 1 ? "" : "s"} from this device.`,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Saved scenarios could not be imported. Please try again.",
      );
    } finally {
      setIsWorking(false);
    }
  }

  async function signOutAccount() {
    setError("");
    setIsWorking(true);

    try {
      await signOut({ redirectUrl: "/" });
    } catch {
      setError("Could not sign out. Please try again.");
      setIsWorking(false);
    }
  }

  return (
    <AccountShell
      title="Your Denominated account"
      description="Manage your signed-in account and move saved scenarios from this device into secure account storage."
    >
      <section className="panel rounded-lg p-5 sm:p-7">
        <div className="mb-5 flex items-start gap-4">
          <AccountIcon icon={<Mail size={20} />} />
          <div className="min-w-0">
            <p className="eyebrow mb-3">Signed in</p>
            <h2 className="break-words text-2xl font-medium text-[#efe6da]">
              {email || "Denominated account"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#b9ab9a]">
              Clerk protects your sign-in. Phone number is not required.
            </p>
          </div>
        </div>

        {!account ? (
          <button
            className="copper-button rounded-md px-4 py-3 font-semibold"
            type="button"
            disabled={isWorking}
            onClick={activateAccountStorage}
          >
            {isWorking ? "Activating..." : "Activate account storage"}
          </button>
        ) : (
          <p className="flex items-center gap-2 text-sm text-[#f0a36f]">
            <Check size={16} />
            Account storage active
          </p>
        )}

        {account && localSavedScenarioCount > 0 ? (
          <div className="mt-5 rounded-md border border-[rgba(239,230,218,0.14)] bg-black/18 p-4">
            <p className="font-medium text-[#efe6da]">Saved scenarios found</p>
            <p className="mt-2 text-sm leading-6 text-[#b9ab9a]">
              Import {localSavedScenarioCount} scenario
              {localSavedScenarioCount === 1 ? "" : "s"} saved in this
              browser to your account.
            </p>
            <button
              className="outline-button mt-3 rounded-md px-4 py-3 text-sm font-medium text-[#f0a36f]"
              type="button"
              disabled={isWorking}
              onClick={importScenariosFromDevice}
            >
              {isWorking ? "Importing..." : "Import from this device"}
            </button>
          </div>
        ) : null}

        {message ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-[#f0a36f]">
            <Check size={16} />
            {message}
          </p>
        ) : null}
        {error ? <p className="mt-4 text-sm text-[#f0a36f]">{error}</p> : null}

        <button
          className="outline-button mt-5 inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-[#f0a36f]"
          type="button"
          disabled={isWorking}
          onClick={signOutAccount}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </section>

      <section className="panel rounded-lg p-5 sm:p-7">
        <div className="mb-5 flex items-start gap-4">
          <AccountIcon icon={<ShieldCheck size={20} />} />
          <div>
            <p className="eyebrow mb-3">Free account</p>
            <h2 className="text-2xl font-medium text-[#efe6da]">
              Your purchasing-power home base
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#b9ab9a]">
              Keep your first saved scenario connected to your account while
              the calculator, examples, Learn, and sharing remain free.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <AccountMetric
            label="Saved in account"
            value={`${savedScenarios.length}`}
          />
          <AccountMetric
            label="Account type"
            value={
              account
                ? getAccountPlanLabel({
                    planTier: account.planTier,
                    subscriptionStatus: account.subscriptionStatus,
                    cancelAtPeriodEnd: account.cancelAtPeriodEnd,
                  })
                : "Not activated"
            }
          />
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
            href="/calculator"
          >
            Run a Scenario
          </Link>
        </div>
        {account && isProEntitled(account.planTier) ? (
          <div className="mt-5 border-t border-[rgba(239,230,218,0.14)] pt-5">
            <p className="text-sm leading-6 text-[#b9ab9a]">
              Manage your subscription, payment method, and invoices securely
              through Stripe.
            </p>
            <BillingPortalButton />
          </div>
        ) : null}
      </section>
    </AccountShell>
  );
}

function AccountSignInState() {
  return (
    <AccountShell
      title="Your Denominated account"
      description="Create a free account to save a scenario, or sign in to return to one you already created."
    >
      <section className="panel rounded-lg p-5 sm:p-7 lg:col-span-2">
        <div className="flex items-start gap-4">
          <AccountIcon icon={<LogIn size={20} />} />
          <div>
            <p className="eyebrow mb-3">Account access</p>
            <h2 className="text-2xl font-medium text-[#efe6da]">
              Save your purchasing-power work
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b9ab9a]">
              Sign in to access an existing account, or create one after you
              have run a scenario. No phone number is required.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            className="copper-button inline-flex items-center justify-center rounded-md px-5 py-3 font-semibold"
            href="/sign-up"
          >
            Create free account
          </Link>
          <Link
            className="outline-button inline-flex items-center justify-center rounded-md px-5 py-3 text-[#f0a36f]"
            href="/sign-in"
          >
            Sign in
          </Link>
          <Link
            className="inline-flex items-center justify-center px-5 py-3 text-sm text-[#b9ab9a] hover:text-[#efe6da]"
            href="/calculator"
          >
            Continue without an account
          </Link>
        </div>
      </section>
    </AccountShell>
  );
}

function AccountUnavailableState() {
  return (
    <AccountShell
      title="Account service unavailable"
      description="Account access could not load, but every free calculator feature is still available."
    >
      <section className="panel rounded-lg p-5 sm:p-7 lg:col-span-2">
        <Link
          className="copper-button inline-flex rounded-md px-5 py-3 font-semibold"
          href="/calculator"
        >
          Run a Scenario
        </Link>
      </section>
    </AccountShell>
  );
}

function AccountLoadingState() {
  return (
    <AccountShell
      title="Loading your account"
      description="Connecting your secure account and saved scenarios."
    >
      <section className="panel rounded-lg p-5 text-[#b9ab9a] sm:p-7 lg:col-span-2">
        Loading account...
      </section>
    </AccountShell>
  );
}

function AccountShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="container py-10">
      <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="mt-3 text-4xl font-medium text-[#efe6da] md:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#b9ab9a]">
            {description}
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
      <div className="grid gap-6 lg:grid-cols-2">{children}</div>
    </section>
  );
}

function AccountIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[rgba(240,163,111,0.34)] bg-[#2a1810]/55 text-[#f0a36f]">
      {icon}
    </div>
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

function subscribeToLocalWatchlist(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(watchlistChangedEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(watchlistChangedEvent, onStoreChange);
  };
}

function getLocalSavedScenarioCount() {
  return parseSavedScenarios(
    window.localStorage.getItem(WATCHLIST_STORAGE_KEY),
  ).length;
}

function getServerSavedScenarioCount() {
  return 0;
}
