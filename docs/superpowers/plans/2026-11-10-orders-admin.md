# Orders and catalog administration

Accepted scope: product-fit dimensions composed into WhatsApp (no messages sent automatically), three starter configurations, durable protected catalog editing. Preserve gray design, original supplier provenance and owner-private audience. Rustem email not available; current owner remains sole editor.

Implementation: existing static pages moved to public; bundled Worker with ASSETS, D1 catalog overrides and R2 images. Initial 79 supplier records stay source data; edits/new records live in D1 and survive deployments. Conditional revisions prevent lost updates. Platform ChatGPT identity plus server allowlist authorizes every admin endpoint. Same-origin mutation checks, bounded JSON/images, safe image paths and escaped output. Admin supports add/edit/hide, description/specs, photo and confirmed prices/units.

Validation: model/auth/validation tests; actual local D1/R2 integration save/reload/conflict/hide/upload; browser desktop/mobile kit links, fit form and admin. Build production bundle and ensure no preview auth. Fresh independent review before publishing. Preserve project id and access. Handoff remaining Rustem email without granting unknown parties access.
