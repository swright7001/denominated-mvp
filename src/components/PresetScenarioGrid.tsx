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
import { formatBTC, formatUSD } from "@/lib/calculations";
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

        return (
          <Link
            key={scenario.slug}
            href={`/examples/${scenario.slug}`}
            className="panel group rounded-lg p-5 transition hover:-translate-y-1 hover:border-[rgba(240,163,111,0.55)]"
          >
            <div className="mb-10 flex items-start justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-full border border-[rgba(240,163,111,0.32)] text-[#f0a36f]">
                <Icon size={23} />
              </div>
              <span className="rounded-full border border-[rgba(240,163,111,0.24)] px-3 py-1 text-xs text-[#b9ab9a]">
                {scenario.category}
              </span>
            </div>
            <h3 className="text-2xl text-[#efe6da]">{scenario.itemName}</h3>
            <p className="mt-1 text-sm text-[#b9ab9a]">
              {scenario.shortDescription}
            </p>
            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm text-[#f0a36f]">
                  {formatUSD(scenario.currentItemPriceUSD)} today
                </p>
                <p className="mt-1 text-xl text-[#efe6da]">
                  {formatBTC(result.currentItemCostBTC)} BTC
                </p>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-full border border-[rgba(240,163,111,0.36)] text-[#f0a36f] transition group-hover:bg-[#2a1810]">
                →
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
