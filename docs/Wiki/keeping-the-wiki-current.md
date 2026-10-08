---
title: Keeping the Wiki current
description: Bounded Wiki maintenance, source verification and navigation checks
---

## Purpose and audience

**Purpose:** Provide a source-backed way to maintain the repository-managed Markdown Wiki without creating a competing policy source or silently broadening the approved outcome.

**Audience:** Toolkit maintainers and reviewers making substantive changes to the approved Wiki pages. Readers should be familiar with repository-relative Markdown links and the Research → Plan → Implement → Review (RPIR) lifecycle.

## Prerequisites

- Start with the approved documentation outcome, intended pages and relevant canonical sources; check nearby links for necessary in-outcome repairs.
- Read the [Wiki maintenance skill](../../.github/skills/wiki-maintenance/SKILL.md), [Wiki page template](../../.github/skills/wiki-maintenance/templates/wiki-page.md), and [Wiki validation checklist](../../.github/skills/wiki-maintenance/references/wiki-validation-checklist.md).
- Treat `.github/` policy, lifecycle records, manifest data, and artifact metadata as canonical sources rather than copying their bodies into Wiki pages.

## Content

### Existing pages and scope

The existing root and page inventory are:

- `docs/Wiki/index.md`
- `docs/Wiki/choose-an-artifact.md`
- `docs/Wiki/rpir.md`
- `docs/Wiki/lifecycle-evidence-and-authority.md`
- `docs/Wiki/maintain-the-toolkit.md`
- `docs/Wiki/artifact-catalogue.md`
- `docs/Wiki/keeping-the-wiki-current.md`

`README.md` provides inbound navigation outside `docs/Wiki/`. For an approved maintenance outcome, an anticipated page list is not an automatic exhaustive whitelist: inspect and repair necessary related existing pages, index entries and links within that outcome, preserving unrelated work and reporting actual changes. New requirements, materially changed reader behavior or additional external effects need an engineer decision. Future **new Wiki creation** requires an explicit engineer-selected repository-contained non-lifecycle parent, with the exact root derived as `<selected-parent>/Wiki/` and pages, index and navigation intent in the approved scope. Never infer a parent, create a lifecycle-namespaced Wiki or silently start hosted-Wiki integration, commands or packaging work.

### Canonical sources and source verification

1. Identify the claim, navigation destination, or inventory entry that needs maintenance.
2. Verify material facts against the owning canonical source: `.github/` policy and skills for operational rules, `package.json` for manifest and packaging inventory, and lifecycle records for their own authority and status.
3. Link to the source with a repository-relative path; summarize only what readers need and do not reproduce artifact bodies or silently reinterpret policy.
4. When a source is missing, contradictory, inaccessible or materially uncertain, investigate the gap and ask about an engineer-owned decision rather than inventing a value; continue unaffected safe maintenance. During a deliberate `.github` disablement, inspect the corresponding `.github-old` working source but keep canonical Wiki links pointing to the intended post-rename `.github` destination; resolve those links after reactivation.

For the artifact inventory, compare every listed path and activation model with the current `package.json` arrays and the corresponding `.github` metadata. Recheck the distinction between source artifacts and manifest-contributed artifacts. Keep repository Run Books under `docs/run-books/` as human-readable guidance outside the Wiki, not Script Runner selection input.

### Relative navigation and page anatomy

- Use repository-relative links with descriptive link text; do not use absolute URLs for repository pages or rely on unexplained “here” links.
- Check both directions: an approved index or parent reaches the page, and the page reaches its canonical references, related pages, and next steps.
- Preserve the page template anatomy: one title, **Purpose and audience**, **Prerequisites**, **Content**, **Canonical references**, **Related links**, and **Next steps**.
- Keep consumer and maintainer routes distinct, and keep lifecycle authority in its canonical source.

### RPIR and manual checks

Use [RPIR](rpir.md) for the phase and handoff summary, and [Lifecycle evidence and authority](lifecycle-evidence-and-authority.md) for plan authority and the non-authorizing role of lifecycle evidence. Apply the repository's [canonical policy](../../.github/copilot-instructions.md) for the exact approval, scope, and reporting controls.

Before completion, manually:

1. confirm each changed file supports the approved documentation outcome and explain necessary related-page or navigation repairs;
2. inspect headings, prerequisites, lists, tables, accessibility, and required page sections;
3. resolve every changed relative link to an existing intended file or section;
4. trace inbound and outbound reader paths without dead ends;
5. compare each material claim with its canonical source and check for duplication, contradiction, or staleness;
6. inspect the final changed-file set for unapproved new scope, scripts, tools, package or remote integration.

Use manual inspection when automated checks are unavailable; permitted local validation can use an actually available capability without a mandatory Runner route. Report which Markdown, link, rendered-site, installed-behavior and hosted-Wiki checks were performed, failed, unavailable or not run. Neither the VSIX packaging scripts nor static checks prove installed or hosted-Wiki behavior.

## Canonical references

- [Wiki maintenance skill](../../.github/skills/wiki-maintenance/SKILL.md) — authoritative scope, procedure, and reporting boundaries.
- [Wiki page template](../../.github/skills/wiki-maintenance/templates/wiki-page.md) — required page structure.
- [Wiki validation checklist](../../.github/skills/wiki-maintenance/references/wiki-validation-checklist.md) — manual validation expectations.
- [Repository guidance](../../.github/copilot-instructions.md) — canonical policy and RPIR controls.

## Related links

- [Artifact catalogue](artifact-catalogue.md) — current paths, purposes, activation models, and maintenance triggers.
- [VSIX packaging Run Book](../run-books/vsix-packaging.md) — packaging-specific human guidance and independently checked metadata, outside ordinary Wiki upkeep scope.

## Next steps

- For a substantive change, follow the [RPIR handoff](rpir.md) with the inspected agreed document version; make necessary in-outcome maintenance/link repairs without inventing a new Wiki or material scope.
- Re-read changed pages and manually resolve every changed link before handoff.
- Report performed, failed, unavailable and not-run checks, factual or navigation gaps and material scope questions; this guidance page cannot mark lifecycle plan checkboxes.
