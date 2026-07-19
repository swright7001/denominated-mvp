import type { Metadata } from "next";
import Link from "next/link";
import { Bug, LifeBuoy, LockKeyhole } from "lucide-react";
import { Layout } from "@/components/Layout";
import {
  getConfiguredSupportEmail,
  publicSupportEmail,
} from "@/lib/support";

export const metadata: Metadata = {
  title: "Support and Contact",
  description:
    "Contact Denominated about the calculator, account access, product feedback, or a private security report.",
};

export default function SupportPage() {
  const supportEmail = getConfiguredSupportEmail();

  return (
    <Layout>
      <section className="container py-10 sm:py-14">
        <p className="eyebrow">Support</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-medium text-[#efe6da] sm:text-6xl">
          Contact Denominated
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#b9ab9a]">
          Choose the path that fits your question. Never send passwords,
          verification codes, payment details, or API keys.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <SupportOption
            icon={<LifeBuoy />}
            title="Account and billing support"
            copy={
              supportEmail
                ? `Email ${publicSupportEmail} for private help with account access, saved scenarios, or billing.`
                : "The branded support inbox is being verified. Public calculator feedback remains available through GitHub."
            }
            href={supportEmail ? `mailto:${supportEmail}` : undefined}
            action={
              supportEmail ? "Email support" : "Email verification in progress"
            }
          />
          <SupportOption
            icon={<Bug />}
            title="Bug or product feedback"
            copy="Use the guided public form for reproducible bugs and product ideas. Remove private account information from screenshots."
            href="https://github.com/swright7001/denominated-mvp/issues/new/choose"
            action="Open feedback form"
            external
          />
          <SupportOption
            icon={<LockKeyhole />}
            title="Private security report"
            copy="Use GitHub's private security-advisory channel for vulnerabilities. Security details should never be posted publicly."
            href="https://github.com/swright7001/denominated-mvp/security/advisories/new"
            action="Report privately"
            external
          />
        </div>

        <p className="mt-8 max-w-3xl text-sm leading-6 text-[#8f8274]">
          Denominated is an educational tool and does not provide financial
          advice. Support cannot provide personalized investment guidance.
        </p>
      </section>
    </Layout>
  );
}

function SupportOption({
  icon,
  title,
  copy,
  href,
  action,
  external = false,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
  href?: string;
  action: string;
  external?: boolean;
}) {
  return (
    <article className="panel rounded-lg p-6">
      <div className="text-[#f0a36f] [&>svg]:h-6 [&>svg]:w-6">{icon}</div>
      <h2 className="mt-5 text-xl font-medium text-[#efe6da]">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#b9ab9a]">{copy}</p>
      {href ? (
        <Link
          href={href}
          className="outline-button mt-6 inline-flex rounded-md px-4 py-3 text-sm font-semibold text-[#f0a36f]"
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
        >
          {action}
        </Link>
      ) : (
        <p className="mt-6 text-sm font-medium text-[#8f8274]">{action}</p>
      )}
    </article>
  );
}
