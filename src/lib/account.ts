export const signupEmailKey = "denominated.signupEmail.v1";
export const signupPromptShownKey = "denominated.signupPromptShown.v1";
export const signupPromptDismissedKey = "denominated.signupPromptDismissed.v1";
export const emailPreferencesKey = "denominated.emailPreferences.v1";

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
