"use client";

import { copyText } from "@/lib/clipboard";
import { useState } from "react";
import { Share2 } from "lucide-react";
import { buildTweet } from "@/lib/calculations";
import { ScenarioInput, ScenarioResult } from "@/lib/types";
import { trackProductEvent } from "@/lib/product-analytics";

export function CopyTweetButton({
  scenario,
  result,
}: {
  scenario: ScenarioInput;
  result: ScenarioResult;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  async function copyTweet() {
    const tweet = buildTweet(scenario, result);

    try {
      await copyText(tweet);
      setCopyError("");
    } catch {
      setCopyError("Copy is unavailable in this browser. Select and copy the text below.");
      return;
    }

    setCopied(true);
    trackProductEvent({ event: "result_copied", format: "tweet" });
    window.setTimeout(() => setCopied(false), 3000);
  }

  return (
    <>
    <button
      type="button"
      className="outline-button inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-[var(--accent-text)] transition hover:bg-[var(--accent-surface)] sm:w-auto"
      onClick={copyTweet}
    >
      <Share2 size={18} />
      {copied ? "Copied" : "Copy Tweet"}
    </button>
    {copyError && <div className="basis-full" role="alert">
      <p className="text-sm text-[var(--accent-text)]">{copyError}</p>
      <textarea aria-label="Tweet text to copy" readOnly className="field mt-2" value={buildTweet(scenario, result)} onFocus={(event) => event.target.select()} />
    </div>}
    </>
  );
}
