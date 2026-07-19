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
}: {
  scenarios: Scenario[];
  limit?: number;
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
            className="panel group overflow-hidden rounded-lg transition hover:-translate-y-1 hover:border-[rgba(240,163,111,0.55)]"
          >
            <div className="relative overflow-hidden p-5">
              <div className="absolute -right-14 -top-16 h-40 w-40 rounded-full border border-[rgba(240,163,111,0.12)] bg-[radial-gradient(circle,rgba(240,163,111,0.14),transparent_65%)] transition duration-300 group-hover:scale-110" />
              <div className="absolute left-8 top-16 h-px w-24 bg-gradient-to-r from-[rgba(240,163,111,0.34)] to-transparent" />
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-full border border-[rgba(240,163,111,0.32)] bg-[#100d0b]/70 text-[#f0a36f] backdrop-blur">
                  <Icon size={23} />
                </div>
                <span className="max-w-[11rem] rounded-full border border-[rgba(240,163,111,0.24)] bg-[#100d0b]/65 px-3 py-1 text-xs text-[#b9ab9a] backdrop-blur">
                  {scenario.category}
                </span>
              </div>
              <h3 className="relative z-10 mt-14 text-2xl text-[#efe6da]">
                {scenario.itemName}
              </h3>
              <p className="mt-1 text-sm text-[#b9ab9a]">
                {scenario.shortDescription}
              </p>
              <p className="mt-2 text-xs text-[#8f8172]">
                {scenario.sourceCountry ?? "United States"} source ·{" "}
                {scenario.sourceCurrencyCode ?? "USD"}
              </p>
              <div className="mt-5 flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm text-[#f0a36f]">
                    {formatCurrency(scenario.currentItemPriceUSD, currencyCode)} today
                  </p>
                  <p className="mt-1 text-xl text-[#efe6da]">
                    {formatBTC(result.currentItemCostBTC)} BTC
                  </p>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-full border border-[rgba(240,163,111,0.36)] text-[#f0a36f] transition group-hover:bg-[#2a1810]">
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
