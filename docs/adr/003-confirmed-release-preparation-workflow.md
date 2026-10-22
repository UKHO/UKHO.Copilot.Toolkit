# ADR 003: Confirmed release preparation workflow

## Record metadata

- **Status:** Proposed.
- **Substantive version:** v0.1, 2026-10-22.
- **Authored:** 2026-10-22.
- **Decision date:** Individual choices were selected on 2026-10-22; this complete record has not been accepted.
- **Author:** GitHub Copilot, acting as the active Plan coordinator.
- **Decision participants and roles:** Requesting engineer selects outcome, boundaries and future release edits. GitHub Copilot supplies analysis/drafting, not release or enterprise approval. No additional approval matrix is established.
- **Agreement evidence:** Physical Research v1.2 records the engineer's quick, prepare-only, non-RPIR routine workflow and request to reflect built-in Agent mode instead of a custom agent. Plan-chat version option C requests proper release rules and reports earlier versions unreleased; subsequent B selects agent-proposed version/changelog updates only after engineer confirmation. Validation B selects fixtures only for this delivery. The latest A selects the exact ADR 002/003 destinations, existing template and Proposed drafting. These choices do not approve every drafting detail, pick a concrete version, authorize current packaging/source edits or accept this complete ADR.
- **Affected systems:** Prospective repository-local release preparation, bounded release-input editing, package interfaces/fixtures and Run Book/policy authoring guidance. No publisher account, credentials, CI publisher or installed runtime is implemented.
- **Related decisions:** [ADR 002](002-local-vsix-candidate-archive.md), Proposed v0.1, covers candidate identity/storage/evidence/status/backup. ADR 001 covers RPIR architectural coverage/checkpoints and remains unchanged. No reciprocal ADR/register edit is performed.
- **Source revisions:** Research v1.2, working Plan v0.11 at drafting intake and attributed subsequent answers. Plan v0.12 is intended to bind this exact v0.1 after separate save/readback. Local RPIR records may be unavailable in versioned checkouts; this rationale is standalone.

## Context and problem

The maintainer wants a complete Run Book that built-in VS Code Agent mode can follow quickly to produce a locally retained candidate, with manual testing/publication afterward. Current policy defers packaging and uses phase-scoped Script Runner delegation; the Run Book and its authoring guidance are human-facing/non-executable. The existing helpers protect a single root `1.0.0` candidate, not the selected archive. Adding a document or agent cannot self-grant the desired operation.

During planning the engineer deliberately expanded the original no-source-edit preparation task: the agent should propose version/changelog changes, ask for confirmation, then update those release inputs before building. This is a bounded exception, not authority to repair arbitrary source, sync the manifest, change dependencies or publish. Invocation/edit policy is recorded separately from artifact policy because those permissions may change independently.

## Decision and conditions

### D3 — Built-in Agent entry with a narrow confirmed-edit exception

- **Choice and rationale:** The future routine task uses built-in Agent mode with the canonical `docs/run-books/vsix-packaging.md`; no lifecycle predecessor or new RPIR records are required during routine use. No new custom agent or optional prompt is included in the proposed baseline. Helpers own deterministic preflight/build/verification/archive behavior; the Run Book states exact implemented interfaces, effects, failure handling and handoff. The task stops before installation/manual testing/publication.
- **Alternatives:** Keeping all operation under RPIR adds unwanted routine overhead. A custom role/prompt might aid future discovery or isolation but adds unjustified routing/contribution scope now; neither is a sandbox. Keeping release-input edits in a separate development task minimizes mutation, but engineer selected the confirmation-gated step within preparation instead.
- **Actual selection:** Research establishes built-in Agent/prepare-only direction. Plan-chat B selects agent-proposed engineer-confirmed release-input edits. No custom agent is required; omission of the optional shortcut is the coordinator's bounded baseline proposal, not a separately attributed engineer answer.
- **Confirmed-edit conditions:** Show current/proposed numeric version, change classification/rationale, exact intended release notes and affected fields; obtain explicit confirmation of those edits before writing. Limit effects to `package.json.version`, `package-lock.json.version`, `package-lock.json.packages[""].version` and the selected pending release notes in `CHANGELOG.md`. Preserve dependencies, contribution metadata, identity/engine and historical notes. Reinspect preimages; material drift invalidates dependent confirmation. Save/read back and check consistency before fresh build preflight. Rejection/cancellation performs no edit; partial failure reports actual state and stops dependent packaging. Do not overwrite concurrent edits, silently revert user work or auto-bump on retries. Build failure does not silently roll back confirmed inputs. Do not invoke generic version commands with unassessed lifecycle/tag/commit effects.
- **Authority conditions and affected work:** Work Items 1–4 deliver capability, tests and narrow policy alignment, but only Implement after actual approved-Plan invocation may edit those sources. Built-in Agent owns any future specifically confirmed release-input edit; Script Runner remains source-read-only with unchanged tools and delegation boundaries. No general source repair, dependency install, automatic sync, lifecycle record creation, Git mutation, installation, publication, credentials, archive cleanup or backup is part of the routine task. Actual VS Code permissions, Workspace Trust and managed policy apply; a Run Book is not execution authority or a denial bypass. Consequential development beyond the release-input exception still uses RPIR.
- **Current-delivery limit:** Engineer selected fixtures-only validation B. No real `vsce`, retained real build, runtime Agent trial, install or activation occurs under this Plan. Any future routine preparation request needs actual effective authorization under the then-loaded policy and a separately authorized follow-up; authoring a future exception cannot self-upgrade this session. Keep package CI disabled. Static/fixture completion is not operational acceptance.

