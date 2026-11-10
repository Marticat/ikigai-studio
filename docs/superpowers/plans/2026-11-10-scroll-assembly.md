# Scroll assembly implementation plan

**Goal:** Implement the user-approved abstract line drawing of a wardrobe assembling with scroll, followed by glass doors closing and gently opening.

**Design:** Place after the intro and before the catalog, within the existing gray design. No clothes or visible marketing labels. Prefer a native SVG over video or a 3D library: crisp outlines at every viewport, no download/dependency, directly reversible with scrolling. SVG perspective is illustrative, not a technical drawing. Keep normal page scrolling. Reduced-motion and no-JS users see a completed static drawing in a shorter section.

**Architecture:** A static SVG embedded in index.html, an isolated assembly.css, and assembly.mjs updating path strokes, part offsets and door polygons from clamped scroll progress. Sticky scene with mobile-specific scroll distance; IntersectionObserver gates work, passive scroll events request a single animation frame. Accessible localized description and keyboard skip link.

**Validation:** Inspect early/middle/final DOM geometry and screenshots at desktop/mobile sizes; verify no horizontal overflow, reverse scroll, reduced-motion fallback, independent hero slideshow, and no JS errors. Build and publish through existing private Site workflow, preserving catalog and access.

- Add SVG, styles, localized accessible labels and deterministic scroll states.
- Verify viewport behavior and stages; fix observed issues.
- Build, publish same Site, and update source archive.
