# ImageSEOFix Opportunity Brief

Date: 2026-05-20

## Decision

Build a narrow SEO tool first: **Shopify Alt Text CSV Generator / Image SEO Auditor**.

Do not start with a full Shopify App Store app. Start with a public SEO tool site that lets merchants upload a Shopify product CSV, paste image URLs, or upload images, then receive:

- missing/weak alt text audit
- AI-generated alt text suggestions
- editable preview table
- Shopify-ready CSV export

After the tool gets traffic, users, and paid batches, turn it into a Shopify app with OAuth and one-click write-back.

## Why This Can Reach $1,000 MRR

Target pricing:

| Plan | Price | Limit | $1k MRR path |
| --- | ---: | --- | ---: |
| Starter | $19/mo | 500 images/month, CSV export | 53 customers |
| Growth | $29/mo | 1,500 images/month, saved projects | 35 customers |
| Pro | $59/mo | 5,000 images/month, team/export/API | 17 customers |

The first milestone is not scale; it is 20-40 paying Shopify/WooCommerce merchants or SEO freelancers.

## Evidence From Current Market

- SpectoAI offers Shopify bulk alt generation with review/edit and one-click apply. Pricing validates this market at $29/mo for 1,000 credits and $79/mo for 5,000 credits.
- Caseo claims 1,000+ brands, a 4.7 app rating, and pay-per-credit packages from $9 to $229, validating both Shopify demand and credit pricing.
- AutoAlt claims 2,000+ Shopify stores, 3M+ generated alt texts, 4.9 rating, collection/blog image coverage, variants, markets, and pricing from EUR29/mo after 50 free credits.
- AltTextMax targets generic bulk alt text with CSV import/export and no subscription, proving there is demand outside Shopify app-only workflows.
- Reddit discussions show merchants recognize the pain: blank or generic alt text, bulk work, hallucinated generic AI output, and the need for review before saving.

## Product Wedge

Position against full Shopify apps:

> "Audit and generate Shopify alt text safely from CSV before installing another app."

Differentiators:

- CSV-first: no Shopify install required for first value.
- Safe preview: never overwrites existing alt text by default.
- Quality scoring: flags blank, SKU-only, duplicate, too-short, keyword-stuffed, or generic alt text.
- Context-aware generation: image + product title + variant + product type + optional keyword.
- Review workflow: approve/edit before export.
- Shopify-ready export: produce columns ready for product CSV re-import.
- Later expansion: Shopify app, WooCommerce, API, agency batch work.

## ICP

Primary:

- Shopify merchants with 100-10,000 product images.
- Fashion, jewelry, home decor, beauty, electronics accessories, and other visual catalogs.
- Store owners who care about SEO but do not have a dedicated SEO team.

Secondary:

- SEO freelancers/agencies serving Shopify stores.
- WooCommerce merchants willing to work through CSV/export.
- Accessibility consultants doing bulk remediation.

## Initial Keywords

| Priority | Keyword | Intent | Page |
| --- | --- | --- | --- |
| A | shopify alt text generator | Generate alt text specifically for Shopify product images | `/shopify-alt-text-generator` |
| A | bulk alt text generator | Process many images at once | `/bulk-alt-text-generator` |
| A | shopify image seo checker | Audit missing/weak image SEO | `/shopify-image-seo-checker` |
| A | shopify alt text csv | Export/import alt text through CSV | `/shopify-alt-text-csv-generator` |
| B | ai alt text generator for shopify | AI generation with Shopify context | `/ai-alt-text-generator-for-shopify` |
| B | woocommerce alt text generator | Adjacent platform expansion | `/woocommerce-alt-text-generator` |
| B | image alt text audit | Generic agency/accessibility workflow | `/image-alt-text-audit` |
| C | caseo alternative | Competitor comparison | `/alternatives/caseo` |
| C | autoalt alternative | Competitor comparison | `/alternatives/autoalt` |

## Competitor Weaknesses To Exploit

- Full Shopify apps require install/trust before value; CSV-first gives instant value.
- Many tools promise generation, fewer lead with audit and quality scoring.
- Generic generation can produce weak descriptions; the wedge is product-context + visual detail + review before write-back.
- App Store tools compete on automation; the first public site can compete on SEO pages and free audits.
- Some merchants have theme/SKU edge cases where alt text is tied to variant behavior; a safe audit/export workflow can detect and warn before changes.

## MVP Scope

Must have:

- Upload Shopify CSV.
- Parse product title, handle, image src, image alt text, variant fields where present.
- Flag missing/weak alt text.
- Generate alt text for selected rows.
- Preview/edit table.
- Export Shopify-ready CSV.
- Stripe checkout for paid batch credits.

Nice later:

- Paste URL list.
- Upload images directly.
- WooCommerce CSV mode.
- Shopify OAuth app.
- Scheduled scans.
- Multi-language generation.
- Agency workspace.

## 30-Day Milestones

Week 1:

- Build landing page and CSV parser.
- Ship free audit for up to 100 image rows.
- Publish 4 SEO pages.

Week 2:

- Add AI generation and export.
- Add Stripe credits.
- Publish 4 more SEO pages and 2 competitor comparison pages.

Week 3:

- Cold outreach to 50 Shopify stores with a free audit report.
- Post in relevant Shopify/SEO/ecommerce communities carefully, focusing on lessons and audit results.
- Collect first testimonials and bug reports.

Week 4:

- Improve quality scoring.
- Add saved projects or payment-required large exports.
- Decide whether to build Shopify OAuth app based on usage.

## Kill Criteria

Stop or pivot if, after 30 days:

- No users complete a CSV upload.
- No one exports generated alt text.
- Outreach produces no merchant interest.
- Search Console shows no impressions after core pages are indexed.

Keep going if:

- Users upload real catalogs.
- Users ask for one-click Shopify write-back.
- At least 3 merchants pay or offer to pay.
- GSC starts showing impressions for Shopify alt text/image SEO queries.

## Source Notes

- SpectoAI: https://ecomgraph.com/app/spectoai-alt-text
- Caseo: https://caseo.ai/
- AutoAlt: https://www.autoalt.ai/integrations/shopify/
- AltiSeo: https://www.altiseo.com/
- AltTextMax: https://alttextmax.ai/
- Reddit merchant pain examples:
  - https://www.reddit.com/r/AI_agentic_ecommerce/comments/1sxuvf3/80_of_shopify_product_images_are_broken_in_a_way/
  - https://www.reddit.com/r/ShopifySEO/comments/1p8ht8f/store_owners_who_tried_ai_alt_text_apps_did_it/
  - https://www.reddit.com/r/shopifyDev/comments/1m5cey4/alttext_locked_to_product_sku_cant_be_used_for_seo/
