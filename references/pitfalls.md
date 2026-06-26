# Pitfalls

- Always open the intended `.ai` file in Illustrator first, and make sure it is the active document.
- Illustrator may show a security prompt before running JSX. The user must explicitly allow it.
- Artboard indexes are zero-based. The first artboard is `0`.
- Do not use the default PowerPoint page size. Derive slide size from the Illustrator artboard.
- Do not make a full-page screenshot and blur or repair the text area. Export non-text graphics as transparent PNG layers, or use the exporter full-context non-text mode for compound gradients and other complex appearances while keeping text editable.
- Do not rasterize text unless the user explicitly accepts non-editable text.
- Do not force every text run into one fallback font. Preserve the font metadata from Illustrator.
- If PowerPoint or WPS cannot resolve a PostScript font name, add a narrow alias for that font only.
- Compound gradients, blend modes, clipped/plugin appearances, complex fonts, special effects, and individual line wrapping still need manual inspection.
- Do not promise perfect conversion for every Illustrator file.
- Text boxes should have no fill, no line, no glow, no blur, and automatic wrapping enabled.
- Preserve center and right alignment from Illustrator paragraph metadata.
- Avoid overly tight text boxes. A small padding helps reduce wrapping differences in PowerPoint/WPS.
- Run `verify_pptx.py` after building the PPTX, and check `manifest.exportMode`; `full-context` means non-text artwork was preserved as one composite PNG.
- Open the result manually and check size, layer order, fonts, wrapping, alignment, special effects, and visual fidelity.
- If Illustrator produces no command-line error, check `export_error.txt` in the configured export directory.
