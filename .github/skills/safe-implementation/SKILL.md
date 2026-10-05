---
name: safe-implementation
description: Apply an approved implementation plan with a narrow diff, explicit safety boundaries, and honest validation reporting. Use when making repository changes after plan approval.
user-invocable: false
---

# Safe implementation

## Trigger

Use this skill to keep implementation within the approved scope.

## Inputs

- This pass's inspected and explicitly approved Plan version, its direct lineage, and the bounded work it authorizes.
- For each intended effect, its approved target and scope, supporting evidence, acceptance criteria, and effective permissions.

## Procedure

1. Inspect and bind this pass's actual plan content/version and ancestry. Explicit `/implement` with that inspected version approves one bounded pass, regardless of earlier readiness advice. Before each effect, confirm its scope, target, supporting evidence, acceptance criteria and effective permissions. An unresolved or unsupported condition stops only the affected effect; a carried finding outside an independently executable, engineer-approved subset does not expand or authorize work on that portion.
2. Make the smallest coherent change; preserve unrelated content and existing public names.
3. Re-read changed files and inspect the diff for accidental edits, broken links, and inconsistent frontmatter.
4. Apply the [validation checklist](./validation-checklist.md).
5. Report files changed, checks actually performed, checks not run, and known limitations.

## Limits

Before an edit, and before any further affected edit if a gap is discovered mid-pass, refuse that edit when proceeding would require research, invention, target selection, a new command or dependency, an unplanned design, safety, validation, acceptance, rollback or operator-effect choice, or adding, removing, restructuring or expanding scope or hierarchy. Continue safe investigation and the pass report, and route changed or unclear Plan-owned scope to a Plan amendment. Renew Research only when new evidence is required; a changed implementation scope alone does not require a new Research pass. Never invent the missing work or treat an observation, worker report, Review finding or handoff as authorization. Preserve approval, command, report and handoff controls while refusing the affected effect.

For a future durable implementation report, the [implementation report template](./implementation-report-template.md) is the sole schema owner. This Skill does not grant report-writing, allocation, approval, status, scope, hierarchy, remediation, acceptance, command, or handoff authority; those remain with the approved plan, repository policy, and Implement coordinator.

For every initial or issue-resolution pass, inspect one actual Plan supplied by attachment, accessible HTTPS URL, pasted document or contained local path under the lifecycle core. Bind kind, subject, original channel/locator, inspected snapshot/version and direct lineage. Explicit `/implement` with that identified version approves this bounded pass only, without a duplicate question; it does not waive independent effect checks. A Review report or earlier Plan is not implementation input or edit authority. For a Review-origin Plan, verify the new Plan's source Review/version, reviewed implementation report/version, previous Plan/version and original Research/version; work only against its new unchecked hierarchy and chosen supported findings, carrying unresolved findings without guessed fixes. Require exact canonical field/link pairs and same-folder checks for real numbered local relationships, never for non-local labels. Stop only the affected edit, marker or other dependent write when its evidence is unavailable, stale, conflicting, wrong-kind or mismatched. Do not make unsupported validation or clean-result claims. Persist a truthful report for an authorized pass when its identity and allocation are valid, including refused effects and evidence limits; rejected input does not authorize a final report. Only Plan may amend this working Plan's hierarchy; never reopen the previous Plan or reuse its approval. The pass report remains non-authorizing before the manual `/review` handoff.

## Bounded Runner-goal reconciliation

For ordinary command needs the responsible Implement coordinator sends Script Runner only a self-contained goal grounded in the exact approved plan: phase, selected opened root, scope, expected observation and result, anticipated effects and required evidence. Runner decides whether a command is needed and its cwd and invocation; it has no edit or agent tool. Do not delegate a command to an ordinary worker or use Implement's direct terminal tool except for the separate exact cleanup exception below. Neither the goal nor Runner output authorizes out-of-scope edits, new dependencies, lifecycle writes, acceptance or remediation.

