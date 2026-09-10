# OrbitFS Master UI

Design/prototype repository for the OrbitFS Website commercial control plane.

This repository is intentionally separate from `OrbitFS-Website`: production source is not modified here. The prototype covers the storefront/customer portal and the MASTER control plane with a focus on billing, orders, licences, fulfilment and enforcement.

## Design scope

- Storefront and product catalogue
- Customer portal: orders, invoices, licences, downloads and support
- MASTER Admin: customers, orders & billing, licence system, products/content and system controls
- Master licence control: bindings, desired/remote state, suspension/termination, installations and enforcement queue
- Clear separation between commerce state and licence state
- Dense operational UI rather than marketing SaaS styling

## Source of truth reviewed

The design was based on the current OrbitFS Website architecture and its existing routes/components. The production repository remains untouched; all final design work lands in this repository.

## Run

Open `index.html` directly, or serve the repository with any static HTTP server.
