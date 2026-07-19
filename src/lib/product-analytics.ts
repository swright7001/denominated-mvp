export const PRODUCT_ANALYTICS_VERSION = 1;

const calculatorSources = ["direct", "shared"] as const;
const presetSurfaces = ["home", "examples"] as const;
const resultFormats = ["tweet", "scenario_link"] as const;
const ctaIds = [
  "hero_run_scenario",
  "hero_view_examples",
  "nav_run_scenario",
  "signup_save_scenario",
  "signup_continue_without_account",
  "upgrade_compare_plans",
  "upgrade_run_free_scenario",
] as const;
const checkoutPlans = ["proMonthly", "proAnnual", "lifetime"] as const;

export type ProductAnalyticsInput =
  | { event: "calculator_used"; source: (typeof calculatorSources)[number] }
  | { event: "preset_opened"; surface: (typeof presetSurfaces)[number] }
  | { event: "result_copied"; format: (typeof resultFormats)[number] }
  | { event: "cta_clicked"; cta: (typeof ctaIds)[number] }
  | { event: "checkout_started"; plan: (typeof checkoutPlans)[number] };

export type ProductAnalyticsEvent = ProductAnalyticsInput & {
  version: typeof PRODUCT_ANALYTICS_VERSION;
};

export function buildProductAnalyticsEvent(
  input: unknown,
): ProductAnalyticsEvent | null {
  if (!isRecord(input) || typeof input.event !== "string") {
    return null;
  }

  switch (input.event) {
    case "calculator_used":
      return isAllowed(input.source, calculatorSources)
        ? { event: input.event, source: input.source, version: 1 }
        : null;
    case "preset_opened":
      return isAllowed(input.surface, presetSurfaces)
        ? { event: input.event, surface: input.surface, version: 1 }
        : null;
    case "result_copied":
      return isAllowed(input.format, resultFormats)
        ? { event: input.event, format: input.format, version: 1 }
        : null;
    case "cta_clicked":
      return isAllowed(input.cta, ctaIds)
        ? { event: input.event, cta: input.cta, version: 1 }
        : null;
    case "checkout_started":
      return isAllowed(input.plan, checkoutPlans)
        ? { event: input.event, plan: input.plan, version: 1 }
        : null;
    default:
      return null;
  }
}

export function trackProductEvent(input: ProductAnalyticsInput) {
  if (typeof window === "undefined") {
    return;
  }

  const event = buildProductAnalyticsEvent(input);
  if (!event) {
    return;
  }

  void fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  }).catch(() => undefined);
}

function isAllowed<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
): value is T[number] {
  return typeof value === "string" && allowed.includes(value as T[number]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
