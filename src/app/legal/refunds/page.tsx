import type { Metadata } from "next";
import { Layout } from "@/components/Layout";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refunds and Cancellations",
  description: "Refund and cancellation policy scaffold for Denominated.",
  alternates: {
    canonical: "/legal/refunds",
  },
  openGraph: {
    title: "Refunds and Cancellations | Denominated",
    description: "Refund and cancellation policy scaffold for Denominated.",
    url: absoluteUrl("/legal/refunds"),
  },
};

const sections = [
  {
    title: "Free Calculator",
    body: "The core calculator remains free. Paid tiers are for recurring tracking, saved scenarios, reports, exports, and other account-based tools.",
  },
  {
    title: "Pro Subscription",
    body: "If Pro subscriptions are enabled, users should be able to cancel future renewals through the billing management flow. Access should continue until the end of the paid billing period unless a refund or account issue changes that status.",
  },
  {
    title: "Lifetime Access",
    body: "Lifetime should mean ongoing access to the included Pro feature set for the life of the product, subject to the final terms. Refund eligibility for Lifetime purchases must be decided before launch.",
  },
  {
    title: "Failed Payments",
    body: "Failed subscription payments should not block the free calculator. Paid features may be paused or downgraded if payment cannot be completed after the configured grace period.",
  },
  {
    title: "Support",
    body: "A production support contact should be published before accepting payments so users have a clear path for billing questions, cancellations, and account access problems.",
  },
];

export default function RefundsPage() {
  return (
    <Layout>
      <section className="container py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="eyebrow">Billing</p>
          <h1 className="mt-3 text-4xl font-medium text-[#efe6da] md:text-6xl">
            Refunds and Cancellations
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#b9ab9a]">
            This policy scaffold keeps paid-launch expectations visible while
            final legal, tax, and support decisions are completed.
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
