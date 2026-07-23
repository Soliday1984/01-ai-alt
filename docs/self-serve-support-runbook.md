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

## Funnel and validation checks

The server records only job-scoped operational events. It does not store CSV
contents, job tokens, email addresses, or store URLs in the event table.

```powershell
pnpm exec wrangler d1 execute imageseofix --remote --command "SELECT event_name, COUNT(*) AS events FROM self_serve_events WHERE created_at >= datetime('now', '-7 days') GROUP BY event_name ORDER BY event_name;"
```

For an individual merchant journey, query by the Job ID only:

```powershell
pnpm exec wrangler d1 execute imageseofix --remote --command "SELECT event_name, event_data_json, created_at FROM self_serve_events WHERE job_id = 'job_example' ORDER BY created_at;"
```

The expected paid path is `job_created` -> `checkout_started` ->
`payment_verified` -> `csv_downloaded` -> `import_feedback_saved`.

## Internal zero-charge Stripe E2E

Use this only for a controlled end-to-end check. It is not a public discount,
does not create revenue, and is intentionally unavailable to ordinary users.

1. In the relevant Stripe mode, create a 100% promotion code restricted to the
   ImageSEOFix product, with one redemption and a short expiration. Before
   putting its ID in any Worker secret, verify the underlying coupon is scoped
   to the one intended product. A missing `applies_to.products` value means
   the coupon is account-wide and must not be used, even for an internal test.

```powershell
stripe promotion_codes retrieve promo_example --live
stripe coupons retrieve coupon_example --live
```

The coupon response must list only the ImageSEOFix product under
`applies_to.products`. If it is absent or lists another product, deactivate
the promotion code and create a new product-restricted coupon before
continuing.
2. Set the exact internal tester mailbox and promotion code ID as Worker
   secrets. Do not create GitHub variables for either value.

```powershell
pnpm exec wrangler secret put IMAGESEOFIX_E2E_EMAIL
pnpm exec wrangler secret put STRIPE_E2E_PROMOTION_CODE
```

3. Run one job using exactly that mailbox. Stripe Checkout should show a zero
   total, then the webhook, delivery email, secure link, CSV download, and
   Shopify import preview must all complete.
4. Delete the promotion code and clear both Worker secrets immediately after
   the check. Keep the resulting job ID and Stripe event IDs in the private
   validation record.

The server accepts a zero-total session only when the configured mailbox,
promotion-code configuration, E2E metadata, and a full $19 discount all match.
Changing any one of these conditions prevents an unlock.

## CSV retention

Both the original and cleaned CSV are stored under the `self-serve/` prefix in
the `imageseofix-uploads` R2 bucket. Production has the
`self-serve-expire` lifecycle rule enabled to delete that prefix after 30 days.
Verify it with:

```powershell
pnpm exec wrangler r2 bucket lifecycle list imageseofix-uploads
```

Do not claim automatic deletion in product copy until the live rule is listed.

## Email delivery configuration

Payment receipts and secure recovery links are optional delivery aids; a paid
download never depends on email. The selected provider must have a verified
ImageSEOFix sending domain.

### Cloudflare Email Service

ImageSEOFix uses the native Worker `EMAIL` binding when `EMAIL_PROVIDER` is
`cloudflare`. The binding is declared in `wrangler.jsonc`; it uses the
Cloudflare Email Sending onboarding for `imageseofix.com`, so no email API key
is stored in a Worker secret.

The selected sender is versioned as non-secret Worker configuration:

```text
EMAIL_PROVIDER=cloudflare
CLOUDFLARE_EMAIL_FROM=ImageSEOFix <support@imageseofix.com>
```

After deployment, use a real mailbox you control to request a recovery link.
Check Cloudflare Email Sending activity logs and the recipient inbox. Do not
test with invented recipient addresses because bounces damage sender
reputation.

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

For Mailjet, add these Worker secrets after verifying the sender domain in
Mailjet. The free tier is sufficient for early validation, but keep the
provider selection explicit:

```powershell
pnpm exec wrangler secret put EMAIL_PROVIDER
# Enter: mailjet
pnpm exec wrangler secret put MAILJET_API_KEY
pnpm exec wrangler secret put MAILJET_API_SECRET
pnpm exec wrangler secret put MAILJET_FROM_EMAIL
```

Set `MAILJET_FROM_EMAIL` to `ImageSEOFix <support@imageseofix.com>`. Never put
provider credentials in GitHub variables, repository files, logs, or chat.

## Safety

- Never paste Stripe secrets, job tokens, or CSV contents into tickets, Git,
  logs, or chat.
- Treat a job token as a password. Use the job ID for support lookup.
- Before changing production state, preserve the original CSV and record the
  reason, operator, and Stripe session ID in the support system.
- Support requests should include the Job ID only. Never ask users to send a
  job token or their CSV by email.
