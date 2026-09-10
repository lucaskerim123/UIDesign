# OrbitFS Master UI

Design/prototype repository for the OrbitFS Website commercial control plane.

This repository is intentionally separate from `OrbitFS-Website`. The production repository is **read-only source material for the design project**; the final UI/design work is delivered here.

## Full rescan completed

A second, full rescan of `lucaskerim123/OrbitFS-Website` was completed on 2026-09-10 after the first design pass was found to be incomplete.

The expanded scope now accounts for the real Website architecture across:

- Public storefront/catalogue
- Product configuration/options/artifacts
- Basket and checkout
- Customers/accounts
- Orders and order items
- Invoices, payments and refunds
- Payment gateways/runtime/webhooks
- Coupons
- Wallet/account credit/recharge
- Gift purchase and delivery
- Customer Portal
- Licences and licence components
- Master licence control/enforcement
- Licence API/runtime health
- Panel/Engine release system and release bundles
- Customer deployment/download surfaces
- Support, departments, claims and escalation
- Guest/basic support
- Knowledge Base and premade messages
- Notifications and transactional mail
- News/content
- Staff/roles/permissions
- Alerts, analytics and audit
- Account enforcement/restricted payment behaviour
- Themes and responsive UI

## Canonical licence products

- OrbitFS Base System — `orbitfs_base`
- OrbitFS MCP — `orbitfs_mcp`
- OrbitFS Apex System — `orbitfs_apex`
- OrbitFS Studio — `orbitfs_studio`

Historic aliases are retained only for compatibility in the source system.

## Critical design rule

Commerce state and licence state are separate. The UI must distinguish order/payment/fulfilment from licence desired state, remote state and enforcement state.

Required billing language:

- Unpaid / Pending Payment
- Overdue / Pending Payment
- Paid / Active
- APAID / Active
- Suspended / Suspended
- Canceled / Terminated

## Prototype focus

The prototype is an operational control plane, not a marketing SaaS dashboard. It should demonstrate the real system hierarchy and enough representative states to design the complete Website, Customer Portal and MASTER Admin experience.

See `DESIGN_SPEC.md` for the complete rescan-derived specification, route/state inventory, subsystem map, security rules and 12ui workflow.

## Run

Open `index.html` directly, or serve the repository with any static HTTP server.
