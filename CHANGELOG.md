# Changelog

## Unreleased

- Removed automatic full-page non-text compositing so complex design artwork remains exported as separate PNG layers.
- Removed the public `AI_TO_PPT_APPEARANCE_MODE` mode switch.
- Kept native PPT text gradients limited to direct text gradients or reliably matched Pathfinder/compound-shape text outlines.

## v0.1.0 - 2026-06-26

- Initial public-ready release.
- Added Illustrator JSX exporter for transparent PNG layers and editable text metadata.
- Added PPTX builder that reconstructs slide size, image layers, editable text boxes, fonts, colors, wrapping, and paragraph alignment.
- Added PPTX verifier for slide size, object counts, wrapping markers, alignment markers, font markers, and glow/blur checks.
- Added public documentation, usage checklist, pitfalls, privacy guidance, and release audit.
