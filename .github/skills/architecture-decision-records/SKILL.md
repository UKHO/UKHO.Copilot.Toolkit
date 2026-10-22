---
name: architecture-decision-records
description: Identify architectural choices in Research and reconcile complete ADR coverage in Plan without conflating agreement, delivery approval, or acceptance.
user-invocable: false
---

# Architecture decision records

## Purpose and consumers

Use this resource-backed capability to identify architectural choices upfront in Research and reconcile every architectural choice, including planning discoveries, against inspected ADR coverage by Plan. Proportionality governs detail, not coverage: small, reversible projects and spikes are not exemptions. It supports Research, Plan, Implement, and Review; it is not a fifth RPIR phase, an ADR requirement for every coding choice, a phase-wide invocation gate, or an authority grant.

Component topology (for example separate web/API components), technology/toolchain baselines (such as frontend technology or Aspire), public contracts (such as numeric semantics), and security/data boundaries are architectural commitments. Dependency or test-framework changes are context-sensitive: assess whether they change platform, integration, compatibility or operational commitments rather than classifying by package name alone. Naming, helper extraction and architecture-preserving local repairs are routine coding choices that Implement may make without ADR reference. Resolve material classification ambiguity with the engineer using evidence and the shared question-resolution method; do not silently exempt a disputed choice.

## Inputs and outputs

- **Inputs:** relevant Research evidence and citations, attributed engineer statements, alternatives and their reasoning, consequential unknowns, verified consumer conventions/governance, and—downstream—the inspected Plan-bound ADR identity/version and conditions.
- **Outputs:** a compact Research handover identifying architectural choices and gaps; complete choice-to-ADR reconciliation in Plan, with associated Proposed drafts only when authorized; and truthful downstream consistency findings. The Plan remains the sole delivery hierarchy and authority for delivery scope and acceptance.

Use the [Research input coverage map](references/research-input-coverage.md) proportionately and the [ADR template](templates/adr.md) for necessary authorized drafts. Reuse existing answers and citations; do not restart the Research interview or require all map fields for every decision.

## Complete coverage and reuse

For each architectural choice, preserve its identifiable subject, drivers/rationale, realistic alternatives and option-specific reasoning, actual selection or explicit pending state, conditions and affected work. Research identifies likely affected work; Plan maps it to its existing Work Item IDs. Plan binds coverage to each inspected ADR's actual path/ID, identifiable section, substantive version or snapshot, decision state, actual agreement evidence and conditions. A valid binding for one choice does not cover omitted choices.

Inspect existing ADRs for substantive applicability before reusing them; appropriate verified coverage needs no duplicate ADR. Group related choices only where shared context, rationale and governance make this meaningful, while keeping each choice's alternatives, selection/pending state, reasoning, conditions and affected Work Items individually identifiable. A vague umbrella record is not coverage. Independently changing status, authority or supersession favours separate records. Do not add a competing delivery register.

Unknown destinations, unavailable records, pending choices/agreement or unmet decision-critical conditions remain visible gaps with dependent effects and an evidence/engineer-resolution route. They are not invented coverage or Accepted state. Constrain dependent effects, not phase invocation or independent safe work; do not invent governance prerequisites.

## Phase operation

1. **Research:** Explicitly identify architectural choices after the existing discovery/acknowledgment or explicit-deferral rules permit investigation. Reuse evidence, cite its existing location, identify existing ADR candidates and actual engineer selections separately from recommendations, and hand over consequential gaps/routes. Research never authors a standalone ADR or the formal delivery hierarchy.
2. **Plan:** Reconcile all Research choices and choices discovered during planning to complete inspected ADR coverage as above; if none are architectural, give an evidence-supported routine-only disposition. The Plan coordinator may create or revise only a Proposed ADR directly associated with its active planning objective, alongside the working Plan and before `/implement`, under the safeguards below. Required coverage does not grant authorship or guess a destination. Keep one authoritative Plan hierarchy. Separate Plan/ADR saves require separate inspection and readback; report partial persistence honestly.
3. **Implement:** Inspect the exact Plan-bound ADR version and its decision state/conditions. Resolve material identity, version, status, or condition mismatch before dependent effects; continue independent approved work. Do not float to a newer ADR, infer a decision, or revise an ADR outside applicable scope.
4. **Review:** Independently compare implementation and evidence with the Plan-bound architectural choice and assess whether governance claims are supported. A clean delivery Review is not architectural or enterprise approval.

## Authority and effect safeguards

The Plan coordinator's narrowly defined exception is owned by repository policy and the Plan coordinator, not by this Skill. It permits only the associated Proposed ADR draft and its guarded revision during active planning. It does not authorize code/configuration edits, unrelated documents or ADRs, register edits, reciprocal metadata changes, accepted/superseded history rewrites, commits, distribution, publication, or a new agent/prompt/tool route. Research, Implement, Review, analysts, workers, and Script Runner gain no ADR authorship authority from this resource.

Use evidenced consumer naming, location, retention, required template, renderer, and governance conventions. Do not select a guessed fallback destination or invent approval, standards, owners, participants, dates, or agreement. A necessary directory may be created only at an explicitly engineer-selected, verified contained destination. Do not recursively create unselected ancestors; each missing directory needs its own explicit selection and separate identity, containment, absence/collision, and permission checks. Check each ADR file effect separately for identity, containment, absence/collision, effective permission, saved result, and readback. Never overwrite or silently relocate on collision; reconcile concurrency and disclose a failed or partial save. Preserve accepted and superseded substantive history. A Proposed/Accepted/Rejected/Superseded vocabulary is only a candidate unless consumer conventions establish it; decision status is not delivery progress or approval by phase invocation.

Unconditional Accepted requires actual applicable decision authority and agreement evidence, with all applicable required decision approvals and decision-critical conditions satisfied. Otherwise retain Proposed or an explicitly qualified/pending state according to evidenced consumer conventions. Actual agreement and its conditions remain distinct from delivery approval and acceptance.

See the [lifecycle core](../rpir-lifecycle-core/SKILL.md) and phase-owned instructions for canonical intake, authority, permissions, and manual transitions. This Skill grants no tools, permissions, approval, lifecycle authority, or runtime guarantee.
