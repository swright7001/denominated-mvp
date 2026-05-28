import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AssumptionsPanel } from "@/components/AssumptionsPanel";
import { BTCComparisonChart } from "@/components/BTCComparisonChart";
import { Layout } from "@/components/Layout";
import { ShareableResultCard } from "@/components/ShareableResultCard";
import { calculateScenario, formatBTC, formatUSD } from "@/lib/calculations";
import { getScenario, scenarios } from "@/lib/scenarios";
import { absoluteUrl } from "@/lib/site";

type ScenarioDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return scenarios.map((scenario) => ({ slug: scenario.slug }));
}

export async function generateMetadata({
  params,
}: ScenarioDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const scenario = getScenario(slug);

  if (!scenario) {
    return {
      title: "Scenario Not Found",
    };
  }

  const title = `${scenario.itemName} in Bitcoin Terms`;
  const description = `See how ${scenario.itemName.toLowerCase()} changes when measured in dollars and Bitcoin purchasing power over time.`;
  const path = `/examples/${scenario.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${title} | Denominated`,
      description,
      url: absoluteUrl(path),
    },
    twitter: {
      title: `${title} | Denominated`,
      description,
    },
  };
}

export default async function ScenarioDetailPage({
  params,
}: ScenarioDetailPageProps) {
  const { slug } = await params;
  const scenario = getScenario(slug);

  if (!scenario) notFound();

  const result = calculateScenario(scenario);
  const direction =
    result.btcCostChangePercent < 0 ? "cheaper" : "more expensive";

  return (
    <Layout>
      <section className="container grid gap-6 py-12 lg:grid-cols-[1fr_360px]">
        <article className="panel rounded-lg p-6 sm:p-8">
          <Link
            className="mb-8 inline-flex items-center gap-2 text-sm text-[#f0a36f]"
            href="/examples"
          >
            <ArrowLeft size={18} /> Back to all
          </Link>
          <p className="eyebrow">{scenario.category}</p>
          <h1 className="mt-3 text-4xl font-medium text-[#efe6da] md:text-6xl">
            {scenario.itemName}
          </h1>
          <p className="mt-3 text-lg text-[#b9ab9a]">
            {scenario.shortDescription}
          </p>

          <div className="my-8 grid gap-5 border-y border-[rgba(239,230,218,0.12)] py-8 sm:grid-cols-2">
            <div>
              <p className="eyebrow">Today</p>
              <p className="mt-4 text-3xl text-[#efe6da]">
                {formatUSD(scenario.currentItemPriceUSD)}
                {scenario.purchaseType === "monthly" && " / month"} ={" "}
                <span className="copper-text">
                  {formatBTC(result.currentItemCostBTC)} BTC
                </span>
              </p>
              <p className="mt-2 text-[#b9ab9a]">
                At {formatUSD(scenario.currentBTCPriceUSD)} BTC
              </p>
            </div>
            <div>
              <p className="eyebrow">Future</p>
              <p className="mt-4 text-3xl text-[#efe6da]">
                {formatUSD(result.futureItemPriceUSD)}
                {scenario.purchaseType === "monthly" && " / month"} ={" "}
                <span className="copper-text">
                  {formatBTC(result.futureItemCostBTC)} BTC
                </span>
              </p>
              <p className="mt-2 text-[#b9ab9a]">
                At {formatUSD(result.futureBTCPriceUSD)} BTC
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-[rgba(240,163,111,0.32)] bg-[#2a1810]/45 p-6">
            <p className="eyebrow mb-3">The takeaway</p>
            <p className="text-2xl leading-9 text-[#efe6da]">
              More expensive in dollars.{" "}
              <span className="copper-text">
                {Math.abs(result.btcCostChangePercent).toFixed(1)}% {direction}
              </span>{" "}
              in Bitcoin terms.
            </p>
            <p className="mt-4 leading-7 text-[#b9ab9a]">
              Today, {scenario.itemName} costs{" "}
              {formatBTC(result.currentItemCostBTC)} BTC. If the item rises to{" "}
              {formatUSD(result.futureItemPriceUSD)} and Bitcoin reaches{" "}
              {formatUSD(result.futureBTCPriceUSD)}, the same expense costs{" "}
              {formatBTC(result.futureItemCostBTC)} BTC.
            </p>
          </div>
        </article>
        <aside className="space-y-6">
          <AssumptionsPanel scenario={scenario} />
          <ShareableResultCard scenario={scenario} result={result} />
        </aside>
      </section>
      <section className="container pb-12">
        <BTCComparisonChart result={result} />
      </section>
    </Layout>
  );
}
