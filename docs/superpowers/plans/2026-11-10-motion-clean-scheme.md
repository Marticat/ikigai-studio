# Motion and clean schematic

User requests more engaging animations and an empty schematic in the configurator. Keep existing gray design, supplier catalog and photographic visualization. Remove only decorative clothes, folded textiles, hangers and shoes from generated SVG; retain layout, shelf/rail/drawer counts, glass, lighting and dimensions.

Add a shared progressive motion layer on the home, catalog and configurator: staggered entrance, photo reveal, shallow scroll depth, slow visible hero camera, hover feedback, buttons/dialog transitions, configurator change fade. Content remains visible without animation JS; reduced-motion turns off CSS and JS animation, mobile limits depth. No scroll capture, cursor replacement or autoplay slides. Async catalog cards are registered on insertion. Dimension sliders do not restart scene animation.

Validation: structural schematic test for all three layouts and dimensions; existing regression suite; desktop and mobile browser interaction, SVG inspection, no overflow or errors; source review; publish to same owner-private Site and retain durable catalog data.
