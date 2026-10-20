# Local Git checkpoint checklist

Use only for a coordinator-proposed checkpoint in the actual consumer project. The checkpoint is optional, local-only history. It does not replace physical saves/readback, validation, phase invocation, or independent Review. Do not turn normal skips into lifecycle gates.

Before every Git command, assess the effects that invocation could trigger, including during applicability/tracking checks, status, diff, candidate inspection and post-action reconciliation. Establish relevant effective configuration and attributes through safe reads or other already-assessed observation, without executing an unassessed helper to discover its behavior. Cover filesystem-monitor, external-diff, text-conversion and other executable helpers, plus incidental index refresh/cache writes; an observational label is not evidence of no effects. Unknown, changed or incompatible consequential effects stop that command before execution. Use proportionate non-mutating observation where supported, without bypassing required hooks, signing or other controls. Genuinely safe reads need no local-commit grant; index writes, including incidental ones, require the distinct bounded grant and compatible executor authority. If safe observation is unavailable, report the affected fact as unavailable/unresolved and continue independent safe work. Apply this preflight throughout §§1–5, not only before staging or committing.

## 1. Decide whether a checkpoint applies

- Bind the candidate to the actual opened consumer root, changed paths and repository/worktree that own them. Do not infer membership from the extension installation, toolkit checkout, workspace name or a path alone.
- If evidence verifies that the project is outside Git or uses another VCS, report **Skipped — not applicable**. Do not initialize Git, select another VCS workflow, request a grant, or retry the same inapplicable question. Continue independent approved work and the manual handoff.
- If no eligible change remains, the candidate is unchanged, or all eligible untracked candidates are ignored/local-only, report **Skipped — no eligible changes**. Do not create an empty commit, edit ignore rules, force-add, relocate files to evade local choices, or make persistence/validation wait.
- If Git is missing/inaccessible, repository membership is ambiguous, or actual worktree ownership cannot be established, report **Unavailable / unresolved** and stop only the affected Git action. Do not call this a verified no-repository skip. Continue independent safe work.
- For multi-root, nested-repository, submodule or linked-worktree cases, establish ownership separately for every candidate. A grant for one repository/worktree does not transfer to another. Do not include submodule contents or common worktree metadata by inference.

## 2. Apply local policy and determine eligible content

- Respect effective repository, local, global/user excludes and explicit local-only choices for all work. Inspect actual tracked state: ignore patterns govern untracked paths; a tracked file remains tracked and may have eligible modifications despite matching an ignore pattern. Do not automatically untrack it.
- Leave ignored or explicitly excluded untracked content untouched by Git. If a meaningful candidate depends on local-only implementation, tests or records, disclose that the checkpoint does not reproduce the full local result; do not claim it is self-contained. If no useful eligible unit remains, skip normally.
- Prefer a smallest useful coherent implementation unit with necessary tests and directly related documentation, validated against that candidate. Combine inseparable dependencies; do not split by file type, elapsed time, line count, checkbox, or phase alone. A meaningful single implementation commit is valid. No automatic WIP/test-first exception or session-end sweep is enabled.
- Eligible Research, Plan, implementation-report or Review evidence may be proposed only after its physical record is saved and read back. A versioned phase record can be part of a suitable pending checkpoint; a local-only record still must be physically persisted. Never make marker persistence wait for a commit or require a marker-only commit. Do not include the active Plan's substantive content in an Implement marker-only update. A report must not contain its own future commit ID/hash; report that later in chat or subsequent evidence.

## 3. Require a distinct, bounded grant

Before any index or local-history mutation, the coordinator must have an actual, explicit local-commit grant relevant to the proposed checkpoint. Bind it to:

- consumer repository and worktree, selected branch, current RPIR objective and approved outcome;
- allowed phase and content categories, named exclusions and the intended local-only effects (index and append-only local commit);
- the single execution owner (Script Runner), validation standard, and any established message requirements;
- authorized identity/signing expectations and understood consequential hook, filter, normalization or other helper effects; and
- validity/resume conditions and revocation. The proposed ordinary validity is the same objective across manually invoked phases, Review and original-criteria corrections under the same Plan; revalidate state on resume. Material scope/objective, repository/worktree/branch, permission or consequential helper changes require reassessment. A grant never approves later phase edits or absorbs a Plan amendment.

A phase invocation, terminal capability, saved report, prior commit, readiness advice or `send: false` handoff is not this grant. Do not ask for a grant when checkpointing is inapplicable or there is no eligible candidate. If one is required but absent/ambiguous/revoked/expired, do not mutate Git; continue independent work and ask only for the dependent authorization. A real platform denial stops the affected action and is never bypassed through another role.

