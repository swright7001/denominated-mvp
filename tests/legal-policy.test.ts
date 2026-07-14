import test from "node:test";
import assert from "node:assert/strict";
import {
  getLegalPolicyConfig,
  getPrivacyPolicyIntro,
  getRefundWindowCopy,
} from "../src/lib/legal-policy";

test("legal policy stays unavailable until every business fact is valid", () => {
  assert.equal(getLegalPolicyConfig({}), null);
  assert.equal(
    getLegalPolicyConfig({
      DENOMINATED_OPERATOR_NAME: "Test operator",
      DENOMINATED_LEGAL_EFFECTIVE_DATE: "2026-02-31",
      DENOMINATED_GOVERNING_JURISDICTION: "Test jurisdiction",
      DENOMINATED_REFUND_WINDOW_DAYS: "14",
    }),
    null,
  );
});

test("legal policy normalizes an approved configuration", () => {
  assert.deepEqual(
    getLegalPolicyConfig({
      DENOMINATED_OPERATOR_NAME: " Test operator ",
      DENOMINATED_LEGAL_EFFECTIVE_DATE: "2026-07-11",
      DENOMINATED_GOVERNING_JURISDICTION: " Test jurisdiction ",
      DENOMINATED_REFUND_WINDOW_DAYS: "14",
    }),
    {
      operatorName: "Test operator",
      effectiveDate: "2026-07-11",
      governingJurisdiction: "Test jurisdiction",
      refundWindowDays: 14,
    },
  );
});

test("refund copy handles pending, no-refund, and request-window policies", () => {
  assert.match(getRefundWindowCopy(null), /Paid checkout remains unavailable/);
  assert.match(
    getRefundWindowCopy({
      operatorName: "Test operator",
      effectiveDate: "2026-07-11",
      governingJurisdiction: "Test jurisdiction",
      refundWindowDays: 0,
    }),
    /non-refundable except where required/,
  );
  assert.match(
    getRefundWindowCopy({
      operatorName: "Test operator",
      effectiveDate: "2026-07-11",
      governingJurisdiction: "Test jurisdiction",
      refundWindowDays: 14,
    }),
    /within 14 days/,
  );
});

test("privacy copy publishes approved operator and effective date", () => {
  const policy = getLegalPolicyConfig({
    DENOMINATED_OPERATOR_NAME: "Example Operator",
    DENOMINATED_LEGAL_EFFECTIVE_DATE: "2026-07-14",
    DENOMINATED_GOVERNING_JURISDICTION: "Example jurisdiction",
    DENOMINATED_REFUND_WINDOW_DAYS: "14",
  });

  assert.equal(
    getPrivacyPolicyIntro(policy),
    "Effective 2026-07-14. This privacy notice explains how Example Operator, the operator of Denominated, processes information used to provide the service.",
  );
});

test("privacy copy keeps paid checkout fail-closed without approved facts", () => {
  assert.match(
    getPrivacyPolicyIntro(null),
    /Paid checkout remains unavailable/,
  );
});
