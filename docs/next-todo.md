# ImageSEOFix Next Todo

Updated: 2026-06-07

## Doing now

- [x] Add a low-friction lead capture path after the free CSV audit.
- [x] Add pricing intent cards for Free, Private cleanup, Growth, and Agency.
- [x] Deploy the first lead capture flow to Cloudflare Workers.
- [x] Wire GitHub Actions to read `NEXT_PUBLIC_LEAD_EMAIL` from repository variables.
- [x] Confirm the real lead inbox spelling before setting `NEXT_PUBLIC_LEAD_EMAIL`.
- [x] Set `NEXT_PUBLIC_LEAD_EMAIL` in GitHub Actions variables.
- [x] Reframe the default tool workflow around Store URL scan with a 5-product free cap.

## Next engineering tasks

- [x] Trigger Cloudflare Deploy and verify the generated `mailto:` uses the confirmed inbox.
- [x] Replace the demo store scan with a server-side Shopify storefront scanner.
- [x] Enforce the free scan limit at 5 products on the server.
- [x] Add lightweight click tracking for `Generate suggestions`, `Export CSV`, `View pricing`, and `Request private audit`.
- [ ] Add Google Search Console setup notes and submit sitemap for the canonical production domain.
- [ ] Decide whether Vercel or Cloudflare is the canonical public URL before promotion.

## Next product tasks

- [ ] Write the first outreach offer: private Shopify image SEO cleanup from `$19+`.
- [ ] Define the first qualified lead criteria: store URL, image count, platform, urgency, and agency/client context.
- [ ] After 5 qualified requests, replace `mailto:` with a real form backend or Stripe Payment Link.
- [ ] Review Cloudflare logs weekly for scan, export, pricing, and lead-request events.

## Waiting on user

- [x] Confirm the lead inbox spelling.
