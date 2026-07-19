import type { Metadata } from "next";
import { Layout } from "@/components/Layout";
import { DATA_SOURCE_CAVEAT, SUPPORT_CONTACT_NOTE } from "@/lib/legal";
import {
  getLegalPolicyConfig,
  getPrivacyPolicyIntro,
} from "@/lib/legal-policy";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy notice for Denominated.",
  alternates: {
    canonical: "/legal/privacy",
  },
  openGraph: {
    title: "Privacy | Denominated",
    description: "Privacy notice for Denominated.",
    url: absoluteUrl("/legal/privacy"),
  },
};

const sections = [
  {
    title: "What Denominated Collects",
    body: "Denominated may store calculator preferences and unauthenticated scenarios in your browser. If you create an account, Denominated processes account identifiers, saved scenarios, assumptions, and billing entitlement records needed to provide account features.",
  },
  {
    title: "How Data Is Used",
    body: "Data is used to run calculator scenarios, save watchlist items, manage account access, process billing, improve the product, and provide support.",
  },
  {
    title: "Price And Scenario Inputs",
    body: DATA_SOURCE_CAVEAT,
  },
  {
    title: "Service Providers",
    body: "Clerk processes account authentication, Convex stores account and saved-scenario data, Stripe processes payments and billing, Vercel hosts the app and provides operational analytics, and CoinGecko supplies the reference Bitcoin price. These providers process data under their own terms and privacy notices.",
  },
  {
    title: "Payment Data",
    body: "Stripe handles payment details. Denominated stores billing identifiers and entitlement status needed to provide paid access, but does not store raw card numbers or card security codes.",
  },
  {
    title: "Service Messages And Analytics",
    body: "Account, billing, security, and support messages may be sent when needed to provide the service. Product analytics are used to understand performance and usage; Denominated does not enable session replay by default.",
  },
  {
    title: "Retention And Your Choices",
    body: "Browser data can be cleared through your browser. Account, billing, and support records are retained while needed to provide the service, meet legal obligations, resolve disputes, and prevent abuse. Contact support to request account-data access, correction, or deletion; some records may be retained where law requires it.",
  },
  {
    title: "Contact",
    body: SUPPORT_CONTACT_NOTE(),
  },
];

export default function PrivacyPage() {
  const policy = getLegalPolicyConfig();

  return (
    <Layout>
      <section className="container py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="eyebrow">Legal</p>
          <h1 className="mt-3 text-4xl font-medium text-[var(--text-primary)] md:text-6xl">
            Privacy Notice
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--text-muted)]">
            {getPrivacyPolicyIntro(policy)}
          </p>
        </div>

        <div className="mt-10 grid gap-5">
          {sections.map((section) => (
            <article key={section.title} className="panel rounded-lg p-5 sm:p-7">
              <h2 className="text-2xl font-medium text-[var(--text-primary)]">
                {section.title}
              </h2>
              <p className="mt-3 leading-7 text-[var(--text-muted)]">{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  );
}
