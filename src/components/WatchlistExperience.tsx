"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ArrowRight, BookmarkPlus, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { formatBTC } from "@/lib/calculations";
import {
  formatCurrency,
  normalizeCurrencyCode,
} from "@/lib/currency";
import { useBTCPrices } from "@/lib/use-btc-prices";
import {
  getMockPlanTierFromStorage,
  isProEntitled,
  type PlanTier,
} from "@/lib/entitlements";
import { getProConversionCopy } from "@/lib/pro-copy";
import {
  buildSavedScenarioImpactCopy,
  calculateScenarioImpact,
} from "@/lib/scenario-insights";
import { scenarioToSearchParams } from "@/lib/share-url";
import type { SavedScenario } from "@/lib/types";
import {
  parseSavedScenarios,
  renameSavedScenario,
  removeSavedScenario,
  serializeSavedScenarios,
  WATCHLIST_STORAGE_KEY,
  watchlistChangedEvent,
} from "@/lib/watchlist";
import { ProUpgradePromptFromCopy } from "./ProUpgradePrompt";
const emptyWatchlist: SavedScenario[] = [];
let cachedWatchlistRaw: string | null = null;
let cachedWatchlistSnapshot: SavedScenario[] = emptyWatchlist;

export function WatchlistExperience({
  realAccountsEnabled = false,
}: {
  realAccountsEnabled?: boolean;
}) {
  if (realAccountsEnabled) {
    return <AccountWatchlistExperience />;
  }

  return <LocalWatchlistExperience />;
}