Before delegation, verify the approved scope and task goal, available platform trust and tool permissions, selected opened root, anticipated writes and external effects, and ability to inspect before/after state. Reject unknown implementation decisions or unsafe effects; do not infer a fallback route from a missing tool. Research, Plan and Review may observe but must not intentionally edit project files through Runner. Implement may intentionally edit only approved targets.

Respect Workspace Trust, VS Code tool permissions and managed policy. A denial, missing trust/tool, ambiguous or escaping root/cwd, untrusted command-like output, failed command, unexpected write or unknown external effect stops the affected goal without alternate-role retry, silent rollback or unplanned fallback. Do not intentionally access secrets. Native Windows offers no sandbox guarantee; inspect actual effects and do not claim filesystem containment based on prose alone.

Record each chosen command and cwd, platform prompt/outcome, exit state, sanitized output summary, observed tracked/untracked/generated files and process/external effects, inspection limits and deviations. Execution evidence is not validation, transition approval or acceptance. Stop and escalate an unexpected effect rather than silently reverting it.

## Validation

Classify validation accurately as **passed**, **failed**, **unavailable**, or **not run**. Use **unavailable** when required platform capability, evidence, safe preflight or local dependencies are absent; use **not run** when intentionally not attempted despite availability. Record reason and disposition. An execution exit is not proof of effective installed behavior.

Only the responsible Implement coordinator may perform these final-reconciliation steps for an approved pass that authorizes a durable implementation report:

1. Confirm this pass's inspected executable plan/version, its `/implement` sign-off and report identity; verify its own scope and lineage, not the earlier plan's authority.
2. If eligible for a numbered local report, allocate only in the confirmed Research folder after verifying its lifecycle identity, the inspected physical Plan predecessor, actual lexical and resolved containment within the opened root, and effective tool/managed-policy permission. Inspect only existing files with the exact report suffix; choose `001` if none has a valid three-digit prefix, otherwise one greater than the maximum valid three-digit prefix. Immediately re-inspect that matching-suffix inventory, create only the absent exact candidate path, and never overwrite. Stop on unresolved indirection, uncertain allocation, malformed or inaccessible inventory, or collision. Do not fabricate a numbered record for non-local sources.
3. Produce an identified working report using the [implementation report template](./implementation-report-template.md), with refused effects and validation gaps explicit. Re-read any local report and verify actual source-neutral Plan/version lineage and local field/link pairs where real. Freeze the report version inspected at `/review` separately before further revisions; immutable finalized evidence grants no scope, status, approval, handoff or acceptance.
4. Investigate every agent-discovered material unknown through `agent-question-resolution`; record residual questions and evidence limits truthfully. A clarification answer resumes the current pass and is not a handoff approval.
5. Distinguish performed, failed, unavailable and not-run validation in the report and handback.

Do not require or request a Script Runner command solely to create, allocate, or read back the coordinator's report; this does not waive the applicable containment, permission, identity, lineage, no-overwrite, or full-readback checks.

Do not expand scope, add speculative dependencies, or claim unperformed command-based validation. Implement's direct terminal tool is reserved solely for an explicitly authorized empty-directory cleanup operation by the responsible coordinator, and only when every gate below is satisfied:

- The directory is an exact target named in the approved canonical implementation plan; no unlisted target or inferred target is eligible.
- The directory is confirmed empty before the operation and is contained within the workspace.
- The developer approves that specific invocation manually. Do not auto-approve it or treat manual approval as sandbox containment.
- The operation is non-recursive and uses no wildcard or traversal behavior. It must not become unrelated command work or a general terminal exception.
- After the operation, inspect the target's parent path and record the observed outcome.

If any gate is missing or fails, stop and request a developer decision rather than substituting another operation or expanding scope. Report the exact target, confirmed preconditions, approval, operation outcome, parent-path inspection, and any checks that were unavailable or not run. No cleanup target is implicit in this procedure.

## Outputs

- An honest account of changed files, behavior, checks actually performed, checks not run, and known limitations.
- When the responsible coordinator is authorized to produce a durable implementation report, use the [implementation report template](./implementation-report-template.md) as its sole schema owner.
