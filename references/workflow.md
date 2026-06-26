# Workflow

This workflow converts one Adobe Illustrator `.ai` artboard into one editable PPT slide. Here, `.ai` means the Illustrator file format, not artificial intelligence.

## Goal

Convert Illustrator `.ai` artboards into PowerPoint pages where non-text graphics are preserved as transparent PNG layers and text is rebuilt as editable PPT text boxes.

The conversion should preserve, as far as practical:

- artboard size
- object position and dimensions
- layer order
- font family and style
- font size
- text color
- line breaks and wrapping
- paragraph alignment

Complex fonts, special effects, and individual line wrapping differences still require manual inspection in PowerPoint or WPS.

## Process

1. Open the `.ai` source file in Adobe Illustrator.
2. Make sure the target document is the active Illustrator document.
3. Copy `scripts/export_artboard.jsx` to a working folder.
4. Configure:

```javascript
var ARTBOARD_INDEX = 0;
var OUT_DIR = 'exports/artboard_001';
var APPEARANCE_MODE = 'auto'; // auto, layers, full-context
```

`ARTBOARD_INDEX` is zero-based. The first artboard is `0`. `APPEARANCE_MODE=auto` detects compound gradients and other complex appearances and exports non-text artwork in full context when needed; use `layers` to force per-object PNG layers, or `full-context` to force visual-preservation mode.

5. Run the JSX with Illustrator using the launch method for your operating system and Illustrator installation.
6. If Illustrator asks whether to allow the script, click continue.
7. Confirm the export directory contains:

- `manifest.json`
- `images/layer_001.png`, or `images/artwork_full_context.png` when complex-appearance preservation is active
- any additional `images/layer_*.png` files when layer mode is active

8. Build the PPTX:

```bash
python scripts/build_pptx.py --manifest exports/artboard_001/manifest.json --out output/artboard_001.pptx
```

9. Verify the PPTX:

```bash
python scripts/verify_pptx.py output/artboard_001.pptx --manifest exports/artboard_001/manifest.json --show-fonts
```

10. Open the PPTX in PowerPoint or WPS and compare it against the source Illustrator artboard.

## Coordinates And Size

Illustrator uses points. PowerPoint stores dimensions in EMU.

- `1 inch = 72 pt`
- `1 inch = 914400 EMU`
- `1 cm = 360000 EMU`

The PPT slide size must always be derived from `manifest.artboardRect`.

Example: an Illustrator artboard of `3840 x 2160 pt` becomes:

- width: `3840 / 72 = 53.333 in = 135.47 cm`
- height: `2160 / 72 = 30 in = 76.2 cm`

## Export Logic

- Process objects that intersect the target artboard.
- Treat Illustrator `TextFrame` objects as text metadata, not image layers.
- Treat non-text top-level objects or groups as PNG layer candidates.
- In `layers` mode, temporarily hide all other objects while each PNG layer is captured.
- In `auto` mode, detect compound-gradient, clipping, plugin, or non-normal blend appearances; when found, hide text and export all non-text artwork in full context as `artwork_full_context.png`.
- Export PNG layers with transparency enabled.
- Record each PNG layer path, export mode, and bounds relative to the artboard.
- Restore Illustrator layer and item hidden/locked state after export.
- Write all metadata to `manifest.json`.

## Text Reconstruction Logic

For each Illustrator text frame, export:

- contents
- visible bounds
- geometric bounds
- font name, family, full name, and style
- font size
- fill color
- leading
- paragraph justification
- orientation
- character runs

When building the PPTX:

- Use geometric and visible bounds to create a slightly padded text box.
- Recreate text as PPT runs so mixed fonts, sizes, and colors can be preserved.
- Prefer `fontFamily` and `fontFullName` over raw PostScript names.
- Use an optional font-map JSON only for fonts that PowerPoint/WPS cannot resolve.
- Map center and right alignment from Illustrator into PPT paragraph alignment.
- Use no fill, no line, no glow, and no blur.
- Set text wrapping to `wrap="square"`.
- Manually inspect complex fonts and individual line wrapping because PowerPoint/WPS text layout can differ from Illustrator.

## Acceptance Criteria

- PPT page size matches the Illustrator artboard.
- PNG count matches `manifest.images`.
- Editable text box count matches `manifest.texts`.
- Text is editable in PowerPoint or WPS.
- Text boxes have no visible fill, line, glow, blur, or background artifact.
- Text wrapping is enabled.
- Center and right alignment are preserved.
- Fonts are not collapsed into a single fallback face.
- Complex fonts, special effects, and individual line wrapping have been manually inspected.
