# ImageSEOFix Lightweight Analytics

Updated: 2026-06-07

ImageSEOFix uses a small `/events` endpoint for early validation before adding a
database or paid analytics stack.

## Why this exists

- Keep the first product low-cost and simple on Cloudflare Workers.
- Measure whether visitors scan stores, export CSV files, inspect pricing, and
  request private audits.
- Avoid storing emails, full store URLs, uploaded CSV contents, or image URLs in
  analytics events.

## Current events

- `hero_scan_click`
- `pricing_view`
- `pricing_cta_click`
- `store_scan_submit`
- `store_scan_success`
- `store_scan_error`
- `csv_generate`
- `csv_upload`
- `csv_export`
- `lead_request_missing_email`
- `lead_request_submit`

## Implementation

- Client helper: `src/lib/analytics.ts`
- Endpoint: `src/app/events/route.ts`
- Storage: Cloudflare Worker logs only
- Response: `204 No Content`
- Payload limit: 2 KB

## Upgrade trigger

After the site receives consistent traffic or 5 qualified private audit requests,
replace log-only tracking with a real backend event table or privacy-focused
analytics provider.
