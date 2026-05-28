export function parseNumericInputDraft(draft: string) {
  const trimmed = draft.trim();
  if (!trimmed || trimmed === "-" || trimmed === "." || trimmed === "-.") {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeNumericInputDraft({
  draft,
  fallback,
  min,
}: {
  draft: string;
  fallback: number;
  min?: number;
}) {
  const parsed = parseNumericInputDraft(draft) ?? fallback;
  return min === undefined ? parsed : Math.max(min, parsed);
}
