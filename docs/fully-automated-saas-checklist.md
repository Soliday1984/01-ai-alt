# ImageSEOFix Fully Automated SaaS Checklist

Updated: 2026-07-07

Goal: move from a paid manual CSV cleanup service to a self-serve SaaS loop:
merchant uploads official Shopify Products CSV, pays once, receives an unlocked
cleaned CSV download, and can complete the whole path without waiting for us.

## Current Verdict

ImageSEOFix can sell the first manual or semi-automated `$19` cleanup now. It is
not yet a fully automated SaaS until Cloudflare storage, Stripe live checkout,
webhook fulfillment, abuse protection, and production E2E are live.

## P0 Revenue Loop

- [x] Free CSV audit and export path works locally.
- [x] Store URL path has a safe 5-product free scan.
- [x] UI interaction bug fixed by using webpack for local dev and exposing CSV
  as the default path.
- [x] Unknown `/api/*` probes stay blocked while `/api/self-serve/*` remains
  available for the paid workflow.
- [x] Stripe Checkout Session code exists for one-time `$19` payment.
- [x] Stripe webhook endpoint added for automated paid-status fulfillment after
  checkout closes or the browser is abandoned.
- [ ] Cloudflare D1 database created and bound as `IMAGESEOFIX_DB`.
- [ ] Cloudflare R2 bucket created and bound as `IMAGESEOFIX_UPLOADS`.
- [ ] Remote D1 migration applied: `migrations/0001_self_serve_jobs.sql`.
- [ ] Cloudflare secrets configured:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - optional `STRIPE_STARTER_PRICE_ID`
- [ ] Public env configured:
  - `NEXT_PUBLIC_SITE_URL=https://imageseofix.com`
  - `NEXT_PUBLIC_SELF_SERVE_ENABLED=true`
- [ ] Stripe webhook registered for
  `/api/self-serve/stripe/webhook`.
- [ ] Test-mode E2E passes: upload CSV, create job, pay with Stripe test card,
  webhook marks job paid, download cleaned CSV.
- [ ] Live-mode E2E passes with a small real payment or couponed live order.
- [ ] Shopify import preview validates the downloaded cleaned CSV.

## P0 Cost And Abuse Protection

- [x] No paid AI/image-processing API in v1.
- [x] Free public scan is capped at 5 products.
- [x] CSV upload is capped at 2 MB.
- [ ] Cloudflare WAF rule protects `/api/self-serve/*` with rate limiting or
  Managed Challenge.
- [ ] Turnstile added to job creation if upload abuse appears.
- [ ] Cloudflare usage and billing alerts checked before traffic push.
- [ ] Emergency rollback documented: set `NEXT_PUBLIC_SELF_SERVE_ENABLED=false`
  and redeploy.

## P1 Fulfillment Quality

- [ ] Email receipt or download link after payment.
- [ ] Admin/job lookup page or CLI runbook for support.
- [ ] Clear refund/support policy on site.
- [ ] Terms and Privacy pages linked from checkout-adjacent pages.
- [ ] CSV output regression fixture using a real Shopify export.
- [ ] Repeat-user path: email-based job lookup or lightweight magic link.

## P1 Growth Loop

- [ ] Production GSC sitemap submitted and monitored weekly.
- [ ] Track funnel events: upload, job created, checkout start, paid,
  download, import-preview success.
- [ ] Add 10 real Shopify stores to validation log.
- [ ] Publish one focused SEO page per real query cluster.
- [ ] Weekly review: queries, impressions, clicks, uploads, paid conversion,
  refunds, support issues.

## Blocked By External Access

- Cloudflare account access or API token for D1, R2, WAF, secrets, and deploy.
- Stripe live/test secret and webhook signing secret.
- A production domain route pointing to the deployed Worker.
- Optional email provider if we want automatic receipts in v1.
