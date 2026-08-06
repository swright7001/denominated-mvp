"use client";

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

  async function copyScenarioLink() {
    const link = scenarioToShareUrl(scenario, window.location.origin);

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(link);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = link;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    setCopied(true);
    trackProductEvent({ event: "result_copied", format: "scenario_link" });
    window.setTimeout(() => setCopied(false), 3000);
  }

  return (
    <button
      type="button"
      className="outline-button inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-[var(--accent-text)] transition hover:bg-[var(--accent-surface)] sm:w-auto"
      onClick={copyScenarioLink}
    >
      <Link2 size={18} />
      {copied ? "Link Copied" : "Copy Scenario Link"}
    </button>
  );
}
