import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { isClerkConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a Denominated account.",
};

export default function SignUpPage() {
  if (!isClerkConfigured()) {
    return (
      <Layout>
        <AuthSetupFallback mode="sign up" />
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container grid place-items-center py-12 md:py-16">
        <SignUp />
      </section>
    </Layout>
  );
}

function AuthSetupFallback({ mode }: { mode: string }) {
  return (
    <section className="container py-12 md:py-16">
      <div className="panel max-w-2xl rounded-lg p-6 sm:p-8">
        <p className="eyebrow">Auth setup</p>
        <h1 className="mt-3 text-3xl font-medium text-[#efe6da] md:text-5xl">
          Clerk is not configured yet.
        </h1>
        <p className="mt-4 leading-7 text-[#b9ab9a]">
          Production {mode} will be available after Clerk environment variables
          are added. The free calculator remains available while setup is in
          progress.
        </p>
        <Link
          className="copper-button mt-6 inline-flex rounded-md px-5 py-3 font-semibold"
          href="/calculator"
        >
          Run a Scenario
        </Link>
      </div>
    </section>
  );
}
