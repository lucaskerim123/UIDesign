# V2 Billing Store — Vercel deployment

## Project
Deploy this repository as a Next.js application on Vercel.

## Required environment variables
Set these in Vercel for Production, Preview, and Development as appropriate:

`NEXT_PUBLIC_SUPABASE_URL`

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`MASTER_API_URL`

`MASTER_API_TOKEN`

The Supabase project currently connected for this build is `xwbjfhpgsvsjaykelufa`.

## Architecture
The Store owns customers, orders, billing, payments and support.

The independent OrbitFS License Master owns licence issuance, validation, licence control, releases and deployments.

The Store must never contain a licence signing private key or become the licence authority.

## Vercel
Use the repository root as the project root and the Next.js framework preset.

Build command: `npm run build`

Install command: `npm install`

Do not commit `.env.local` or any service token.

## Master dependency
The Store can be deployed while Master is unavailable. Paid orders remain pending licence issuance until Master is reachable.

Existing runtime licensing continues to use the Master service rather than Store-local signing.

## Release storage
The Master uses Cloudflare R2 for release artifacts. R2 must be enabled on the Cloudflare account before the Master Worker can be deployed with its configured artifact bucket.
