---
name: wiki-maintenance
description: Maintain repository-managed Markdown wiki pages with bounded anatomy, navigation, and source validation; use for drafting or updating approved wiki content and indexes.
user-invocable: true
---

# Wiki maintenance

Use this Skill for repository-managed Markdown wiki work. It provides reusable documentation guidance; it does not own a role, approve work, or authorize edits.

## Inputs and boundaries

- Start from the exact approved page, index, and navigation targets. Do not broaden the target set from nearby files or inferred reader needs.
- Use the existing Research → Plan → Implement → Review process for substantive changes. Follow the [RPIR lifecycle guidance](../rpir-lifecycle-core/SKILL.md) and the [implementation validation checklist](../safe-implementation/validation-checklist.md); those resources remain authoritative.
- Treat `docs/` content as repository-managed Markdown. Do not introduce hosted-wiki integration, authentication, publishing, remote effects, scripts, or command-based work.
- Stop and report a gap when a material fact lacks a canonical repository source or a required target, audience, navigation path, or acceptance decision is unknown.

## Procedure

1. **Discover.** Read the approved targets, their nearby index or navigation pages, existing inbound and outbound links, and the canonical sources cited by the content. Identify the intended audience and the reader path into and out of each page.
2. **Bound the scope.** List the exact page and index files to change. Keep policy, lifecycle, packaging, and generated truth at their canonical locations; link to them rather than copying or reinterpreting their authority.
3. **Draft or update.** Start from the [wiki page template](templates/wiki-page.md). Keep the purpose and audience clear, distinguish prerequisites from procedure, and preserve the page's established terminology and reader flow.
4. **Maintain navigation.** Update only named indexes, tables of contents, and related links within the approved scope. Prefer repository-relative links and check both directions: the page is reachable from its index, and its links lead to existing intended destinations.
5. **Validate structure and facts.** Apply the [wiki validation checklist](references/wiki-validation-checklist.md). Check headings, links, source provenance, duplication, stale claims, accessibility, and next steps by manual inspection when automation is unavailable.
6. **Report gaps.** Record unresolved factual, navigation, scope, or validation gaps separately from completed checks. Stop for Research or Plan clarification when the gap is material; do not fill it with an invented fact or an unapproved target.

## Deliverable

Return the changed or proposed exact paths, audience and purpose, source references, navigation updates, checks performed, unavailable checks, and remaining gaps. Keep substantive edits within the approved RPIR scope.
