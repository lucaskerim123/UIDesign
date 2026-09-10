# OrbitFS Split Architecture

## Repository boundaries
- `lucaskerim123/UIDesign` — Store, Customer Panel and Admin Panel design/prototype target.
- `OrbitFS-License-Master-V2` — independent licence/release/deployment authority.
- `lucaskerim123/OrbitFS-Website` — reference only; never modify for this split.

## Authority
The Store owns customers, products, orders, invoices, payments and fulfilment state. The Master owns licences, bindings, validation, enforcement, releases and deployment jobs.

A paid order does not itself create a licence. It creates a fulfilment request/eligibility state.

## Fulfilment
Auto Mode: Website -> Master issue API -> licence returned -> Website attaches licence ID to order -> issued.

Manual Mode: admin creates licence in Master -> attaches Master licence ID to paid order -> Website verifies -> issued.

Manual Mode is fallback only and does not move authority into the Website.

## Release
Draft -> changelog -> package -> validate -> publish -> Admin controls -> Customer Portal availability -> customer-selected deployment.

Publishing never deploys automatically.

## Customer deployment
Customer Panel calls the external deployment service. The deployment target is customer-owned infrastructure. Base and Engine are deployed as shared platform components; MCP, APEX and Studio are component entitlements using the existing Engine.

## Security
Browser clients never receive Master signing keys, billing service tokens or deployment secrets. Store-to-Master calls are server-side authenticated requests. Master is independently operable if the Store is unavailable, and the Store remains commercially usable when Master is unavailable.