function LocalWatchlistExperience() {
  const savedScenarios = useSyncExternalStore(
    subscribeToWatchlist,
    getWatchlistSnapshot,
    getServerWatchlistSnapshot,
  );
  const btcPrices = useBTCPrices(savedScenarios);
  const planTier = useSyncExternalStore(
    subscribeToPlanTier,
    getPlanTierSnapshot,
    getServerPlanTierSnapshot,
  );
  const hasProAccess = isProEntitled(planTier);
  const visibleSavedScenarios = hasProAccess
    ? savedScenarios
    : savedScenarios.slice(0, 1);

  function deleteSavedScenario(id: string) {
    const next = removeSavedScenario(savedScenarios, id);
    window.localStorage.setItem(
      WATCHLIST_STORAGE_KEY,
      serializeSavedScenarios(next),
    );
    window.dispatchEvent(new Event(watchlistChangedEvent));
  }

  function renameScenario(id: string, itemName: string) {
    const next = renameSavedScenario(savedScenarios, id, itemName);
    window.localStorage.setItem(
      WATCHLIST_STORAGE_KEY,
      serializeSavedScenarios(next),
    );
    window.dispatchEvent(new Event(watchlistChangedEvent));
  }

  return (
    <div className="container py-10">
      <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="eyebrow">Watchlist</p>
          <h1 className="mt-3 text-4xl font-medium text-[var(--text-primary)] md:text-6xl">
            Saved purchasing-power goals
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--text-muted)]">
            Keep the expenses you care about in one place. This local-first
            watchlist stores the assumptions needed to recalculate later as BTC
            prices change.
          </p>
        </div>
        {savedScenarios.length > 0 ? (
          <Link
            className="copper-button inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 font-semibold"
            href="/calculator"
          >
            Run a Scenario
            <ArrowRight size={18} />
          </Link>
        ) : null}
      </div>

      {savedScenarios.length === 0 ? (
        <WatchlistEmptyState />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            {visibleSavedScenarios.map((savedScenario) => (
              <WatchlistCard
                key={savedScenario.id}
                savedScenario={savedScenario}
              currentBTCPriceUSD={
                btcPrices[normalizeCurrencyCode(savedScenario.scenario.currencyCode)]?.price ??
                savedScenario.scenario.currentBTCPriceUSD
              }
              onDelete={() => deleteSavedScenario(savedScenario.id)}
              onRename={(itemName) =>
                renameScenario(savedScenario.id, itemName)
              }
            />
            ))}
          </div>
          {!hasProAccess ? (
            <ProUpgradePromptFromCopy
              copy={getProConversionCopy("fullWatchlist")}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function AccountWatchlistExperience() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <WatchlistLoadingState />;
  }

  if (!isSignedIn) {
    return <WatchlistSignInState />;
  }

  return <SignedInAccountWatchlistExperience />;
}

function SignedInAccountWatchlistExperience() {
  const savedScenarioDocs = useQuery(api.savedScenarios.list, { limit: 100 });
  const account = useQuery(api.accounts.getViewerAccount);
  const removeSavedScenarioMutation = useMutation(api.savedScenarios.remove);
  const renameSavedScenarioMutation = useMutation(api.savedScenarios.rename);
  const savedScenarios = useMemo(
    () => (savedScenarioDocs ?? []).map(toSavedScenario),
    [savedScenarioDocs],
  );
  const btcPrices = useBTCPrices(savedScenarios);
  const planTier: PlanTier = account?.planTier ?? "freeAccount";
  const hasProAccess = isProEntitled(planTier);
  const visibleSavedScenarios = hasProAccess
    ? savedScenarios
    : savedScenarios.slice(0, 1);

  async function deleteSavedScenario(id: string) {
    await removeSavedScenarioMutation({ id: id as Id<"savedScenarios"> });
  }

  async function renameScenario(id: string, itemName: string) {
    await renameSavedScenarioMutation({
      id: id as Id<"savedScenarios">,
      itemName,
    });
  }

  return (
    <div className="container py-10">
      <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="eyebrow">Account watchlist</p>
          <h1 className="mt-3 text-4xl font-medium text-[var(--text-primary)] md:text-6xl">
            Saved purchasing-power goals
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--text-muted)]">
            Your signed-in watchlist is tied to your Denominated account and
            recalculates from stored assumptions as BTC prices change.
          </p>
        </div>
        {savedScenarioDocs && savedScenarios.length > 0 ? (
          <Link
            className="copper-button inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 font-semibold"
            href="/calculator"
          >
            Run a Scenario
            <ArrowRight size={18} />
          </Link>
        ) : null}
      </div>

      {!savedScenarioDocs ? (
        <WatchlistLoadingState />
      ) : savedScenarios.length === 0 ? (
        <WatchlistEmptyState />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            {visibleSavedScenarios.map((savedScenario) => (
              <WatchlistCard
                key={savedScenario.id}
                savedScenario={savedScenario}
                currentBTCPriceUSD={
                  btcPrices[normalizeCurrencyCode(savedScenario.scenario.currencyCode)]?.price ??
                  savedScenario.scenario.currentBTCPriceUSD
                }
                onDelete={() => deleteSavedScenario(savedScenario.id)}
                onRename={(itemName) =>
                  renameScenario(savedScenario.id, itemName)
                }
              />
            ))}
          </div>
          {!hasProAccess ? (
            <ProUpgradePromptFromCopy
              copy={getProConversionCopy("fullWatchlist")}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function toSavedScenario(doc: Doc<"savedScenarios">): SavedScenario {
  const currencyCode = normalizeCurrencyCode(doc.scenario.currencyCode);

  return {
    id: doc._id,
    scenario: { ...doc.scenario, currencyCode },
    savedAt: doc.savedAt,
    baselineBTCPriceUSD: doc.baselineBTCPriceUSD,
    baselineItemCostBTC: doc.baselineItemCostBTC,
    baselineCurrencyCode: normalizeCurrencyCode(
      doc.baselineCurrencyCode ?? currencyCode,
    ),
  };
}

function subscribeToWatchlist(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(watchlistChangedEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(watchlistChangedEvent, onStoreChange);
  };
}

function getWatchlistSnapshot() {
  const raw = window.localStorage.getItem(WATCHLIST_STORAGE_KEY);

  if (raw === cachedWatchlistRaw) {
    return cachedWatchlistSnapshot;
  }

  cachedWatchlistRaw = raw;
  cachedWatchlistSnapshot = parseSavedScenarios(raw);

  return cachedWatchlistSnapshot;
}

function getServerWatchlistSnapshot() {
  return emptyWatchlist;
}

function subscribeToPlanTier(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);

  return () => window.removeEventListener("storage", onStoreChange);
}

function getPlanTierSnapshot(): PlanTier {
  return getMockPlanTierFromStorage(window.localStorage);
}

function getServerPlanTierSnapshot(): PlanTier {
  return "noAccount";
}

function WatchlistCard({
  savedScenario,
  currentBTCPriceUSD,
  onDelete,
  onRename,
}: {
  savedScenario: SavedScenario;
  currentBTCPriceUSD: number;
  onDelete: () => void;
  onRename: (itemName: string) => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(savedScenario.scenario.itemName);
  const impact = useMemo(
    () => calculateScenarioImpact(savedScenario, currentBTCPriceUSD),
    [currentBTCPriceUSD, savedScenario],
  );
  const calculatorHref = `/calculator?${scenarioToSearchParams(
    savedScenario.scenario,
  ).toString()}`;
  const savedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(savedScenario.savedAt));
  const currencyCode = normalizeCurrencyCode(savedScenario.scenario.currencyCode);

  function submitRename() {
    onRename(draftName);
    setIsRenaming(false);
  }

  return (
    <article className="panel min-w-0 overflow-hidden rounded-lg p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="eyebrow mb-3">Saved {savedDate}</p>
          {isRenaming ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="field py-2"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitRename();
                  if (event.key === "Escape") {
                    setDraftName(savedScenario.scenario.itemName);
                    setIsRenaming(false);
                  }
                }}
                aria-label="Saved scenario name"
              />
              <button
                type="button"
                className="copper-button rounded-md px-3 py-2 text-sm font-semibold"
                onClick={submitRename}
              >
                Save
              </button>
            </div>
          ) : (
            <h2 className="text-2xl font-medium text-[var(--text-primary)]">
              {savedScenario.scenario.itemName}
            </h2>
          )}
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {savedScenario.scenario.purchaseType === "monthly"
              ? "Monthly expense"
              : "One-time purchase"}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="outline-button grid h-10 w-10 place-items-center rounded-md text-[var(--accent-text)] transition hover:bg-[var(--accent-surface)]"
            aria-label={`Rename ${savedScenario.scenario.itemName}`}
            onClick={() => setIsRenaming((current) => !current)}
          >
            <Pencil size={17} />
          </button>
          <button
            type="button"
            className="outline-button grid h-10 w-10 place-items-center rounded-md text-[var(--accent-text)] transition hover:bg-[var(--accent-surface)]"
            aria-label={`Delete ${savedScenario.scenario.itemName}`}
            onClick={onDelete}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <WatchlistMetric
          label={`Current ${currencyCode} cost`}
          value={formatCurrency(savedScenario.scenario.currentItemPriceUSD, currencyCode)}
        />
        <WatchlistMetric
          label="Current BTC cost"
          value={`${formatBTC(impact.currentBTCCost)} BTC`}
        />
        <WatchlistMetric
          label="Time horizon"
          value={`${savedScenario.scenario.years} years`}
        />
        <WatchlistMetric
          label="BTC price used"
          value={formatCurrency(currentBTCPriceUSD, currencyCode)}
        />
      </dl>

      <div className="mt-5 rounded-md border border-[var(--neutral-line-soft)] bg-[var(--surface-soft)] p-4">
        <p className="text-sm leading-6 text-[var(--text-muted)]">
          {buildSavedScenarioImpactCopy(impact)}{" "}
          <span className="text-[var(--text-primary)]">
            {formatBTC(Math.abs(impact.btcDifference))} BTC
          </span>{" "}
          absolute change,{" "}
          <span className="text-[var(--text-primary)]">
            {Math.abs(impact.percentDifference).toFixed(1)}%
          </span>{" "}
          from the saved baseline.
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[var(--text-subtle)]">
          Compared with {formatCurrency(impact.priorBTCPriceUSD, currencyCode)} BTC on {savedDate};
          current comparison uses {formatCurrency(impact.currentBTCPriceUSD, currencyCode)} BTC.
        </p>
      </div>

      <div className="mt-4 rounded-md border border-[var(--neutral-line-soft)] bg-[var(--surface-soft)] p-4">
        <p className="text-sm leading-6 text-[var(--text-muted)]">
          Assumes {savedScenario.scenario.itemInflationRate}% annual item
          inflation and {savedScenario.scenario.btcGrowthRate}% annual BTC
          growth. Saved baseline:{" "}
          <span className="text-[var(--text-primary)]">
            {formatBTC(savedScenario.baselineItemCostBTC)} BTC
          </span>{" "}
          at {formatCurrency(savedScenario.baselineBTCPriceUSD, currencyCode)} BTC.
        </p>
      </div>

      <Link
        className="outline-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-[var(--accent-text)] transition hover:bg-[var(--accent-surface)] sm:w-auto"
        href={calculatorHref}
      >
        <RotateCcw size={18} />
        Open in Calculator
      </Link>
    </article>
  );
}

function WatchlistMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--neutral-line-soft)] bg-[var(--surface-soft)] p-4">
      <dt className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </dt>
      <dd className="mt-2 text-xl text-[var(--text-primary)]">{value}</dd>
    </div>
  );
}

