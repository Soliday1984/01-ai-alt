# ImageSEOFix self-serve support runbook

Use this runbook for a merchant who has already supplied the job ID or the
email address used at checkout. Do not ask the merchant to email their CSV.

## Find a job

Run from the repository root after authenticating Wrangler. Query only the
specific job or the merchant-provided email; do not export the full table.

```powershell
pnpm exec wrangler d1 execute imageseofix --remote --command "SELECT id, email, status, payment_status, checkout_session_id, processed_image_rows, changed_rows, first_downloaded_at, download_count, import_status, created_at, paid_at FROM self_serve_jobs WHERE id = 'job_example';"
```

For a merchant-provided email, use a recent and bounded result set:

```powershell
pnpm exec wrangler d1 execute imageseofix --remote --command "SELECT id, payment_status, first_downloaded_at, download_count, import_status, created_at, paid_at FROM self_serve_jobs WHERE email = 'merchant@example.com' ORDER BY created_at DESC LIMIT 10;"
```

## Common cases

- `unpaid`: confirm the Checkout Session in Stripe. Do not manually mark the
  job paid. Ask the merchant to reopen their secure job link after Stripe has
  completed payment; the server performs a verified session check.
- `paid` with no download: ask the merchant to reopen the original secure job
  link. Confirm the cleaned R2 object exists before considering a refund.
- `paid` with `import_status = issue`: ask for the exact Shopify import-preview
  message and the affected row number. Reproduce with a sanitized fixture.
- duplicate payment: compare Stripe session IDs first. Refund through Stripe,
  then document the outcome in the support ticket; do not delete the D1 row.

## Email delivery configuration

Payment receipts and secure recovery links are optional delivery aids; a paid
download never depends on email. The selected provider must have a verified
ImageSEOFix sending domain.

For Brevo, add these Worker secrets:

```powershell
pnpm exec wrangler secret put EMAIL_PROVIDER
# Enter: brevo
pnpm exec wrangler secret put BREVO_API_KEY
pnpm exec wrangler secret put BREVO_FROM_EMAIL
```

Set `BREVO_FROM_EMAIL` to a verified sender such as
`ImageSEOFix <support@imageseofix.com>`.

The previous Resend setup remains supported while migrating:

```powershell
pnpm exec wrangler secret put RESEND_API_KEY
pnpm exec wrangler secret put RESEND_FROM_EMAIL
```

Set `EMAIL_PROVIDER=resend` only when explicitly using Resend. After
configuration, create a test job, use the recovery page, and verify the
received link expires after seven days.

## Safety

- Never paste Stripe secrets, job tokens, or CSV contents into tickets, Git,
  logs, or chat.
- Treat a job token as a password. Use the job ID for support lookup.
- Before changing production state, preserve the original CSV and record the
  reason, operator, and Stripe session ID in the support system.
