# Wiki validation checklist

Use this checklist for the exact approved wiki page and navigation targets. Record unavailable checks rather than presenting them as passed.

## Scope and reader path

- [ ] Confirm every changed page and index is an exact approved target; stop for clarification before adding an inferred target.
- [ ] For Wiki creation, confirm the developer explicitly selected an exact repository-contained parent; do not infer a location or default to `docs/`.
- [ ] For Wiki creation, confirm the root is exactly `<selected-parent>/Wiki/` and the approved scope explicitly inventories every page, index, and navigation target.
- [ ] Confirm every created page, index, and navigation target is contained within the selected Wiki root; a new parent may be created only when the developer explicitly selected it.
- [ ] Confirm no creation target, selected parent, or derived Wiki root is in `docs/planning/`, `docs/delivery/`, or another lifecycle namespace.
- [ ] Confirm the page's purpose, audience, prerequisites, content, canonical references, related links, and next steps are present and coherent.
- [ ] Trace the intended reader path from the relevant index to the page and onward to its related or next-step destinations.
- [ ] Confirm each planned index, table-of-contents, or navigation update is named in the approved scope.

## Links and navigation

- [ ] Check every new or changed link uses the repository's relative-link convention.
- [ ] Resolve each changed relative link to an existing intended file or section; inspect link targets manually when automated checking is unavailable.
- [ ] Check inbound navigation: the relevant index or parent page reaches the page.
- [ ] Check outbound navigation: the page reaches its canonical references, related pages, and next steps without dead ends.
- [ ] Check link text describes the destination and does not rely on unexplained "here" links.
- [ ] For Wiki creation, confirm navigation neither infers a location nor reaches outside the selected Wiki root except for canonical sources at their existing locations.

## Facts and provenance

- [ ] Trace each material factual claim to a canonical repository source or an explicitly cited Research result.
- [ ] Link to policy, lifecycle, packaging, or generated truth at its canonical location instead of copying or reinterpreting its authority.
- [ ] Check for duplicated, contradictory, stale, or superseded claims across the changed page and its nearby navigation.
- [ ] Record any material source or factual gap; do not invent a value or silently preserve an uncertain claim.

## Structure and accessibility

- [ ] Use one clear page title and a logical heading hierarchy without skipped levels.
- [ ] Keep paragraphs, lists, tables, and examples readable in the surrounding Markdown style.
- [ ] Use descriptive headings, meaningful link text, and concise reader-first language.
- [ ] Check that prerequisites and next steps make the page usable without relying on hidden context.

## Automation and reporting

- [ ] Perform the available manual or structural checks and name their observed outcome.
- [ ] Mark automated Markdown, link, package, or installed-behavior checks unavailable when no approved capability exists; do not run or invent a substitute.
- [ ] Reconcile selected-parent, exact-root, inventory, containment, no-inferred-location, lifecycle-exclusion, and changed-link outcomes with the approved scope; record any gap separately.
- [ ] Report unresolved scope, navigation, factual, accessibility, or validation gaps separately from passed checks.
- [ ] Confirm the final change remains within the approved files and does not add scripts, tools, commands, remote integration, or authority.
