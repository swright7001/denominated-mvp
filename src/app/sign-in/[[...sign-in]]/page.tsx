import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { isClerkConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Denominated account.",
};

export default function SignInPage() {
  if (!isClerkConfigured()) {
    return <AuthSetupFallback action="sign in" />;
  }

  return (
    <Layout>
      <section className="container grid place-items-center py-12 md:py-16">
        <SignIn />
      </section>
    </Layout>
  );
}

function AuthSetupFallback({ action }: { action: string }) {
  return (
    <Layout>
      <section className="container py-12 md:py-16">
        <div className="panel max-w-2xl rounded-lg p-6 sm:p-8">
          <p className="eyebrow">Account</p>
          <h1 className="mt-3 text-3xl font-medium text-[var(--text-primary)] md:text-5xl">
            Account access is temporarily unavailable.
          </h1>
          <p className="mt-4 leading-7 text-[var(--text-muted)]">
            We could not load {action}. The free calculator remains available.
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
