---
title: Lifecycle evidence and authority
description: How RPIR documents record provenance, approved outcomes and acceptance
---

## Purpose and audience

**Purpose:** Clarify which lifecycle record governs the approved outcome, how evidence is preserved and what constitutes acceptance.

**Audience:** Anyone reading or contributing to RPIR records, especially consumers deciding whether a document permits an action.

## Prerequisites

- Read [RPIR](rpir.md) for phase ownership and manual transitions.
- Independently inspect the actual numbered physical predecessor and substantive version in the verified Research-created lifecycle folder; a remote, pasted or attached candidate is only a locator until verified there.

## Content

### What is authoritative

An approved physical implementation Plan defines the outcome, acceptance criteria and material boundaries. The engineer's explicit `/implement` invocation with that inspected version authorizes bounded implementation, subject to effective platform permission. A projected file list or debugging step is guidance, not an automatic exhaustive repair whitelist. Implement may investigate, select necessary related files/tests, repair attributable mistakes while preserving user work, and rerun relevant checks within the original outcome. New requirements, materially changed public behavior, consequential dependencies, changed security/compatibility commitments or additional external effects require an engineer decision and Plan-owned amendment or new Plan. Neither publication nor a Wiki page nor a Review finding grants edit authority.

The active approved Plan is also Implement's progress surface. The coordinator updates only its already-existing Step, Task and Work Item markers as supported outcomes complete: a Step after its intended outcome and required successful check, a Task after its intended outcome and constituent work/checks, and a Work Item only after its explicit gate passes (acceptance met and all required validation has the specified successful result). A failed parent gate or pause retains completed children; later evidence reopens only disproved markers and dependent parents, preserving unaffected work and recording reasons. These marker-only changes do not revise substantive Plan approval, scope, criteria, hierarchy or lineage. Inspect the current preimage and verify the postimage; conflicts are reconciled without overwriting user edits. Failed marker persistence is reported separately from verified work. Markers are not standalone test proof, approval, transition or Review acceptance; lifecycle status mirrors remain optional. See the [safe implementation skill](../../.github/skills/safe-implementation/SKILL.md) for the procedure.

For supported in-boundary Review findings, the engineer manually resumes `/implement` with the **original approved Plan** and linked inspected Review context, preserving original criteria and obtaining fresh implementation evidence and independent re-review. A materially new Review finding belongs with Plan, not a duplicate issue Plan for an ordinary correction. Mixed or unclear findings remain unresolved until settled; independent correction can proceed without treating the whole Review as accepted. The changed `/remediate-review` prompt enters Implement for supported original-criteria corrections, not its former Plan alias.

For a new lifecycle Research selects one opened consumer root and a suitable existing `docs/` or another evidently established documentation directory; only if none exists may it conditionally create `docs/`. It separately verifies or creates that root's direct `copilot/` parent, numbered subject topic and physical Research brief under each effect's identity, containment, absence and permission checks. Existing verified `docs/planning/` and `docs/delivery/` topics remain in place; successor phases inherit the actual verified folder rather than guessing a new one. Inspect kind, subject, version and direct same-folder predecessor links. A compact identity/lineage section suffices: neither duplicate canonical path fields nor mandatory fingerprints, double inventories, status-write rituals or terminal probes are prerequisites. Inspect the relevant exact-suffix inventory, choose an absent number and read back the saved content; on a collision re-inspect and choose another absent number in the same verified topic when identity remains clear. Never overwrite approved Plans or finalized reports, infer permission from a path, or claim a failed save persisted.

For an active approved Plan, the preceding non-overwrite rule protects substantive Plan content and finalized reports; only the Implement coordinator's safeguarded existing-marker updates described above are excepted. Do not infer permission from path or claim failed persistence.

Preserve older record formats as history, not present-day operating policy.

Working drafts may be revised and can retain genuine questions. Freeze the inspected substantive predecessor version at a manual phase transition. Physical containment, effective permission and verified readback remain necessary for a dependent write; unresolved indirection, denial or an unreadable postimage prevents its persistence claim. A failed optional observation leaves its requested fact unknown, not proof that a separate editor save failed. No routine ACL, reparse or global hash ritual substitutes for concrete effect evidence. See the [lifecycle core](../../.github/skills/rpir-lifecycle-core/SKILL.md) for the canonical record and phase rules.

### What is evidence only

- Research supplies findings and provenance for Plan, not edit approval. The initiating request retains its actual channel/locator; an attachment, HTTPS page or paste never replaces a verified physical predecessor.
- An implementation report describes actual deliverables, correction history and performed, failed, unavailable and not-run checks. `/review` with its inspected physical version admits independent Review, not acceptance. A partial report is a checkpoint, not a substitute for the promised artifact.
- Review classifies severity, actionability and original-criteria correction versus material change. Its findings support a manual decision but do not grant scope, mutate Plan hierarchy or authorize implementation.

