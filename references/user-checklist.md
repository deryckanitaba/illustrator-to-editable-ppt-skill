# User Checklist

Use this checklist before and after each conversion.

## Before Running

1. Open the `.ai` file in Adobe Illustrator.
2. Confirm the target file is the active Illustrator document.
3. Close unrelated Illustrator files if there is any risk of exporting the wrong document.
4. Confirm the source file loads without missing linked images or missing font warnings.
5. Confirm special fonts are installed locally if font fidelity matters.
6. Decide which artboard should be converted. Remember that the script uses zero-based indexes.

## While Running

1. If Illustrator asks whether to run the script, click continue.
2. Do not close Illustrator while the script is exporting.
3. Do not move or delete files inside the export directory while the script is running.
4. If Illustrator shows an error dialog, capture the message before dismissing it.
5. If Illustrator appears unresponsive for a short period, wait for the export to finish unless it is clearly stuck.

## After Building PPT

1. Open the PPTX in PowerPoint or WPS.
2. Confirm the page size matches the Illustrator artboard.
3. Confirm text can be selected and edited as text.
4. Confirm fonts look close to the source file.
5. Confirm different source fonts were not collapsed into one fallback font.
6. Confirm text has no unexpected background, glow, blur, outline, or colored block.
7. Confirm line breaks and automatic wrapping look reasonable.
8. Confirm centered and right-aligned text preserved alignment.
9. Confirm background graphics, icons, decorative elements, and layer order look correct.
10. Confirm complex fonts, special effects, and any sensitive line breaks were manually checked.

## Useful Feedback

When something is wrong, provide the most concrete detail available:

- Font issue: expected font name or a screenshot of the source font panel.
- Wrapping issue: screenshot of the text box and expected line breaks.
- Layer issue: which object should be above or below another object.
- Visual artifact: screenshot of the exact area.
- Wrong page: confirm the active Illustrator document and the artboard index.
