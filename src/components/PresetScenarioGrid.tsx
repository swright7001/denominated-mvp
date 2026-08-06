"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  Building2,
  Car,
  GraduationCap,
  Heart,
  Home,
  Laptop,
  LineChart,
  Plane,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { formatBTC } from "@/lib/calculations";
import { formatCurrency, normalizeCurrencyCode } from "@/lib/currency";
import { calculateScenario } from "@/lib/calculations";
import { Scenario } from "@/lib/types";
import { trackProductEvent } from "@/lib/product-analytics";

const icons = {
  BriefcaseBusiness,
  Building2,
  Car,
  GraduationCap,
  Heart,
  Home,
  Laptop,
  LineChart,
  Plane,
  ShieldCheck,
  Sparkles,
  Users,
};

export function PresetScenarioGrid({
  scenarios,
  limit,
  analyticsSurface,
}: {
  scenarios: Scenario[];
  limit?: number;
  analyticsSurface: "home" | "examples";
}) {
  const visible = limit ? scenarios.slice(0, limit) : scenarios;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((scenario) => {
        const Icon = icons[scenario.icon as keyof typeof icons] ?? Sparkles;
        const result = calculateScenario(scenario);
        const currencyCode = normalizeCurrencyCode(scenario.currencyCode);

        return (
          <Link
            key={scenario.slug}
            href={`/examples/${scenario.slug}`}
            className="panel group overflow-hidden rounded-lg transition hover:-translate-y-1 hover:border-[var(--accent-line-strong)]"
            onClick={() =>
              trackProductEvent({
                event: "preset_opened",
                surface: analyticsSurface,
              })
            }
          >
            <div className="relative overflow-hidden p-5">
              <div className="absolute -right-14 -top-16 h-40 w-40 rounded-full border border-[var(--accent-line-soft)] bg-[radial-gradient(circle,rgba(240,163,111,0.14),transparent_65%)] transition duration-300 group-hover:scale-110" />
              <div className="absolute left-8 top-16 h-px w-24 bg-gradient-to-r from-[rgba(240,163,111,0.34)] to-transparent" />
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-full border border-[var(--accent-line)] bg-[var(--surface-soft-strong)] text-[var(--accent-text)] backdrop-blur">
                  <Icon size={23} />
                </div>
                <span className="max-w-[11rem] rounded-full border border-[var(--accent-line)] bg-[var(--surface-soft-strong)] px-3 py-1 text-xs text-[var(--text-muted)] backdrop-blur">
                  {scenario.category}
                </span>
              </div>
              <h3 className="relative z-10 mt-14 text-2xl text-[var(--text-primary)]">
                {scenario.itemName}
              </h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {scenario.shortDescription}
              </p>
              <p className="mt-2 text-xs text-[var(--text-subtle)]">
                {scenario.sourceCountry ?? "United States"} source ·{" "}
                {scenario.sourceCurrencyCode ?? "USD"}
              </p>
              <div className="mt-5 flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm text-[var(--accent-text)]">
                    {formatCurrency(scenario.currentItemPriceUSD, currencyCode)} today
                  </p>
                  <p className="mt-1 text-xl text-[var(--text-primary)]">
                    {formatBTC(result.currentItemCostBTC)} BTC
                  </p>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--accent-line)] text-[var(--accent-text)] transition group-hover:bg-[var(--accent-surface)]">
                  →
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
