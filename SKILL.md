---
name: illustrator-to-editable-ppt
description: Convert Adobe Illustrator (.ai) artboards into editable layered PowerPoint (.pptx) files. Use when a user needs Illustrator to PPT conversion, transparent PNG element layers, editable text boxes, WPS/PowerPoint layout preservation, artboard sizing, font/size/color/alignment preservation, or batch conversion of Illustrator pages into presentation slides.
---

# Illustrator To Editable PPT

Use this skill to convert Adobe Illustrator `.ai` artboards into layered, editable PowerPoint slides while preserving visual fidelity and editable text. In this repository, `.ai` means the Illustrator file format, not artificial intelligence.

## Core Rules

- Use the active Illustrator document when possible. The exporter JSX runs inside Illustrator and reads the current document.
- Expect Illustrator to show a script security prompt. Pause and ask the user to click **Continue** before waiting for output.
- Preserve the Illustrator artboard size. Do not force the result into a default 16:9 PowerPoint template.
- Export non-text objects as transparent PNG layers from Illustrator. In `AI_TO_PPT_APPEARANCE_MODE=auto`, preserve complex compound-gradient, clipping, plugin, or non-normal blend appearances by exporting the non-text artwork in full context as a single transparent PNG while keeping text editable. Do not blur, repair, or inpaint text out of a full-page screenshot.
- Rebuild text as editable PPT text boxes. Do not rasterize text unless the user explicitly accepts it. When Illustrator text is paired with Pathfinder/compound-shape gradient lettering, preserve editability by applying a native PowerPoint text gradient (`a:gradFill`) to the PPT text run instead of overlaying a flat solid text color.
- Preserve fonts per text run from Illustrator metadata. Prefer Illustrator `fontFamily` / `fontFullName`; use aliases only for PostScript names that PowerPoint or WPS cannot resolve directly.
- Manually check complex fonts, Pathfinder/compound-shape gradient text, special effects, and individual line wrapping differences. Do not promise perfect conversion for every Illustrator file.
- Keep text boxes with no fill, no line, no glow, and no blur.
- Enable text wrapping in PPT/WPS (`wrap="square"`). Avoid forced `wrap="none"`.
- Map Illustrator paragraph justification into PPT paragraph alignment.

## Standard Workflow

1. Confirm Illustrator is open with the source `.ai` document active.
2. Copy `scripts/export_artboard.jsx` to a scratch folder.
3. Configure the export:
   - edit `ARTBOARD_INDEX` and `OUT_DIR` at the top of the JSX, or
   - set `AI_TO_PPT_ARTBOARD_INDEX` and `AI_TO_PPT_OUT_DIR` environment variables before launching Illustrator.
   - optionally set `AI_TO_PPT_APPEARANCE_MODE` to `auto` (default), `layers`, or `full-context`.
   - optionally set `AI_TO_PPT_TEXT_GRADIENT_MODE` to `auto` (default) or `off`.
4. Run the JSX through Illustrator.
5. If Illustrator asks for script permission, tell the user to click **Continue** and wait.
6. Build PPTX:

```bash
python scripts/build_pptx.py --manifest exports/artboard_001/manifest.json --out output/artboard_001.pptx
```

7. Verify PPTX:

```bash
python scripts/verify_pptx.py output/artboard_001.pptx --manifest exports/artboard_001/manifest.json --show-fonts
```

8. Open the PPTX visually in WPS or PowerPoint and inspect slide size, layer order, text wrapping, centered text, fonts, complex effects, and absence of blurry text remnants.

## Script Roles

- `scripts/export_artboard.jsx`: Illustrator JSX exporter. Produces transparent PNG layer exports or a full-context non-text PNG for complex appearances, plus `manifest.json` with text metadata/runs and optional `textGradient` metadata.
- `scripts/build_pptx.py`: Builds PPTX from the manifest, including native PPT text gradients for marked runs.
- `scripts/verify_pptx.py`: Checks slide size, picture/text counts, optional font markers, wrap/alignment markers, and absence of glow/blur.

## References

Read when needed:

- `references/workflow.md`: Full public workflow, coordinate model, export logic, text reconstruction, and acceptance criteria.
- `references/pitfalls.md`: Common mistakes and conversion guardrails.
- `references/user-checklist.md`: User-facing checklist for each conversion run.
