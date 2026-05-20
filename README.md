# ImageSEOFix

ImageSEOFix is a Shopify image SEO tool that audits product image alt text,
generates editable suggestions, and exports a Shopify-ready CSV for bulk
updates.

The first version is intentionally narrow and safe: a free browser-based CSV
audit tool plus SEO landing pages around Shopify alt text, bulk alt text
generation, and image SEO workflows. Paid plans are planned around private
batch processing, saved history, agency workspaces, and direct Shopify
import/export after traffic is validated.

## Current MVP

- Shopify CSV paste/upload audit
- Missing, too-short, too-long, and generic alt text detection
- Product-aware suggested alt text
- CSV export for review or store workflows
- SEO landing page at `/shopify-alt-text-generator`
- Static SEO pages for bulk alt text and image SEO long-tail queries
- No public API, auth, upload, Stripe, or AI endpoint in the launch build

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

- The MVP runs client-side in the browser.
- `/api/`, `/admin/`, `/dashboard/`, `/settings/`, and `/auth/` return 404.
- Real AI generation, direct Shopify import, Stripe checkout, and file storage
  stay disabled until authentication, rate limits, caching, and Vercel spend
  controls are configured.
- Submit `https://01-ai-alt.vercel.app/sitemap.xml` to Google Search Console
  after deployment.
