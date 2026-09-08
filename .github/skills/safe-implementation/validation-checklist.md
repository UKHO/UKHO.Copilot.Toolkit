# Safe implementation validation checklist

## Validation Worker read-only structural checks

Use this section only when acting as the delegated Validation Worker. Read and search the approved canonical plan and changed files; return a concise structural validation report with cited evidence, passed checks, failed checks, unavailable checks, and risks. Do not inspect or perform allocation, persistence, marker or status changes, command preflight or execution, cleanup, reconciliation, approval, acceptance, handoff, scope, or hierarchy decisions. Those duties remain coordinator-owned.

- [ ] Each inspected changed file is within the approved plan scope.
- [ ] Changed worker contracts use only their declared least-privilege tools and prohibit editing, commands, and nested delegation.
- [ ] Frontmatter delimiters, names, and local relative links in inspected changed files are structurally valid.
- [ ] Worker inputs and required outputs match the approved role boundary and do not transfer lifecycle authority.
- [ ] No inspected worker procedure allocates, selects, creates, persists, revises, or authorizes lifecycle artifacts, handoffs, commands, cleanup, scope, hierarchy, approvals, or acceptance.
- [ ] Checks requiring command execution, runtime delegation, VS Code diagnostics, packaging, or installed-VSIX exercise are reported as unavailable or not run unless separately evidenced by the coordinator.

- [ ] Every change is covered by the approved plan.
- [ ] No unrelated files or formatting were changed.
- [ ] Before initial implementation checks, the developer-supplied plan input is resolved under the lifecycle core to one eligible derived exact repository-relative canonical plan identity; ordinary initial `/implement` remains plan-only and separate approval/authorization checks follow resolution.
- [ ] Before remediation checks, the developer-supplied plan and source Review-report inputs are each resolved under the lifecycle core to one eligible derived exact repository-relative canonical identity; exact canonical linkage checks follow resolution.
- [ ] Before remediation edits, the source Review report is accessible, immutable, same-folder, linked to the exact canonical plan, and linked to the exact canonical reviewed implementation report; missing, malformed, inaccessible, inferred, reused, wrong-folder, wrong-plan, mismatched, stale, or invalid-state input or evidence stopped the pass before edits, markers, or report allocation.
- [ ] Every remediation finding maps to existing Work Items, Tasks, and Steps; affected existing markers and parents are reopened for rework, and hierarchy expansion, removal, or restructuring stopped for Plan amendment.
- [ ] A remediation implementation report links the exact source Review report and records each finding's resolution or remaining blocker before the manual Review handoff.
- [ ] The lifecycle-core-derived exact approved canonical plan identity and, when authorized, the exact immutable implementation-report canonical identity are recorded; neither is selected by latest/highest-prefix inference.
- [ ] Any implementation report uses a valid three-digit `implementation-report` identity allocated independently within the plan's lifecycle folder.
- [ ] Report allocation inspected the matching-suffix inventory twice, re-inspected immediately before creation, and did not overwrite an existing target; malformed or inaccessible inventory stopped the operation.
- [ ] The report is in the same folder as the exact approved plan, links to that exact plan path, was re-read after creation, and is not revised or overwritten.
- [ ] The report contains the required identity, pass, hierarchy, changed-file, behavior, acceptance, validation, deviation, scope, evidence, risk, and next-action information.
- [ ] The report explicitly remains non-authorizing execution evidence; the plan remains authoritative for scope, hierarchy, status, approval, handoff, and acceptance.
- [ ] Every agent-discovered material unknown was resolved through `agent-question-resolution` before completion or handoff.
- [ ] **Open questions** is omitted unless it contains a specifically named question with explicit developer-declared intentional-open/unknown provenance; other material unknowns are not deferred there.
- [ ] Frontmatter is valid and names are unique.
- [ ] Relative links resolve to existing repository files.
- [ ] Tool permissions and delegation lists remain least-privilege.
- [ ] Handoffs target existing agents and remain human-approved.
- [ ] The diff was re-read for accidental policy changes.
- [ ] Guarded command execution remains unavailable by default and is limited to the responsible `Implement` coordinator; no worker, lifecycle phase, or inferred tool route can execute it.
- [ ] The exact developer-named canonical plan path is confirmed and contains a dedicated approved-command record for the proposed invocation.
- [ ] The proposed command matches the plan’s literal byte-for-byte and the working directory matches its fixed recorded directory; no normalization, substitution, composition, inference, or repair occurred.
- [ ] The working directory and every declared output/write path are contained within the workspace; traversal, wildcards, external paths, and undeclared writes are denied.
- [ ] The command, arguments, environment, configuration, and expected effects are screened for secrets, credentials, authentication/login, publishing, deployment, release/tag or remote mutation, global changes, shell composition, redirection, substitution, aliases, arbitrary script targets, `npx`, recursive deletion, and safety-control bypass.
- [ ] The execution context is secret-free and sensitive output, environment values, credentials, tokens, and untrusted output are not exposed or recorded verbatim.
- [ ] Default Approvals are in effect, terminal auto-approval is disabled, and fresh developer approval was obtained after presenting the unchanged literal, fixed directory, Tier, purpose, expected output/result, effects, and failure disposition.
- [ ] Native Windows is not represented as sandbox-contained; human review, approval, and fixed contained paths remain mandatory.
- [ ] Tier 1 is separately checked as an exact approved local build, test, or script invocation with recorded purpose, output/result, effects, inputs, and failure disposition.
- [ ] Tier 2 is separately checked for an existing reviewed `package.json`, existing lockfile, `.npmrc`, dependency sources, install-script policy, and prohibited mutation/script/source conditions; it is not bundled with or treated as Tier 1.
- [ ] Preflight failure, approval/settings uncertainty, command mismatch, unexpected prompt/effect, non-zero exit, timeout, or boundary violation caused an immediate stop with no substitute, modified retry, or continuation.
- [ ] Execution evidence is sanitized and separate from validation, readiness, and acceptance; it records plan path, literal, fixed directory, Tier, approval, result/exit state, output summary, and observed effects.
- [ ] Post-command inspection inventoried changed, untracked, generated, and expected output artifacts and checked the recorded directory and relevant parent paths for unexpected changes.
- [ ] A successful exit is not treated as build, test, diagnostic, compatibility, package, readiness, or acceptance validation.
- [ ] Checks that passed or were otherwise actually performed are listed separately from checks that failed, were unavailable, or were not run, with no unavailable or not-run check claimed as successful.
- [ ] Any failed validation is recorded with its observed failure and disposition; unavailable validation identifies the missing capability or approved mechanism; not-run validation is distinguished from both.
- [ ] The general repository terminal-command prohibition remains in force.
- [ ] Any directory-cleanup exception is limited to the exact target named in the approved canonical implementation plan.
- [ ] The cleanup target was confirmed empty before the operation.
- [ ] The cleanup target was confirmed to be contained within the workspace.
- [ ] The specific cleanup invocation received manual developer approval; terminal auto-approval was not used.
- [ ] The cleanup operation was non-recursive and used no wildcard or traversal behavior.
- [ ] No unlisted target, outside-workspace path, or unrelated command work was included.
- [ ] The target's parent path was inspected after the operation and the observed outcome was recorded.
- [ ] The report names the exact target, pre-operation checks, approval, operation outcome, parent-path inspection, and checks that were unavailable or not run.
- [ ] No ordinary command-based validation is claimed when it was unavailable.