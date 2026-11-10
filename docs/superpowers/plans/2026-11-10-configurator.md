# IKIGAI Configurator Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship the user-selected material switches and three furnishing presets, with a clearly provisional price range.
**Architecture:** Buildless ES modules: pure settings/pricing, SVG scene renderer, page controller. Existing catalog and selection stay intact.
**Tech Stack:** HTML, CSS, SVG, JavaScript, node:test.
**Spec:** ../specs/2026-11-10-configurator-design.md

## Global Constraints
- Preserve gray visual style, existing project ID and owner-private audience.
- Rates are demonstration inputs, never confirmed supplier prices or payable totals.
- Only link to WhatsApp; never send messages during verification.

## Review Focus
- Corrupt stored values must never produce NaN or injected SVG.
- Open-door preview must not change glass pricing.
- Changing preset must visibly alter storage and update drawer cost.
- 320 px controls and scene must fit and remain keyboard usable.
- Reduced motion users must not see animated transitions.

### Task 1: Settings, presets and estimator
Files: dist/configurator-model.mjs, tests/configurator.test.mjs.
Interfaces: normalizeConfig(input), estimateConfig(config), configEnquiry(config), presets, defaultConfig.
- [x] Write tests: malformed settings clamp/default; each preset differs; dimensions increase estimates; glass/lighting/profile costs increase; default lower/upper finite; WhatsApp text explicitly unconfirmed.
- [x] Observe missing-module failure, implement pure functions, run passing tests.

### Task 2: Visual configurator
Files: dist/configurator.html, configurator.css, configurator-scene.mjs, configurator-app.mjs; index.html, catalog.html, styles.css links/teaser.
- [x] Render three-bay wardrobe with depth, glass, hanging clothing, folded clothing, drawers, shelves, LED strips, dimensions.
- [x] Wire accessible button groups/ranges, local persistence, open doors, reset, price breakdown and enquiry link.
- [x] Verify desktop/mobile interactions and visual differences, all previous tests, JS syntax.

### Task 3: Deliver
- [x] Review, fix observed issues, update README, source archive, screenshot.
- [ ] Package exact pushed source and publish same private Site; verify terminal success.

Ruling: proceed within user's explicit selected features and existing build authorization; use current site checkout and inline execution. No additional design/permission loop needed.

Verification: 16 tests passed. Browser found portrait price overflow and short-landscape sticky obstruction; both fixed and rechecked. Fresh read-only review identified the same landscape issue; no other material findings.

