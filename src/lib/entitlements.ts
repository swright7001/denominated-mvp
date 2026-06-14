import { signupEmailKey } from "./account";

export type PlanTier = "noAccount" | "freeAccount" | "pro" | "lifetime";

export type FeatureKey =
  | "calculatorAccess"
  | "shareCopyResult"
  | "watchlistAccess"
  | "btcMovementImpact"
  | "dailySnapshot"
  | "weeklyReport"
  | "emailReports"
  | "privateShareLinks"
  | "pdfReportExport"
  | "customCategoriesPresets";

export type FeatureAccess = "none" | "preview" | "limited" | "included";

export type PlanEntitlements = {
  tier: PlanTier;
  label: string;
  positioning: string;
  savedScenarioLimit: number | "unlimited";
  features: Record<FeatureKey, FeatureAccess>;
};

export const mockPlanTierKey = "denominated.mockPlanTier.v1";

export const planOrder: PlanTier[] = [
  "noAccount",
  "freeAccount",
  "pro",
  "lifetime",
];

export const planEntitlements: Record<PlanTier, PlanEntitlements> = {
  noAccount: {
    tier: "noAccount",
    label: "Free",
    positioning: "Run scenarios and understand purchasing power.",
    savedScenarioLimit: 0,
    features: {
      calculatorAccess: "included",
      shareCopyResult: "included",
      watchlistAccess: "none",
      btcMovementImpact: "preview",
      dailySnapshot: "preview",
      weeklyReport: "preview",
      emailReports: "none",
      privateShareLinks: "none",
      pdfReportExport: "none",
      customCategoriesPresets: "none",
    },
  },
  freeAccount: {
    tier: "freeAccount",
    label: "Free Account",
    positioning: "Save your first scenario and see how it changes.",
    savedScenarioLimit: 1,
    features: {
      calculatorAccess: "included",
      shareCopyResult: "included",
      watchlistAccess: "limited",
      btcMovementImpact: "limited",
      dailySnapshot: "limited",
      weeklyReport: "limited",
      emailReports: "limited",
      privateShareLinks: "none",
      pdfReportExport: "none",
      customCategoriesPresets: "none",
    },
  },
  pro: {
    tier: "pro",
    label: "Pro",
    positioning:
      "Track real-life costs over time with a personal purchasing-power dashboard.",
    savedScenarioLimit: "unlimited",
    features: {
      calculatorAccess: "included",
      shareCopyResult: "included",
      watchlistAccess: "included",
      btcMovementImpact: "included",
      dailySnapshot: "included",
      weeklyReport: "included",
      emailReports: "included",
      privateShareLinks: "included",
      pdfReportExport: "included",
      customCategoriesPresets: "included",
    },
  },
  lifetime: {
    tier: "lifetime",
    label: "Lifetime",
    positioning: "Full Pro ownership forever.",
    savedScenarioLimit: "unlimited",
    features: {
      calculatorAccess: "included",
      shareCopyResult: "included",
      watchlistAccess: "included",
      btcMovementImpact: "included",
      dailySnapshot: "included",
      weeklyReport: "included",
      emailReports: "included",
      privateShareLinks: "included",
      pdfReportExport: "included",
      customCategoriesPresets: "included",
    },
  },
};

export type SaveScenarioDecision = {
  allowed: boolean;
  tier: PlanTier;
  limit: number | "unlimited";
  reason?: "account-required" | "limit-reached";
};

type StorageReader = Pick<Storage, "getItem">;

export function getPlanEntitlements(tier: PlanTier) {
  return planEntitlements[tier];
}

export function getFeatureAccess(tier: PlanTier, feature: FeatureKey) {
  return getPlanEntitlements(tier).features[feature];
}

export function canUseFeature(tier: PlanTier, feature: FeatureKey) {
  return getFeatureAccess(tier, feature) !== "none";
}

export function isProEntitled(tier: PlanTier) {
  return tier === "pro" || tier === "lifetime";
}

export function canSaveScenario(
  tier: PlanTier,
  savedScenarioCount: number,
): SaveScenarioDecision {
  const limit = getPlanEntitlements(tier).savedScenarioLimit;

  if (limit === "unlimited") {
    return { allowed: true, tier, limit };
  }

  if (limit <= 0) {
    return {
      allowed: false,
      tier,
      limit,
      reason: "account-required",
    };
  }

  if (savedScenarioCount >= limit) {
    return {
      allowed: false,
      tier,
      limit,
      reason: "limit-reached",
    };
  }

  return { allowed: true, tier, limit };
}

export function parsePlanTier(value: string | null): PlanTier | null {
  if (!value) return null;

  return planOrder.includes(value as PlanTier) ? (value as PlanTier) : null;
}

export function resolveMockPlanTier({
  storedTier,
  hasSignupEmail,
}: {
  storedTier?: string | null;
  hasSignupEmail: boolean;
}): PlanTier {
  const parsedStoredTier = parsePlanTier(storedTier ?? null);

  if (parsedStoredTier) return parsedStoredTier;

  return hasSignupEmail ? "freeAccount" : "noAccount";
}

export function getMockPlanTierFromStorage(storage: StorageReader): PlanTier {
  return resolveMockPlanTier({
    storedTier: storage.getItem(mockPlanTierKey),
    hasSignupEmail: Boolean(storage.getItem(signupEmailKey)),
  });
}
