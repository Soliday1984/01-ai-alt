# Cloudflare Cost Protection

Updated: 2026-06-06

## Current risk profile

ImageSEOFix is low-cost by design:

- No paid AI API is called on the server.
- D1 and R2 are bound for the paid CSV workflow, but self-serve job creation is
  blocked server-side unless `SELF_SERVE_ENABLED=true`.
- The R2 bucket is private and is only accessed through token-checked API
  routes; there is no public R2 bucket or public object URL.
- Unknown `/api/*` probes, auth, dashboard, admin, and common scanner paths are
  blocked in middleware. The paid CSV workflow allows `/api/self-serve/*`.
- The Worker is currently deployed on Cloudflare Workers Free plan.

The main remaining risks are request volume against the Worker and abusive CSV
job creation after self-serve is enabled.

## Code-level controls

Cloudflare rejected `limits.cpu_ms` on the current Free plan. Keep runtime limits out of `wrangler.jsonc` unless the account is upgraded to Workers Paid.

If the account moves to Workers Paid, add this optional technical fuse:

```jsonc
"limits": {
  "cpu_ms": 20,
  "subrequests": 5
}
```

Configured in `src/middleware.ts`:

- Return `404` for unused product/API/admin/auth paths while allowing
  `/api/self-serve/*` for the paid CSV workflow.
- Return `404` for common scanner paths such as WordPress, PHP, dotfile, and repository probes.
- Return `403` for obvious automated scanner user agents.

Configured in the self-serve API:

- `POST /api/self-serve/jobs` checks the server-side self-serve flag before
  parsing the upload body or writing D1/R2.
- `POST /api/self-serve/jobs` rejects upload requests with a declared body
  larger than the beta limit before parsing JSON.
- CSV payloads are capped at 2 MB.
- Cleaned CSV downloads require a private job token and `payment_status='paid'`.
- `POST /api/self-serve/checkout` is also behind the server-side self-serve
  flag, so the paid loop can be paused without breaking existing paid downloads.
- `NEXT_PUBLIC_SELF_SERVE_ENABLED` only controls UI visibility; it does not open
  the D1/R2 write path by itself.

Deployment smoke tests verify:

- `/` returns success.
- `/robots.txt` returns success.
- `/sitemap.xml` returns success.
- `/api/ping` returns `404`.
- `/.env` returns `404`.
- A scanner user agent returns `403`.

## Cloudflare dashboard controls

Set these before pointing a production custom domain to the Worker.

### Billing and alerts

1. Open Cloudflare Dashboard > Billing.
2. Check whether the account is on Workers Free or Workers Paid.
3. Keep Workers Free while the product is validating, unless a paid feature requires Workers Paid.
4. Add a low billing notification threshold if billing is enabled on the account.
5. Review Workers usage daily for the first week after launch.

### Worker metrics

1. Open Workers & Pages > `imageseofix` > Metrics.
2. Watch:
   - Requests
   - Errors
   - CPU time
   - Subrequests
3. If requests spike without matching GSC/referrer evidence, pause promotion and tighten rules.

### WAF and rate limiting

For `workers.dev`, WAF controls may be limited compared with a proxied custom domain. After binding a custom domain through Cloudflare DNS, add:

- Challenge or block suspicious countries only if traffic quality is poor.
- Rate limit by IP on expensive or abuse-prone paths.
- Keep unknown `/api/*`, `/admin/*`, `/dashboard/*`, `/settings/*`, and
  `/auth/*` blocked. Do not block `/api/self-serve/*`; protect it with rate
  limits and Stripe/download-token checks.
- Challenge traffic with obvious automated or missing browser signals.

Suggested first rule for custom-domain traffic:

- Match: paths under `/api/` except `/api/self-serve/`, plus `/admin/`,
  `/dashboard/`, `/settings/`, `/auth/`
- Action: Block

Suggested first rate limit:

- Match: all paths on the production host, with a stricter rule for
  `/api/self-serve/*`
- Threshold: 120 requests per minute per IP
- Action: Managed Challenge or Block for 10 minutes

Tune the threshold only after checking real search crawler and user traffic.

## Emergency runbook

If traffic spikes unexpectedly:

1. Confirm whether it is visible in Cloudflare Workers metrics.
2. Immediately set `SELF_SERVE_ENABLED=false` and
   `NEXT_PUBLIC_SELF_SERVE_ENABLED=false`, then redeploy.
3. If it is abusive, temporarily set the Worker route/domain to a stricter WAF rule.
4. If cost risk is immediate, disable the custom route or roll back DNS to the existing Vercel deployment.
5. Keep the Worker code deployed but stop sending production traffic until rules are tightened.

Do not add paid AI, image processing, queues, or external API calls until authentication, quotas, and per-user limits exist. Keep R2 writes disabled by feature flag until Stripe fulfillment and WAF/rate limits are ready.
