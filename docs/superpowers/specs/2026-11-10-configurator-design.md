# IKIGAI visual configurator

User selected live glass/profile/lighting changes and three furnishing presets after the price-estimator proposal. Implement those in the existing gray website, including the earlier request for an approximate estimate. This is a conceptual wardrobe, not a technically approved MEIDU SKU or binding quotation.

Approaches considered: a numeric calculator alone (simpler but does not meet the selected visualization requirement); a live visual configurator (selected by the user's two requested visual features). Use a responsive SVG interior elevation with depth and materials, avoiding heavyweight 3D dependencies. This implementation choice belongs to the builder.

Controls: 3 presets (clothes, shelves, mixed), graphite/bronze/silver profiles, open/clear/smoked/bronze glass, lighting off/warm/neutral. Width 180–420 cm and height 220–300 cm, 10 cm increments; fixed conceptual depth 60 cm. Three bays; changing dimensions changes silhouette and dimension labels. Glass can be temporarily opened to inspect the interior without changing the chosen product or estimate. Persist configuration locally; reset to default; include the chosen options in the existing WhatsApp enquiry flow without sending anything.

Pricing is explicitly demonstration-only, unconfirmed by IKIGAI. At 260 cm high: base 165000 KZT per width metre including standard shelves/rails; drawers 18000 each; glass 110000 per width metre (smoked multiplier 1.08, bronze 1.12); bronze profile adds 8% of base, silver 3%; lighting 15000 per width metre. Height scales base/glass. Display a ±15% range rounded outward to 10000 KZT. Excludes delivery, installation and extra mechanisms. No payment or price updates to supplier product cards.

Dedicated configurator.html, accessible from main/catalog navigation and a landing teaser. Retain existing owner-private audience and site ID. No PDF export requested in this selection. Verify estimates, invalid restored settings, distinct presets, dimensions, mobile, keyboard and visual material changes.
