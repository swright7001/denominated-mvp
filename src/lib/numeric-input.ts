export function parseNumericInputDraft(draft: string) {
  const trimmed = draft.trim();
  if (!trimmed || trimmed === "-" || trimmed === "." || trimmed === "-.") {
    return null;
  }

  const plain = trimmed.replace(/^\$\s*/, "");
  if (!/^-?(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d*)?|\.\d+)$/.test(plain)) {
    return null;
  }
  const parsed = Number(plain.replaceAll(",", ""));
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
