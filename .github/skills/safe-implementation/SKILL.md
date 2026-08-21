---
name: safe-implementation
description: Apply an approved implementation plan with a narrow diff, explicit safety boundaries, and honest validation reporting. Use when making repository changes after plan approval.
user-invocable: false
---

# Safe implementation

Use this skill to keep implementation within the approved scope.

1. Confirm the plan, affected files, acceptance criteria, and unresolved decisions before editing.
2. Make the smallest coherent change; preserve unrelated content and existing public names.
3. Re-read changed files and inspect the diff for accidental edits, broken links, and inconsistent frontmatter.
4. Apply the [validation checklist](./validation-checklist.md).
5. Report files changed, checks actually performed, checks not run, and known limitations.

Only the responsible Implement coordinator may perform steps 6–10, and only during authorized final reconciliation of an approved pass that authorizes a durable implementation report:

6. Before final reconciliation, confirm the developer-named approved plan is an exact repository-relative path and that the report contract authorizes one implementation report for this pass.
7. Allocate the report in the same lifecycle folder as that exact plan using the approved three-digit, `implementation-report` suffix sequence. Inspect matching-suffix inventory, calculate `001` or maximum valid prefix plus one, immediately re-inspect before creation, and stop without overwriting if the target collides, the inventory is malformed, or the folder cannot be inspected.
8. Create exactly one report at the allocated path. Re-read it after creation and verify its exact plan link, lifecycle identity, pass status/revision, completed and remaining hierarchy, changed files, delivered behavior, acceptance, validation outcomes, deviations, scope decisions, evidence, risks, and next action. State that the report is immutable execution evidence and does not authorize scope, status, approval, handoff, or acceptance; do not revise or overwrite it.
9. Resolve every agent-discovered material unknown through `agent-question-resolution` before completion or handoff. Include **Open questions** only when it records a specifically named question that the developer expressly declared intentionally open or unknown, with that provenance; otherwise omit the section.
10. In the final response, point to the exact immutable report path and distinguish validation that was performed, failed, unavailable, or not run. Do not present unavailable or not-run checks as successful evidence.

Do not expand scope, add speculative dependencies, or claim command-based validation. The general prohibition on repository terminal commands remains in force. The sole bounded exception is an explicitly authorized directory cleanup operation by the responsible coordinator, and only when every gate below is satisfied:

- The directory is an exact target named in the approved canonical implementation plan; no unlisted target or inferred target is eligible.
- The directory is confirmed empty before the operation and is contained within the workspace.
- The developer approves that specific invocation manually. Do not auto-approve it or treat manual approval as sandbox containment.
- The operation is non-recursive and uses no wildcard or traversal behavior. It must not become unrelated command work or a general terminal exception.
- After the operation, inspect the target's parent path and record the observed outcome.

If any gate is missing or fails, stop and request a developer decision rather than substituting another operation or expanding scope. Report the exact target, confirmed preconditions, approval, operation outcome, parent-path inspection, and any checks that were unavailable or not run. This repository currently has no approved terminal commands, so ordinary command-based validation remains unavailable.