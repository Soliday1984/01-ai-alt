# ImageSEOFix Validation Stage

Date: 2026-06-08
Goal: prove that Shopify merchants understand the problem, can try the free scan, and are willing to request or pay for a full-store CSV cleanup.

## 1. Real Shopify Store Test Set

Use `https://imageseofix.com/store-scan` and keep only stores where the scanner can read public Shopify products. This validates the current MVP path without requiring merchant app authorization.

| Store | Scan result | Products | Image rows | Missing or weak alt | Notes |
| --- | --- | ---: | ---: | ---: | --- |
| https://allbirds.com | OK | 5 | 15 | 15 | Strong demo; every sampled row is missing or weak. |
| https://www.hauslabs.com | OK | 5 | 15 | 5 | Good beauty-store demo. |
| https://www.deathwishcoffee.com | OK | 5 | 15 | 10 | Good food and beverage demo. |
| https://www.chubbiesshorts.com | OK | 5 | 15 | 5 | Good apparel demo. |
| https://colourpop.com | OK | 5 | 15 | 0 | Useful control sample; scanner works even when sampled alts are mostly acceptable. |
| https://www.kyliecosmetics.com | OK | 5 | 15 | 15 | Strong beauty-store demo. |
| https://www.manscaped.com | OK | 5 | 13 | 5 | Good grooming-store demo. |
| https://www.blueland.com | OK | 3 | 3 | 3 | Small public catalog sample. |
| https://www.packagefreeshop.com | OK | 5 | 15 | 9 | Good sustainability-store demo. |
| https://shop.beardbrand.com | OK | 5 | 15 | 0 | Useful control sample. |
| https://www.bombas.com | OK | 5 | 5 | 5 | Good apparel/accessory demo. |

Failed or limited public tests:

| Store | Result | Product implication |
| --- | --- | --- |
| https://www.kith.com | 422 from scanner | Public catalog path is blocked or unsuitable. Add clearer UI error copy later. |
| https://www.ridge.com | 422 from scanner | Public catalog path is blocked or unsuitable. |
| https://www.mvmt.com | 422 from scanner | Public catalog path is blocked or unsuitable. |
| https://www.meundies.com | 400 from scanner | The site path is not currently accepted by scanner normalization. |

## 2. Manual Validation Script

Run this flow for each of the 10 usable stores:

1. Open ImageSEOFix.
2. Paste store URL.
3. Scan first 5 products.
4. Record products, images, issue count, and whether suggestions feel reasonable.
5. Click `Request full-store fix` and confirm the page jumps to the lead form.
6. Fill email and store URL, then submit.
7. Confirm the mail draft includes the audit summary and asks for a fixed-price cleanup quote.

Success signal:

- At least 7 of 10 scans return useful findings.
- At least 3 examples are strong enough to share publicly without exaggeration.
- The lead form intent is obvious without explaining it in chat.

## 3. Outreach Posts

Do not mass-post links. Start with feedback-first posts, follow each community rule, and reply with concrete store-level observations.

### Reddit

Targets:

- r/ShopifyApps: self-promotion is allowed when it adds value, according to the subreddit welcome post. The same post says developers should be transparent, stay relevant, and limit promo or idea-validation posts to one per month.
- r/shopify and r/ecommerce: use comments and feedback posts carefully; r/shopify rules emphasize avoiding obvious self-promotion.

Draft:

```text
I built a tiny free checker for Shopify product image alt text and I need merchant feedback.

It scans the first 5 public products, shows missing/weak alt text, and exports a Shopify-ready CSV path so merchants can update Image Alt Text without installing an app.

I am trying to validate one narrow question: would store owners rather fix this manually from Shopify CSV, or pay a small one-time fee to get the full CSV cleaned up?

If you run a Shopify store and want me to test the first 5 products, reply with your store URL or DM me. I will share the findings in plain text, no signup required.
```

### Indie Hackers

Draft:

```text
I launched a small Shopify SEO tool instead of another broad AI app.

Problem: many stores have product images with missing or generic alt text. Shopify lets merchants update Image Alt Text through product CSV, but the workflow is annoying and easy to miss.

MVP: paste a store URL or upload Shopify Products CSV, scan the first 5 products free, then request a full-store CSV cleanup quote.

Validation target for this week:
- 10 real Shopify store tests
- 3 merchant replies
- 1 paid manual cleanup via Stripe/Gumroad/PayPal

Question for other indie hackers: would you lead with a one-time manual service first, or force a self-serve subscription from day one?
```

