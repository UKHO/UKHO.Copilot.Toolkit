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

## Direct provenance

Record provenance with an explicit exact forward-slash repository-relative canonical-path field and a direct, validated one-hop Markdown link from the current record to each required source record. The canonical-path field is the authority-bearing identity. The Markdown destination must render directly from the current document to that same record, use no traversal, URI, path repair, redirect, or indirect route, and is local renderable evidence only. Do not derive authority from a raw alias, transitive chain, copied text, a Markdown label or destination, report contents, a shared prefix, a suffix, recency, or an inferred “current” record. A direct provenance link records evidence only; it does not transfer or weaken the source record's authority.

Plans remain the sole authority for their scope, Work Item/Task/Step hierarchy, lifecycle status, completion markers, acceptance, and validation. Implementation and Review reports remain immutable, non-authorizing evidence; neither authorizes scope, hierarchy, status, acceptance, implementation, or remediation.

## Phase and confirmation boundaries

A valid phase request asks the named phase to process its validated input. It is not a duplicate request for phase initiation, but it is also not an approval, handoff, record write, or command confirmation.

- **Plan:** a phase request does not authorize implementation.
- **Implement:** implementation requires the separate explicit developer approval and named canonical plan required by policy.
- **Review:** acceptance requires the separate explicit developer acceptance required by policy.
- **Commands:** a command requires separate fresh per-invocation confirmation of the unchanged approved literal and fixed directory; plan or phase approval never substitutes for it.

Preserve manual handoffs and all role-specific allocation, write, and approval controls. If any material unknown remains after inspecting the available evidence, resolve it through [agent-question-resolution](../agent-question-resolution/SKILL.md) before completion or handoff.