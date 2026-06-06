# ImageSEOFix Cloudflare Migration

Updated: 2026-05-26

## Product choice

Use **Cloudflare Workers with OpenNext** for the first Cloudflare trial of ImageSEOFix.

Why this is the right default for this repo:

- The current app is a static/client-side-first Next.js app, but it still has a request guard that adds security headers and returns 404 for `/api/*`, `/admin/*`, `/dashboard/*`, `/settings/*`, and `/auth/*`.
- Next static export is attractive for Cloudflare Pages, but static export does not support Proxy/Middleware. Moving to Pages would require replacing that guard with Pages `_headers` plus either redirects or a Pages Function.
- Workers + OpenNext keeps the existing Next behavior and gives a clean upgrade path if the product later adds auth, APIs, AI calls, or Shopify integrations.

Cloudflare Pages can still be a later simplification if ImageSEOFix stays fully static and we intentionally replace the request guard.

Compatibility note: the request guard currently uses `src/middleware.ts` instead of the newer Next 16 `src/proxy.ts` convention. Next 16 warns about this, but OpenNext cannot bundle the new Node-based Proxy convention for Cloudflare Workers yet; the legacy middleware convention keeps the guard on the Edge-compatible path.

## Local configuration

- Wrangler config: `wrangler.jsonc`
- OpenNext config: `open-next.config.ts`
- Worker entry after build: `.open-next/worker.js`
- Static asset binding: `.open-next/assets` bound as `ASSETS`
- Trial hostname: `imageseofix.<your-workers-subdomain>.workers.dev`

## Commands

```bash
pnpm build
pnpm cf:build
pnpm cf:dry-run
pnpm cf:preview
pnpm cf:deploy
```

Useful auth/config checks:

```bash
pnpm cf:whoami
pnpm cf:typegen
```

## Current blockers from Windows validation

`pnpm build` succeeds on Windows.

`pnpm cf:build` currently reaches the OpenNext bundling step, then fails locally with:

```text
EPERM: operation not permitted, symlink ... @next/env
```

That is a Windows symlink permission/runtime issue in the OpenNext trace-copy step. Use one of these before deploying from this workstation:

- Run the Cloudflare build in a Linux/WSL environment.
- Enable Windows Developer Mode or run from an elevated shell that can create symlinks.
- Deploy through a Linux CI runner.

Wrangler is also not authenticated in this Codex session. `pnpm cf:whoami` currently reports that `wrangler login` or `CLOUDFLARE_API_TOKEN` is required.

## Linux CI validation

The repository includes `.github/workflows/cloudflare-build.yml` to run the Cloudflare build on `ubuntu-latest`.

This workflow does not deploy and does not need Cloudflare secrets. It verifies:

- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm cf:build`

If the workflow passes, the remaining deployment blocker is authentication only. If it fails, inspect the workflow logs before adding a deploy job.

## GitHub Actions deployment

The repository includes `.github/workflows/cloudflare-deploy.yml` for manual production deployment to Cloudflare Workers.

Required GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The workflow is intentionally `workflow_dispatch` only, so pushes keep validating the Cloudflare build but do not deploy automatically.

Deployment steps:

- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm cf:build`
- `pnpm exec wrangler deploy --dry-run`
- `pnpm exec wrangler deploy`
- smoke test `/`, `/robots.txt`, `/sitemap.xml`, and `/api/ping`

After it succeeds, the first trial URL should be the `workers.dev` route for the `imageseofix` Worker.

## Deployment checklist

1. Authenticate Wrangler:
   ```bash
   pnpm exec wrangler login
   ```
   or set `CLOUDFLARE_API_TOKEN` with the minimum deploy permissions.

2. Build in a symlink-capable environment:
   ```bash
   pnpm cf:build
   ```

3. Dry-run the Worker:
   ```bash
   pnpm cf:dry-run
   ```

4. Deploy to the trial `workers.dev` URL:
   ```bash
   pnpm cf:deploy
   ```

5. Smoke-test:
   - `/`
   - `/shopify-alt-text-generator`
   - `/shopify-schema-checker`
   - `/robots.txt`
   - `/sitemap.xml`
   - `/api/ping` must return 404

6. Keep the current Vercel production URL live until the Cloudflare trial passes.

7. Apply cost protection:
   - Review `docs/cloudflare-cost-protection.md`.
   - Keep Workers Free while validating unless a paid feature is required.
   - Add Cloudflare billing notifications and WAF/rate limiting before custom-domain cutover.

## Minimum Cloudflare permissions

For a Workers trial deployment:

- Workers Scripts: Edit
- Workers Tail: Read, if inspecting logs
- Account Settings: Read

For a production domain cutover later:

- Zone DNS: Edit
- Zone Settings: Read
- Zone WAF / Rulesets: Edit
