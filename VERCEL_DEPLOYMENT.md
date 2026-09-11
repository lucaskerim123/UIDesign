# V2 Billing Store — Vercel deployment

## Project
Deploy this repository as a Next.js application on Vercel.

## Required environment variables
Set these in Vercel for Production, Preview, and Development as appropriate:

`NEXT_PUBLIC_SUPABASE_URL`

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`SUPABASE_SERVICE_ROLE_KEY`

`MASTER_API_URL`

`MASTER_API_TOKEN`

`CRON_SECRET`

`SITE_URL` (recommended for email links and local/preview parity)

The Supabase project currently connected for this build is `xwbjfhpgsvsjaykelufa`.

## Architecture
The Store owns customers, orders, billing, payments and support.

The independent OrbitFS License Master owns licence issuance, validation, licence control, releases and deployments.

The Store must never contain a licence signing private key or become the licence authority.

## Vercel
Use the repository root as the project root and the Next.js framework preset.

Build command: `npm run build`

Install command: `npm ci`

Do not commit `.env.local` or any service token.

Keep the Vercel production branch set to `main`. Use preview deployments for pull requests, merge a reviewed batch to `main`, and avoid connecting incidental agent branches as production targets. The repository `ignoreCommand` skips deployments for documentation/workflow-only pushes, while CI validates application changes without calling Vercel. Batch related agent changes in one PR before pushing intermediate commits to reduce preview and build noise.

## Free-tier cron

`vercel.json` schedules `/api/cron/mail-automations` once daily at 03:00 UTC. Vercel sends the configured cron secret as a bearer token; the route also requires `SUPABASE_SERVICE_ROLE_KEY` and returns an explicit configuration error when either secret is missing. Keep this daily schedule on Vercel Hobby rather than adding per-minute or per-hour jobs.

## Master dependency
The Store can be deployed while Master is unavailable. Paid orders remain pending licence issuance until Master is reachable.

Existing runtime licensing continues to use the Master service rather than Store-local signing.

## Release storage
The Master uses Cloudflare R2 for release artifacts. R2 must be enabled on the Cloudflare account before the Master Worker can be deployed with its configured artifact bucket.
