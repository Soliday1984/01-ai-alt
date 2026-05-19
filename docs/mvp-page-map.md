# ImageSEOFix MVP Page Map

## Brand

Working name: **ImageSEOFix**

Positioning:

> Fix missing Shopify image alt text from CSV in minutes, with AI suggestions you can review before importing.

Primary CTA:

> Upload Shopify CSV

Secondary CTA:

> Try 20 images free

## Core Pages

### `/`

Target keyword: `shopify alt text generator`

Title:

```text
Shopify Alt Text Generator - ImageSEOFix
```

Description:

```text
Audit missing Shopify image alt text, generate AI suggestions in bulk, review every row, and export a Shopify-ready CSV.
```

H1:

```text
Shopify Alt Text Generator
```

H2 sections:

- Upload a Shopify CSV
- Find missing and weak alt text
- Generate product-aware suggestions
- Review before export
- Pricing
- FAQ

### `/shopify-alt-text-generator`

Intent: AI generation for Shopify product images.

Tool module:

- CSV upload
- sample CSV download
- row limit notice
- audit preview
- generated alt text table

### `/bulk-alt-text-generator`

Intent: bulk non-Shopify users and SEO agencies.

Angle:

- paste URLs
- upload CSV
- export CSV
- agency batch workflow

### `/shopify-image-seo-checker`

Intent: audit-first users.

Checks:

- blank alt text
- duplicate alt text
- SKU-only alt text
- filename-like alt text
- too short
- too long
- keyword stuffing
- missing product context

### `/shopify-alt-text-csv-generator`

Intent: long-tail CSV import/export workflow.

Content:

- how Shopify product CSV image columns work
- how to export products
- how to re-import updated alt text
- warnings about theme/SKU variant edge cases

### `/woocommerce-alt-text-generator`

Intent: expansion page.

MVP can collect waitlist first if WooCommerce export is not ready.

### `/alternatives/caseo`

Intent: comparison page.

Position honestly:

- Caseo is good for Shopify app workflow.
- ImageSEOFix is better if users want CSV-first audit, no install, and pre-review exports.

### `/alternatives/autoalt`

Intent: comparison page.

Position honestly:

- AutoAlt is good for automatic Shopify app automation.
- ImageSEOFix is better for safe manual review, CSV workflow, and stores that do not want another app yet.

## Blog / Content Pages

1. `/blog/how-to-bulk-update-shopify-alt-text`
2. `/blog/shopify-image-alt-text-best-practices`
3. `/blog/shopify-product-csv-image-alt-text`
4. `/blog/ai-alt-text-for-ecommerce-images`
5. `/blog/shopify-image-seo-checklist`
6. `/blog/alt-text-vs-product-title`
7. `/blog/google-image-search-for-shopify`
8. `/blog/ada-wcag-alt-text-shopify`

## MVP Data Model

CSV row fields:

- `product_title`
- `handle`
- `image_src`
- `image_alt_text`
- `variant_sku`
- `variant_title`
- `product_type`
- `tags`
- `status`

Audit result fields:

- `row_id`
- `image_src`
- `current_alt`
- `issue_codes`
- `severity`
- `recommended_alt`
- `user_edited_alt`
- `approved`

Issue codes:

- `missing_alt`
- `duplicate_alt`
- `sku_only`
- `filename_like`
- `too_short`
- `too_long`
- `generic_ai`
- `keyword_stuffed`
- `variant_mismatch_risk`

## Free/Paid Boundaries

Free:

- Audit up to 100 rows.
- Generate up to 20 alt texts.
- Export audit summary.

Paid:

- Generate more than 20 rows.
- Export Shopify-ready CSV with generated alt text.
- Save project.
- Batch jobs over 500 rows.

## Acceptance Criteria For MVP

- User can upload a Shopify product CSV and see parsed image rows.
- Tool flags at least missing, duplicate, SKU-only, filename-like, too-short alt text.
- User can generate alt text for selected rows.
- User can edit suggestions before export.
- Free users are limited without blocking initial value.
- Paid users can export a Shopify-ready CSV.
- Landing page and tool page have SSR/static crawlable content with TDH.
