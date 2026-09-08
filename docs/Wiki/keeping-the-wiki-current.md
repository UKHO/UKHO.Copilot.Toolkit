# Keeping the Wiki current

## Purpose and audience

**Purpose:** Provide a bounded, repeatable way to maintain the repository-managed Markdown Wiki without creating a competing policy source, widening the target set, or introducing automation.

**Audience:** Toolkit maintainers and reviewers making substantive changes to the approved Wiki pages. Readers should be familiar with repository-relative Markdown links and the Research → Plan → Implement → Review (RPIR) lifecycle.

## Prerequisites

- Start with the exact approved page targets and the relevant canonical sources.
- Read the [Wiki maintenance skill](../../.github/skills/wiki-maintenance/SKILL.md), [Wiki page template](../../.github/skills/wiki-maintenance/templates/wiki-page.md), and [Wiki validation checklist](../../.github/skills/wiki-maintenance/references/wiki-validation-checklist.md).
- Treat `.github/` policy, lifecycle records, manifest data, and artifact metadata as canonical sources rather than copying their bodies into Wiki pages.

## Content

### Exact targets and scope

For this Wiki initiative, the approved root and page inventory are:

- `docs/Wiki/index.md`
- `docs/Wiki/choose-an-artifact.md`
- `docs/Wiki/rpir.md`
- `docs/Wiki/lifecycle-evidence-and-authority.md`
- `docs/Wiki/maintain-the-toolkit.md`
- `docs/Wiki/artifact-catalogue.md`
- `docs/Wiki/keeping-the-wiki-current.md`

`README.md` is the sole approved inbound navigation target outside `docs/Wiki/`. Future Wiki creation requires an explicit developer-selected repository-contained non-lifecycle parent, with the exact root derived as `<selected-parent>/Wiki/` and the page, index, and navigation inventory named in approved scope. Do not infer a location or add pages, indexes, customization artifacts, maintenance scripts, hosted-Wiki integration, commands, or packaging changes outside that approved root and inventory. A target or hierarchy change requires a Plan-stage amendment before implementation.

### Canonical sources and source verification

1. Identify the claim, navigation destination, or inventory entry that needs maintenance.
2. Verify material facts against the owning canonical source: `.github/` policy and skills for operational rules, `package.json` for manifest and packaging inventory, and lifecycle records for their own authority and status.
3. Link to the source with a repository-relative path; summarize only what readers need and do not reproduce artifact bodies or silently reinterpret policy.
4. When a source is missing, contradictory, inaccessible, or materially uncertain, stop and report the gap rather than inventing a value.

For the artifact inventory, compare every listed path and activation model with the current `package.json` arrays and the corresponding `.github` metadata. Recheck the distinction between source artifacts and manifest-contributed artifacts.

### Relative navigation and page anatomy

- Use repository-relative links with descriptive link text; do not use absolute URLs for repository pages or rely on unexplained “here” links.
- Check both directions: an approved index or parent reaches the page, and the page reaches its canonical references, related pages, and next steps.
- Preserve the page template anatomy: one title, **Purpose and audience**, **Prerequisites**, **Content**, **Canonical references**, **Related links**, and **Next steps**.
- Keep consumer and maintainer routes distinct, and keep lifecycle authority in its canonical source.

### RPIR and manual checks

Use [RPIR](rpir.md) for the phase and handoff summary, and [Lifecycle evidence and authority](lifecycle-evidence-and-authority.md) for plan authority and the non-authorizing role of lifecycle evidence. Apply the repository's [canonical policy](../../.github/copilot-instructions.md) for the exact approval, scope, and reporting controls.

Before completion, manually:

1. confirm every changed file is an exact approved target;
2. inspect headings, prerequisites, lists, tables, accessibility, and required page sections;
3. resolve every changed relative link to an existing intended file or section;
4. trace inbound and outbound reader paths without dead ends;
5. compare each material claim with its canonical source and check for duplication, contradiction, or staleness;
6. inspect the final changed-file set and confirm no script, tool, command, customization, package, or remote integration was added.

No approved Markdown or link-check command is available for this scope. Automated Markdown, link, rendered-site, installed-behavior, and hosted-Wiki checks are therefore unavailable; do not substitute the VSIX packaging scripts or claim command-based validation.

## Canonical references

- [Wiki maintenance skill](../../.github/skills/wiki-maintenance/SKILL.md) — authoritative scope, procedure, and reporting boundaries.
- [Wiki page template](../../.github/skills/wiki-maintenance/templates/wiki-page.md) — required page structure.
- [Wiki validation checklist](../../.github/skills/wiki-maintenance/references/wiki-validation-checklist.md) — manual validation expectations.
- [Repository guidance](../../.github/copilot-instructions.md) — canonical policy and RPIR controls.

## Related links

- [Artifact catalogue](artifact-catalogue.md) — current paths, purposes, activation models, and maintenance triggers.
- [VSIX packaging guide](../vsix-packaging.md) — packaging-specific documentation, outside ordinary Wiki upkeep scope.

## Next steps

- For a substantive change, obtain the applicable RPIR approval and use only the exact approved target set.
- Re-read changed pages and manually resolve every changed link before handoff.
- Report completed checks, unavailable automation, factual or navigation gaps, and any scope deviation; do not mark lifecycle plan checkboxes from this guidance page.
