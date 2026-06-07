# Store URL Scan Plan

Updated: 2026-06-07

## Product decision

The default ImageSEOFix workflow should be:

```text
Enter Shopify store URL -> scan first 5 products free -> show image alt text issues -> export sample CSV -> request larger cleanup
```

CSV remains a fallback for SEO agencies and users who already know how to export Shopify product data.

## Free and paid boundary

- Free: scan first 5 products.
- Private cleanup: `$19+` one-time quote for stores that want help.
- Growth: `$29/mo`, planned for up to 100 products per scan.
- Agency: `$79/mo`, planned for multi-store audits, white-label reports, and cleanup support.

The limit exists to keep crawling cost low, avoid abuse, and make the upgrade reason obvious.

## Implementation stages

### Stage 1: Controlled scanner

Current implementation includes a server-side scanner:

- Accept a public Shopify store URL.
- Discover at most 5 product URLs.
- Fetch only the storefront HTML that a search crawler can see.
- Extract product title, image URL, and rendered `img alt`.
- Timeout quickly and return partial results instead of retrying aggressively.
- Do not write to Shopify.
- Do not call AI APIs.

The Cloudflare deploy workflow smoke-tests this route against a real public Shopify store and fails if more than 5 products are scanned.

### Stage 2: Paid expansion

After pricing intent is proven:

- Require email or checkout before scanning more than 5 products.
- Add per-store and per-IP rate limits.
- Add Growth and Agency scan quotas.
- Consider Shopify OAuth only if users demand direct write-back.

## Cost controls

- Keep the public free scanner at 5 products.
- Cache scan results by store URL for a short window.
- Block `/api/*` style generic paths from public abuse.
- Avoid image downloads; inspect HTML and image metadata only.
- Avoid AI generation until a paid plan or quote is involved.
