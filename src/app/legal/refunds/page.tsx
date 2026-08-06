import type { Metadata } from "next";
import { Layout } from "@/components/Layout";
import { PAID_FEATURES_CAVEAT, SUPPORT_CONTACT_NOTE } from "@/lib/legal";
import { absoluteUrl } from "@/lib/site";
import {
  getLegalPolicyConfig,
  getRefundWindowCopy,
} from "@/lib/legal-policy";

export const metadata: Metadata = {
  title: "Refunds and Cancellations",
  description: "Refund and cancellation policy for Denominated.",
  alternates: {
    canonical: "/legal/refunds",
  },
  openGraph: {
    title: "Refunds and Cancellations | Denominated",
    description: "Refund and cancellation policy for Denominated.",
    url: absoluteUrl("/legal/refunds"),
  },
};

export default function RefundsPage() {
  const policy = getLegalPolicyConfig();
  const sections = [
    {
      title: "Free Calculator",
      body: PAID_FEATURES_CAVEAT,
    },
    {
      title: "Refund Requests",
      body: getRefundWindowCopy(policy),
    },
    {
      title: "Pro Subscription",
      body: "Pro renews automatically at the interval shown during checkout until canceled. You can cancel future renewals through Billing; unless a refund or legal requirement applies, paid access continues through the end of the current billing period.",
    },
    {
      title: "Lifetime Access",
      body: "Lifetime is a one-time purchase that grants access to the included Lifetime feature set for as long as Denominated continues to offer that product. It is not a promise that the service or every feature will exist forever.",
    },
    {
      title: "Failed Payments",
      body: "A failed subscription payment does not block the free calculator. Paid features may be paused or downgraded while a payment remains unresolved.",
    },
    {
      title: "Support",
      body: SUPPORT_CONTACT_NOTE(),
    },
  ];

  return (
    <Layout>
      <section className="container py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="eyebrow">Billing</p>
          <h1 className="mt-3 text-4xl font-medium text-[var(--text-primary)] md:text-6xl">
            Refunds and Cancellations
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--text-muted)]">
            {policy
              ? `Effective ${policy.effectiveDate}. This policy explains refunds, renewals, cancellations, and Lifetime access.`
              : "Paid checkout remains unavailable until this refund policy and its effective date are approved and published."}
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
