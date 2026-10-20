---
name: architecture-decision-records
description: Capture and consume selective, Research-fed architecture decisions across RPIR without conflating agreement, delivery approval, or acceptance.
user-invocable: false
---

# Architecture decision records

## Purpose and consumers

Use this resource-backed capability when a material architectural choice benefits from durable rationale, meaningful alternatives, consequences, or future review. It supports Research, Plan, Implement, and Review; it is not a fifth RPIR phase, a universal ADR gate, or an authority grant. Routine local corrections normally do not need an ADR. The actual engineer/consumer decides disputed relevance, subject to evidenced consumer policy.

## Inputs and outputs

- **Inputs:** relevant Research evidence and citations, attributed engineer statements, alternatives and their reasoning, consequential unknowns, verified consumer conventions/governance, and—downstream—the inspected Plan-bound ADR identity/version and conditions.
- **Outputs:** a compact Research handover when relevant; a standalone Proposed ADR associated with the active Plan when authorized; and truthful downstream consistency findings. The Plan remains the sole delivery hierarchy and authority for delivery scope and acceptance.

Use the [Research input coverage map](references/research-input-coverage.md) selectively and the [ADR template](templates/adr.md) when a record is warranted. Reuse existing answers and citations; do not restart the Research interview or require all fields for every decision.

## Phase operation

1. **Research:** Consider relevant coverage after the existing discovery/acknowledgment or explicit-deferral rules permit the investigation. Reuse evidence, cite its existing location, and hand over material gaps and consequences. Research never authors a standalone ADR.
2. **Plan:** For a relevant decision, the Plan coordinator may create or revise only a Proposed ADR directly associated with its active planning objective, alongside the working Plan and before `/implement`. Bind the ADR's actual path/ID, substantive inspected revision or snapshot, status, actual agreement evidence, conditions, and dependent Work Items in the Plan. Keep one authoritative Plan hierarchy. Separate Plan/ADR saves require separate inspection and readback; report partial persistence honestly.
3. **Implement:** Inspect the exact Plan-bound ADR version and its decision state/conditions. Resolve material identity, version, status, or condition mismatch before dependent effects; continue independent approved work. Do not float to a newer ADR, infer a decision, or revise an ADR outside applicable scope.
4. **Review:** Independently compare implementation and evidence with the Plan-bound architectural choice and assess whether governance claims are supported. A clean delivery Review is not architectural or enterprise approval.

## Authority and effect safeguards

The Plan coordinator's narrowly defined exception is owned by repository policy and the Plan coordinator, not by this Skill. It permits only the associated Proposed ADR draft and its guarded revision during active planning. It does not authorize code/configuration edits, unrelated documents or ADRs, register edits, reciprocal metadata changes, accepted/superseded history rewrites, commits, distribution, publication, or a new agent/prompt/tool route. Research, Implement, Review, analysts, workers, and Script Runner gain no ADR authorship authority from this resource.

Use evidenced consumer naming, location, retention, required template, renderer, and governance conventions. Do not select a guessed fallback destination or invent approval, standards, owners, participants, dates, or agreement. A necessary directory may be created only at an explicitly engineer-selected, verified contained destination. Do not recursively create unselected ancestors; each missing directory needs its own explicit selection and separate identity, containment, absence/collision, and permission checks. Check each ADR file effect separately for identity, containment, absence/collision, effective permission, saved result, and readback. Never overwrite or silently relocate on collision; reconcile concurrency and disclose a failed or partial save. Preserve accepted and superseded substantive history. A Proposed/Accepted/Rejected/Superseded vocabulary is only a candidate unless consumer conventions establish it; decision status is not delivery progress or approval by phase invocation.

Unconditional Accepted requires actual applicable decision authority and agreement evidence, with all applicable required decision approvals and decision-critical conditions satisfied. Otherwise retain Proposed or an explicitly qualified/pending state according to evidenced consumer conventions. Actual agreement and its conditions remain distinct from delivery approval and acceptance.

See the [lifecycle core](../rpir-lifecycle-core/SKILL.md) and phase-owned instructions for canonical intake, authority, permissions, and manual transitions. This Skill grants no tools, permissions, approval, lifecycle authority, or runtime guarantee.
