# ADR 002: Local VSIX candidate archive

## Record metadata

- **Status:** Proposed.
- **Substantive version:** v0.1, 2026-10-22.
- **Authored:** 2026-10-22.
- **Decision date:** Individual selections were made on 2026-10-22; this complete ADR has not been accepted.
- **Author:** GitHub Copilot, acting as the active Plan coordinator.
- **Decision participants and roles:** The requesting engineer supplied the workflow requirements and selected the archive/evidence arrangements. GitHub Copilot analyses and drafts; no enterprise approval matrix or additional decision authority has been established.
- **Agreement evidence:** Research v1.2 records engineer-selected date-first retention of all candidates, repeated versions and manual-test failures. In the Plan conversation on 2026-10-22, separate answers A selected `Releases/`, UTC dates, time plus unique ID, compact verification evidence, exact-tested-file publication, manual status-file edits, and maintainer-owned backup outside the workflow. The latest answer A selects this exact path and the associated ADR 003 path, existing template and Proposed drafting. These attributed selections are not acceptance of every drafting detail, delivery approval, Git authority or upload permission.
- **Affected systems:** Toolkit local packaging/verification helpers and fixtures, candidate metadata and the maintainer Run Book. No installed extension behavior or external storage system is changed by this record.
- **Related decisions:** [ADR 003](003-confirmed-release-preparation-workflow.md) covers invocation, release-input edits, versioning and publication ownership. ADR 001 covers RPIR architecture/checkpoints, not this archive. No existing ADR or register is modified.
- **Source revisions:** Research v1.2, working Plan v0.11 at drafting intake, and engineer answers above. Associated Plan v0.12 is intended to bind this exact v0.1 after separate save/readback; local lifecycle links may be unavailable outside this workspace.

## Context and problem

The maintainer wants to build a local VSIX, test it manually, then publish the tested candidate, retaining unsuccessful attempts as well as selected releases. The existing package helper accepts no arguments, guards version `1.0.0` and writes to one absent repository-root target. The verifier selects that root file and compares it against today's checkout. Those controls protect one candidate but do not support repeated same-version builds or meaningful verification after source changes.

The existing archive is ignored by Git; ignored storage is neither backup nor trusted provenance. Existing root/legacy archives must remain untouched, with no migration, renaming, overwrite or inferred publication history. Deterministic helpers should allocate/verify candidates rather than rely on model-improvised filesystem operations.

The grouped choices below share candidate identity and retention context. Each remains separately traceable to the associated Plan's Work Items; invocation authority changes independently and is kept in ADR 003.

## Decision and conditions

### D1 — Promote the exact tested artifact

- **Choice and rationale:** Human publication selects the exact retained VSIX that passed the relevant manual testing. Candidate ID, explicit path, packaged identity/version, SHA-256 and size identify those bytes. Check integrity before publication; mismatch stops promotion. Do not edit/rebuild the archive or regenerate its expected evidence to accommodate a changed file.
- **Alternatives:** A source rebuild may be useful but creates a new candidate and needs fresh verification/testing; source revision or matching version does not establish byte identity. Selecting “latest” or another same-version filename risks publishing untested bytes.
- **Actual selection:** Engineer's publication-rule A selected exact-tested-archive publication. A rebuild always receives a new retained candidate identity and starts untested; test success is not inherited.
- **Conditions and affected work:** Work Items 1–3 implement identity/integrity checks and document the human selection boundary. No upload, publisher identity, authentication method or release permission is selected here; ADR 003 D4 records that deferral. A local hash does not guarantee the bytes of any later Marketplace download/signature packaging.

### D2 — Date-first local all-candidate storage with separate backup ownership

- **Choice and rationale:** New candidates use `Releases/YYYY-MM-DD/HHmmssZ-<unique-id>/`, with UTC date/time from one allocation instant. Keep a version-derived VSIX leaf inside each attempt. Exclusive attempt allocation and non-overwrite file creation preserve same-day/same-version and concurrent attempts. Unique-ID generation is a routine implementation choice subject to collision tests; collisions never reuse a candidate.
- **Alternatives:** Daily flat/version-only targets collide across attempts. Daily sequence allocation is readable but needs shared sequence/race handling; time plus unique ID was selected instead. External storage can survive checkout replacement but introduces unselected path/access concerns; integrated managed backup adds infrastructure/external effects.
- **Actual selection:** Separate Plan-chat A answers select existing repository-local `Releases/`, UTC `YYYY-MM-DD`, UTC time plus ID and maintainer-owned backup outside the workflow. Research selected retention of all candidates, including complete verification/manual-test failures. No automatic pruning or retention cutoff is introduced.
- **Conditions and affected work:** Work Items 1–3 preserve existing contents, enforce ancestor containment and reject unsafe path components/symlinks/junctions for writes. Owned transient build outputs may be cleaned; retained attempts may not. Mark incomplete outputs truthfully, never as verified/installable. Maintainers preserve each whole candidate folder including evidence/status when backing up; no backup command/service/destination/schedule or external write is part of delivery. Local loss remains possible; restored-candidate integrity must be checked before use, not assumed.

### D6 — Compact verification evidence and manually edited human status

