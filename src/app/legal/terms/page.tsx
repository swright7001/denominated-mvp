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
import { getLegalPolicyConfig } from "@/lib/legal-policy";

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
  const policy = getLegalPolicyConfig();

  return (
    <Layout>
      <LegalArticle
        eyebrow="Legal"
        title="Terms of Use"
        intro={
          policy
            ? `Effective ${policy.effectiveDate}. These terms govern your use of Denominated, operated by ${policy.operatorName}.`
            : "These terms govern the free Denominated calculator. Paid checkout remains unavailable until the operator, effective date, jurisdiction, and refund policy are approved and published."
        }
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
            body: `${PAID_FEATURES_CAVEAT} You are responsible for maintaining access to your account and for activity performed through it. Subscription pricing and renewal intervals are shown before checkout.`,
          },
          {
            title: "Acceptable Use",
            body: "Do not misuse the service, interfere with its operation, attempt unauthorized access, automate abusive traffic, or use Denominated to violate applicable law or another person's rights.",
          },
          {
            title: "Availability And Warranty",
            body: "Denominated is provided on an as-available basis. Calculations, data, and online access may contain errors or interruptions. To the extent permitted by law, no warranty is made that the service will always be available or fit for a particular purpose.",
          },
          {
            title: "Service Changes",
            body: "Denominated may improve, change, pause, or remove features over time. We will try to avoid disrupting paid access, but no online service can be guaranteed to be uninterrupted.",
          },
          {
            title: "Governing Terms",
            body: policy
              ? `These terms are governed by the laws applicable in ${policy.governingJurisdiction}, without overriding consumer protections that cannot legally be waived.`
              : "A governing jurisdiction must be approved and published before paid checkout is enabled.",
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
        <h1 className="mt-3 text-4xl font-medium text-[var(--text-primary)] md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-[var(--text-muted)]">{intro}</p>
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
  );
}
