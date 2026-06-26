# Public Release Audit

Audit date: 2026-06-26

Source reviewed: local `ai-to-ppt` skill.

Target repository: `illustrator-to-editable-ppt-skill`.

## Summary

The source skill contains a small, reusable conversion workflow and three core scripts. No customer source files, screenshots, logos, PDFs, PPTX files, font files, tokens, accounts, secrets, or environment files were found in the source skill directory.

The public copy intentionally excludes:

- `agents/`
- `scripts/__pycache__/`
- any generated export folders
- any customer source material
- any local output or error files

## Findings

| Category | Source location | Public action |
| --- | --- | --- |
| Local absolute Illustrator path example | `SKILL.md`, `references/workflow.md` | Rewritten as generic launch guidance. |
| Local absolute export path | `scripts/export_artboard.jsx` | Replaced with relative default `exports/artboard_001`; supports environment override. |
| Local fallback error path | `scripts/export_artboard.jsx` | Replaced with temp-folder fallback. |
| Specific font warning in checklist | `references/pitfalls.md` | Rewritten as generic "do not force all text to one font" guidance. |
| Python bytecode cache | `scripts/__pycache__/` | Excluded from public repo. |
| Agent prompt metadata | `agents/openai.yaml` | Excluded; not needed for public skill release. |

## Sensitive Content Checklist

- Customer files, project names, logos, screenshots, source .ai/PDF/PPT: not found in source skill; excluded by `.gitignore`.
- Local absolute paths: found in docs and JSX; sanitized in public copy.
- Font files: not found; ignored by `.gitignore`.
- Tokens, accounts, keys, environment variables: not found; ignored by `.gitignore`.
- Temporary export files, caches, and error logs: `__pycache__` found; excluded and ignored.

## Files Approved For Public Copy

- `SKILL.md`, after public rewrite.
- `scripts/export_artboard.jsx`, after path sanitization.
- `scripts/build_pptx.py`, after removing project-specific font aliases and relying on optional user-provided font maps.
- `scripts/verify_pptx.py`, retained with minor formatting normalization.
- `references/workflow.md`, rewritten for public usage.
- `references/pitfalls.md`, rewritten for public usage.
- `references/user-checklist.md`, rewritten for public usage.

## Manual Checks Before Publishing

- Confirm the repository contains no real customer examples.
- Confirm no private project or client names are added later.
- Confirm `examples/` contains only placeholders or fully authorized, desensitized examples.
- Confirm the license owner line should remain generic or be replaced with the intended public copyright holder.
- Confirm the GitHub repository name and release metadata.

