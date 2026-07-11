import type { Metadata } from "next";
import { Mail, ShieldCheck } from "lucide-react";
import { Layout } from "@/components/Layout";
import { absoluteUrl } from "@/lib/site";
import { getSupportContact } from "@/lib/support";

export const metadata: Metadata = {
  title: "Support",
  description: "Get account, billing, and product support for Denominated.",
  alternates: {
    canonical: "/support",
  },
  openGraph: {
    title: "Support | Denominated",
    description: "Get account, billing, and product support for Denominated.",
    url: absoluteUrl("/support"),
  },
};

export default function SupportPage() {
  const support = getSupportContact();

  return (
    <Layout>
      <section className="container py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="eyebrow">Support</p>
          <h1 className="mt-3 text-4xl font-medium text-[#efe6da] md:text-6xl">
            Help with Denominated
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#b9ab9a]">
            Get help with account access, saved scenarios, billing, refunds, or
            questions about how the calculator works.
          </p>
        </div>

        <div className="mt-10 grid max-w-3xl gap-5">
          <article className="panel rounded-lg p-5 sm:p-7">
            {support ? (
              <>
                <Mail className="text-[#f0a36f]" size={24} />
                <h2 className="mt-4 text-2xl font-medium text-[#efe6da]">
                  Contact support
                </h2>
                <p className="mt-3 leading-7 text-[#b9ab9a]">
                  Email us with the address on your Denominated account and a
                  short description of what happened. Never send card numbers,
                  passwords, or authentication codes.
                </p>
                <a
                  className="outline-button mt-5 inline-flex rounded-md px-4 py-3 text-[#f0a36f]"
                  href={`mailto:${support.email}`}
                >
                  {support.email}
                </a>
              </>
            ) : (
              <>
                <ShieldCheck className="text-[#f0a36f]" size={24} />
                <h2 className="mt-4 text-2xl font-medium text-[#efe6da]">
                  Paid support is not open yet
                </h2>
                <p className="mt-3 leading-7 text-[#b9ab9a]">
                  The free calculator remains available. A monitored customer
                  support address will be published here before paid checkout
                  is enabled.
                </p>
              </>
            )}
          </article>
        </div>
      </section>
    </Layout>
  );
}
