# Denominated Paid V2 Provider Setup Worksheet

Use this worksheet before running `DEN-98`. Do not paste real secrets into this
file or commit provider values.

Current status: Vercel Preview has no environment variables configured for
`denominated-mvp`, so paid Preview E2E cannot start yet.

## Vercel Preview Values

Add these to the Vercel project Preview environment first. Prefer branch-scoped
Preview values for `codex/paid-v2-launch` when possible.

| Env var | Source | Expected shape | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard | `pk_test_...` | Public browser key for the Clerk test/preview app. |
| `CLERK_SECRET_KEY` | Clerk dashboard | `sk_test_...` | Server key for the same Clerk app. |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk dashboard JWT issuer | `https://...clerk.accounts.dev` or custom issuer URL | Must match Convex `auth.config.ts` provider domain. |
| `CONVEX_DEPLOYMENT` | Convex dashboard or CLI | deployment name | Needed by Convex tooling/deploys. |
| `NEXT_PUBLIC_CONVEX_URL` | Convex dashboard | `https://...convex.cloud` | Public Convex URL used by the browser client. |
| `STRIPE_SECRET_KEY` | Stripe test mode | `sk_test_...` | Use test mode only for Preview. |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Stripe test mode Price | `price_...` | Recurring monthly Pro price. |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | Stripe test mode Price | `price_...` | Recurring annual Pro price. |
| `STRIPE_LIFETIME_PRICE_ID` | Stripe test mode Price | `price_...` | One-time Lifetime price. |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint | `whsec_...` | Signing secret for the Preview webhook endpoint. |
| `DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET` | Generate locally | random secret string | Same exact value must also be set in Convex. |
| `RESEND_API_KEY` | Resend dashboard | `re_...` | Required before paid/account email flows are launch-ready. |
| `DENOMINATED_EMAIL_FROM` | Resend verified sender | `Denominated <reports@domain>` | Preview may use `onboarding@resend.dev`; Production may not. |
| `NEXT_PUBLIC_APP_URL` | Vercel Preview URL or stable branch alias | `https://...vercel.app` | Should point at the Preview URL used for checkout returns. |

Generate the webhook sync secret locally:

```bash
openssl rand -hex 32
```

Then set that same value in both places:

```bash
vercel env add DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET preview --scope swright7001-gmailcoms-projects
npx convex env set DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET <same-preview-sync-secret>
```

## Clerk Setup

1. Create or choose the Clerk app used for Denominated Preview.
2. Add the active Vercel Preview URL to allowed redirect/origin settings.
3. Create the Convex JWT template with audience/application ID `convex`.
4. Copy the Clerk issuer URL into `CLERK_JWT_ISSUER_DOMAIN`.
5. Confirm `/sign-up` and `/sign-in` render Clerk instead of the local fallback
   after Preview env vars are deployed.

## Convex Setup

1. Confirm Convex project: `denominated-mvp`.
2. Confirm `convex/auth.config.ts` trusts the Clerk issuer from
   `CLERK_JWT_ISSUER_DOMAIN`.
3. Set `DENOMINATED_STRIPE_WEBHOOK_SYNC_SECRET` in Convex with the same value as
   Vercel Preview.
4. After redeploy, verify signed-in users can save scenarios to Convex account
   storage.

## Stripe Test Mode Setup

Create test-mode products and prices only.

### Product: Denominated Pro

- Monthly recurring price: `$7/month`
- Annual recurring price: `$59/year`

Recommended price metadata:

| Key | Monthly value | Annual value |
| --- | --- | --- |
| `denominated_plan` | `pro` | `pro` |
| `billing_interval` | `month` | `year` |
| `entitlement_tier` | `pro` | `pro` |

### Product: Denominated Lifetime

- One-time price: `$99` launch test value

Recommended price metadata:

| Key | Value |
| --- | --- |
| `denominated_plan` | `lifetime` |
| `billing_interval` | `one_time` |
| `entitlement_tier` | `lifetime` |

## Stripe Webhook Setup

Create a Stripe test-mode webhook endpoint for the active paid Preview URL:

```text
https://<paid-preview-url>/api/webhooks/stripe
```

Subscribe to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Copy the endpoint signing secret into Vercel Preview as
`STRIPE_WEBHOOK_SECRET`.

## Checkout Flag Order

Do not set `DENOMINATED_ENABLE_PAID_CHECKOUT=true` until all provider setup
above is complete and the paid branch has been redeployed once with provider
env vars.

Only then set the flag for Preview:

```bash
vercel env add DENOMINATED_ENABLE_PAID_CHECKOUT preview --scope swright7001-gmailcoms-projects
```

Redeploy Preview again after setting the flag, then run `DEN-98`.
