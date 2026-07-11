# Paid Production Launch Gate

The paid Preview can use Stripe test mode while paid Production remains fail-closed.
Production checkout returns `PAID_PRODUCTION_NOT_READY` until provider setup and
the business decisions below are explicitly configured.

## Required production decisions

Set these only after the corresponding work is complete. Boolean approvals must
be the literal value `true`.

| Environment variable | Evidence required before setting it |
| --- | --- |
| `DENOMINATED_STRIPE_BRANDING_CONFIRMED` | Stripe Checkout and Billing Portal show Denominated branding, support details, and accurate legal identity. |
| `DENOMINATED_LEGAL_SIGNOFF` | The owner or a qualified legal professional has approved the paid Terms, Privacy, and Refund policies. |
| `DENOMINATED_OPERATOR_NAME` | Accurate legal/operator identity for the published policies. |
| `DENOMINATED_LEGAL_EFFECTIVE_DATE` | Effective date for the approved policies in `YYYY-MM-DD` format. |
| `DENOMINATED_GOVERNING_JURISDICTION` | Approved governing jurisdiction displayed in the Terms. |
| `DENOMINATED_REFUND_WINDOW_DAYS` | Approved initial-purchase refund request window from `0` through `365` days. |
| `DENOMINATED_TAX_SIGNOFF` | The owner or tax professional has recorded the Stripe Tax, registration, and bookkeeping decision. |
| `DENOMINATED_SUPPORT_EMAIL` | Monitored customer support email for billing, refunds, and account access. |
| `NEXT_PUBLIC_SUPPORT_URL` | Published customer support URL configured in both the app and Stripe. |
| `DENOMINATED_EMAIL_FROM` | Verified customer-facing Resend sender, such as `Denominated <reports@approved-domain>`. |

These values do not replace the provider variables reported by
`getProductionReadinessChecks`. Production also needs live Clerk, Convex,
Stripe, webhook, Resend, and canonical app URL configuration.

Production readiness validates provider values, not only their presence:

- Clerk keys must be live-mode keys.
- Convex must use a `prod:` deployment and public HTTPS URLs.
- Stripe must use a live secret key and valid price/webhook identifiers.
- The canonical app, Convex, Clerk issuer, and support URLs must be public HTTPS
  URLs.
- The legal effective date must be a real `YYYY-MM-DD` date, and the support
  email/URL pair must pass the same validation used by `/support`.

## Release sequence

1. Keep `DENOMINATED_ENABLE_PAID_CHECKOUT` disabled in Production.
2. Complete DEN-99, DEN-100, and DEN-101 and record evidence in Linear.
3. Configure live provider credentials and the decision variables above.
4. Deploy the paid branch to Preview and rerun auth, storage, checkout, webhook,
   entitlement, Billing Portal, cancellation, and failed-payment tests.
5. Merge only after explicit paid-release approval.
6. Enable Production checkout and run one controlled live transaction followed
   by refund/reconciliation verification.

Never copy test-mode Stripe price IDs, webhook secrets, or test Clerk/Convex
credentials into Production.
