import type { Metadata } from "next";
import { Layout } from "@/components/Layout";
import { DISCLAIMER } from "@/components/Footer";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for Denominated.",
  alternates: {
    canonical: "/legal/terms",
  },
  openGraph: {
    title: "Terms | Denominated",
    description: "Terms of use for Denominated.",
    url: absoluteUrl("/legal/terms"),
  },
};

export default function TermsPage() {
  return (
    <Layout>
      <LegalArticle
        eyebrow="Legal"
        title="Terms of Use"
        intro="These launch terms are written to set clear expectations before paid tiers go live. They should be reviewed by counsel before accepting production payments."
        sections={[
          {
            title: "Educational Tool",
            body: DISCLAIMER,
          },
          {
            title: "Assumptions Are User-Controlled",
            body: "Denominated calculates scenarios from the prices, rates, and time horizons shown in the product. Bitcoin prices, item prices, inflation rates, and growth assumptions may be incomplete, delayed, stale, or wrong.",
          },
          {
            title: "No Investment Or Purchasing Advice",
            body: "Denominated does not tell you whether to buy, sell, hold, spend, save, trade, invest, or avoid any asset or item. You are responsible for your own financial, tax, legal, and purchasing decisions.",
          },
          {
            title: "Accounts And Paid Features",
            body: "If paid tiers are enabled, the free calculator remains available without payment. Paid features are intended for saved scenarios, watchlists, dashboards, reports, exports, and other recurring-use tools.",
          },
          {
            title: "Service Changes",
            body: "Denominated may improve, change, pause, or remove features over time. We will try to avoid disrupting paid access, but no online service can be guaranteed to be uninterrupted.",
          },
          {
            title: "Contact",
            body: "For account, billing, or support questions, contact the support address published with the production launch.",
          },
        ]}
      />
    </Layout>
  );
}

function LegalArticle({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: { title: string; body: string }[];
}) {
  return (
    <section className="container py-12 md:py-16">
      <div className="max-w-3xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-medium text-[#efe6da] md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#b9ab9a]">{intro}</p>
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
  );
}