### D4 — Human publication with method and publisher access deferred

- **Choice and rationale:** The engineer owns manual testing, release selection and publication; preparation has no publisher access and needs no credentials merely to build locally. Exact tested-file selection is governed by ADR 002 D1.
- **Alternatives:** Human browser upload offers minimal integration. Existing-file CLI publication can be repeatable but requires deliberate authentication/external-effect handling. CI promotion adds artifact transfer and infrastructure; none is necessary for local preparation.
- **Actual selection/pending state:** Human ownership is selected in Research. Specific publication method, actual publisher authority, authentication route and public channel selection remain deferred and outside delivery. Do not describe manual browser upload or any identity as already selected/verified. No publisher helper, account query or CI publisher is included.
- **Conditions and affected work:** Work Item 3 documents only the handoff and human prerequisites/boundary. No credential acquisition or publication may proceed under this delivery; resolve method/identity/current platform support separately before any future human publication. Unknown external completion must be reconciled by the engineer before retry or a confirmed status claim, not inferred from packaging checks or a status file.

### D5 — Release version distinct from candidate attempt

- **Choice and rationale:** Reuse the existing changelog's numeric major/minor/patch convention: breaking supported behavior/contracts -> major, compatible capabilities -> minor, compatible fixes -> patch. Propose a version supported by inspected changes and a credible release baseline; engineer confirms exact edits under D3. Repeated unpublished attempts may share the intended release version in distinct folders. Published versions are not replaced/reused; next releases need the appropriate higher version. Do not use candidate suffixes or a public pre-release channel merely to identify local attempts.
- **Alternatives:** Bumping on every retry confuses attempts with releases and consumes versions without a change-based reason. Permanently retaining hard-coded `1.0.0` prevents normal releases. Fully autonomous bump selection can misclassify compatibility and exceeds the selected confirmation boundary. Engineer selected an integrated confirmed edit over the proposed separate-input workflow.
- **Actual selection/evidence:** Engineer requested proper release rules and selected confirmation-gated edits B. `CHANGELOG.md` already defines Semantic Versioning; this is existing practice reused for the proposal, not a newly inferred answer choosing a concrete version. Preserve publisher/name `ukho.ukho-copilot-toolkit`, engine `^1.130.0` and pinned `@vscode/vsce` 3.9.2; no dependency/toolchain upgrade is needed. Generalize the helper/verifier's prepared numeric-version guards while retaining identity and payload protection.
- **Pending conditions and affected work:** Work Items 1–4 implement/document generalized checks and confirmation safety. First public version, actual Marketplace occupancy and release baseline are unresolved and constrain future actual version proposals/publication, not fixture-only implementation. The changelog records private `0.1.0` and unreleased `1.0.0`; the engineer reports prior versions unreleased, possibly referring to public publication. Preserve both sources without rewriting history or inventing a reconciliation. Obtain engineer clarification/evidence for a real release proposal; if classification/baseline is unknown, ask rather than guess. Do not bump this checkout merely to fixture-test the new capability. Future no-bump rebuilds retain fresh candidate identity and do not inherit testing from another attempt.

## Alternatives and reasoning

| Option | Evidence and benefits | Costs, risks, limitations | Disposition and reason |
| --- | --- | --- | --- |
| RPIR/custom agent for every candidate | Familiar phase controls | Conflicts with quick routine workflow; unnecessary role overhead | Not the selected entry; consequential tooling development still uses RPIR |
| Built-in Agent, prepared inputs only | Small mutation boundary | Engineer would need a separate task to update release notes/version | Considered; engineer selected confirmed release-input edits instead |
| Built-in Agent plus confirmed release-input step | Meets selected ownership with visible change approval | Requires exact edit scoping, drift checks and partial-failure handling | Selected operating direction; prospective policy alignment remains delivery work |
| Unattended bump/build/publish | Low interaction | Unselected version judgement, credentials and external release effects | Excluded |
| Manual/CLI/CI publication implementation now | Could complete distribution automation | Method/identity unknown and outside prepare-only task | Deferred; human ownership only is selected |

