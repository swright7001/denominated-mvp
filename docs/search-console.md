# Google Search Console Runbook

This runbook covers the manual, post-launch steps for Denominated's public SEO
landing pages. Building or reviewing DEN-34 does not authorize anyone to sign in,
add a property, change DNS, or submit pages to Google Search Console.

## Before submission

1. Confirm the production domain serves HTTPS without redirects to a preview URL.
2. Open `/robots.txt` and confirm it allows public crawling and references
   `/sitemap.xml` on the production domain.
3. Open `/sitemap.xml` and confirm these URLs are present:
   - `/examples/median-us-house`
   - `/examples/rent`
   - `/examples/tesla-model-3`
4. Confirm each URL returns `200`, has its own canonical URL, and renders the
   expected title, description, social image, disclaimer, and JSON-LD.

## Property and sitemap setup

These steps require the site owner's explicit production authorization.

1. Sign in to Google Search Console with the approved owner account.
2. Add or select the production domain property.
3. If the property is new, complete Google's DNS verification using the domain
   provider. Do not remove existing DNS records.
4. In **Sitemaps**, submit the production `/sitemap.xml` URL once.
5. Record the submission date and any validation errors in the launch issue.

## URL inspection

After the production deployment is confirmed, inspect the three landing URLs.
Request indexing only when the rendered page, canonical, and crawl status are
correct. Search Console submission does not guarantee ranking or indexing.

## Post-launch checks

- After 7 days: review indexing status, crawl errors, and canonical selection.
- After 28 days: record impressions, clicks, and indexed-page status without
  inventing search-volume or ranking claims.
- If Google reports a page error, reproduce it publicly before changing code.
- Keep all tooling at $0 for DEN-34. Paid SEO products require a separate issue
  and approval.

## Rollback

If a landing page exposes incorrect metadata or broken output, revert the DEN-34
merge commit and redeploy the last known-good production commit. Remove a URL
from the sitemap only when the page itself is intentionally removed in a reviewed
follow-up change.
