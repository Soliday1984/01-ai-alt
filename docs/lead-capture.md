# ImageSEOFix Lead Capture

Updated: 2026-06-07

## Current implementation

The first conversion path is intentionally lightweight:

- Users run the free CSV audit in the browser.
- Pricing cards explain the free and paid boundary.
- The lead form opens an email draft with the current audit summary.
- No database, login, third-party form provider, or paid API is required.

This keeps the launch cheap and safe while validating whether users ask for a paid cleanup workflow.

## Required configuration

Set a real public reply inbox before promoting the page:

```text
NEXT_PUBLIC_LEAD_EMAIL=you@example.com
```

If the variable is not set, the app falls back to:

```text
hello@imageseofix.com
```

Only use the fallback after that mailbox exists.

## First offer

Use this as the first paid intent:

- Private Shopify image SEO cleanup: `$19+`
- Growth plan waitlist: `$29/mo`
- Agency plan waitlist: `$79/mo`

The immediate goal is not automated checkout. The immediate goal is to learn:

- How many users click pricing.
- How many users request a private audit.
- How many stores have 100+ images.
- Whether agencies ask for multi-store cleanup.

## Next upgrade

After 5 qualified email requests, replace `mailto` with a real capture backend:

- Formspree, Tally, or Buttondown for the simplest no-code path.
- Supabase table if we want owned lead data and event tracking.
- Stripe Payment Links if users clearly accept the one-time audit price.