### Shopify Community

Post only in relevant feedback or marketing threads when the store owner is asking for SEO/store feedback.

Draft reply:

```text
One small issue to check is product image alt text. It will not fix sales alone, but it is part of a cleaner SEO and accessibility baseline.

For Shopify, the practical route is:
1. Export Products CSV.
2. Review the Image Alt Text column.
3. Replace missing/generic values with product-specific descriptions.
4. Import the edited CSV back after keeping a backup.

I built a free first-5-product checker for this exact workflow. If helpful, I can run a quick sample and share the findings here.
```

### X / Twitter

Draft thread:

```text
I am validating a narrow Shopify SEO service:

Find missing or weak product image alt text.
Export a Shopify-ready CSV.
Offer a paid full-store cleanup for merchants who do not want to edit hundreds of rows.

Today I tested 10 public Shopify stores. Some had every sampled image missing useful alt text.

The bet: a tiny manual service can prove willingness to pay before building a full Shopify app.

Looking for 3 Shopify merchants who want a free first-5-products audit.
```

## 4. GSC Observation

Current known baseline:

- Domain property for `imageseofix.com` was added.
- `https://imageseofix.com/sitemap.xml` was submitted successfully.
- Sitemap showed 8 discovered pages.
- URL Inspection indexing request previously hit a temporary Search Console error.

Weekly tracking:

| Metric | Where | Validation meaning |
| --- | --- | --- |
| Impressions | GSC Performance | Google is testing the pages in SERP. |
| Queries | GSC Performance > Queries | Shows which keywords Google associates with the site. |
| Clicks | GSC Performance | Early proof of search traffic. |
| Indexed pages | GSC Pages + Sitemaps | Confirms crawler can read the site. |
| Landing pages | GSC Performance > Pages | Identifies which pages need stronger TDH and internal links. |

Decision rule:

- If there are no impressions after 14 days, add 3 focused pages around Shopify CSV image alt text, Shopify image SEO checker, and product image alt text generator.
- If impressions exist but CTR is low, rewrite title/description around the exact query wording.
- If clicks happen but no leads, revise CTA and add a visible service price anchor.

## 5. First Payment Path

Preferred: Stripe Payment Link.

Fallbacks:

- Gumroad product: `Shopify image alt text CSV cleanup`.
- PayPal invoice or PayPal.me link.

Validation offer:

- First 3 stores: USD 19 manual cleanup for up to 100 product image rows.
- Above 100 rows: quote manually before payment.
- Deliverable: Shopify-ready product CSV with updated Image Alt Text column.
- Turnaround: 24 to 48 hours during validation.

Implementation note:

- Set `NEXT_PUBLIC_PAYMENT_LINK` as a GitHub Actions repository variable after creating the payment link.
- Redeploy and the payment CTA appears automatically.

## 6. Next Experiment Scoreboard

| Experiment | Timebox | Success | Failure |
| --- | --- | --- | --- |
| 10 real store scans | 1 day | 7+ useful scan results | Scanner fails on most stores or suggestions feel wrong. |
| Reddit feedback post | 3 days | 3 replies or 1 merchant test | Removed as spam or no useful replies. |
| Indie Hackers post | 3 days | 2 founder comments on pricing/path | No discussion. |
| Shopify Community replies | 7 days | 3 context-specific replies without moderation issue | Replies deleted or treated as spam. |
| X build-in-public thread | 7 days | 1 merchant intro or DM | Only indie-hacker likes, no merchant signal. |
| Paid manual cleanup | 14 days | 1 paid order | Leads ask questions but no one pays. |

## Sources To Recheck Before Posting

- Reddit r/ShopifyApps welcome/rules thread: https://www.reddit.com/r/ShopifyApps/comments/1p28k3m/welcome_to_rshopifyapps_read_before_posting_get/
- Shopify Community Store Feedback board: https://community.shopify.com/c/en/shopify/store-feedback/125
- Shopify Community homepage category description: https://community.shopify.com/
- Indie Hackers launch norms reference: https://smollaunch.com/guides/indiehackers-launch-checklist
