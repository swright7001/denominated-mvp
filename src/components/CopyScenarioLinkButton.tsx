"use client";

import { copyText } from "@/lib/clipboard";
import { useState } from "react";
import { Link2 } from "lucide-react";
import { scenarioToShareUrl } from "@/lib/share-url";
import { ScenarioInput } from "@/lib/types";
import { trackProductEvent } from "@/lib/product-analytics";

export function CopyScenarioLinkButton({
  scenario,
}: {
  scenario: ScenarioInput;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  async function copyScenarioLink() {
    const link = scenarioToShareUrl(scenario, window.location.origin);

    try {
      await copyText(link);
      setCopyError("");
    } catch {
      setCopyError("Copy is unavailable in this browser. Select and copy the text below.");
      return;
    }

    setCopied(true);
    trackProductEvent({ event: "result_copied", format: "scenario_link" });
    window.setTimeout(() => setCopied(false), 3000);
  }

  return (
    <>
    <button
      type="button"
      className="outline-button inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-[var(--accent-text)] transition hover:bg-[var(--accent-surface)] sm:w-auto"
      onClick={copyScenarioLink}
    >
      <Link2 size={18} />
      {copied ? "Link Copied" : "Copy Scenario Link"}
    </button>
    {copyError && <div className="basis-full" role="alert">
      <p className="text-sm text-[var(--accent-text)]">{copyError}</p>
      <textarea aria-label="Scenario link to copy" readOnly className="field mt-2" value={scenarioToShareUrl(scenario, window.location.origin)} onFocus={(event) => event.target.select()} />
    </div>}
    </>
  );
}
