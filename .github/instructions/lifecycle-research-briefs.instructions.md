---
name: Lifecycle research briefs
description: Author durable Research-stage evidence records in the approved planning or delivery locations.
applyTo: 'docs/{planning,delivery}/**/[0-9][0-9][0-9]-research-brief.md'
---

# Lifecycle research briefs

Use this guidance only for the durable `research-brief.md` record produced by a Research stage.

## Required content

- Follow the [research brief template](../skills/codebase-research/research-brief-template.md). New records use `<NNN>-research-brief.md`, with exactly three ASCII decimal digits and an independent folder-local sequence for this suffix; existing unprefixed records are legacy and are not renamed or implicitly migrated.
- Identify the lifecycle context in the title or metadata:
  - planning records identify the initiative slug;
  - delivery records identify the Work Item ID, short slug, and tracker URL when one exists.
- Include the question and scope, success criteria, cited evidence, existing patterns, assumptions, options and trade-offs, risks and constraints, a conditional Open questions section, and recommendation.
- Cite repository files, symbols, sources, or observed behavior for material claims. Separate facts from assumptions and identify unknowns rather than inventing them.
- Record the exact lifecycle folder and artifact path, the allocation/provenance basis, and any exact source paths used. Allocation requires matching-suffix inventory inspection, `001` or maximum-valid-prefix-plus-one, immediate pre-create reinspection, and no overwrite; stop on malformed or inaccessible inventory or collision. Never infer the current or approved artifact from the highest prefix, recency, or suffix alone.
- Resolve agent-discovered material unknowns through [agent-question-resolution](../skills/agent-question-resolution/SKILL.md) before completion or handoff. Include **Open questions** only when it names a developer-declared intentionally open or unknown question; otherwise omit the section.
- State that the record captures Research evidence only, is not an approval or Plan authority, and does not authorize or automatically submit the Plan handoff.

## Source of truth

- Before a Work Item is created or imported, the planning record is the reviewable working draft.
- After creation or import, the external tracker is authoritative for workflow state, priority, assignment, and tracker discussion.
- During delivery, the local research brief is a versioned evidence record or snapshot, not an independent source of workflow truth.

## Boundaries

- Preserve the selected exact numbered filename and lifecycle folder layout; use exact repository-relative paths for links and handoffs.
- Do not turn the research brief into a chat transcript, implementation plan, code change, tracker update, or approval record.
- Do not create parent `README.md` files or other lifecycle artifacts unless a separate approved scope explicitly requests them.