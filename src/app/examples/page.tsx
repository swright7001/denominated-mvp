import type { Metadata } from "next";
import { BTCPriceStatus } from "@/components/BTCPriceStatus";
import { Layout } from "@/components/Layout";
import { PresetScenarioGrid } from "@/components/PresetScenarioGrid";
import { getBTCPrice } from "@/lib/btc-price";
import { applyBTCPriceToScenarios } from "@/lib/live-scenarios";
import { scenarios } from "@/lib/scenarios";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Popular Purchasing-Power Examples",
  description:
    "Explore preset Denominated scenarios for cars, housing, rent, elder care, childcare, tuition, travel, and more.",
  alternates: {
    canonical: "/examples",
  },
  openGraph: {
    title: "Popular Purchasing-Power Examples | Denominated",
    description:
      "Explore real-life expenses measured in dollars and Bitcoin terms.",
    url: absoluteUrl("/examples"),
  },
};

export const dynamic = "force-dynamic";

export default async function ExamplesPage() {
  const btcPrice = await getBTCPrice();
  const pricedScenarios = applyBTCPriceToScenarios(
    scenarios,
    btcPrice.price,
  );

  return (
    <Layout>
      <section className="container py-12">
        <div className="mb-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="eyebrow">Examples</p>
            <h1 className="mt-3 text-4xl font-medium text-[#efe6da] md:text-6xl">
              Popular Scenarios
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#b9ab9a]">
              See how everyday expenses compare in today&apos;s dollars versus
              future purchasing power.
            </p>
          </div>
          <div className="outline-button rounded-md px-4 py-3 text-sm text-[#f0a36f]">
            United States
          </div>
        </div>
        <BTCPriceStatus btcPrice={btcPrice} className="mb-6" />
        <PresetScenarioGrid scenarios={pricedScenarios} />
      </section>
    </Layout>
  );
}
