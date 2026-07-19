export const signupEmailKey = "denominated.signupEmail.v1";
export const signupPromptShownKey = "denominated.signupPromptShown.v1";
export const signupPromptDismissedKey = "denominated.signupPromptDismissed.v1";
export const purchasingPowerCommitmentAcceptedKey =
  "denominated.purchasingPowerCommitmentAccepted.v1";
export const emailPreferencesKey = "denominated.emailPreferences.v1";
export const accountChangedEvent = "denominated-account-changed";

export type EmailPreferences = {
  weeklyReport: boolean;
  scenarioUpdates: boolean;
  educationLessons: boolean;
  popularExamples: boolean;
};

export const defaultEmailPreferences: EmailPreferences = {
  weeklyReport: true,
  scenarioUpdates: true,
  educationLessons: true,
  popularExamples: true,
};

export function parseEmailPreferences(value: string | null): EmailPreferences {
  if (!value) return defaultEmailPreferences;

  try {
    const parsed = JSON.parse(value) as Partial<EmailPreferences>;

    return {
      weeklyReport:
        typeof parsed.weeklyReport === "boolean"
          ? parsed.weeklyReport
          : defaultEmailPreferences.weeklyReport,
      scenarioUpdates:
        typeof parsed.scenarioUpdates === "boolean"
          ? parsed.scenarioUpdates
          : defaultEmailPreferences.scenarioUpdates,
      educationLessons:
        typeof parsed.educationLessons === "boolean"
          ? parsed.educationLessons
          : defaultEmailPreferences.educationLessons,
      popularExamples:
        typeof parsed.popularExamples === "boolean"
          ? parsed.popularExamples
          : defaultEmailPreferences.popularExamples,
    };
  } catch {
    return defaultEmailPreferences;
  }
}

export function serializeEmailPreferences(preferences: EmailPreferences) {
  return JSON.stringify(preferences);
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function getStoredAccountEmail(storage: Pick<Storage, "getItem">) {
  const value = storage.getItem(signupEmailKey);

  return value && isValidEmail(value) ? normalizeEmail(value) : "";
}

export function hasAcceptedPurchasingPowerCommitment(
  storage: Pick<Storage, "getItem">,
) {
  return storage.getItem(purchasingPowerCommitmentAcceptedKey) === "true";
}

export function acceptPurchasingPowerCommitment(
  storage: Pick<Storage, "setItem">,
) {
  storage.setItem(purchasingPowerCommitmentAcceptedKey, "true");
}

export function saveLocalAccountEmail(
  storage: Pick<Storage, "setItem" | "removeItem">,
  email: string,
) {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail)) {
    throw new Error("Enter a valid email address.");
  }

  storage.setItem(signupEmailKey, normalizedEmail);
  storage.setItem(
    emailPreferencesKey,
    serializeEmailPreferences(defaultEmailPreferences),
  );
  storage.removeItem(signupPromptDismissedKey);

  return normalizedEmail;
}
