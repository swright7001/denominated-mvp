import Link from "next/link";
import Image from "next/image";
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
            className="panel group overflow-hidden rounded-lg transition hover:-translate-y-1 hover:border-[rgba(240,163,111,0.55)]"
          >
            <div
              className={
                scenario.image
                  ? "relative min-h-44 overflow-hidden bg-[radial-gradient(circle_at_50%_35%,rgba(240,163,111,0.14),transparent_58%)] p-5"
                  : "relative mb-10 flex items-start justify-between p-5 pb-0"
              }
            >
              {scenario.image && (
                <Image
                  src={scenario.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover object-[center_45%] opacity-100 brightness-[1.55] contrast-[1.08] saturate-[1.12] transition duration-300 group-hover:scale-[1.025]"
                />
              )}
              {scenario.image && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-[#080807]/0 via-[#080807]/4 to-[#12100e]/66" />
                  <div className="absolute left-0 top-0 h-32 w-32 bg-[radial-gradient(circle_at_0_0,#12100e_0,rgba(18,16,14,0.94)_42%,rgba(18,16,14,0)_76%)]" />
                </>
              )}
              <div className="relative z-10 flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-full border border-[rgba(240,163,111,0.32)] bg-[#100d0b]/70 text-[#f0a36f] backdrop-blur">
                  <Icon size={23} />
                </div>
                <span className="rounded-full border border-[rgba(240,163,111,0.24)] bg-[#100d0b]/65 px-3 py-1 text-xs text-[#b9ab9a] backdrop-blur">
                  {scenario.category}
                </span>
              </div>
            </div>
            <div className="p-5 pt-4">
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
            </div>
          </Link>
        );
      })}
    </div>
  );
}
