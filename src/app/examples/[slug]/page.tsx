import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AssumptionsPanel } from "@/components/AssumptionsPanel";
import { BTCComparisonChart } from "@/components/BTCComparisonChart";
import { BTCPriceStatus } from "@/components/BTCPriceStatus";
import { Layout } from "@/components/Layout";
import { ShareableResultCard } from "@/components/ShareableResultCard";
import { getBTCPrice } from "@/lib/btc-price";
import { calculateScenario, formatBTC } from "@/lib/calculations";
import { formatCurrency, normalizeCurrencyCode } from "@/lib/currency";
import { applyBTCPriceToScenario } from "@/lib/live-scenarios";
import { getScenario, scenarios } from "@/lib/scenarios";
import { absoluteUrl } from "@/lib/site";

type ScenarioDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return scenarios.map((scenario) => ({ slug: scenario.slug }));
}

export const dynamic = "force-dynamic";

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

  const btcPrice = await getBTCPrice();
  const liveScenario = applyBTCPriceToScenario(scenario, btcPrice.price);
  const result = calculateScenario(liveScenario);
  const direction =
    result.btcCostChangePercent < 0 ? "cheaper" : "more expensive";
  const currencyCode = normalizeCurrencyCode(liveScenario.currencyCode);

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
          <p className="eyebrow">{liveScenario.category}</p>
          <h1 className="mt-3 text-4xl font-medium text-[#efe6da] md:text-6xl">
            {liveScenario.itemName}
          </h1>
          <p className="mt-3 text-lg text-[#b9ab9a]">
            {liveScenario.shortDescription}
          </p>
          <BTCPriceStatus btcPrice={btcPrice} className="mt-6" />

          {liveScenario.image && (
            <div className="relative mt-8 aspect-[16/7] overflow-hidden rounded-lg border border-[rgba(240,163,111,0.24)] bg-[#12100e]">
              <Image
                src={liveScenario.image}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 760px, 100vw"
                className="object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#080807]/35 via-transparent to-[#080807]/25" />
            </div>
          )}

          <div className="my-8 grid gap-5 border-y border-[rgba(239,230,218,0.12)] py-8 sm:grid-cols-2">
            <div>
              <p className="eyebrow">Today</p>
              <p className="mt-4 text-3xl text-[#efe6da]">
                {formatCurrency(liveScenario.currentItemPriceUSD, currencyCode)}
                {liveScenario.purchaseType === "monthly" && " / month"} ={" "}
                <span className="copper-text">
                  {formatBTC(result.currentItemCostBTC)} BTC
                </span>
              </p>
              <p className="mt-2 text-[#b9ab9a]">
                At {formatCurrency(liveScenario.currentBTCPriceUSD, currencyCode)} BTC
              </p>
            </div>
            <div>
              <p className="eyebrow">Future</p>
              <p className="mt-4 text-3xl text-[#efe6da]">
                {formatCurrency(result.futureItemPriceUSD, currencyCode)}
                {liveScenario.purchaseType === "monthly" && " / month"} ={" "}
                <span className="copper-text">
                  {formatBTC(result.futureItemCostBTC)} BTC
                </span>
              </p>
              <p className="mt-2 text-[#b9ab9a]">
                At {formatCurrency(result.futureBTCPriceUSD, currencyCode)} BTC
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-[rgba(240,163,111,0.32)] bg-[#2a1810]/45 p-6">
            <p className="eyebrow mb-3">The takeaway</p>
            <p className="text-2xl leading-9 text-[#efe6da]">
              More expensive in {currencyCode}.{" "}
              <span className="copper-text">
                {Math.abs(result.btcCostChangePercent).toFixed(1)}% {direction}
              </span>{" "}
              in Bitcoin terms.
            </p>
            <p className="mt-4 leading-7 text-[#b9ab9a]">
              Today, {liveScenario.itemName} costs{" "}
              {formatBTC(result.currentItemCostBTC)} BTC. If the item rises to{" "}
              {formatCurrency(result.futureItemPriceUSD, currencyCode)} and Bitcoin reaches{" "}
              {formatCurrency(result.futureBTCPriceUSD, currencyCode)}, the same expense costs{" "}
              {formatBTC(result.futureItemCostBTC)} BTC.
            </p>
          </div>
        </article>
        <aside className="space-y-6">
          <AssumptionsPanel scenario={liveScenario} />
          <ShareableResultCard scenario={liveScenario} result={result} />
        </aside>
      </section>
      <section className="container pb-12">
        <BTCComparisonChart scenario={liveScenario} result={result} />
      </section>
    </Layout>
  );
}