## 4. Inspect and preserve the candidate

The Runner acts only on the coordinator-supplied goal, literal candidate/content categories, actual grant and candidate-relevant validation evidence. It does not select scope or broaden the grant.

Before staging, establish and report the repository/worktree identity, branch, baseline HEAD (or evidenced unborn state), repository operation state, relevant index and worktree ownership, and relevant effective local policy. Revalidate these facts on resume. Refuse the affected checkpoint when an operation is in progress, repository identity/branch is uncertain, unrelated staged content exists, or partial staging/same-file ownership is ambiguous. Do not demand a pristine whole worktree: unrelated, clearly owned unstaged work elsewhere may remain untouched.

Git administrative metadata may resolve outside an opened subdirectory or into a linked worktree's common directory. Establish the actual authorized metadata identity and containment for the granted Git effect without treating that path as permission to widen source access or cross into another repository. If the metadata target is outside the grant or its ownership is unclear, stop the affected checkpoint.

Select literal intended paths/content; do not use blanket all-worktree staging or pathspec magic as a shortcut. Inspect the complete proposed candidate, including additions, modifications, deletions, renames, mode changes, and expected filter/line-ending normalization. Confirm candidate-relevant validation actually applies to the staged snapshot; tests against a different working-tree state do not prove that candidate. Detect concurrent edits, HEAD/index drift and ownership changes before mutation; if drift occurs, stop and re-inspect rather than claim an atomic snapshot. Serialize Git mutations and avoid editing during the candidate/commit window.

Before any command that could invoke them, inspect consequential effective hooks/configuration, signing, filters and other executable helpers proportionately under the opening preflight rule. Understand expected normalization and effects. A source-mutating hook in Research, Plan or Review is outside the record-only boundary; a local-commit grant does not authorize source edits. Unknown, incompatible or changed consequential effects stop the affected command before execution. Never bypass hooks/signing, alter configuration, invent identity/legal signoff, expose or acquire secrets/credentials, or authorize network/source effects by implication.

Remote/network effects are outside this checkpoint capability; a hook/helper that would perform them stops the Git action. Runner remains source-read-only in every phase, including Implement, and must stop before invoking a source-mutating helper even when its effects are known. Implement's source authority never transfers to Runner. Any independently permitted source operation belongs to Implement's normal authorized route, separate from Runner's checkpoint invocation; inspect the result and freshly inspect/revalidate the candidate before reconsidering a checkpoint. Do not disable a required hook to force a commit. If the required checkpoint invocation still entails source writes or no compatible route is available, report checkpointing as unavailable and continue independent safe work. The local-commit grant itself never supplies source authority.

## 5. Append and reconcile; never assume success

Only after the complete candidate and relevant checks are supported and state remains current may Runner perform the bounded index and local append-only commit effects. No push, fetch, PR, tag, branch management/switch, amend, rebase, reset, history rewrite, stash, unstage, clean, lock removal, force-add, ignore change or automatic repair is authorized.

Afterward inspect actual local history and state: determine whether a commit exists, its actual ID, parent and content, and the remaining index/worktree/local-only changes. Report unexpected hook/helper effects separately from command exit status. A command success alone does not verify a commit; a failure or timeout does not prove one was absent. If completion is uncertain, reconcile whether the intended commit already exists and inspect index/worktree and validation impacts before retry. Do not create a duplicate, amend, or clean up to make the result look tidy. If unexpected effects invalidate technical evidence, identify and revalidate the affected work; otherwise independent work may continue.

## 6. Report evidence without lifecycle claims

Use only evidence actually observed. Distinguish these outcomes as applicable: **Skipped — not applicable**, **Skipped — no eligible changes**, **Not attempted**, **Unavailable / unresolved**, **Failed**, **No commit verified**, **Commit verified** (ID, parent, purpose/content and relevant validation), **Commit verified with unexpected effects**, or **Completion uncertain** (what remains to reconcile). Also state relevant uncommitted/local-only work and why it remains.

Keep saved files, Plan marker persistence, validation, commit creation and Review acceptance separate. A checkpoint does not authorize source edits, advance RPIR, pass a Work Item gate, admit Review or accept work. A failed Git attempt does not erase verified saved files or independent technical evidence; a normal skip is not a delivery defect. Do not claim installed/runtime safety from authored rules or static tests.
