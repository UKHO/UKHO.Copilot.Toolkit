---
description: "Template for an initial or material Review-origin RPIR implementation plan"
---

# Implementation plan

## Outcome and boundaries

- **Outcome and acceptance:** State the observable deliverable and original criteria for success.
- **Change boundary:** Name affected areas, material exclusions, compatibility/security commitments and consequential external effects. Projected files guide implementation; they are not an exhaustive repair whitelist.
- **Approach:** Explain relevant patterns, trade-offs, dependencies and sequencing. Record decisions needed from the engineer rather than inventing them. Ordinary related-file/test selection, failure diagnosis and implementation details belong to Implement.
- **Architectural choice coverage and ADR binding:** Reconcile every architectural choice from Research and every planning discovery, including small reversible spikes. For each choice record rationale, realistic alternatives/reasons, actual selection or explicit pending state, conditions and affected Work Item IDs; bind the inspected ADR path/ID, identifiable section, substantive version/snapshot, decision state and actual agreement evidence/conditions. Inspect existing records for substantive applicability before reuse without duplicates. Meaningful grouping preserves each choice's alternatives, reasoning, selection/pending state, conditions and affected work; a vague umbrella ADR or one valid binding is not complete coverage. Independently changing status, authority or supersession favours separate records. Proportionality governs detail, not coverage. If none are architectural, give an evidence-supported routine-only disposition. Use existing IDs, not another delivery register; Plan invocation, implementation approval and Review do not establish architectural agreement.
- **Architecture boundaries and unresolved conditions:** Topology, technology/toolchain baselines, public contracts and security/data boundaries are architectural signals; dependency/test-framework changes require context about platform, integration, compatibility or operating commitments. Naming, helper extraction and architecture-preserving repairs remain routine Implement-owned coding without ADR reference. Resolve material classification ambiguity with the engineer using evidence. Unknown destinations, unavailable records, pending selection/agreement and unmet decision-critical conditions need explicit gaps, dependent effects and resolution routes, not invented coverage, Accepted state, governance or a phase-wide invocation veto. Continue independent safe work. Only the Plan coordinator may author associated Proposed drafts under the [ADR capability](../architecture-decision-records/SKILL.md) and lifecycle core's separate directory/file guards, verified consumer conventions and accepted-history/agreement safeguards.
- **Local Git checkpoint strategy:** Every prospective Plan must state one explicit bounded local staging/append-only strategy with a stable reference for its Work Items: repository/worktree/branch selection rule, approved content and exclusions, Script Runner ownership, relevant candidate validation, consumer local-policy constraints, validity and revocation. Explicit approval of this inspected Plan authorizes only its covered commits after `/implement`; no separate grant exchange is needed, and a candidate need not exist at approval. A silent, prohibiting or unapproved-option Plan authorizes no Git effects. Normally checkpoint eligible coherent validated work after each completed Work Item before unrelated work and proactively consider earlier coherent validated Tasks in larger items. Each detailed item needs the commit-plan entry below; empty headings, generic exemptions and unexplained blanket prohibitions fail planning assessment, but actual prohibitions, including historical ones, still grant no Git authority. Commits never gate persistence, validation, Work Item completion, transition or acceptance. Runtime candidate, state, helper and permission facts remain mandatory; Plan publication cannot authorize its own checkpoint or earlier Research effects. Link the shared [local Git checkpoint capability](../local-git-checkpoints/SKILL.md) for execution safeguards and the distinct phase-record grant route.

## Planned work

Use one authoritative Work Item register mapping each intended outcome to Research/requirements evidence and observable acceptance. Begin with unchecked completion markers; they track execution progress only and are not standalone validation proof, approval, or Review acceptance. Each Work Item must state an explicit exit gate tied to its acceptance and every required validation's specified successful result.

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

**Exit gate:** `<acceptance is met and each required validation has its specified successful result; identify evidence>`

**Validation:** `<relevant check and expected result, or reason unavailable>`

**Commit plan:** `<strategy reference; normal post-validation checkpoint boundary, coherent content and purpose; or specific justified combination/deferral/no-commit exception stating actual constraint/reason, affected IDs, validation/dependency consequence, later checkpoint boundary if one exists and why the normal boundary is unsuitable. Do not invent future obstacles or repeat the Git procedure.>`

## Execution guidance and validation

- **Checkpoint accounting:** Implement must compare planned versus actual disposition at every expected boundary before unrelated work, with verified checkpoint evidence or a specific supported disposition. Runtime obstacles belong in fresh implementation evidence, never retrospective substantive exceptions edited into this approved Plan. Preserve coordinator-only existing-marker updates; commit count is not technical acceptance.
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

