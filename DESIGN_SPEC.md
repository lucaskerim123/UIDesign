# OrbitFS Master UI — Design Specification

## Purpose

This is the final UI/design target for the OrbitFS Website commercial and licence control plane. It is deliberately isolated from the production `OrbitFS-Website` repository.

## Primary surfaces

1. Storefront — catalogue, product detail, basket and checkout.
2. Customer Portal — account, orders, invoices, licences, downloads, support and wallet.
3. MASTER Admin — operational control over customers, commerce, fulfilment and the licence service.

## Master navigation

- Overview
- Customers
- Orders & Billing
  - Orders
  - Invoices
  - Payments & gateways
  - Coupons
- Licence System
  - Release Panel
  - Licences
  - Master licence control
  - API settings
  - Licence settings
- Products & Content
- Support
- System

## Commerce model

Order/payment state is not the same thing as licence state. Orders retain payment status and fulfilment status. A paid order can trigger licence fulfilment; a manual `APAID` override is still represented as an auditable administrative state.

## Licence model

The Master control surface exposes issued keys, licence products, customer bindings, installation limits, desired state, remote state and enforcement queue state. Core actions include issue/reissue, unblock, suspend, sync and terminate. Termination means the licence is blocked/archived; suspension is reversible service enforcement.

## Required status language

- Unpaid / Pending Payment
- Overdue / Pending Payment
- Paid / Active
- APAID / Active
- Suspended / Suspended
- Canceled / Terminated

## Security boundary

The browser must never receive billing/admin secrets or licence service tokens. Production server routes call the licence service through its server-only adapter. Administrative mutations are permission checked and audited.

## Visual direction

Operational, compact and professional. Strong hierarchy, restrained colour, clear state pills, dense tables, useful panels and responsive behaviour. Avoid marketing-SaaS card grids, oversized controls and decorative UI that obscures operational information.

## Source scan used for this design

- `OrbitFS-Website/ARCHITECTURE.md`
- `web/src/app/admin/layout.tsx`
- `web/src/app/admin/orders`
- `web/src/app/admin/enforcement`
- `web/src/app/admin/licenses`
- `web/src/app/admin/billing`
- `web/src/app/admin/payments`
- `web/src/app/portal`
- `web/src/app/portal/checkout`
- `web/src/app/portal/licenses`
- payment-gateway and licence adapter/server libraries

No production repository was modified by the final UI work.
