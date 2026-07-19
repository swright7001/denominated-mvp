import Link from "next/link";
import { ArrowRight, BadgeDollarSign, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { BTCPriceStatus } from "@/components/BTCPriceStatus";
import { Layout } from "@/components/Layout";
import { PresetScenarioGrid } from "@/components/PresetScenarioGrid";
import { ProductWalkthrough } from "@/components/ProductWalkthrough";
import { DISCLAIMER } from "@/components/Footer";
import { getBTCPrice } from "@/lib/btc-price";
import { calculateScenario, formatBTC, formatUSD } from "@/lib/calculations";
import { applyBTCPriceToScenario, applyBTCPriceToScenarios } from "@/lib/live-scenarios";
import { defaultScenario, scenarios } from "@/lib/scenarios";

export const dynamic = "force-dynamic";

export default async function Home() {
  const btcPrice = await getBTCPrice();
  const heroScenario = applyBTCPriceToScenario(
    defaultScenario,
    btcPrice.priceUSD,
  );
  const heroResult = calculateScenario(heroScenario);
  const pricedScenarios = applyBTCPriceToScenarios(
    scenarios,
    btcPrice.priceUSD,
  );

  return (
    <Layout>
      <section className="container grid gap-10 py-12 md:grid-cols-[1fr_0.82fr] md:items-center md:py-20">
        <div>
          <h1 className="max-w-3xl text-4xl font-medium leading-[1.08] text-[#efe6da] sm:text-5xl md:text-7xl">
            See What Life Costs in Bitcoin Terms
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#b9ab9a] sm:text-xl">
            Compare everyday expenses in dollars and Bitcoin so you can
            understand purchasing power over time.
          </p>
          <p className="mt-4 text-2xl text-[#f0a36f]">
            Measure life in purchasing power.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/calculator"
              className="copper-button inline-flex items-center justify-center gap-3 rounded-md px-6 py-4 font-semibold"
            >
              Run a Scenario <ArrowRight size={19} />
            </Link>
            <Link
              href="/examples"
              className="outline-button inline-flex items-center justify-center rounded-md px-6 py-4"
            >
              View Examples
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            <MiniProof icon={<BadgeDollarSign />} title="Purchasing power first" copy="Value in what matters, not inflated dollars." />
            <MiniProof icon={<ShieldCheck />} title="Transparent inputs" copy="Use simple assumptions you can change." />
            <MiniProof icon={<Users />} title="Built for real life" copy="For families, savers, and everyday decisions." />
          </div>
        </div>
        <div className="panel rounded-lg p-5">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xl text-[#efe6da]">Tesla Model 3</p>
              <p className="text-sm text-[#b9ab9a]">Example scenario</p>
            </div>
            <span className="rounded-md bg-white/5 px-3 py-1 text-xs text-[#b9ab9a]">
              5 Year Outlook
            </span>
          </div>
          <div className="grid gap-6 border-y border-[rgba(239,230,218,0.12)] py-6 sm:grid-cols-2">
            <div>
              <p className="eyebrow">Today</p>
              <p className="metric mt-2 text-4xl text-[#f0a36f]">
                {formatBTC(heroResult.currentItemCostBTC)} BTC
              </p>
              <p className="mt-1 text-sm text-[#b9ab9a]">
                {formatUSD(heroScenario.currentItemPriceUSD)}
              </p>
            </div>
            <div>
              <p className="eyebrow">In 5 years</p>
              <p className="metric mt-2 text-4xl text-[#f0a36f]">
                {formatBTC(heroResult.futureItemCostBTC)} BTC
              </p>
              <p className="mt-1 text-sm text-[#b9ab9a]">
                {formatUSD(heroResult.futureItemPriceUSD)}
              </p>
            </div>
          </div>
          <div className="mt-6 h-36 rounded-md border border-[rgba(240,163,111,0.18)] bg-[linear-gradient(160deg,rgba(199,119,66,0.2),transparent)] p-5">
            <div className="flex h-full items-end gap-2">
              {[70, 62, 55, 48, 42, 34, 28].map((height, index) => (
                <div
                  key={height}
                  className="flex-1 rounded-t bg-[#c77742]/60"
                  style={{ height: `${height - index * 2}%` }}
                />
              ))}
              <TrendingUp className="mb-16 text-[#f0a36f]" size={42} />
            </div>
          </div>
          <p className="mt-5 rounded-md border border-[rgba(240,163,111,0.18)] bg-[#2a1810]/45 p-4 text-sm text-[#f0c19f]">
            More expensive in dollars. Cheaper in Bitcoin.
          </p>
          <BTCPriceStatus btcPrice={btcPrice} className="mt-4" />
        </div>
      </section>

      <ProductWalkthrough />

      <section className="container py-8">
        <div className="mb-8 text-center">
          <p className="eyebrow">Popular examples</p>
          <h2 className="mt-3 text-3xl text-[#efe6da]">Real-life costs, not trading screens</h2>
          <p className="mt-3 text-[#b9ab9a]">
            Explore common expenses through a purchasing-power lens.
          </p>
        </div>
        <PresetScenarioGrid scenarios={pricedScenarios} limit={6} />
      </section>

      <section className="container grid gap-6 py-12 md:grid-cols-3">
        <InfoPanel title="How it works" copy="Enter today's cost, today's Bitcoin price, a time horizon, and simple annual assumptions. Denominated compares the same expense in dollars and BTC." />
        <InfoPanel title="Why purchasing power matters" copy="A price can rise in dollars while falling against a harder benchmark. That helps explain why a bigger dollar number does not always mean better value." />
        <InfoPanel title="Disclaimer" copy={DISCLAIMER} />
      </section>

      <section className="border-t border-[rgba(240,163,111,0.16)] py-12">
        <div className="container flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Contact</p>
            <h2 className="mt-2 text-3xl text-[#efe6da]">Questions or feedback?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b9ab9a]">
              Get account help, report a bug, suggest an improvement, or use
              the private security channel.
            </p>
          </div>
          <Link
            href="/support"
            className="outline-button inline-flex shrink-0 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold text-[#f0a36f]"
          >
            Contact Denominated
          </Link>
        </div>
      </section>
    </Layout>
  );
}

function MiniProof({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="text-[#f0a36f] [&>svg]:h-6 [&>svg]:w-6">{icon}</div>
      <div>
        <p className="text-sm font-medium text-[#efe6da]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#b9ab9a]">{copy}</p>
      </div>
    </div>
  );
}

function InfoPanel({ title, copy }: { title: string; copy: string }) {
  return (
    <article className="panel rounded-lg p-6">
      <h3 className="text-2xl text-[#efe6da]">{title}</h3>
      <p className="mt-4 text-sm leading-6 text-[#b9ab9a]">{copy}</p>
    </article>
  );
}
