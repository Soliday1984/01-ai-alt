# ImageSEOFix

ImageSEOFix is a Shopify image SEO tool that audits product image alt text,
generates editable suggestions, and exports a Shopify-ready CSV for bulk
updates.

The first version is intentionally narrow: a free browser-based CSV audit tool
plus SEO landing pages around Shopify alt text, bulk alt text generation, and
image SEO workflows. Paid plans are planned around private batch processing,
saved history, agency workspaces, and direct Shopify import/export.

## Current MVP

- Shopify CSV paste/upload audit
- Missing, too-short, too-long, and generic alt text detection
- Product-aware suggested alt text
- CSV export for review or store workflows
- SEO landing page at `/shopify-alt-text-generator`
- Pricing copy for Free, Growth, and Agency plans

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

`pnpm build` requires a clean Next.js output directory when switching between
dev and production builds. Stop the dev server before running the production
build.

## Configuration Needed Before Launch

- `BETTER_AUTH_SECRET`
- OAuth credentials if GitHub or Google login stays enabled
- Stripe price IDs for Growth and Agency plans
- production domain and metadata image assets
- Google Search Console, sitemap, and robots verification