## Consequences

- **Expected benefits:** Quick repeatable preparation, explicit release-edit ownership and a clear human test/release boundary without a new role or dependency.
- **Risks and debt:** Model judgement about change classification and human confirmation remain essential. Built-in Agent may expose broader tools; authored constraints are not mechanical isolation. Confirmed multi-file edits can partially fail and must not be represented as atomic.
- **Operational impact:** Maintain exact implemented helper interfaces and Run Book/policy together. Missing prerequisites requiring repair stop routine preparation. No command catalogue or Run Book row becomes Script Runner eligibility or authority.
- **Recovery constraints:** Inspect actual effects before retries; no silent bump, reset, rollback of user changes, archive rewrite, hook bypass or publication replay. Delivery rollback guidance remains Plan-owned, based on attributable preimages, not Git history rewrite.
- **Dependencies:** ADR 002's archive/evidence contract, approved Plan/manual Implement invocation, current tool permissions and the separately authorized future packaging route. Fixture results do not establish pinned real-build success, installed discovery, actual conversation behavior or cross-platform equivalence.

## Standards and practice alignment

Reuses the inspected changelog's Semantic Versioning convention and current publisher/engine/pinned-tool commitments. Published-version/channel details in Research are prior retrieved evidence, not refreshed platform checks; no actual publication depends on them here. Preserve current RPIR/Runner guardrails outside the narrow prospective exception. No enterprise release approval matrix, new authentication standard, special Markdown renderer or compliance claim is established.

## Open items and decision conditions

| Item | Consequence / affected work | Owner or owner-to-identify | Resolution evidence / route | State |
| --- | --- | --- | --- | --- |
| Destination/template/Proposed state | This draft and Plan binding | Engineer; Plan coordinator drafts | Latest A selects exact offered paths/template/state | Selected; persistence verified separately |
| Complete ADR agreement | No unconditional Accepted status | Engineer; additional applicable authority not established | Attribute actual choices; obtain any newly required material decision without inventing governance | Proposed |
| Exact public version/release baseline | Future actual edits and publication, not fixture implementation | Engineer supplies/selects baseline and confirms proposal | Resolve private/public history and change evidence before dependent proposal | Open, deferred to first actual preparation |
| Publisher/method/access | Human publication only | Engineer | Separately establish method/authority/current external facts before publication | Open/outside delivery |
| Prospective exception adoption | Work Item 4 policy and Run Book alignment | Engineer approves inspected Plan by manual Implement invocation | Inspect this exact ADR/Plan and preserve selected fixture-only current pass | Proposed, not current execution authority |
| Real packaging/runtime validation | Full operational confidence | Engineer selects follow-up authorization | Fixtures-only B forbids those executions in this pass; record limits honestly | Deferred, not waived/passed |

## References and implementation binding

- [Manifest](../../package.json), [lockfile](../../package-lock.json) root version metadata, [changelog](../../CHANGELOG.md) versioning/history and [Run Book](../run-books/vsix-packaging.md): inspected source contracts, not edit/execute permission.
- [Repository guidance](../../.github/copilot-instructions.md), [Run Book authoring Skill](../../.github/skills/create-runbook/SKILL.md), [lifecycle core](../../.github/skills/rpir-lifecycle-core/SKILL.md): current boundaries that must be deliberately aligned, not silently bypassed.
- [Research v1.2](../copilot/021-local-vsix-archive-and-marketplace-release/001-research-brief.md), 2026-10-22, local-only source; Plan-chat version ownership B explicitly changes its original source-edit exclusion.
- **Associated Plan:** [001-implementation-plan.md](../copilot/021-local-vsix-archive-and-marketplace-release/001-implementation-plan.md), intended working v0.12, 2026-10-22. Its single Work Item hierarchy, criteria and G1 govern delivery after actual invocation, not this ADR alone.
- **Coverage:** Plan D3 -> this D3, Work Items 1–4; Plan D4 -> this D4, Work Item 3 documentation only; Plan D5 -> this D5, Work Items 1–4. All bindings are Proposed v0.1 with actual selections, remaining conditions and future-effect deferrals above.
- **Convention/renderer:** Engineer-selected existing ADR directory, exact filename and template, Proposed state, ordinary Markdown. No change to ADR 001 or a register.

This supplementary Proposed record grants no source, Git, packaging, installation, publication, lifecycle-transition or acceptance authority. Its save/readback is distinct from Plan binding, engineer confirmation of future release edits and delivery acceptance.