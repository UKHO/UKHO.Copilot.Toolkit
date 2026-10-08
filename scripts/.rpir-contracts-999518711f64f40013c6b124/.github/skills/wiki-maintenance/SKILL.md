---
name: wiki-maintenance
description: Maintain repository-managed Markdown wiki pages with bounded anatomy, navigation, and source validation; use for drafting or updating approved wiki content and indexes.
user-invocable: true
---

# Wiki maintenance

## Trigger and boundary

Use this Skill for repository-managed Markdown Wiki work. It does not approve edits or select a lifecycle location. For **maintenance** of an approved documentation outcome, inspect nearby pages, indexes and links; repair necessary related-page/navigation issues within that outcome rather than treating a projected page list as an exact whitelist. Preserve canonical source-backed facts and user work. New requirements, material audience/behavior changes, unsupported facts or additional external effects require an engineer decision.

For **new Wiki creation**, the engineer must explicitly select an exact repository-contained, non-lifecycle parent. Derive only `<selected-parent>/Wiki/`; do not infer a parent, default to `docs/`, or use RPIR documentation-root selection as Wiki approval. The creation scope must identify its pages, index and navigation intent; every created Wiki page/index/navigation target stays in that root. A nonexistent parent may be created only when explicitly selected. Do not create a parent, Wiki root or target in `docs/planning/`, `docs/delivery/`, a verified `<documentation-directory>/copilot/` RPIR parent or numbered topic, or another lifecycle namespace. New targets outside the chosen root or materially expanded documentation outcomes need a decision.

Follow the [RPIR lifecycle core](../rpir-lifecycle-core/SKILL.md) and [implementation validation checklist](../safe-implementation/validation-checklist.md) for the active stage. No hosted-wiki integration, authentication, publishing or remote effect is implied.

## Procedure

1. Read the intended audience, approved outcome, existing page and nearby navigation, inbound/outbound links and canonical sources. For creation verify the selected parent/root before any write.
2. Draft from the [wiki page template](templates/wiki-page.md), preserving established terminology and reader flow. Keep policy, lifecycle and packaging truth at their canonical source and link rather than restating authority.
3. Repair related existing pages/indexes and links when needed to deliver the approved maintenance outcome; describe actual changed paths. Do not silently create a new Wiki root or invent unsourced claims. Ask promptly about genuine material scope, ownership or location choices while continuing independent safe work.
4. Validate with the [wiki validation checklist](references/wiki-validation-checklist.md): inspect source fidelity, headings, navigation both ways, accessibility and next steps. Use manual inspection when automation is unavailable; permitted checks may be run through actually available capability, without a compulsory Runner route. Record **Performed**, **Failed**, **Unavailable**, **Not run** accurately and recheck repaired links.

## Deliverable

Report actual pages and related navigation changes, sources, validation results and remaining gaps. A documentation edit does not authorize lifecycle transitions; material decisions remain engineer-owned.
