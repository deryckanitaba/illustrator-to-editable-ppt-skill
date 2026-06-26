# Changelog

## Unreleased

- Added automatic complex-appearance preservation for compound-gradient, clipping, plugin, and non-normal blend artwork via full-context non-text PNG export while keeping text editable.
- Added `AI_TO_PPT_APPEARANCE_MODE` with `auto`, `layers`, and `full-context` modes.
- Skipped zero-area image candidates to avoid blank full-slide PNG artifacts.

## v0.1.0 - 2026-06-26

- Initial public-ready release.
- Added Illustrator JSX exporter for transparent PNG layers and editable text metadata.
- Added PPTX builder that reconstructs slide size, image layers, editable text boxes, fonts, colors, wrapping, and paragraph alignment.
- Added PPTX verifier for slide size, object counts, wrapping markers, alignment markers, font markers, and glow/blur checks.
- Added public documentation, usage checklist, pitfalls, privacy guidance, and release audit.
