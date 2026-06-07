# ImageSEOFix Next Todo

Updated: 2026-06-07

## Doing now

- [x] Add a low-friction lead capture path after the free CSV audit.
- [x] Add pricing intent cards for Free, Private cleanup, Growth, and Agency.
- [x] Deploy the first lead capture flow to Cloudflare Workers.
- [x] Wire GitHub Actions to read `NEXT_PUBLIC_LEAD_EMAIL` from repository variables.
- [ ] Confirm the real lead inbox spelling before setting `NEXT_PUBLIC_LEAD_EMAIL`.

## Next engineering tasks

- [ ] Set `NEXT_PUBLIC_LEAD_EMAIL` in GitHub Actions variables after the inbox is confirmed.
- [ ] Trigger Cloudflare Deploy and verify the generated `mailto:` uses the confirmed inbox.
- [ ] Add lightweight click tracking for `Generate suggestions`, `Export CSV`, `View pricing`, and `Request private audit`.
- [ ] Add Google Search Console setup notes and submit sitemap for the canonical production domain.
- [ ] Decide whether Vercel or Cloudflare is the canonical public URL before promotion.

## Next product tasks

- [ ] Write the first outreach offer: private Shopify image SEO cleanup from `$19+`.
- [ ] Define the first qualified lead criteria: store URL, image count, platform, urgency, and agency/client context.
- [ ] After 5 qualified requests, replace `mailto:` with a real form backend or Stripe Payment Link.

## Waiting on user

- [ ] Confirm whether the lead inbox is `lawxianzhao@gmail.com` or `lawxianzhao@gmial.com`.
