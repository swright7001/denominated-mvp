"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ArrowRight, BookmarkPlus, RotateCcw, Trash2 } from "lucide-react";
import type { BTCPriceResult } from "@/lib/btc-price";
import { formatBTC, formatUSD } from "@/lib/calculations";
import {
  getMockPlanTierFromStorage,
  isProEntitled,
  type PlanTier,
} from "@/lib/entitlements";
import {
  buildSavedScenarioImpactCopy,
  calculateScenarioImpact,
} from "@/lib/scenario-insights";
import { scenarioToSearchParams } from "@/lib/share-url";
import type { SavedScenario } from "@/lib/types";
import {
  parseSavedScenarios,
  removeSavedScenario,
  serializeSavedScenarios,
  WATCHLIST_STORAGE_KEY,
  watchlistChangedEvent,
} from "@/lib/watchlist";
import { ProUpgradePrompt } from "./ProUpgradePrompt";
const emptyWatchlist: SavedScenario[] = [];
let cachedWatchlistRaw: string | null = null;
let cachedWatchlistSnapshot: SavedScenario[] = emptyWatchlist;

export function WatchlistExperience() {
  const savedScenarios = useSyncExternalStore(
    subscribeToWatchlist,
    getWatchlistSnapshot,
    getServerWatchlistSnapshot,
  );
  const btcPrice = useWatchlistBTCPrice();
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

  return (
    <div className="container py-10">
      <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="eyebrow">Watchlist</p>
          <h1 className="mt-3 text-4xl font-medium text-[#efe6da] md:text-6xl">
            Saved purchasing-power goals
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#b9ab9a]">
            Keep the expenses you care about in one place. This local-first
            watchlist stores the assumptions needed to recalculate later as BTC
            prices change.
          </p>
        </div>
        <Link
          className="copper-button inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 font-semibold"
          href="/calculator"
        >
          <BookmarkPlus size={18} />
          Save a Scenario
        </Link>
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
                  btcPrice.data?.priceUSD ??
                  savedScenario.scenario.currentBTCPriceUSD
                }
                onDelete={() => deleteSavedScenario(savedScenario.id)}
              />
            ))}
          </div>
          {!hasProAccess ? (
            <ProUpgradePrompt
              eyebrow="Full watchlist"
              title="Unlock unlimited saved scenarios"
              body="Free accounts can save one scenario. Pro and Lifetime are planned for a full watchlist, BTC movement across every saved goal, historical comparisons, and exportable reports."
              features={[
                "Unlimited saved scenarios",
                "BTC movement impact across all saved goals",
                "Historical comparisons over time",
                "Private share links and PDF/report exports",
              ]}
            />
          ) : null}
        </div>
      )}
    </div>
  );
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
}: {
  savedScenario: SavedScenario;
  currentBTCPriceUSD: number;
  onDelete: () => void;
}) {
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

  return (
    <article className="panel min-w-0 overflow-hidden rounded-lg p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow mb-3">Saved {savedDate}</p>
          <h2 className="text-2xl font-medium text-[#efe6da]">
            {savedScenario.scenario.itemName}
          </h2>
          <p className="mt-2 text-sm text-[#b9ab9a]">
            {savedScenario.scenario.purchaseType === "monthly"
              ? "Monthly expense"
              : "One-time purchase"}
          </p>
        </div>
        <button
          type="button"
          className="outline-button grid h-10 w-10 shrink-0 place-items-center rounded-md text-[#f0a36f] transition hover:bg-[#2a1810]"
          aria-label={`Delete ${savedScenario.scenario.itemName}`}
          onClick={onDelete}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <WatchlistMetric
          label="Current USD cost"
          value={formatUSD(savedScenario.scenario.currentItemPriceUSD)}
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
          value={formatUSD(currentBTCPriceUSD)}
        />
      </dl>

      <div className="mt-5 rounded-md border border-[rgba(239,230,218,0.14)] bg-black/18 p-4">
        <p className="text-sm leading-6 text-[#b9ab9a]">
          {buildSavedScenarioImpactCopy(impact)}{" "}
          <span className="text-[#efe6da]">
            {formatBTC(Math.abs(impact.btcDifference))} BTC
          </span>{" "}
          absolute change,{" "}
          <span className="text-[#efe6da]">
            {Math.abs(impact.percentDifference).toFixed(1)}%
          </span>{" "}
          from the saved baseline.
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[#8f8172]">
          Compared with {formatUSD(impact.priorBTCPriceUSD)} BTC on {savedDate};
          current comparison uses {formatUSD(impact.currentBTCPriceUSD)} BTC.
        </p>
      </div>

      <div className="mt-4 rounded-md border border-[rgba(239,230,218,0.14)] bg-black/18 p-4">
        <p className="text-sm leading-6 text-[#b9ab9a]">
          Assumes {savedScenario.scenario.itemInflationRate}% annual item
          inflation and {savedScenario.scenario.btcGrowthRate}% annual BTC
          growth. Saved baseline:{" "}
          <span className="text-[#efe6da]">
            {formatBTC(savedScenario.baselineItemCostBTC)} BTC
          </span>{" "}
          at {formatUSD(savedScenario.baselineBTCPriceUSD)} BTC.
        </p>
      </div>

      <Link
        className="outline-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-[#f0a36f] transition hover:bg-[#2a1810] sm:w-auto"
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
    <div className="rounded-md border border-[rgba(239,230,218,0.14)] bg-black/18 p-4">
      <dt className="text-xs uppercase tracking-[0.14em] text-[#b9ab9a]">
        {label}
      </dt>
      <dd className="mt-2 text-xl text-[#efe6da]">{value}</dd>
    </div>
  );
}

function WatchlistEmptyState() {
  return (
    <section className="panel rounded-lg p-7 text-center sm:p-10">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[rgba(240,163,111,0.34)] bg-[#2a1810]/55 text-[#f0a36f]">
        <BookmarkPlus size={24} />
      </div>
      <h2 className="mt-5 text-2xl font-medium text-[#efe6da]">
        Save your first scenario
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#b9ab9a]">
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

function useWatchlistBTCPrice() {
  const [state, setState] = useState<{
    status: "loading" | "ready" | "error";
    data?: BTCPriceResult;
  }>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadBTCPrice() {
      try {
        const response = await fetch("/api/prices/bitcoin", {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Live BTC price request failed");

        const data = (await response.json()) as BTCPriceResult;
        setState({ status: "ready", data });
      } catch {
        if (!controller.signal.aborted) setState({ status: "error" });
      }
    }

    loadBTCPrice();

    return () => controller.abort();
  }, []);

  return state;
}
