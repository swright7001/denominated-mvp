import type { Metadata } from "next";
import { Layout } from "@/components/Layout";
import { DISCLAIMER } from "@/components/Footer";
import {
  ASSUMPTION_CAVEAT,
  DATA_SOURCE_CAVEAT,
  PAID_FEATURES_CAVEAT,
  SUPPORT_CONTACT_NOTE,
} from "@/lib/legal";
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
        intro="These terms set expectations for using Denominated's calculator, examples, account features, and future paid tracking tools."
        sections={[
          {
            title: "Educational Tool",
            body: DISCLAIMER,
          },
          {
            title: "Assumptions Are User-Controlled",
            body: `Denominated calculates scenarios from the prices, rates, and time horizons shown in the product. ${ASSUMPTION_CAVEAT}`,
          },
          {
            title: "Data May Be Delayed Or Estimated",
            body: DATA_SOURCE_CAVEAT,
          },
          {
            title: "No Investment Or Purchasing Advice",
            body: "Denominated does not tell you whether to buy, sell, hold, spend, save, trade, invest, or avoid any asset or item. You are responsible for your own financial, tax, legal, and purchasing decisions.",
          },
          {
            title: "Accounts And Paid Features",
            body: PAID_FEATURES_CAVEAT,
          },
          {
            title: "Service Changes",
            body: "Denominated may improve, change, pause, or remove features over time. We will try to avoid disrupting paid access, but no online service can be guaranteed to be uninterrupted.",
          },
          {
            title: "Contact",
            body: SUPPORT_CONTACT_NOTE(),
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