function WatchlistEmptyState() {
  return (
    <section className="panel rounded-lg p-7 text-center sm:p-10">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-surface)] text-[var(--accent-text)]">
        <BookmarkPlus size={24} />
      </div>
      <h2 className="mt-5 text-2xl font-medium text-[var(--text-primary)]">
        Save your first scenario
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
        Run a calculator scenario, save it here, and Denominated will have the
        foundation to track how that cost changes in Bitcoin terms over time.
      </p>
      <Link
        className="copper-button mt-6 inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 font-semibold"
        href="/calculator"
      >
        Run a Scenario
        <ArrowRight size={18} />
      </Link>
    </section>
  );
}

function WatchlistLoadingState() {
  return (
    <section className="panel rounded-lg p-7 text-center sm:p-10">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-surface)] text-[var(--accent-text)]">
        <BookmarkPlus size={24} />
      </div>
      <h2 className="mt-5 text-2xl font-medium text-[var(--text-primary)]">
        Loading your watchlist
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
        We are checking your account-backed purchasing-power scenarios.
      </p>
    </section>
  );
}

function WatchlistSignInState() {
  return (
    <div className="container py-10">
      <section className="panel rounded-lg p-7 text-center sm:p-10">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-surface)] text-[var(--accent-text)]">
          <BookmarkPlus size={24} />
        </div>
        <h1 className="mt-5 text-3xl font-medium text-[var(--text-primary)]">
          Sign in to see your watchlist
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
          The calculator stays free. A Denominated account keeps saved
          scenarios tied to you across devices.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            className="copper-button inline-flex items-center justify-center rounded-md px-5 py-3 font-semibold"
            href="/sign-up"
          >
            Create account
          </Link>
          <Link
            className="outline-button inline-flex items-center justify-center rounded-md px-5 py-3 font-semibold text-[var(--accent-text)]"
            href="/sign-in"
          >
            Sign in
          </Link>
        </div>
      </section>
    </div>
  );
}
