import type { Metadata } from "next";
import Link from "next/link";
import { Check, Clock, Infinity, Lock, Sparkles } from "lucide-react";
import { CheckoutButton } from "@/components/CheckoutButton";
import { Layout } from "@/components/Layout";
import { DISCLAIMER } from "@/components/Footer";
import type { CheckoutPlanId } from "@/lib/checkout";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Plans",
  description:
    "Compare Denominated's free calculator, free account, Pro, and Lifetime purchasing-power tracking plans.",
  alternates: {
    canonical: "/plans",
  },
  openGraph: {
    title: "Plans | Denominated",
    description:
      "See what stays free and what becomes part of Denominated Pro and Lifetime.",
    url: absoluteUrl("/plans"),
  },
};

const tiers = [
  {
    name: "Free",
    eyebrow: "No account",
    price: "$0",
    cadence: "always",
    icon: Check,
    summary: "Run scenarios and understand purchasing power.",
    body: "Use the calculator, change assumptions, view examples, learn the basics, and share results without creating an account.",
    cta: "Run a Scenario",
    href: "/calculator",
    featured: false,
    checkoutPlanIds: [],
  },
  {
    name: "Free Account",
    eyebrow: "Personal starter",
    price: "$0",
    cadence: "with email signup",
    icon: Sparkles,
    summary: "Save your first scenario and see how it changes.",
    body: "A light account gives you one saved scenario, a basic watchlist view, and opt-in educational updates.",
    cta: "Save a Scenario",
    href: "/calculator",
    featured: false,
    checkoutPlanIds: [],
  },
  {
    name: "Pro",
    eyebrow: "Recurring tracking",
    price: "$7/mo",
    cadence: "or $59/year",
    icon: Clock,
    summary:
      "Track real-life costs over time with a personal purchasing-power dashboard.",
    body: "Unlimited saved scenarios, full watchlist, daily snapshots, weekly reports, email reports, and historical comparison.",
    cta: "Preview Pro Tools",
    href: "/dashboard",
    featured: true,
    checkoutPlanIds: ["proMonthly", "proAnnual"] satisfies CheckoutPlanId[],
  },
  {
    name: "Lifetime",
    eyebrow: "Founder option",
    price: "$99",
    cadence: "one-time access",
    icon: Infinity,
    summary: "Full Pro ownership forever.",
    body: "Everything in Pro, plus lifetime access to future premium tools unless a later launch explicitly excludes them.",
    cta: "View Lifetime Fit",
    href: "#matrix",
    featured: false,
    checkoutPlanIds: ["lifetime"] satisfies CheckoutPlanId[],
  },
];

const features = [
  {
    feature: "Run calculator scenarios",
    free: "Included",
    account: "Included",
    pro: "Included",
    lifetime: "Included",
  },
  {
    feature: "Use live BTC price",
    free: "Included",
    account: "Included",
    pro: "Included",
    lifetime: "Included",
  },
  {
    feature: "Change manual assumptions",
    free: "Included",
    account: "Included",
    pro: "Included",
    lifetime: "Included",
  },
  {
    feature: "View examples and learn content",
    free: "Included",
    account: "Included",
    pro: "Included",
    lifetime: "Included",
  },
  {
    feature: "Copy and share results",
    free: "Included",
    account: "Included",
    pro: "Included",
    lifetime: "Included",
  },
  {
    feature: "Saved scenarios",
    free: "Not included",
    account: "1 scenario",
    pro: "Unlimited",
    lifetime: "Unlimited",
  },
  {
    feature: "Watchlist",
    free: "Not included",
    account: "Basic",
    pro: "Full watchlist",
    lifetime: "Full watchlist",
  },
  {
    feature: "Daily purchasing-power snapshot",
    free: "Preview",
    account: "Limited preview",
    pro: "Included",
    lifetime: "Included",
  },
  {
    feature: "Weekly cost-of-life report",
    free: "Preview",
    account: "Limited preview",
    pro: "Included",
    lifetime: "Included",
  },
  {
    feature: "BTC movement impact",
    free: "Preview",
    account: "1 scenario",
    pro: "All scenarios",
    lifetime: "All scenarios",
  },
  {
    feature: "Historical comparison",
    free: "Not included",
    account: "Not included",
    pro: "Included",
    lifetime: "Included",
  },
  {
    feature: "Email reports",
    free: "Not included",
    account: "Education only",
    pro: "Included",
    lifetime: "Included",
  },
  {
    feature: "Private share links and PDF exports",
    free: "Not included",
    account: "Not included",
    pro: "Included",
    lifetime: "Included",
  },
  {
    feature: "Custom categories and assumption presets",
    free: "Not included",
    account: "Not included",
    pro: "Included",
    lifetime: "Included",
  },
  {
    feature: "Early access to future premium tools",
    free: "Not included",
    account: "Not included",
    pro: "Not default",
    lifetime: "Included",
  },
];

const principles = [
  "The calculator stays useful without an account.",
  "The first scenario is never hard-gated.",
  "Paid value is recurring tracking, not basic access.",
  "Paid launch requires real auth, storage, Stripe fulfillment, and legal signoff.",
];

