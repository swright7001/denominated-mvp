"use client";

import Image from "next/image";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { ArrowRight, BookOpen, Calculator, LayoutGrid } from "lucide-react";
import { useRef, useState } from "react";
import { walkthroughSteps } from "@/lib/walkthrough";

const stepIcons = {
  calculate: Calculator,
  compare: LayoutGrid,
  understand: BookOpen,
};

export function ProductWalkthrough({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const started = useRef(false);
  const activeStep = walkthroughSteps[activeIndex];

  function selectStep(index: number) {
    const step = walkthroughSteps[index];

    if (!started.current) {
      started.current = true;
      track("walkthrough_started", {
        source: standalone ? "walkthrough_page" : "home",
      });
    }

    setActiveIndex(index);
    track(
      index === walkthroughSteps.length - 1
        ? "walkthrough_completed"
        : "walkthrough_step_viewed",
      {
        step: step.id,
        position: index + 1,
      },
    );
  }

  return (
    <section
      className={
        standalone
          ? "container py-10 sm:py-14"
          : "container py-12 sm:py-16"
      }
    >
      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
        <div>
          <p className="eyebrow">Product walkthrough</p>
          <h2 className="mt-3 text-3xl font-medium text-[#efe6da] sm:text-4xl">
            See the purchasing-power workflow
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#b9ab9a]">
            Follow one scenario from editable assumptions to a plain-English
            result. No trading controls, hidden model, or price prediction.
          </p>

          <div
            className="mt-7"
            role="group"
            aria-label="Denominated walkthrough steps"
          >
            {walkthroughSteps.map((step, index) => {
              const Icon = stepIcons[step.id];
              const selected = activeIndex === index;

              return (
                <button
                  key={step.id}
                  type="button"
                  aria-pressed={selected}
                  className={`flex w-full items-start gap-3 border-l px-4 py-4 text-left transition ${
                    selected
                      ? "border-[#f0a36f] bg-[#2a1810]/45 text-[#efe6da]"
                      : "border-[rgba(239,230,218,0.14)] text-[#b9ab9a] hover:border-[rgba(240,163,111,0.5)] hover:text-[#efe6da]"
                  }`}
                  onClick={() => selectStep(index)}
                >
                  <Icon className="mt-0.5 shrink-0 text-[#f0a36f]" size={19} />
                  <span>
                    <span className="block text-xs uppercase tracking-[0.14em] text-[#f0a36f]">
                      {step.eyebrow}
                    </span>
                    <span className="mt-1 block font-medium">{step.title}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <Link
            href="/calculator"
            className="copper-button mt-7 inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 font-semibold"
            onClick={() =>
              track("walkthrough_calculator_cta", {
                source: standalone ? "walkthrough_page" : "home",
              })
            }
          >
            Run your scenario
            <ArrowRight size={18} />
          </Link>
        </div>

        <div>
          <div
            id="walkthrough-screen"
            aria-live="polite"
            className="overflow-hidden rounded-lg border border-[rgba(240,163,111,0.3)] bg-[#0b0907]"
          >
            <div className="relative aspect-[8/5] w-full">
              <Image
                key={activeStep.image}
                src={activeStep.image}
                alt={activeStep.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 62vw"
                className="object-cover object-top"
                loading="eager"
                fetchPriority="low"
              />
            </div>
            <div className="border-t border-[rgba(239,230,218,0.12)] p-5">
              <p className="text-lg font-medium text-[#efe6da]">
                {activeStep.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#b9ab9a]">
                {activeStep.description}
              </p>
            </div>
          </div>

          <details className="mt-4 border-t border-[rgba(239,230,218,0.14)] py-4 text-sm text-[#b9ab9a]">
            <summary className="cursor-pointer text-[#efe6da]">
              Text-only walkthrough
            </summary>
            <ol className="mt-4 space-y-4">
              {walkthroughSteps.map((step) => (
                <li key={step.id}>
                  <span className="font-medium text-[#f0a36f]">
                    {step.title}.
                  </span>{" "}
                  {step.description}
                </li>
              ))}
            </ol>
          </details>
        </div>
      </div>
    </section>
  );
}
