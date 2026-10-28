# Artifact preservation checklist

Use with a completed batch-local [rule map](../templates/rule-map.md). This checklist guides review; it does not establish equivalence, approval, or permission.

## Contract completeness

- [ ] Every baseline clause has a candidate location or a complete retained equivalent; every candidate normative clause maps back to a baseline rule or an explicitly approved new requirement.
- [ ] Actors, trigger/scope, modal strength, quantifiers, conditions, exceptions, prohibitions, authority, recovery, failure and output behavior are preserved.
- [ ] No sentence is removed merely because it looks repetitive, obsolete, implied, or covered by a distant source. Check whether its role-local reinforcement is still needed.
- [ ] Contradictions, ambiguous scope and missing material facts are recorded as unresolved; no new behavior is selected silently.

## Interfaces and loading boundaries

- [ ] Compare frontmatter, names, descriptions, invocation visibility, headings, paths, anchors, applicability and discovery/registration metadata.
- [ ] Check every link destination and fragment, plus linked resource bodies and relevant consumers; a valid link alone does not establish equivalent exposure or loading.
- [ ] Preserve tools, capabilities, routes, delegation, handoffs, outputs and validation interfaces unless the approved outcome explicitly changes them.
- [ ] Compare the [shared model profile](../../agent-model-selection/SKILL.md), role classification and configuration projections, supported overrides and fallback rules, and harness/evidence limits. Do not treat metadata or links as observed routing, effort or picker precedence. Preserve each role's own canonical profile effort declaration as `reasoning-effort` beside its model, without requiring runtime support proof before declaration; do not default all roles to `high` or inherit another role's effort. Distinguish recommended effort, declared intent, supported model configuration and separately observed effective effort. Runtime consumption, compatibility and harmless ignoring are unestablished; disclose unknown support. Do not assume root effort reaches a child; effort declarations grant no authority.
- [ ] Inspect neighboring primitive-selection, clarification, input, output and validation duties; do not treat historical records or retained test staging as active rewrite targets.

## Editing and test evidence

- [ ] Use the actual inspected preimage. Preserve concurrent and unrelated user edits; restore only attributable accidental work from its actual preimage.
- [ ] Diagnose assertion failures: determine whether a rule was lost, a wording-coupled fixture is stale, or an unrelated baseline/environment issue occurred.
- [ ] Keep owner-scoped diagnostics and negative detection. Add supported positive paraphrases and paired negatives where useful; do not broaden checks or disable assertions just to make a rewrite pass.
- [ ] Review selected additive contradictions as well as missing or weakened clauses. Finite text checks do not interpret arbitrary prose.

## Independent review and behavior evaluation

- [ ] An independent reviewer compares the full baseline/candidate diff and both map directions, including fragments, resources, role-local reinforcement and neighboring rules.
- [ ] Do not self-certify equivalence or use a model score as the sole judge. A rule map, static checks and review cannot prove all future behavior.
- [ ] Run consumer behavior comparisons only under separate explicit authorization. Use fresh sessions and consistent runtime, model, inputs, available tools, settings and instruction sources; inspect expected decisions and tool traces over repeated boundary cases. Do not require identical response wording.
- [ ] Report baseline failures separately; do not weaken an expected behavior to match a failing baseline.

## Honest report

- [ ] State actual changed paths, inspectable diff/map evidence and the specific clarity or precision benefit; no arbitrary reduction percentage is required.
- [ ] Classify each check as passed/performed, failed, unavailable or not run, with outcome and reason.
- [ ] Distinguish static/review evidence from runtime behavior, discovery, attachment and installed activation. State residual uncertainty and leave acceptance to the authorized independent lifecycle stage.