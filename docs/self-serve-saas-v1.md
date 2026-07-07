# ImageSEOFix Self-serve CSV SaaS v1

## Goal

Turn the manual `$19` Shopify CSV cleanup into a self-serve paid flow:

1. Merchant exports the official Shopify Products CSV.
2. Merchant uploads the CSV with email and store URL.
3. ImageSEOFix creates a cleanup job, stores original and cleaned CSV files, and saves job metadata.
4. Merchant pays with Stripe Checkout.
5. After Stripe confirms payment, ImageSEOFix unlocks the cleaned CSV download.

This is the first paid SaaS loop, not a full account system. The access model is a private job URL with a token plus Stripe session verification.

## Low-cost stack

- Next.js 16 on Cloudflare Workers through OpenNext.
- Cloudflare D1 for job and order metadata.
- Cloudflare R2 for original and cleaned CSV files.
- Stripe Checkout Sessions for one-time payment.
- No AI image model calls in v1.
- No Shopify Admin OAuth in v1.
- No full auth in v1.

The product promise stays narrow: `$19` unlocks a cleaned Shopify Products CSV for up to 100 product image rows.

## Current code paths

- Page: `/self-serve`
- Create job: `POST /api/self-serve/jobs`
- Create checkout: `POST /api/self-serve/checkout`
- Stripe webhook: `POST /api/self-serve/stripe/webhook`
- Check job: `GET /api/self-serve/jobs/:jobId?token=...&session_id=...`
- Download: `GET /api/self-serve/jobs/:jobId/download?token=...&session_id=...`
- Migration: `migrations/0001_self_serve_jobs.sql`

## Cloudflare setup

Run after Wrangler is authenticated.

```powershell
pnpm exec wrangler login
pnpm exec wrangler whoami
```

Create D1.

```powershell
pnpm exec wrangler d1 create imageseofix
```

Add the returned binding to `wrangler.jsonc`.

```jsonc
"d1_databases": [
  {
    "binding": "IMAGESEOFIX_DB",
    "database_name": "imageseofix",
    "database_id": "replace-with-cloudflare-d1-database-id"
  }
]
```

Apply the schema to the remote database.

```powershell
pnpm exec wrangler d1 execute imageseofix --remote --file migrations/0001_self_serve_jobs.sql
```

Create R2.

```powershell
pnpm exec wrangler r2 bucket create imageseofix-uploads
```

Add the R2 binding to `wrangler.jsonc`.

```jsonc
"r2_buckets": [
  {
    "binding": "IMAGESEOFIX_UPLOADS",
    "bucket_name": "imageseofix-uploads"
  }
]
```

## Stripe setup

Use live keys only when ready to charge real users.

```powershell
pnpm exec wrangler secret put STRIPE_SECRET_KEY
```

Optional, if you create a Stripe Price in the Dashboard:

```powershell
pnpm exec wrangler secret put STRIPE_STARTER_PRICE_ID
```

If `STRIPE_STARTER_PRICE_ID` is not configured, the API creates a one-time inline `$19` Checkout Session.

Create a Stripe webhook endpoint:

```text
https://imageseofix.com/api/self-serve/stripe/webhook
```

Subscribe to:

```text
checkout.session.completed
checkout.session.async_payment_succeeded
```

Then save the endpoint signing secret:

```powershell
pnpm exec wrangler secret put STRIPE_WEBHOOK_SECRET
```

Set public build variables in GitHub Actions or Cloudflare deployment environment:

```text
NEXT_PUBLIC_SITE_URL=https://imageseofix.com
NEXT_PUBLIC_SELF_SERVE_ENABLED=true
```

Keep `NEXT_PUBLIC_SELF_SERVE_ENABLED=false` or unset until D1, R2, and Stripe are all live.

## Verification checklist

1. Build locally.

```powershell
pnpm build
```

2. Build Cloudflare bundle.

```powershell
pnpm cf:build
```

3. Dry-run deploy.

```powershell
pnpm exec wrangler deploy --dry-run
```

4. Upload a real Shopify Products CSV to `/self-serve`.
5. Confirm D1 has a new `self_serve_jobs` row.
6. Confirm R2 has:
   - `self-serve/{jobId}/original.csv`
   - `self-serve/{jobId}/cleaned.csv`
7. Pay with Stripe test card in test mode first.
8. Confirm the Stripe webhook marks the D1 job as `payment_status='paid'`.
9. Return to the success URL and confirm the download button appears.
10. Download the cleaned CSV and validate in Shopify import preview.
11. Switch to live Stripe key only after the import preview path passes.

## Next v2 items

- Email receipt and download link.
- Cloudflare Turnstile on job creation if abuse appears.
- Per-email job history after repeat users appear.
- Shopify Admin OAuth only after CSV self-serve gets paid demand.

## Sources

- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- Cloudflare R2 pricing: https://developers.cloudflare.com/r2/pricing/
- Stripe Checkout Sessions: https://docs.stripe.com/api/checkout/sessions/create
- Stripe Checkout fulfillment: https://docs.stripe.com/checkout/fulfillment
