import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { isClerkConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a free Denominated account.",
};

export default function SignUpPage() {
  if (!isClerkConfigured()) {
    return <AuthSetupFallback />;
  }

  return (
    <Layout>
      <section className="container grid place-items-center py-12 md:py-16">
        <SignUp />
      </section>
    </Layout>
  );
}

function AuthSetupFallback() {
  return (
    <Layout>
      <section className="container py-12 md:py-16">
        <div className="panel max-w-2xl rounded-lg p-6 sm:p-8">
          <p className="eyebrow">Account</p>
          <h1 className="mt-3 text-3xl font-medium text-[var(--text-primary)] md:text-5xl">
            Account creation is temporarily unavailable.
          </h1>
          <p className="mt-4 leading-7 text-[var(--text-muted)]">
            The free calculator remains available while account service is
            restored.
          </p>
          <Link
            className="copper-button mt-6 inline-flex rounded-md px-5 py-3 font-semibold"
            href="/calculator"
          >
            Run a Scenario
          </Link>
        </div>
      </section>
    </Layout>
  );
}
