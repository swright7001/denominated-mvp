"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  CalendarDays,
  Check,
  Mail,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  defaultEmailPreferences,
  emailPreferencesKey,
  parseEmailPreferences,
  serializeEmailPreferences,
  signupEmailKey,
  type EmailPreferences,
} from "@/lib/account";
import type { BTCPriceResult } from "@/lib/btc-price";
import { calculateScenario, formatBTC, formatUSD } from "@/lib/calculations";
import {
  getMockPlanTierFromStorage,
  isProEntitled,
  type PlanTier,
} from "@/lib/entitlements";
import { applyBTCPriceToScenarios } from "@/lib/live-scenarios";
import { scenarios } from "@/lib/scenarios";
import {
  buildSavedScenarioImpactCopy,
  buildScenarioChangeInsight,
  calculateScenarioImpact,
  getBiggestImpact,
  type ScenarioImpact,
} from "@/lib/scenario-insights";
import type { SavedScenario } from "@/lib/types";
import {
  parseSavedScenarios,
  WATCHLIST_STORAGE_KEY,
  watchlistChangedEvent,
} from "@/lib/watchlist";
import { DISCLAIMER } from "./Footer";
import { ProUpgradePrompt } from "./ProUpgradePrompt";

const emptyWatchlist: SavedScenario[] = [];
let cachedWatchlistRaw: string | null = null;
let cachedWatchlistSnapshot: SavedScenario[] = emptyWatchlist;

