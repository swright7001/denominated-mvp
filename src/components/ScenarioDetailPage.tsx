import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AssumptionsPanel } from "@/components/AssumptionsPanel";
import { BTCComparisonChart } from "@/components/BTCComparisonChart";
import { BTCPriceStatus } from "@/components/BTCPriceStatus";
import { Layout } from "@/components/Layout";
import { ShareableResultCard } from "@/components/ShareableResultCard";
import { getBTCPrice } from "@/lib/btc-price";
import { calculateScenario, formatBTC } from "@/lib/calculations";
import { formatCurrency, normalizeCurrencyCode } from "@/lib/currency";
import { applyBTCPriceToScenario } from "@/lib/live-scenarios";
import {
  buildScenarioCalculatorPath,
  buildScenarioStructuredData,
  getRelatedScenarios,
  type ScenarioLandingContent,
} from "@/lib/scenario-seo";
import type { Scenario } from "@/lib/types";

export async function ScenarioDetailPage({
  scenario,
  landingContent,
}: {
  scenario: Scenario;
  landingContent?: ScenarioLandingContent;
}) {
  const btcPrice = await getBTCPrice();
  const liveScenario = applyBTCPriceToScenario(scenario, btcPrice.price);
  const result = calculateScenario(liveScenario);
  const direction =
    result.btcCostChangePercent < 0 ? "cheaper" : "more expensive";
  const currencyCode = normalizeCurrencyCode(liveScenario.currencyCode);
  const relatedScenarios = landingContent
    ? getRelatedScenarios(landingContent)
    : [];
  const structuredData = landingContent
    ? buildScenarioStructuredData(scenario, landingContent)
    : null;

  return (
    <Layout>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <section className="container grid min-w-0 gap-6 py-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="panel min-w-0 rounded-lg p-6 sm:p-8">
          <Link
            className="mb-8 inline-flex items-center gap-2 text-sm text-[#f0a36f]"
            href="/examples"
          >
            <ArrowLeft size={18} /> Back to all
          </Link>
          <p className="eyebrow">{liveScenario.category}</p>
          <h1 className="mt-3 break-words text-4xl font-medium text-[#efe6da] md:text-6xl">
            {landingContent?.heading ?? liveScenario.itemName}
          </h1>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-[#b9ab9a]">
            {landingContent?.intro ?? liveScenario.shortDescription}
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

          <div className="my-8 grid min-w-0 gap-5 border-y border-[rgba(239,230,218,0.12)] py-8 sm:grid-cols-2">
            <div className="min-w-0">
              <p className="eyebrow">Today</p>
              <p className="mt-4 break-words text-3xl text-[#efe6da]">
                {formatCurrency(liveScenario.currentItemPriceUSD, currencyCode)}
                {liveScenario.purchaseType === "monthly" && " / month"} ={" "}
                <span className="copper-text">
                  {formatBTC(result.currentItemCostBTC)} BTC
                </span>
              </p>
              <p className="mt-2 break-words text-[#b9ab9a]">
                At {formatCurrency(liveScenario.currentBTCPriceUSD, currencyCode)} BTC
              </p>
            </div>
            <div className="min-w-0">
              <p className="eyebrow">Future</p>
              <p className="mt-4 break-words text-3xl text-[#efe6da]">
                {formatCurrency(result.futureItemPriceUSD, currencyCode)}
                {liveScenario.purchaseType === "monthly" && " / month"} ={" "}
                <span className="copper-text">
                  {formatBTC(result.futureItemCostBTC)} BTC
                </span>
              </p>
              <p className="mt-2 break-words text-[#b9ab9a]">
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
        <aside className="min-w-0 space-y-6">
          <AssumptionsPanel scenario={liveScenario} />
          <ShareableResultCard scenario={liveScenario} result={result} />
        </aside>
      </section>

      <section className="container min-w-0 pb-12">
        <BTCComparisonChart scenario={liveScenario} result={result} />
      </section>

      {landingContent && (
        <section className="border-y border-[rgba(239,230,218,0.1)] bg-[#0d0c0a] py-14">
          <div className="container grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <p className="eyebrow">How the comparison works</p>
              <h2 className="mt-3 text-3xl font-medium text-[#efe6da]">
                Dollars and Bitcoin measure the same cost differently.
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-[#b9ab9a]">
                {landingContent.howItWorks}
              </p>
            </div>
            <div>
              <p className="eyebrow">What can change</p>
              <h2 className="mt-3 text-3xl font-medium text-[#efe6da]">
                Assumptions are inputs, not predictions.
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-[#b9ab9a]">
                {landingContent.whatCanChange}
              </p>
            </div>
          </div>
        </section>
      )}

      {landingContent && (
        <section className="container py-14">
          <div className="flex flex-col justify-between gap-5 border-b border-[rgba(239,230,218,0.12)] pb-8 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Explore the assumptions</p>
              <h2 className="mt-3 text-3xl font-medium text-[#efe6da]">
                Make this scenario your own.
              </h2>
            </div>
            <Link
              href={buildScenarioCalculatorPath(scenario)}
              className="copper-button inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 py-3 font-medium"
            >
              Edit this scenario <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid gap-6 py-8 md:grid-cols-2">
            {relatedScenarios.map((relatedScenario) => (
              <Link
                key={relatedScenario.slug}
                href={`/examples/${relatedScenario.slug}`}
                className="panel group rounded-lg p-6"
              >
                <p className="eyebrow">Related example</p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-xl text-[#efe6da]">
                    {relatedScenario.itemName}
                  </span>
                  <ArrowRight
                    size={20}
                    className="text-[#f0a36f] transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>
            ))}
          </div>

          <p className="max-w-4xl text-sm leading-6 text-[#8f8375]">
            This tool is educational only. It does not provide financial advice.
            Future Bitcoin prices, inflation rates, and item prices are assumptions,
            not guarantees. Results are illustrative and can change as the BTC price
            and your inputs change.
          </p>
        </section>
      )}
    </Layout>
  );
}
