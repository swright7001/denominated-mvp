# Denominated Monetization Packaging

This document is the launch packaging source of truth for the Denominated
Post-MVP roadmap. It keeps the basic purchasing-power calculator free while
reserving recurring, personalized tracking value for paid plans.

## Positioning

- No Account: Run scenarios and understand purchasing power.
- Free Account: Save your first scenario and see how it changes.
- Pro: Track real-life costs over time with a personal purchasing-power
  dashboard.
- Lifetime: Full Pro ownership forever.

Denominated should not feel like a trading app, a price panic tool, or financial
advice. Paid value is based on tracking real-life costs over time, not blocking
basic calculator access.

## Tier Matrix

| Feature | No Account | Free Account | Pro | Lifetime |
| --- | --- | --- | --- | --- |
| Run calculator scenarios | Included | Included | Included | Included |
| Use live BTC price | Included | Included | Included | Included |
| Change manual assumptions | Included | Included | Included | Included |
| View example scenarios | Included | Included | Included | Included |
| View learn content | Included | Included | Included | Included |
| Copy/share result | Included | Included | Included | Included |
| Continue without account escape hatch | Included | Included | Included | Included |
| Saved scenarios | Not included | 1 scenario | Unlimited | Unlimited |
| Watchlist | Not included | Basic view for 1 saved scenario | Full watchlist | Full watchlist |
| BTC movement impact | Not included | Basic update for 1 saved scenario | All saved scenarios | All saved scenarios |
| Personal dashboard | Preview only | Limited preview | Included | Included |
| Daily purchasing-power snapshot | Preview only | Limited preview | Included | Included |
| Weekly cost-of-life report | Preview only | Limited preview | Included | Included |
| Scenario insight copy | Preview only | Limited preview | Included | Included |
| Historical comparison over time | Not included | Not included | Included | Included |
| Email reports | Not included | Occasional educational updates | Included | Included |
| Email preferences | Not included | Included | Included | Included |
| Feedback/interview prompts | Not included | Included | Included | Included |
| Private share links | Not included | Not included | Included | Included |
| PDF/report exports | Not included | Not included | Included | Included |
| Custom scenario categories | Not included | Not included | Included | Included |
| Custom assumptions presets | Not included | Not included | Included | Included |
| Early access to new calculators | Not included | Not included | Not included by default | Included |
| Future premium tools | Not included | Not included | Included while subscription is active | Included unless explicitly excluded later |

## Free Calculator Guardrails

These behaviors must remain available without account creation or payment:

- Run calculator scenarios.
- Use the live BTC price when available.
- Manually edit the BTC price and all assumptions.
- View preset examples and scenario detail pages.
- View learn content.
- Copy/share result text and scenario links.
- Use the first scenario without a hard gate.
- Dismiss the signup prompt with a clear continue-without-account escape hatch.

Do not require phone number or SMS for the initial funnel.

## Account-Required Behaviors

These behaviors require at least a free account:

- Save a scenario.
- View a saved scenario in the watchlist.
- See basic BTC movement impact for the one saved free-account scenario.
- Manage email preferences.
- Receive occasional educational updates after opt-in.
- Receive feedback or interview prompts.

For the launch packaging, a free account is limited to 1 saved scenario.

## Pro-Required Behaviors

These behaviors require Pro or Lifetime:

- Unlimited saved scenarios.
- Full watchlist.
- Full personal dashboard.
- Daily purchasing-power snapshot.
- Weekly cost-of-life report.
- BTC movement impact across all saved scenarios.
- Scenario insight copy across saved scenarios.
- Historical comparison over time.
- Email reports.
- Private share links.
- PDF/report exports.
- Custom scenario categories.
- Custom assumptions presets.

Lifetime users should be treated as Pro-entitled everywhere in the app.

## Lifetime Packaging

Lifetime includes everything in Pro forever. It should be positioned as
founder/early-supporter ownership, not as a speculative investment product.
Lifetime also includes early access to new calculators and future premium tools
unless a later launch explicitly excludes a specific tool.

## Roadmap Impact

This packaging affects:

- DEN-30: Account implementation should enforce the 1 saved scenario free-account
  allowance and keep unauthenticated calculator access.
- DEN-36: Email capture should map to free-account educational updates and Pro
  email reports without requiring phone/SMS.
- DEN-37: Paid plan and Stripe exploration should use Pro subscription plus
  Lifetime purchase as the default monetization path.
- DEN-80: Pricing UI should present No Account, Free Account, Pro, and Lifetime
  with the positioning and matrix above.
- DEN-81: Entitlement helpers should encode this matrix centrally.
- DEN-82: Gating should preserve free calculator/share access and reserve
  recurring habit features for Pro/Lifetime.
- DEN-83: Upgrade copy should sell recurring purchasing-power tracking, not
  trading, price panic, or financial advice.
- DEN-84: Stripe planning should support monthly Pro, annual Pro, and Lifetime
  ownership.

## Open Decisions

- Exact Pro monthly and annual price.
- Exact Lifetime launch price and later standard price.
- Whether Pro should have a free trial.
- Whether Free Account can save 1 scenario forever or only during launch.
- Whether daily snapshot and weekly report are hidden, previewed, or partially
  shown for free accounts.
- What “occasional educational updates” means in cadence and consent language.
- Whether PDF/report export ships with the initial Pro launch or later.
- Whether early access to new calculators applies only to Lifetime or also to
  active Pro subscribers.

## Current Pricing Hypothesis

Use placeholders until pricing is finalized:

- Pro monthly: $7/month.
- Pro annual: $59/year.
- Lifetime launch price: about $99.
- Lifetime standard price later: $149-$249.

These are planning assumptions only. Do not implement checkout or present final
pricing as confirmed until DEN-84 is completed.
