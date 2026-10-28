---
name: maintain-copilot-artifacts
description: Refine wording in Copilot artifacts while preserving their behavioral contracts; use for bounded artifact maintenance and rule-mapped wording changes.
user-invocable: true
---

# Maintain Copilot artifacts

Use a bounded, evidence-led method to improve wording without silently changing an artifact's behavior or interfaces.

## Trigger and scope

Use this Skill for a deliberately bounded wording refinement or maintenance batch involving active Copilot customizations, repository policy, or resources linked by those artifacts. Inspect only the relevant source and consumers; historical lifecycle records and retained test-staging trees are evidence or fixtures, not rewrite targets.

Do not use this method to settle a policy contradiction, delete a rule as obsolete, move rules across loading boundaries, or choose a new behavior. Surface the issue for an engineer-owned decision instead.

## Inputs

- **Required:** The current source version, approved outcome and boundaries for the active phase, relevant consumers/resources, and applicable acceptance criteria.
- **Useful:** Existing tests, links/fragments, metadata, discovery/registration contracts, and a stated clarity goal.
- **Unknowns:** Clarify material facts, ownership, behavior, or scope rather than inventing them. Continue independent safe inspection where possible.

## Procedure

1. Bound a small batch and inspect the actual source, relevant linked resources, root policy and consumers. Record a reviewable baseline and protected interfaces; preserve concurrent/user changes.
2. Extract each normative clause before editing. Use the [rule-map template](templates/rule-map.md) to capture actor, scope, obligation, conditions, exceptions, authority, failure/output behavior and source location.
3. Map baseline rules to candidate wording and candidate normative clauses back to baseline rules. Every removed sentence needs complete retained equivalents; mark ambiguity unresolved rather than choosing a behavior.
4. Make precise in-scope edits. Preserve actors, modal strength, qualifiers, role-local reinforcement, metadata, names, paths, headings, links/fragments, discovery/loading boundaries, tools, routes, delegation, handoffs and output contracts unless an approved outcome explicitly changes them.
	For model-related artifacts, preserve the [shared profile](../agent-model-selection/SKILL.md), its role classification and supported configuration projections, override/fallback boundaries and harness evidence; do not infer effective settings or picker precedence from metadata. Preserve each role's own canonical profile effort declaration as `reasoning-effort` beside its model, without requiring runtime support proof before declaration; do not default all roles to `high` or inherit another role's effort. Distinguish recommended effort, declared intent, supported model configuration and separately observed effective effort. Runtime consumption, compatibility and harmless ignoring are unestablished; disclose unknown support. Do not assume root effort reaches a child; effort declarations grant no authority.
5. Check the full diff, interfaces, linked resource bodies/fragments and relevant owner-scoped assertions. Diagnose a failure as a possible lost rule, stale fixture or unrelated issue; preserve test intent and negative detection when making an approved test repair.
6. Obtain independent semantic review against the baseline and completed rule map. Treat the map as review evidence, not a competing permanent policy or approval.
7. Evaluate behavior separately only when explicitly authorized. Compare fresh sessions with consistent runtime, model, inputs, tools, settings and instruction sources; assess expected decisions/tool traces across repeated boundary cases, not identical prose. Static checks and review do not establish runtime equivalence.
8. Report actual changes, evidence, precision benefit, passed/failed/unavailable/not-run checks and residual uncertainty. Do not claim semantic proof or runtime equivalence from finite checks.

## Limits and authority

- This Skill supplies a method only; it grants no edit, execution, delegation, lifecycle-transition, approval or acceptance authority. Any effect remains subject to the active phase's approved scope and actual permission.
- Do not silently delete, add, relocate, deprecate or reinterpret a normative rule. If preservation is uncertain or a contradiction requires a behavior choice, retain the source wording and ask for an engineer decision.
- Prefer the smallest useful change; clarity takes precedence over a word-count target. Do not claim fewer words improve model behavior without separate evidence.
- Do not treat historical records, copied conversations, or retained staging trees as active targets.

## Validation and output

Produce a bidirectional rule map, protected-interface comparison, focused validation evidence, and a concise account of changed paths and unresolved items. Use the [preservation checklist](references/preservation-checklist.md) for manual review. Reuse the existing [Skill authoring](../create-copilot-skill/SKILL.md), [test-design](../test-design/SKILL.md), and [code-review](../code-review/SKILL.md) methods when relevant; this Skill does not replace their schemas or grant their authority.

## Bundled resources

- [Rule-map template](templates/rule-map.md) — temporary, batch-local traceability for source and candidate clauses.
- [Preservation checklist](references/preservation-checklist.md) — review prompts for semantic, interface, test and evidence boundaries.