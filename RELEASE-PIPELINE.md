# OrbitFS release pipeline

License Master is authoritative for release records and source capture. Base source is `lucaskerim123/V1-vercel-base` / `base-release`; existing-installation updates are `lucaskerim123/V1-vercel-engine` / `release-updates`.

Billing Store receives Master releases, applies final rollout visibility and customer-facing metadata, then publishes through License Master. My OrbitFS consumes published releases and uses the existing deployment control plane for customer deploy/update/rollback.
