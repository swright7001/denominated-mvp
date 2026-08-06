import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { Layout } from "@/components/Layout";
import { BillingPortalButton } from "@/components/BillingPortalButton";
import { getProductionReadinessChecks } from "@/lib/production-readiness";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Billing",
  description:
    "Manage Denominated billing and review paid launch readiness requirements.",
  alternates: {
    canonical: "/billing",
  },
  openGraph: {
    title: "Billing | Denominated",
    description:
      "Manage Denominated billing and review paid launch readiness requirements.",
    url: absoluteUrl("/billing"),
  },
};

export default function BillingPage() {
  const checks = getProductionReadinessChecks();
  const missingCount = checks.filter((check) => check.status === "missing").length;

  return (
    <Layout>
      <section className="container py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="eyebrow">Billing</p>
            <h1 className="mt-3 text-4xl font-medium text-[var(--text-primary)] md:text-6xl">
              Manage paid Denominated access
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text-muted)]">
              Paid tiers should only launch when account identity, durable
              storage, Stripe fulfillment, and support policies are connected.
            </p>
          </div>
          <div className="panel rounded-lg p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-surface)] text-[var(--accent-text)]">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="eyebrow mb-3">Stripe portal</p>
                <h2 className="text-2xl font-medium text-[var(--text-primary)]">
                  Billing management
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  Once Stripe and real account identity are configured, paid
                  users can manage subscriptions and invoices here.
                </p>
              </div>
            </div>
            <BillingPortalButton />
          </div>
        </div>

        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Launch Readiness</p>
              <h2 className="mt-3 text-3xl font-medium text-[var(--text-primary)] md:text-4xl">
                {missingCount === 0
                  ? "No environment blockers detected"
                  : `${missingCount} provider setup item${
                      missingCount === 1 ? "" : "s"
                    } missing`}
              </h2>
            </div>
            <Link
              className="outline-button inline-flex items-center justify-center rounded-md px-4 py-3 text-sm text-[var(--accent-text)]"
              href="/plans"
            >
              Compare Plans
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {checks.map((check) => {
              const Icon =
                check.status === "ready"
                  ? CheckCircle2
                  : check.status === "manual"
                    ? ShieldCheck
                    : AlertTriangle;

              return (
                <article key={check.id} className="panel rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--accent-line)] bg-[var(--surface-soft)] text-[var(--accent-text)]">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-medium text-[var(--text-primary)]">
                        {check.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                        {check.details}
                      </p>
                      {check.missingEnvVars?.length ? (
                        <p className="mt-3 break-words text-xs uppercase tracking-[0.12em] text-[var(--accent-text)]">
                          Missing: {check.missingEnvVars.join(", ")}
                        </p>
                      ) : (
                        <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                          {check.status === "manual"
                            ? "Manual signoff required"
                            : "Configured"}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </Layout>
  );
}
