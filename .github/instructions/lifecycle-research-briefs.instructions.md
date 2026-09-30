---
name: Lifecycle research briefs
description: Author durable Research-stage evidence records in the approved planning or delivery locations.
applyTo: 'docs/{planning,delivery}/**/[0-9][0-9][0-9]-research-brief.md'
---

# Lifecycle research briefs

Use this guidance only for the durable `research-brief.md` record produced by a Research stage.

## Required content

- Follow the [research brief template](../skills/codebase-research/research-brief-template.md). New records use `<NNN>-research-brief.md`, with exactly three ASCII decimal digits and an independent folder-local sequence for this suffix; existing unprefixed records are legacy and are not renamed or implicitly migrated.
- Apply the shared [RPIR lifecycle core](../skills/rpir-lifecycle-core/SKILL.md) for inspected source-neutral input, direct provenance and phase boundaries; this instruction applies only when a numbered local Research record is written, not to every Research output.
- Identify the lifecycle context in the title or metadata:
  - planning records identify the initiative slug;
  - delivery records identify the Work Item ID, short slug, and tracker URL when one exists.
- Include the question and scope, success criteria, cited evidence, existing patterns, assumptions, options and trade-offs, risks and constraints, a conditional Open questions section, and recommendation.
- Cite repository files, symbols, sources, or observed behavior for material claims. Separate facts from assumptions and identify unknowns rather than inventing them.
- Record subject, stable draft identity, `Draft` or `Blocked` state, revision, unresolved decisions, original channel/locator and inspected snapshot/version or fingerprint. For an actual numbered local source record, record its verified canonical repository-relative identity with a matching direct validated one-hop renderable Markdown link. Otherwise record its actual source/version, not a fabricated local path or link. Raw aliases and Markdown destinations never select a local record. Allocate numbered records with matching-suffix inventory, `001` or maximum-valid-prefix-plus-one, immediate reinspection and no overwrite; stop on malformed inventory or collision.
- Persist new or amended local working Research briefs with `Status: In progress`; Research never sets `Completed`. Initial `/plan` with the actual inspected Research version completes and approves it within that invocation. Only an eligible numbered local brief may receive a status-only `Completed` write after full preimage/postimage and direct-link verification; for another source, record the sign-off in the receiving plan without inventing a local write. Freeze each agreed version separately before further draft edits; never reopen or overwrite an agreed historical version.
- Resolve agent-discovered material unknowns through [agent-question-resolution](../skills/agent-question-resolution/SKILL.md) before completion or handoff. Include **Open questions** only when it names a developer-declared intentionally open or unknown question; otherwise omit the section.
- State that the record captures Research evidence only, is not an approval or Plan authority, and does not authorize or automatically submit the Plan handoff.

## Source of truth

- Before a Work Item is created or imported, a local planning record, when used, is the reviewable working draft.
- After creation or import, the external tracker is authoritative for workflow state, priority, assignment, and tracker discussion.
- During delivery, the local research brief is a versioned evidence record or snapshot, not an independent source of workflow truth.

## Boundaries

- Preserve the selected numbered filename and lifecycle folder layout for real local records; a valid non-local or non-numbered Research document can still be the `/plan` predecessor after its content and version are inspected.
- Amend only the exact named in-progress Research record when the applicable role boundary permits it; a completed record is not silently reopened, and a distinct Research pass follows its separate allocation controls.
- Do not turn the research brief into a chat transcript, implementation plan, code change, tracker update, or approval record.
- Do not create parent `README.md` files or other lifecycle artifacts unless a separate approved scope explicitly requests them.
