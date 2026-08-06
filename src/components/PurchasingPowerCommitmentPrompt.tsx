"use client";

import { useState } from "react";
import { Check, Scale, X } from "lucide-react";
import {
  acceptPurchasingPowerCommitment,
} from "@/lib/account";
import { ASSUMPTION_CAVEAT, EDUCATIONAL_DISCLAIMER } from "@/lib/legal";

export function PurchasingPowerCommitmentPrompt({
  isOpen,
  onAccept,
  onClose,
}: {
  isOpen: boolean;
  onAccept: () => void;
  onClose: () => void;
}) {
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen) return null;

  function acceptCommitment() {
    if (!isChecked) return;

    acceptPurchasingPowerCommitment(window.localStorage);
    onAccept();
    setIsChecked(false);
  }

  function closePrompt() {
    setIsChecked(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[var(--surface-overlay)] px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="purchasing-power-commitment-title"
    >
      <div className="panel relative w-full max-w-lg overflow-hidden rounded-lg p-6 shadow-2xl sm:p-7">
        <button
          type="button"
          className="outline-button absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-md text-[var(--accent-text)]"
          aria-label="Close purchasing-power commitment"
          onClick={closePrompt}
        >
          <X size={18} />
        </button>

        <div className="mb-5 grid h-12 w-12 place-items-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-surface)] text-[var(--accent-text)]">
          <Scale size={22} />
        </div>
        <p className="eyebrow mb-3">Before you save this scenario</p>
        <h2
          id="purchasing-power-commitment-title"
          className="pr-8 text-2xl font-medium text-[var(--text-primary)]"
        >
          Commit to measuring this decision in purchasing power.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
          Denominated works best when saved scenarios are treated as learning
          tools. Track the real-life cost, revisit the assumptions, and compare
          how the BTC-denominated cost changes over time.
        </p>

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-md border border-[var(--accent-line)] bg-[var(--surface-soft)] p-4">
          <input
            className="mt-1 h-4 w-4 accent-[var(--accent)]"
            type="checkbox"
            checked={isChecked}
            onChange={(event) => setIsChecked(event.target.checked)}
          />
          <span className="text-sm leading-6 text-[var(--text-secondary)]">
            I understand this scenario uses assumptions, not predictions or
            guarantees.
          </span>
        </label>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <p className="rounded-md border border-[var(--neutral-line-soft)] bg-[var(--surface-soft)] p-3 text-xs leading-5 text-[var(--text-secondary)]">
            Compare sticker price against purchasing power.
          </p>
          <p className="rounded-md border border-[var(--neutral-line-soft)] bg-[var(--surface-soft)] p-3 text-xs leading-5 text-[var(--text-secondary)]">
            Return later to revisit the assumptions.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
          <button
            type="button"
            className="copper-button inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isChecked}
            onClick={acceptCommitment}
          >
            <Check size={18} />
            I&apos;m ready to track this
          </button>
          <button
            type="button"
            className="outline-button rounded-md px-4 py-3 text-[var(--accent-text)]"
            onClick={closePrompt}
          >
            Continue without saving
          </button>
        </div>
        <p className="mt-4 text-xs leading-5 text-[var(--text-subtle)]">
          {ASSUMPTION_CAVEAT} {EDUCATIONAL_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
