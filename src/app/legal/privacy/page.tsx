import type { Metadata } from "next";
import { Layout } from "@/components/Layout";
import { DATA_SOURCE_CAVEAT, SUPPORT_CONTACT_NOTE } from "@/lib/legal";
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
    body: "Before production auth is connected, the app may store calculator inputs, saved scenarios, account email placeholders, and plan test state in your browser. When account features are connected, account, billing, email preference, and saved scenario data should be stored by the configured production providers.",
  },
  {
    title: "How Data Is Used",
    body: "Data is used to run calculator scenarios, save watchlist items, manage account access, process billing, deliver opted-in reports, improve the product, and provide support.",
  },
  {
    title: "Price And Scenario Inputs",
    body: DATA_SOURCE_CAVEAT,
  },
  {
    title: "Payment Data",
    body: "Payment details should be handled by Stripe. Denominated should not store raw card numbers or sensitive payment credentials.",
  },
  {
    title: "Email Preferences",
    body: "If recurring emails are enabled, users should be able to opt in or out of educational updates, saved scenario updates, and report-style emails.",
  },
  {
    title: "Analytics",
    body: "Analytics should measure product usage without logging sensitive calculator inputs by default. Any session replay or invasive tracking should require a separate product decision.",
  },
  {
    title: "Production Review",
    body: `${SUPPORT_CONTACT_NOTE} Privacy and data-retention language should be reviewed before accepting production payments or storing durable user data.`,
  },
];

export default function PrivacyPage() {
  return (
    <Layout>
      <section className="container py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="eyebrow">Legal</p>
          <h1 className="mt-3 text-4xl font-medium text-[#efe6da] md:text-6xl">
            Privacy Notice
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#b9ab9a]">
            Denominated should collect only what it needs to run the product,
            support account features, and send opted-in purchasing-power
            updates.
          </p>
        </div>

        <div className="mt-10 grid gap-5">
          {sections.map((section) => (
            <article key={section.title} className="panel rounded-lg p-5 sm:p-7">
              <h2 className="text-2xl font-medium text-[#efe6da]">
                {section.title}
              </h2>
              <p className="mt-3 leading-7 text-[#b9ab9a]">{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  );
}
