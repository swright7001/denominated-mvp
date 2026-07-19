import test from "node:test";
import assert from "node:assert/strict";
import {
  buildReplyHeaders,
  buildReplySubject,
  getSupportInboxConfig,
  isExpectedReceivingAddress,
  isSupportAdminEmail,
  normalizeSupportSubject,
  parseMailboxAddress,
  sanitizeSupportBody,
  supportReplyHtml,
} from "../src/lib/support-inbox";

const configuredEnv = {
  RESEND_API_KEY: "re_test",
  RESEND_WEBHOOK_SECRET: "whsec_test",
  DENOMINATED_SUPPORT_INBOX_SECRET: "a_secure_support_secret_longer_than_32_chars",
  DENOMINATED_SUPPORT_EMAIL_FROM:
    "Denominated Support <support@getdenominated.com>",
  DENOMINATED_SUPPORT_EMAIL: "support@getdenominated.com",
  DENOMINATED_SUPPORT_EMAIL_VERIFIED: "true",
  DENOMINATED_SUPPORT_RECEIVING_EMAIL: "support@denominated.resend.app",
  DENOMINATED_SUPPORT_ADMIN_EMAILS: "Owner@Example.com, second@example.com",
  NEXT_PUBLIC_APP_URL: "https://getdenominated.com",
};

test("support inbox configuration fails closed and normalizes its allowlist", () => {
  assert.equal(getSupportInboxConfig({}), null);
  assert.equal(
    getSupportInboxConfig({
      ...configuredEnv,
      DENOMINATED_SUPPORT_EMAIL_FROM: "Attacker <attacker@example.com>",
    }),
    null,
  );
  assert.equal(
    getSupportInboxConfig({
      ...configuredEnv,
      DENOMINATED_SUPPORT_EMAIL_VERIFIED: "false",
    }),
    null,
  );

  const config = getSupportInboxConfig(configuredEnv);
  assert.deepEqual(config?.adminEmails, ["owner@example.com", "second@example.com"]);
  assert.equal(isSupportAdminEmail("OWNER@example.com", config!), true);
  assert.equal(isSupportAdminEmail("customer@example.com", config!), false);
});

test("mailbox parsing and subjects remove unsafe formatting", () => {
  assert.deepEqual(parseMailboxAddress('"Jane Doe" <JANE@example.com>'), {
    email: "jane@example.com",
    name: "Jane Doe",
  });
  assert.equal(normalizeSupportSubject("Re: Fwd: Account help\nInjected"), "Account help Injected");
  assert.equal(buildReplySubject("FW: Account help"), "Re: Account help");
});

test("inbound recipient checks use the private Resend receiving address", () => {
  assert.equal(
    isExpectedReceivingAddress(
      ["support@denominated.resend.app"],
      "support@denominated.resend.app",
    ),
    true,
  );
  assert.equal(
    isExpectedReceivingAddress(["other@example.com"], "support@denominated.resend.app"),
    false,
  );
});

test("support bodies and reply headers remain bounded and safe", () => {
  assert.equal(sanitizeSupportBody("hello\r\nworld"), "hello\nworld");
  assert.match(sanitizeSupportBody(""), /plain-text body/);
  assert.deepEqual(buildReplyHeaders("<latest>", ["<first>", "<latest>"]), {
    "In-Reply-To": "<latest>",
    References: "<first> <latest>",
  });
  const html = supportReplyHtml("Hello <script>alert(1)</script>");
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});
