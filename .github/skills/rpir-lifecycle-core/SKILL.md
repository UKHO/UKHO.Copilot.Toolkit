---
name: rpir-lifecycle-core
description: Apply portable, fail-closed RPIR lifecycle-input, provenance, and phase-boundary semantics.
user-invocable: false
---

# RPIR lifecycle core

Use this Skill for lifecycle-record inputs, provenance, and phase-boundary semantics. It is portable where Skills are supported. Role-specific policy, allocation, authority, approval, and write boundaries remain with the applicable repository guidance and phase adapter.

## Canonical lifecycle-record input

Accept exactly one lifecycle-record reference only as either one plain value or one inline Markdown link destination. The inline label is non-authoritative and never selects a record. The one value or destination must be exactly one of these aliases:

1. a forward-slash repository-relative path;
2. a Windows-backslash repository-relative path; or
3. a local absolute path demonstrably contained in the opened workspace.

First validate the alias as written; do not decode, normalize, repair, resolve dot segments, or infer an alternative. For an accepted backslash-relative or workspace-contained absolute alias, derive precisely one forward-slash repository-relative canonical identity by removing only the verified workspace root where applicable and converting only its accepted separators. Validate that exact candidate is accessible, identifies the caller's expected existing lifecycle-record type, is in the required lifecycle folder, and satisfies every required exact canonical linkage for the phase or record relationship. Use only the successfully derived canonical identity for subsequent lifecycle processing, durable provenance, approval matching, handoffs, report linkage, mutations, and chat output; the raw alias and Markdown label/destination are transient input evidence only.

Reject with no repair or inference: multiple candidates; filename-only, empty, dangling, malformed, label-only, reference-style, or indirect-link values; mixed or duplicate separators; `.` or `..` segments or traversal; URI schemes, fragments, encoded paths, redirects, UNC or network paths; external absolute paths; inaccessible paths; incompatible record types; wrong lifecycle folders; and inconsistent or missing required linkage. Do not select by prefix, suffix, recency, or `latest`, and do not select, allocate, amend, write, mutate, or hand off a record on rejection. Resolve a material unknown through [agent-question-resolution](../agent-question-resolution/SKILL.md).

## Explicit `/plan` admission and bounded Research closure

The explicit `/plan` prompt invocation is the only admission event that may close its supplied Research brief. A Plan handoff, generic planning request, worker report, or inferred invocation does not qualify. Before any closure, validate the supplied value under the canonical-input rules above and require that the resulting exact canonical existing record is an eligible numbered `research-brief` in the required lifecycle folder, is accessible, and has exactly `Status: In progress`. Do not close a raw alias, Markdown label, inferred record, completed record, or any record selected by prefix, suffix, recency, or `latest`.

After validation, use a fail-closed procedural compare/write/verify sequence: capture the complete canonical-record preimage; immediately compare the current complete record with that preimage; if it differs, reject and perform no write, allocation, or Plan persistence. If it matches, write exactly one field on that exact record, changing only `Status: In progress` to `Status: Completed`; do not revise content, provenance, hierarchy, or any other field. Re-read the complete record as the postimage and require every field other than that one status field to remain identical and the status to be exactly `Completed`. On any postimage mismatch or other integrity failure, stop, reject admission, perform no Plan allocation or persistence, and do not retry or claim atomicity, rollback, or filesystem compare-and-set. This procedural sequence does not attest invocation origin beyond the explicit prompt contract and does not authorize implementation or Plan persistence.

## Direct provenance

Record provenance with an explicit exact forward-slash repository-relative canonical-path field and a direct, validated one-hop Markdown link from the current record to each required source record. The canonical-path field is the authority-bearing identity. The Markdown destination must render directly from the current document to that same record, use no traversal, URI, path repair, redirect, or indirect route, and is local renderable evidence only. Do not derive authority from a raw alias, transitive chain, copied text, a Markdown label or destination, report contents, a shared prefix, a suffix, recency, or an inferred “current” record. A direct provenance link records evidence only; it does not transfer or weaken the source record's authority.

Plans remain the sole authority for their scope, Work Item/Task/Step hierarchy, lifecycle status, completion markers, acceptance, and validation. Implementation and Review reports remain immutable, non-authorizing evidence; neither authorizes scope, hierarchy, status, acceptance, implementation, or remediation.

## Phase and confirmation boundaries

A phase-entry prompt may confirm only the manual handoff of its preceding, successfully resolved exact canonical evidence to the named next phase. That confirmation is limited to the evidence handoff: it does not authorize edits, record writes, commands, remediation, scope or hierarchy changes, lifecycle status or marker changes, acceptance, or an automatic handoff. A valid phase request asks the named phase to process its validated input; do not ask a duplicate phase-entry question.

- **Plan:** Plan-entry confirmation hands off only the exact canonical approved research brief. It does not authorize implementation, source or customization edits, plan scope decisions, or Plan persistence. Separately, and only when the request is the explicit `/plan` admission route, the bounded closure procedure above permits the exact one-field Research status write; that exception does not authorize Plan persistence or any other record write.
- **Implement:** Implement-entry confirmation hands off only the exact canonical approved implementation plan. Implementation still requires the separate explicit developer approval and named canonical plan required by policy; it does not authorize edits, remediation, or scope changes.
- **Review:** Review-entry confirmation hands off only the exact canonical implementation plan and linked implementation report. It does not authorize acceptance, remediation, report allocation, or status changes; acceptance requires the separate explicit developer acceptance required by policy.
- **Remediation:** Remediation-entry confirmation hands off only the exact canonical implementation plan and source Review report. It does not approve a remediation pass, edits, marker changes, scope changes, or report allocation; remediation remains separately approved and subject to exact linkage checks.
- **Commands:** a command requires separate fresh per-invocation confirmation of the unchanged approved literal and fixed directory; plan, phase, or handoff confirmation never substitutes for it.

Preserve manual `send: false` handoffs, Plan-only hierarchy authority, and all role-specific allocation, write, and approval controls. If any material unknown remains after inspecting the available evidence, resolve it through [agent-question-resolution](../agent-question-resolution/SKILL.md) before completion or handoff.