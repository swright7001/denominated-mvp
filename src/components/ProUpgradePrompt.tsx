import { Lock, Sparkles } from "lucide-react";
import type { ProConversionCopy } from "@/lib/pro-copy";
import { TrackedLink } from "./TrackedLink";

type ProUpgradePromptProps = {
  eyebrow?: string;
  title: string;
  body: string;
  features?: string[];
  primaryCta?: string;
  secondaryCta?: string;
  footnote?: string;
  compact?: boolean;
};

export function ProUpgradePrompt({
  eyebrow = "Pro preview",
  title,
  body,
  features = [],
  primaryCta = "Compare Plans",
  secondaryCta = "Run a Free Scenario",
  footnote = "The free calculator stays open. Paid access adds recurring tracking tools.",
  compact = false,
}: ProUpgradePromptProps) {
  return (
    <section className={`panel rounded-lg ${compact ? "p-5" : "p-6 sm:p-7"}`}>
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-surface)] text-[var(--accent-text)]">
          <Lock size={20} />
        </div>
        <div className="min-w-0">
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h2 className="text-2xl font-medium text-[var(--text-primary)]">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{body}</p>
        </div>
      </div>

      {features.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature}
              className="flex items-start gap-3 rounded-md border border-[var(--neutral-line-soft)] bg-[var(--surface-soft)] p-4 text-sm leading-6 text-[var(--text-secondary)]"
            >
              <Sparkles className="mt-1 shrink-0 text-[var(--accent-text)]" size={15} />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <TrackedLink
          analyticsEvent={{
            event: "cta_clicked",
            cta: "upgrade_compare_plans",
          }}
          className="copper-button inline-flex items-center justify-center rounded-md px-4 py-3 text-sm font-semibold"
          href="/plans"
        >
          {primaryCta}
        </TrackedLink>
        <TrackedLink
          analyticsEvent={{
            event: "cta_clicked",
            cta: "upgrade_run_free_scenario",
          }}
          className="outline-button inline-flex items-center justify-center rounded-md px-4 py-3 text-sm text-[var(--accent-text)]"
          href="/calculator"
        >
          {secondaryCta}
        </TrackedLink>
      </div>
      <p className="mt-4 text-xs leading-5 text-[var(--text-subtle)]">{footnote}</p>
    </section>
  );
}

export function ProUpgradePromptFromCopy({
  copy,
  compact,
}: {
  copy: ProConversionCopy;
  compact?: boolean;
}) {
  return (
    <ProUpgradePrompt
      eyebrow={copy.eyebrow}
      title={copy.title}
      body={copy.body}
      features={copy.features}
      primaryCta={copy.primaryCta}
      secondaryCta={copy.secondaryCta}
      footnote={copy.footnote}
      compact={compact}
    />
  );
}