- **Choice and rationale:** Retain candidate-local identity/version, creation time, VSIX hash/size, canonical expected packaged-member paths/hashes/lengths, compact manifest, verification outcome and schema/policy/tool identity. Derive expected member evidence from build-bound inputs, including declared transformations, not circularly from the artifact being checked. Fresh verification preserves input/payload fidelity checks and detects relevant input drift; historical verification uses retained evidence independently of today's checkout.
- **Alternatives:** A VSIX hash alone cannot establish payload boundary/source fidelity. Today's checkout can legitimately differ. Full source buffers/logs ease diagnostics and may reuse current verifier inputs but add storage and complexity beyond selected evidence level. Shared mutable indexes add unnecessary concurrency; a status command adds an unneeded mutation interface.
- **Actual selection:** Evidence A selects compact metadata, not mandatory source snapshots/detailed logs. Status A selects a small separate human-editable file beside each candidate, initialized once with “not tested” and “not published”; the engineer records later actual outcomes/dates/notes. No status-writing CLI, agent continuation or central index is added. Exact filenames/schema are implementation details within this contract.
- **Conditions and affected work:** Work Items 1–3 retain ZIP/path/identity/boundary protections, version the evidence interpretation, and test missing/tampered evidence, changed checkout, interruption and malformed/mismatched human status. Bind status to candidate ID/hash, preserve original verification evidence and bytes, and identify human reports as such. Unknown publication completion remains pending/unknown until reconciled by the engineer. Editable evidence plus hash is not trusted provenance: co-tampering can defeat historical comparisons. No signing/attestation service or reproducible-build claim is added.

## Alternatives and reasoning

| Option | Evidence and benefits | Costs, risks, limitations | Disposition and reason |
| --- | --- | --- | --- |
| Keep one root candidate per version | Existing exclusive creation protects its target | Cannot retain multiple attempts; checkout-bound verification ages badly | Not sufficient for the selected archive outcome |
| Unique UTC attempts with compact evidence/manual status | Readable chronology; preserves attempts; small independent historical baseline | Disk growth, manual status mistakes and no authenticated provenance | Engineer-selected direction, with stated safeguards |
| Full source/log evidence platform | Richer investigation and reproducibility inputs | Storage/governance/interface complexity; still not automatic authenticity | Not selected; no mandatory full snapshot/log retention |
| Managed external artifact/backup service | Potential recovery/sharing | New access, retention, infrastructure and external effects | Outside scope; maintainer owns separate backup |

## Consequences

- **Expected benefits:** Exact-file handoff, retained failure history and historical integrity checks without reconstructing the old checkout.
- **Risks and debt:** Indefinite local retention consumes space; manual status is fallible; checks do not prove runtime safety, authenticity or external publication. Keep evidence interpretation compatible or report unsupported schemas rather than silently reinterpret them.
- **Operational impact:** No new dependency/service or Git binary tracking. Preserve whole candidate folders for backup, and do not confuse Git ignores with access control or durability.
- **Recovery constraints:** Do not repair a retained package in place. Corrections create new candidates. Changes to storage policy require a separately bounded decision/migration; this record authorizes neither cleanup nor restore effects.
- **Dependencies:** Existing explicit package boundary, pinned toolchain, safe paths and the future authorized preparation route in ADR 003. Helpers/interfaces require implementation and fixture validation; real builds/runtime checks remain deferred under the engineer's validation B.

## Standards and practice alignment

Reuses SHA-256 as an integrity identifier, UTC sortable dates and the repository's existing exclusive-copy and exact-payload validation patterns. None is a compliance certification or trusted provenance scheme. No enterprise retention schedule, backup standard, special renderer or approval matrix was established. Numeric release-version policy is covered separately in ADR 003 D5.

## Open items and decision conditions

| Item | Consequence / affected work | Owner or owner-to-identify | Resolution evidence / route | State |
| --- | --- | --- | --- | --- |
| ADR destination/template/Proposed state | This guarded draft and Plan binding | Engineer; Plan coordinator drafts | Engineer selected offered paths/template/state with A | Selected; save/readback reported separately |
| Complete record agreement | No unconditional Accepted claim | Engineer; any additional applicable governance authority is not established | Record actual additional agreement if supplied; surface newly evidenced material constraints | Proposed, individual selections attributed above |
| Real build and runtime evidence | Full operational confidence, not fixture execution | Engineer selects later authorization | Separate real-build/runtime follow-up; no execution under current delivery | Explicitly deferred by validation B |
| Backup destination/service | Actual recovery, not local retention tooling | Maintainer | Separate maintainer arrangement outside workflow | Outside scope; no backup existence claimed |

## References and implementation binding

- [Package helper](../../scripts/package-vsix.cjs): `expectedTarget`, `packageVsix`, exclusive copy and output comparison.
- [Archive verifier](../../scripts/verify-vsix-boundary.cjs): current root selection and payload checks; historical interface is not yet implemented.
- [Run Book](../run-books/vsix-packaging.md) and [ignore policy](../../.gitignore): inspected current state, not authority to execute future operations.
- [Research v1.2](../copilot/021-local-vsix-archive-and-marketplace-release/001-research-brief.md), 2026-10-22; local-only input whose pending choices were refined by attributed Plan-chat answers.
- **Associated Plan:** [001-implementation-plan.md](../copilot/021-local-vsix-archive-and-marketplace-release/001-implementation-plan.md), intended working v0.12, 2026-10-22. Plan owns the sole delivery hierarchy, acceptance and checkpoint strategy; this ADR adds no work register.
- **Coverage:** Plan D1 -> this D1; D2 -> this D2; D6 -> this D6, all Proposed v0.1 with agreement and conditions above, Work Items 1–3. No other choice is covered by implication.
- **Convention/renderer:** Engineer-selected contained path and existing repository ADR template, Proposed state, ordinary Markdown. ADR 001 is unchanged; this record does not amend its operating policy.

This supplementary Proposed record grants no source, Git, packaging, installation, publication, backup, lifecycle-transition or acceptance authority. Its save/readback and the Plan binding are separate effects.