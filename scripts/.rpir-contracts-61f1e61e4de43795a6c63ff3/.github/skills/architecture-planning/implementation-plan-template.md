---
description: "Template for an initial or material Review-origin RPIR implementation plan"
---

# Implementation plan

## Outcome and boundaries

- **Outcome and acceptance:** State the observable deliverable and original criteria for success.
- **Change boundary:** Name affected areas, material exclusions, compatibility/security commitments and consequential external effects. Projected files guide implementation; they are not an exhaustive repair whitelist.
- **Approach:** Explain relevant patterns, trade-offs, dependencies and sequencing. Record decisions needed from the engineer rather than inventing them. Ordinary related-file/test selection, failure diagnosis and implementation details belong to Implement.

## Planned work

Use one authoritative Work Item register mapping each intended outcome to Research/requirements evidence and observable acceptance. Begin with unchecked completion markers; they track execution progress only, never validation pass, approval, or Review acceptance.

| Completion and ID | Intended result and affected area | Source / acceptance criterion |
| --- | --- | --- |
| [ ] Work Item 1 | `<result and likely locations>` | `<Research/requirements evidence and observable acceptance>` |

## Detailed work items

Add a matching `### Work Item N` section for each register row. IDs and detail sections must match the register; do not create a second authoritative register. Use meaningful, ordered, initially unchecked Task and Step IDs under each item. A small Plan may use one meaningful Task and one Step; do not add empty filler levels or impose a minimum count beyond meaningful traceability. Keep intended actions, dependencies where applicable, item-level acceptance and validation adjacent to the relevant Work Item. A Step is a useful execution/checkpoint unit, not a prediction of every debugging command or repair.

### Work Item 1: `<intended result>`

- [ ] **Task 1.1: `<meaningful outcome>`**
	1. [ ] **Step 1.1.1:** `<intended action or useful checkpoint>`

**Dependencies:** `<relevant dependencies, or None>`

**Acceptance:** `<observable item-level result linked to the source/criterion above>`

**Validation:** `<relevant check and expected result, or reason unavailable>`

## Execution guidance and validation

- **Evidence and assumptions:** Cite the inspected predecessor and repository sources; distinguish facts, assumptions and material open decisions.
- **Useful checks:** Identify available relevant checks, expected results and meaningful limits, including unavailable runtime checks. Implement may choose related tests and rerun after supported repair; a failing check keeps dependent acceptance unmet, not diagnosis forbidden. Static checks do not establish installed behavior.
- **Safety and recovery:** Describe task-specific risks, external effects or rollback considerations where material. Preserve user edits; restore attributable mistakes from actual preimages. Respect effective permissions and reconcile uncertain destructive/external completion before repetition. A real denial is not a fallback invitation.
- **Questions and handoff:** Ask promptly for new requirements, material public behavior, consequential dependencies, altered security/compatibility commitments, additional external effects or genuinely unresolved identity/ownership. Continue independent work and identify effects awaiting a decision. A partial implementation report is a checkpoint; independent Review compares actual output with original criteria.

## Identity and lineage

- **Subject and Plan version:** `<inspected substantive version and actual contained numbered Plan identity when local>`.
- **Direct predecessor:** `<inspected Research identity/version and direct same-folder link when local; for a material Review-origin Plan also identify the source Review, reviewed implementation report, previous Plan and original Research, each by inspected version and direct local relationship>`.
- **Provenance:** `<original locator/channel; never fabricate a local path for a non-local source>`.
- **Physical output:** Save in the verified Research folder without overwriting; on collision re-inspect and select an absent number in the same topic. Read back identity, content and direct links. A failed save is not persisted evidence. Preserve legacy folders and finalized records; status mirrors are optional bookkeeping.
- **Authority:** Only explicit `/implement` with this inspected Plan version authorizes its bounded pass, subject to effective permissions. Publication, a finding or a manual handoff does not. Supported original-criteria Review corrections resume Implement under the original approved Plan with linked Review context; material changes require an engineer decision and Plan-owned amendment/new Plan. Keep handoffs manual.

