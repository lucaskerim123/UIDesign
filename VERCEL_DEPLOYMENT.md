# V2 Billing Store — Vercel deployment

## Project
Deploy this repository as a Next.js application on Vercel.

## Required environment variables
Set these in Vercel for Production, Preview, and Development as appropriate:

`NEXT_PUBLIC_SUPABASE_URL`

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`SUPABASE_SERVICE_ROLE_KEY`

`MASTER_API_URL` (production: `https://incendiarynetworks.cc`)

`BILLING_API_TOKEN` — server-only Store credential for License Master licensing, entitlements, releases and licence control

`DEPLOYER_API_TOKEN` — server-only deployment/update credential used for Master deployment operations

`CRON_SECRET`

`SITE_URL` (recommended for email links and local/preview parity)

`MASTER_API_TOKEN` is a License Master-side privileged secret. Do not put it in the Billing Store environment.

The Supabase project currently connected for this build is `xwbjfhpgsvsjaykelufa`.

## Architecture
The Store owns customers, orders, billing, payments and support.

The independent OrbitFS License Master owns licence issuance, validation, licence control, products/entitlements, releases and deployments.

The Store is a commercial/control plane and License Master is the authoritative licensing plane. The Store must never contain a licence signing private key or become the licence authority.

## Token boundary
Normal Store licensing calls use `BILLING_API_TOKEN`. Deployment/update calls use `DEPLOYER_API_TOKEN`. The privileged `MASTER_API_TOKEN` remains server-only inside License Master and is not a Store dependency.

## Vercel
Use the repository root as the project root and the Next.js framework preset.

Build command: `npm run build`

Install command: `npm ci`

Do not commit `.env.local` or any service token.

Keep the Vercel production branch set to `main`. Use preview deployments for pull requests, merge a reviewed batch to `main`, and avoid connecting incidental agent branches as production targets. The repository `ignoreCommand` skips deployments for documentation/workflow-only pushes, while CI validates application changes without calling Vercel.

## Free-tier cron
`vercel.json` schedules `/api/cron/mail-automations` once daily at 03:00 UTC. Vercel sends the configured cron secret as a bearer token; the route also requires `SUPABASE_SERVICE_ROLE_KEY` and returns an explicit configuration error when either secret is missing.

## Master dependency
The Store can be deployed while Master is unavailable. Paid orders remain pending licence issuance until Master is reachable. Existing runtime licensing continues to use the Master service rather than Store-local signing.

## Release storage
The Master uses Cloudflare R2 for release artifacts. R2 must be enabled on the Cloudflare account before the Master Worker can be deployed with its configured artifact bucket.
