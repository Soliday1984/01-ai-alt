# ImageSEOFix

ImageSEOFix is a Shopify image SEO tool that audits product image alt text,
generates editable suggestions, and exports a Shopify-ready CSV for bulk
updates.

The first version is intentionally narrow and safe: a free browser-based CSV
audit tool plus SEO landing pages around Shopify alt text, bulk alt text
generation, and image SEO workflows. The self-serve paid beta adds server-side
CSV cleanup jobs, Stripe Checkout, and a paid download link for the cleaned
Shopify CSV.

## Current MVP

- Shopify CSV paste/upload audit
- Missing, too-short, too-long, and generic alt text detection
- Product-aware suggested alt text
- CSV export for review or store workflows
- Self-serve CSV cleanup page at `/self-serve`
- Cloudflare D1 job metadata and R2 CSV storage once bindings are configured
- Stripe Checkout Session unlock for the cleaned CSV download
- Optional external Payment Link CTA for manual cleanup
- SEO landing page at `/shopify-alt-text-generator`
- Static SEO pages for bulk alt text and image SEO long-tail queries
- No full auth, public API, direct Shopify write access, or AI image endpoint in
  the launch build

## Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Validation

```bash
pnpm exec tsc --noEmit
pnpm build
```

## Launch Guardrails

- The free audit runs client-side in the browser.
- The self-serve paid flow must stay behind `NEXT_PUBLIC_SELF_SERVE_ENABLED`
  until D1, R2, and Stripe secrets are configured.
- Unknown `/api/` probes, `/admin/`, `/dashboard/`, `/settings/`, and `/auth/`
  return 404; `/api/self-serve/*` stays open for the paid CSV workflow.
- Real AI generation, direct Shopify import, and full account history stay
  disabled until authentication, rate limits, caching, and spend controls are
  configured.
- Submit `https://imageseofix.com/sitemap.xml` to Google Search Console after
  deployment.

See `docs/self-serve-saas-v1.md` for the Cloudflare D1, R2, and Stripe setup
runbook. See `docs/fully-automated-saas-checklist.md` for the remaining
automation checklist before treating ImageSEOFix as a fully automated SaaS.
