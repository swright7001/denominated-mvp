type Env = Record<string, string | undefined>;

export type LegalPolicyConfig = {
  effectiveDate: string;
  governingJurisdiction: string;
  operatorName: string;
  refundWindowDays: number;
};

export function getLegalPolicyConfig(
  env: Env = process.env,
): LegalPolicyConfig | null {
  const operatorName = env.DENOMINATED_OPERATOR_NAME?.trim() ?? "";
  const effectiveDate = env.DENOMINATED_LEGAL_EFFECTIVE_DATE?.trim() ?? "";
  const governingJurisdiction =
    env.DENOMINATED_GOVERNING_JURISDICTION?.trim() ?? "";
  const refundWindowDays = parseRefundWindowDays(
    env.DENOMINATED_REFUND_WINDOW_DAYS,
  );

  if (
    !operatorName ||
    !governingJurisdiction ||
    !isIsoDate(effectiveDate) ||
    refundWindowDays === null
  ) {
    return null;
  }

  return {
    operatorName,
    effectiveDate,
    governingJurisdiction,
    refundWindowDays,
  };
}

export function getRefundWindowCopy(config: LegalPolicyConfig | null) {
  if (!config) {
    return "Paid checkout remains unavailable until the refund policy is approved and published.";
  }

  if (config.refundWindowDays === 0) {
    return "Paid purchases are non-refundable except where required by applicable law. Contact support if a billing error or account-access problem occurs.";
  }

  const unit = config.refundWindowDays === 1 ? "day" : "days";
  return `Refund requests may be submitted within ${config.refundWindowDays} ${unit} of the initial purchase. Approval is subject to this policy and applicable law; contact support with the account email and charge details.`;
}

export function getPrivacyPolicyIntro(config: LegalPolicyConfig | null) {
  if (!config) {
    return "Paid checkout remains unavailable until the operator and policy effective date are approved and published. The free calculator privacy disclosures remain in effect.";
  }

  return `Effective ${config.effectiveDate}. This privacy notice explains how ${config.operatorName}, the operator of Denominated, processes information used to provide the service.`;
}

function parseRefundWindowDays(value: string | undefined) {
  const normalized = value?.trim() ?? "";

  if (!/^\d{1,3}$/.test(normalized)) {
    return null;
  }

  const days = Number(normalized);
  return Number.isInteger(days) && days >= 0 && days <= 365 ? days : null;
}

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}