### Architecture decision records are supplementary

For a relevant architectural choice, the Plan coordinator may draft or revise only a directly associated Proposed ADR during active planning, alongside the working Plan. This narrow exception does not change the approved Plan itself, add a canonical RPIR predecessor, or authorize Research/Implement/Review, workers, analysts or Script Runner to author ADRs. Each destination/directory/file effect remains subject to verified identity, containment, absence/collision, effective permission, save and readback; consumer conventions control where an ADR belongs. The Plan binds the inspected ADR version/state, actual agreement evidence, conditions and dependent work. Implement resolves material mismatch before affected changes; Review independently compares delivery and governance claims. Neither phase invocation nor delivery acceptance is architectural approval. See the [lifecycle core](../../.github/skills/rpir-lifecycle-core/SKILL.md) and [architecture decision records Skill](../../.github/skills/architecture-decision-records/SKILL.md).

### Manual boundaries still apply

Here, optionality applies to lifecycle status mirrors only. Implement's existing Step, Task and Work Item progress markers are required under the narrow active-Plan exception above, but never constitute standalone validation, approval, a phase transition or Review acceptance.

Initial `/plan` with inspected Research approves planning; `/implement` with the inspected approved Plan authorizes its bounded outcome; `/review` with the inspected implementation report admits independent review. A manual `send: false` suggestion or clarification answer is not invocation. A persisted and verified clean Review with no unresolved findings and supported original-criteria evidence records acceptance. Required active-Plan execution markers are evidence of progress, not scope, transition or acceptance authority; only lifecycle status mirrors are optional. A failed status mirror must be disclosed but does not erase verified technical evidence. Unresolved findings prevent acceptance; a failed report save cannot be presented as success.


An actually permitted Implement command may be direct or use the optional Script Runner for a bounded goal. Real platform denial cannot be bypassed via another route. Diagnose ordinary local failures and recheck after an in-boundary correction; reconcile uncertain destructive or external completion before repetition. Wiki text never authorizes commands or mutations. Prompt files are Local shortcuts where supported; Agent Host does not load them, so validate an equivalent supported route before relying on its sign-off semantics.

### Optional local Git checkpoints

A local commit is optional metadata/history, distinct from source or record authorship, physical save/readback, validation, phase invocation and Review acceptance. An engineer's explicit approval of an inspected Plan that states a bounded local staging/append-only strategy authorizes its covered commits after `/implement`; no separate grant exchange is needed for unchanged covered effects. A concrete candidate need not exist at approval. The Plan identifies the repository/worktree/branch selection rule, content/exclusions, Script Runner ownership, relevant validation, local-policy constraints, validity and revocation. Silent/prohibiting Plans and unapproved options authorize nothing; Plan publication cannot authorize its own checkpoint or earlier Research effects. Normally checkpoint eligible coherent work after each completed Work Item and proactively consider earlier coherent validated Tasks in larger items. Explain exceptions; commits never gate marker persistence, validation or acceptance. Verified non-Git/other-VCS projects and no-eligible-change candidates skip without blocking RPIR; uncertain membership/access stays unavailable. Consumer ignore/local policy applies to all work. Coordinators propose candidate content and Script Runner alone executes the Git metadata effect; it cannot authorize source-mutating helpers. Literal candidate, current ownership/state, relevant staged-snapshot validation, compatible helpers and effective permission remain execution prerequisites. Commit claims require inspected history/content/state, not command exit alone. See the [shared checkpoint capability](../../.github/skills/local-git-checkpoints/SKILL.md) for the contract; this reference does not grant Git effects.

## Canonical references

- [RPIR lifecycle core](../../.github/skills/rpir-lifecycle-core/SKILL.md) — Canonical plan authority, provenance and phase boundaries.
- [Repository Copilot instructions](../../.github/copilot-instructions.md) — Repository policy for scope, reports and handoffs.
- [Lifecycle record instructions](../../.github/instructions/lifecycle-records.instructions.md) — Candidate coverage for numbered Research, Plan, implementation-report and Review records; runtime attachment is not established by this reference.

## Related links

- [RPIR](rpir.md) — Follow the phase and coordinator model.
- [Choose an artifact](choose-an-artifact.md) — Return to consumer artifact selection.

## Next steps

- Inspect the actual document/version and direct lineage before assessing scope or a phase handoff.
- Invoke the supported next-phase route with the inspected version you agree to use; preserve original acceptance, independent Review and real platform permissions.
