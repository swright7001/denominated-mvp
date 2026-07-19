export function isMultiCurrencyEnabled() {
  return process.env.DENOMINATED_ENABLE_MULTI_CURRENCY === "true";
}

type Env = Record<string, string | undefined>;

export function isEmailReportsEnabled(env: Env = process.env) {
  return env.DENOMINATED_ENABLE_EMAIL_REPORTS === "true";
}
