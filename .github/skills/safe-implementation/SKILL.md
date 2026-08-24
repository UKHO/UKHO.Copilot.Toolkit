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

For a remediation pass, require the developer's literal exact canonical plan path and literal exact source Review-report path. Validate the source report's same-folder identity, exact plan link, exact reviewed implementation-report link, accessibility, immutability, and remediation-permitting review state before editing. Fail closed on missing, malformed, inaccessible, inferred, reused, wrong-folder, wrong-plan, or mismatched evidence; make no edits, marker changes, or report allocation when linkage validation fails. Map every finding to existing plan hierarchy only, reopen affected existing markers and parents for rework, and stop for Plan amendment if hierarchy would be added, removed, restructured, or expanded. A remediation implementation report must link the exact source Review report and record each finding's resolution or remaining blocker before the manual Review handoff.

## Guarded-command procedure

Command execution is unavailable by default. This procedure does not grant a terminal capability; it governs only a command that an exact, developer-approved canonical implementation plan has already made conditionally eligible. Only the responsible `Implement` coordinator may execute it. Execution must not be delegated to a worker, another lifecycle phase, or an inferred tool route.

Before presenting an invocation for approval, perform every applicable preflight check and stop if any check fails or cannot be evidenced:

1. Confirm the exact developer-named canonical plan path. The plan must contain a dedicated approved-command record for this invocation; plan approval, a tool declaration, a command category, or a similar command is not authorization.
2. Compare the proposed command byte-for-byte with the plan’s recorded literal and compare the working directory with the plan’s recorded fixed directory. Do not normalize, substitute, compose, expand, infer, or repair either value. The directory and every declared output/write path must be contained within the workspace; reject traversal, wildcards, external paths, and undeclared writes.
3. Screen the literal, arguments, working directory, environment, configuration, and expected effects for secrets or credentials and for prohibited forms or effects. Reject authentication or login, publishing, deployment, release/tag or remote mutation, global installation/configuration, shell chaining or redirection, command substitution, aliases, arbitrary script targets, `npx`, recursive deletion, and safety-control bypass. Do not expose secret-bearing environment variables, files, configuration, or command output.
4. Confirm Default Approvals are in effect and terminal auto-approval is disabled. Present the unchanged literal command and fixed directory, purpose, expected output/result, known script/network effects, Tier, and failure disposition to the developer and obtain fresh approval for this invocation. Never reuse, infer, or auto-approve approval. Native Windows is not represented as sandbox-contained; human review, fixed paths, and approval remain mandatory.
5. Apply the tier-specific preflight. Tier 1 is limited to the exact approved local build, test, or script invocation and its recorded purpose, output/result, effects, inputs, and failure disposition. Tier 2 is a separate dependency-installation route: verify the existing reviewed `package.json`, existing lockfile, `.npmrc`, dependency sources, and install-script policy; reject missing, changed, unreviewed, remote, secret-bearing, or mutating inputs. Tier 2 cannot be bundled with Tier 1 or fall back to it.

After fresh approval, execute only the unchanged eligible invocation. Stop immediately on a mismatch, failed or unavailable preflight, approval/settings uncertainty, unexpected prompt, non-zero exit, timeout, unexpected network/script effect, output/write outside the recorded boundary, or any other unexpected result. Do not retry with a modified or substitute command, and do not continue to validation or cleanup as though execution succeeded.

Record sanitized execution evidence separately from validation, readiness, and acceptance: exact plan path, approved literal and fixed directory, Tier, approval outcome, timestamp if available, exit/result state, sanitized output summary, and observed effects. Redact secrets and sensitive paths; do not copy credentials, tokens, environment values, or untrusted output verbatim. Inspect the workspace after execution and inventory changed, untracked, generated, and expected output artifacts against the plan. Inspect the recorded directory and relevant parent paths for unexpected changes. A successful exit is execution evidence only and does not establish build, test, diagnostic, compatibility, package, or acceptance success.

Classify each outcome accurately as **passed**, **failed**, **unavailable**, or **not run**. Use **unavailable** when the required approved command, capability, evidence, or safe preflight is absent; use **not run** when the check was intentionally not attempted despite being available. Record the reason and disposition for failed, unavailable, and not-run checks. Never report unavailable or not-run validation as successful evidence.

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