export default function PlansPage() {
  return (
    <Layout>
      <section className="container py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
          <div>
            <p className="eyebrow">Plans</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-medium text-[var(--text-primary)] md:text-6xl">
              Keep the calculator free. Make tracking worth returning for.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text-muted)]">
              Denominated starts with a free purchasing-power calculator. Pro
              is for people who want to save real-life costs, watch them
              change, and build a personal view of purchasing power over time.
            </p>
          </div>
          <div className="panel rounded-lg p-5 md:p-6">
            <p className="eyebrow">Launch stance</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {principles.map((principle) => (
                <div
                  key={principle}
                  className="rounded-md border border-[var(--accent-line-soft)] bg-[var(--surface-soft)] p-4 text-sm leading-6 text-[var(--text-secondary)]"
                >
                  {principle}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-4">
          {tiers.map((tier) => {
            const Icon = tier.icon;

            return (
              <article
                key={tier.name}
                className={`panel flex rounded-lg p-5 md:p-6 ${
                  tier.featured
                    ? "border-[var(--accent-line-strong)] shadow-[0_0_45px_rgba(199,119,66,0.2)]"
                    : ""
                }`}
              >
                <div className="flex min-h-[27rem] w-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow">{tier.eyebrow}</p>
                      <h2 className="mt-3 text-2xl font-medium text-[var(--text-primary)]">
                        {tier.name}
                      </h2>
                    </div>
                    <div className="rounded-full border border-[var(--accent-line)] bg-[var(--surface-soft)] p-3 text-[var(--accent-text)]">
                      <Icon size={20} />
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="metric text-4xl text-[var(--text-primary)]">
                      {tier.price}
                    </p>
                    <p className="mt-2 text-sm text-[var(--accent-text)]">
                      {tier.cadence}
                    </p>
                  </div>

                  <p className="mt-6 text-lg leading-7 text-[var(--text-primary)]">
                    {tier.summary}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">
                    {tier.body}
                  </p>

                  <div className="mt-auto space-y-3">
                    {tier.checkoutPlanIds.length > 0 ? (
                      tier.checkoutPlanIds.map((planId) => (
                        <CheckoutButton
                          key={planId}
                          planId={planId}
                          featured={tier.featured}
                        />
                      ))
                    ) : (
                      <Link
                        className={`block rounded-md px-4 py-3 text-center text-sm font-semibold ${
                          tier.featured
                            ? "copper-button"
                            : "outline-button text-[var(--accent-text)]"
                        }`}
                        href={tier.href}
                      >
                        {tier.cta}
                      </Link>
                    )}
                    {tier.checkoutPlanIds.length > 0 ? (
                      <Link
                        className="block rounded-md border border-[var(--accent-line)] px-4 py-3 text-center text-sm text-[var(--text-secondary)]"
                        href={tier.href}
                      >
                        {tier.cta}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <section id="matrix" className="mt-10">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Feature Matrix</p>
              <h2 className="mt-3 text-3xl font-medium text-[var(--text-primary)] md:text-4xl">
                What belongs in each tier
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[var(--text-muted)]">
              This is the current packaging plan for launch. Paid access should
              only be enabled once auth, storage, billing fulfillment, and legal
              review are production-ready.
            </p>
          </div>

          <div className="panel overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--accent-line-soft)] text-[var(--text-primary)]">
                    <th className="w-[31%] px-5 py-4 font-medium">Feature</th>
                    <th className="px-5 py-4 font-medium">Free</th>
                    <th className="px-5 py-4 font-medium">Free Account</th>
                    <th className="px-5 py-4 font-medium">Pro</th>
                    <th className="px-5 py-4 font-medium">Lifetime</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-[var(--accent-line-soft)] last:border-b-0"
                    >
                      <th className="px-5 py-4 font-medium text-[var(--text-primary)]">
                        {row.feature}
                      </th>
                      <td className="px-5 py-4 text-[var(--text-muted)]">{row.free}</td>
                      <td className="px-5 py-4 text-[var(--text-muted)]">
                        {row.account}
                      </td>
                      <td className="px-5 py-4 text-[var(--accent-text)]">{row.pro}</td>
                      <td className="px-5 py-4 text-[var(--accent-text)]">
                        {row.lifetime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
          <section className="panel rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full border border-[var(--accent-line)] bg-[var(--surface-soft)] p-3 text-[var(--accent-text)]">
                <Lock size={20} />
              </div>
              <div>
                <p className="eyebrow">No hard gate</p>
                <h2 className="mt-3 text-3xl font-medium text-[var(--text-primary)]">
                  Basic purchasing-power education stays open.
                </h2>
                <p className="mt-4 leading-7 text-[var(--text-muted)]">
                  The paid plan should make Denominated more useful over time.
                  It should not punish someone for running a simple scenario,
                  changing assumptions, or sharing an educational result.
                </p>
              </div>
            </div>
          </section>

          <section className="panel rounded-lg p-6">
            <p className="eyebrow">Disclaimer</p>
            <p className="mt-4 leading-7 text-[var(--text-muted)]">{DISCLAIMER}</p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm">
              <Link className="text-[var(--accent-text)]" href="/legal/terms">
                Terms
              </Link>
              <Link className="text-[var(--accent-text)]" href="/legal/privacy">
                Privacy
              </Link>
              <Link className="text-[var(--accent-text)]" href="/legal/refunds">
                Refunds
              </Link>
              <Link className="text-[var(--accent-text)]" href="/billing">
                Billing readiness
              </Link>
            </div>
          </section>
        </div>
      </section>
    </Layout>
  );
}