export function RecurringDashboard() {
  const savedScenarios = useSyncExternalStore(
    subscribeToWatchlist,
    getWatchlistSnapshot,
    getServerWatchlistSnapshot,
  );
  const [email] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (window.localStorage.getItem(signupEmailKey) ?? ""),
  );
  const [preferences, setPreferences] = useState<EmailPreferences>(() =>
    typeof window === "undefined"
      ? defaultEmailPreferences
      : parseEmailPreferences(window.localStorage.getItem(emailPreferencesKey)),
  );
  const planTier = useSyncExternalStore(
    subscribeToPlanTier,
    getPlanTierSnapshot,
    getServerPlanTierSnapshot,
  );
  const btcPrice = useLiveBTCPrice();
  const currentBTCPriceUSD =
    btcPrice.data?.priceUSD ??
    savedScenarios[0]?.scenario.currentBTCPriceUSD ??
    80000;
  const impacts = useMemo(
    () =>
      savedScenarios.map((savedScenario) =>
        calculateScenarioImpact(savedScenario, currentBTCPriceUSD),
      ),
    [currentBTCPriceUSD, savedScenarios],
  );
  const hasProAccess = isProEntitled(planTier);

  function updatePreference(key: keyof EmailPreferences) {
    setPreferences((current) => {
      const next = { ...current, [key]: !current[key] };
      window.localStorage.setItem(
        emailPreferencesKey,
        serializeEmailPreferences(next),
      );
      return next;
    });
  }

  return (
    <div className="container py-10">
      <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-3 text-4xl font-medium text-[#efe6da] md:text-6xl">
            Your purchasing-power home base
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#b9ab9a]">
            Track saved expenses, review today&apos;s BTC-term movement, and
            keep the next scenario close at hand.
          </p>
        </div>
        <Link
          className="copper-button inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 font-semibold"
          href="/calculator"
        >
          <Plus size={18} />
          Run a Scenario
        </Link>
      </div>

      {hasProAccess ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <DailySnapshot
              impacts={impacts}
              savedCount={savedScenarios.length}
              currentBTCPriceUSD={currentBTCPriceUSD}
              btcPriceStatus={btcPrice.status}
            />
            <RecentScenarioChanges impacts={impacts} />
            <SavedScenarioSummary savedScenarios={savedScenarios} />
          </div>
          <div className="space-y-6">
            <WeeklyReportPreview
              savedScenarios={savedScenarios}
              impacts={impacts}
              currentBTCPriceUSD={currentBTCPriceUSD}
            />
            <EmailPreferencesPanel
              email={email}
              preferences={preferences}
              onToggle={updatePreference}
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <ProUpgradePrompt
              title="Track purchasing power every day"
              body="The full dashboard is reserved for Pro and Lifetime so recurring, personalized tracking can become Denominated's paid value without limiting the free calculator."
              features={[
                "Daily purchasing-power snapshot",
                "Historical comparisons over time",
                "BTC movement impact across all saved scenarios",
                "Custom categories and assumption presets",
              ]}
            />
            <SavedScenarioSummary savedScenarios={savedScenarios.slice(0, 1)} />
          </div>
          <div className="space-y-6">
            <ProUpgradePrompt
              eyebrow="Weekly report"
              title="Get a weekly cost-of-life view"
              body="Pro will turn saved scenarios and popular examples into a readable report you can revisit, share, and use for long-term purchasing-power education."
              features={[
                "Weekly cost-of-life report",
                "Email reports",
                "Private share links",
                "PDF/report exports",
              ]}
            />
            <ProUpgradePrompt
              eyebrow="Email reports"
              title="Email updates are a Pro habit feature"
              body="Educational emails stay warm and useful, but recurring reports tied to saved scenarios belong in the Pro/Lifetime experience."
              compact
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DailySnapshot({
  impacts,
  savedCount,
  currentBTCPriceUSD,
  btcPriceStatus,
}: {
  impacts: ScenarioImpact[];
  savedCount: number;
  currentBTCPriceUSD: number;
  btcPriceStatus: "loading" | "ready" | "error";
}) {
  const biggestImpact = getBiggestImpact(impacts);

  return (
    <section className="panel rounded-lg p-5 sm:p-7">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[rgba(240,163,111,0.34)] bg-[#2a1810]/55 text-[#f0a36f]">
          {biggestImpact && biggestImpact.btcDifference < 0 ? (
            <TrendingDown size={22} />
          ) : (
            <TrendingUp size={22} />
          )}
        </div>
        <div className="min-w-0">
          <p className="eyebrow mb-3">Today&apos;s purchasing power</p>
          <h2 className="text-2xl font-medium text-[#efe6da]">
            {biggestImpact
              ? buildScenarioChangeInsight({
                  itemName: biggestImpact.itemName,
                  btcDifference: biggestImpact.btcDifference,
                  percentDifference: biggestImpact.percentDifference,
                  windowLabel: "today",
                  usePercent: true,
                })
              : "Save a scenario to see today&apos;s BTC-term movement."}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#b9ab9a]">
            BTC price used: {formatUSD(currentBTCPriceUSD)}
            {btcPriceStatus === "loading" ? " while live price loads." : "."}{" "}
            {savedCount > 0
              ? "This compares today's BTC price against your saved baseline."
              : "Run a calculator scenario and save it to start a daily snapshot."}
          </p>
        </div>
      </div>
    </section>
  );
}

function RecentScenarioChanges({ impacts }: { impacts: ScenarioImpact[] }) {
  if (impacts.length === 0) {
    return (
      <section className="panel rounded-lg p-5 sm:p-7">
        <p className="eyebrow mb-3">Recent changes</p>
        <h2 className="text-2xl font-medium text-[#efe6da]">
          No saved scenario changes yet.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#b9ab9a]">
          Save your first expense to compare its BTC-denominated cost against a
          future snapshot.
        </p>
      </section>
    );
  }

  return (
    <section className="panel rounded-lg p-5 sm:p-7">
      <p className="eyebrow mb-4">Recent changes</p>
      <div className="space-y-3">
        {impacts.slice(0, 4).map((impact) => (
          <div
            key={`${impact.itemName}-${impact.comparisonDate}`}
            className="rounded-md border border-[rgba(239,230,218,0.14)] bg-black/18 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-medium text-[#efe6da]">{impact.itemName}</p>
              <p
                className={`text-sm ${
                  impact.btcDifference <= 0
                    ? "text-[#f0a36f]"
                    : "text-[#efe6da]"
                }`}
              >
                {impact.btcDifference <= 0 ? "Cheaper" : "Higher"} in BTC
              </p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#b9ab9a]">
              {buildSavedScenarioImpactCopy(impact)}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#8f8172]">
              {formatBTC(impact.priorBTCCost)} BTC baseline to{" "}
              {formatBTC(impact.currentBTCCost)} BTC today
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SavedScenarioSummary({
  savedScenarios,
}: {
  savedScenarios: SavedScenario[];
}) {
  return (
    <section className="panel rounded-lg p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow mb-3">Saved scenarios</p>
          <h2 className="text-2xl font-medium text-[#efe6da]">
            {savedScenarios.length > 0
              ? `${savedScenarios.length} saved goal${
                  savedScenarios.length === 1 ? "" : "s"
                }`
              : "Your watchlist is empty"}
          </h2>
        </div>
        <Link className="text-sm text-[#f0a36f]" href="/watchlist">
          Open Watchlist
        </Link>
      </div>
      {savedScenarios.length === 0 ? (
        <p className="text-sm leading-6 text-[#b9ab9a]">
          Start with something real: a truck, rent, elder care, tuition, or any
          expense you want to understand in purchasing-power terms.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {savedScenarios.slice(0, 4).map((savedScenario) => {
            const result = calculateScenario(savedScenario.scenario);
            return (
              <div
                key={savedScenario.id}
                className="rounded-md border border-[rgba(239,230,218,0.14)] bg-black/18 p-4"
              >
                <p className="font-medium text-[#efe6da]">
                  {savedScenario.scenario.itemName}
                </p>
                <p className="mt-2 text-sm text-[#b9ab9a]">
                  {formatUSD(savedScenario.scenario.currentItemPriceUSD)} ={" "}
                  <span className="text-[#f0a36f]">
                    {formatBTC(result.currentItemCostBTC)} BTC
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function WeeklyReportPreview({
  savedScenarios,
  impacts,
  currentBTCPriceUSD,
}: {
  savedScenarios: SavedScenario[];
  impacts: ScenarioImpact[];
  currentBTCPriceUSD: number;
}) {
  const reportDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
  const biggestImpact = getBiggestImpact(impacts);
  const pricedExamples = applyBTCPriceToScenarios(
    scenarios.slice(0, 3),
    currentBTCPriceUSD,
  );

  return (
    <section className="panel rounded-lg p-5 sm:p-7">
      <div className="mb-5 flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[rgba(240,163,111,0.34)] bg-[#2a1810]/55 text-[#f0a36f]">
          <CalendarDays size={20} />
        </div>
        <div>
          <p className="eyebrow mb-3">Weekly report preview</p>
          <h2 className="text-2xl font-medium text-[#efe6da]">
            Cost-of-life report
          </h2>
          <p className="mt-2 text-sm text-[#b9ab9a]">
            {reportDate} at {formatUSD(currentBTCPriceUSD)} BTC
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <ReportSection title="Your saved scenarios">
          {savedScenarios.length > 0 ? (
            <ul className="space-y-2 text-sm leading-6 text-[#b9ab9a]">
              {impacts.slice(0, 3).map((impact) => (
                <li key={impact.itemName}>{buildSavedScenarioImpactCopy(impact)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-6 text-[#b9ab9a]">
              No saved scenarios yet. The report can include popular examples
              until a user saves their first goal.
            </p>
          )}
        </ReportSection>

        <ReportSection title="Biggest BTC-term change">
          <p className="text-sm leading-6 text-[#b9ab9a]">
            {biggestImpact
              ? buildScenarioChangeInsight({
                  itemName: biggestImpact.itemName,
                  btcDifference: biggestImpact.btcDifference,
                  percentDifference: biggestImpact.percentDifference,
                  windowLabel: "this week",
                  usePercent: true,
                })
              : "Popular examples are ready to fill this section until saved scenarios exist."}
          </p>
        </ReportSection>

        <ReportSection title="Popular life-cost examples">
          <div className="grid gap-2">
            {pricedExamples.map((scenario) => {
              const result = calculateScenario(scenario);
              return (
                <p
                  key={scenario.slug}
                  className="text-sm leading-6 text-[#b9ab9a]"
                >
                  {scenario.itemName}:{" "}
                  <span className="text-[#efe6da]">
                    {formatBTC(result.currentItemCostBTC)} BTC
                  </span>{" "}
                  today
                </p>
              );
            })}
          </div>
        </ReportSection>

        <ReportSection title="Educational note of the week">
          <p className="text-sm leading-6 text-[#b9ab9a]">
            A price can rise in dollars while falling in BTC terms. Denominated
            is measuring purchasing power, not predicting future prices.
          </p>
        </ReportSection>
      </div>

      <p className="mt-5 text-xs leading-5 text-[#8f8172]">{DISCLAIMER}</p>
      <p className="mt-3 text-xs leading-5 text-[#8f8172]">
        Backend requirement: connect Resend or another email provider, store
        preferences server-side, and schedule weekly sends after auth exists.
      </p>
    </section>
  );
}

function EmailPreferencesPanel({
  email,
  preferences,
  onToggle,
}: {
  email: string;
  preferences: EmailPreferences;
  onToggle: (key: keyof EmailPreferences) => void;
}) {
  const options: Array<{
    key: keyof EmailPreferences;
    label: string;
    description: string;
  }> = [
    {
      key: "weeklyReport",
      label: "Weekly purchasing-power report",
      description: "A readable summary of saved scenarios and examples.",
    },
    {
      key: "scenarioUpdates",
      label: "Saved scenario updates",
      description: "Changes in BTC terms for the goals you care about.",
    },
    {
      key: "educationLessons",
      label: "Educational lessons",
      description: "Plain-English purchasing-power concepts.",
    },
    {
      key: "popularExamples",
      label: "Popular examples",
      description: "Cars, housing, elder care, tuition, and other life costs.",
    },
  ];

  return (
    <section className="panel rounded-lg p-5 sm:p-7">
      <div className="mb-5 flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[rgba(240,163,111,0.34)] bg-[#2a1810]/55 text-[#f0a36f]">
          <Mail size={20} />
        </div>
        <div>
          <p className="eyebrow mb-3">Email foundation</p>
          <h2 className="text-2xl font-medium text-[#efe6da]">
            {email ? "Education preferences" : "No email saved yet"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#b9ab9a]">
            {email
              ? `Placeholder account: ${email}`
              : "Save a scenario to add an email and start the recurring-use foundation."}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            className="flex w-full items-start gap-3 rounded-md border border-[rgba(239,230,218,0.14)] bg-black/18 p-4 text-left"
            onClick={() => onToggle(option.key)}
          >
            <span
              className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded border ${
                preferences[option.key]
                  ? "border-[#f0a36f] bg-[#f0a36f] text-[#140b06]"
                  : "border-[rgba(239,230,218,0.3)] text-transparent"
              }`}
            >
              <Check size={14} />
            </span>
            <span>
              <span className="block font-medium text-[#efe6da]">
                {option.label}
              </span>
              <span className="mt-1 block text-sm leading-6 text-[#b9ab9a]">
                {option.description}
              </span>
            </span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-[#8f8172]">
        Phone/SMS is not required. These settings are local placeholders until
        auth and email infrastructure are connected.
      </p>
    </section>
  );
}

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-[rgba(239,230,218,0.14)] bg-black/18 p-4">
      <h3 className="mb-2 text-sm font-semibold text-[#efe6da]">{title}</h3>
      {children}
    </div>
  );
}

function useLiveBTCPrice() {
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
        if (!controller.signal.aborted) {
          setState({ status: "error" });
        }
      }
    }

    loadBTCPrice();

    return () => controller.abort();
  }, []);

  return state;
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
