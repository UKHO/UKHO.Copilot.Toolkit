---
description: "Template for an iteratable, source-neutral RPIR Research brief"
---

# Research brief

<!-- Numbered local records use an allocated `<NNN>-research-brief.md` path; non-local working records need no invented path. Omit Open questions unless the developer explicitly declares a named question intentionally open or unknown. -->

## Question, scope, and success

- Request / question:
- Scope:
- Success criteria:
- Lifecycle identity and subject:
- Working revision and unresolved decisions or evidence needed:

## Evidence

| Fact | Source | Relevance |
| --- | --- | --- |
|  |  |  |

## Existing patterns and reusable components

-

## Assumptions

-

## Options and trade-offs

1. **Option:** <option>; **Evidence:** <source>; **Trade-off:** <cost or risk>

## Risks and constraints

-

<!-- If, and only if, the developer expressly declares a named question intentionally open or unknown, add an `## Open questions` section here containing that named question. -->

## Recommendation

- Recommended approach:
- Expected benefit:
- Alternatives considered and why they were not selected:
- Next-phase consequences:
- Assumptions that would change the recommendation:

## Lifecycle evidence, provenance, and outcomes

- Local record status, if eligible: `In progress` during Research; `Completed` only after initial `/plan` inspects and signs off this exact version:
- Research revision and stable working-record identity; supersedes working revision:
- Research predecessor: None. Research is the initial RPIR phase; the initiating request and its source are provenance, not a phase predecessor:
- Source envelope: kind `Research`, subject, original channel/locator (attachment, accessible HTTPS URL, paste, or contained local path), inspected snapshot/version (digest or immutable revision where available; otherwise a frozen substantive snapshot with stable fingerprint), draft revision and direct source lineage. When a digest is unavailable, the snapshot and verified full-file postimage/readback suffice:
- Local canonical repository-relative record identity, only if verified (never derive it from a remote label or raw alias):
- Exact lifecycle folder and artifact path, when a numbered local record exists:
- For a new lifecycle, selected opened root and eligible parent (`docs/planning/` or `docs/delivery/`) selection evidence, including expected identity and why this one parent is needed; resolve material ambiguity rather than selecting speculatively. For an existing lifecycle, identify its actual established folder and verify its identity and containment instead of selecting a replacement:
- For a new lifecycle, parent outcome and separate checks: reused unchanged after verifying identity and actual containment, or conditionally created only when absent and needed after selected-root/ancestor containment, expected identity, exact absence (including file collision), and effective tool/managed-policy permission checks; record resolved identity and post-create state. Never create a speculative or second parent:
- For a new lifecycle, subject and selected slug for the prospective numbered topic-folder child; record the complete immediate-child inventory, exact grammar `^[0-9]{3}-[a-z0-9]+(?:-[a-z0-9]+)*$` and valid prefixes `001`–`999`, conflicts (case-equivalent names, invalid numbered-looking entries, duplicate prefixes, colliding files, inaccessible entries, or uncertain same-subject/legacy identity), and per-parent allocation basis (`001` if none, otherwise maximum present prefix plus one; never fill gaps or exceed `999`). Leave unrelated unnumbered legacy folders unchanged:
- For a new lifecycle, child outcome and verification: record the immediately repeated complete inventory, exact candidate absence, conflict and permission checks, creation outcome, and resolved contained identity/post-create state. For an existing lifecycle, record that the actual established folder was verified and inherited. Stop the affected effect on ambiguity, collision, malformed or inaccessible inventory, denial, or inconclusive required evidence; do not claim historical non-reuse or atomicity:
- Historical lifecycle-folder provenance, when applicable: record the actual established folder and evidence (including any historical `B`/`Yes` confirmation) as provenance only; do not require a new name confirmation, rename, relocate, or migrate it:
- Containment and applicable permission evidence for each intended effect: record how evidence establishes lexical and actual destination containment within the selected opened root, with no unresolved indirection, and the effective VS Code/tool and managed-policy permission outcome. A complete existing ancestor-chain/no-reparse inspection is one permitted method, not a universal prerequisite; an ACL estimate or optional probe is neither a permission grant nor a prerequisite. If required containment or permission remains unknown, do not perform the dependent effect:
- Optional probe outcome, only if attempted: identify the specific fact requested and the observed result. An inconclusive result ends that invocation and leaves only that requested fact unestablished by that probe; it is neither safety proof nor evidence by itself of a failed required effect or an unknown relevant effect. The probe is not a prerequisite for folder use or record creation:
- Numbered Research record allocation evidence, only when a local record is allocated: record the actual exact-suffix (`-research-brief.md`) inventory, the immediately repeated inventory before creation, valid three-digit prefix basis (`001` if none, otherwise maximum valid prefix plus one), and the exact candidate's absence before creating it. Stop on malformed or inaccessible inventory, uncertain allocation, or collision; never overwrite. Do not reserve or invent a path:
- Numbered physical Research record identity/version and actual full-file readback outcome: after saving, read back the complete physical file and verify its content, identity, and direct same-folder relationship fields/links. If required parent/child or record containment, permission, allocation, save, or full readback evidence fails or cannot be verified, state that the dependent phase output is unfinished; do not claim a completed record or pointer:
- Direct provenance: For each real numbered local source record, record its verified canonical identity and matching direct one-hop renderable link; for other sources record the actual locator and inspected version without a fabricated local link:
- Evidence sources and observed repository paths:
- Adverse outcomes and refusals: record applicable conflicts, denials, unavailable or inconclusive required evidence, failed save/readback, and the affected unfinished effect/output. Stop only the dependent effect as required; do not imply completion, historical non-reuse, atomicity, or a successful outcome where evidence is absent:
- Historical sign-off: Only initial `/plan` with this inspected version completes and approves Research within that request. Freeze that version separately from later revisions; record invocation and agreed version in the receiving plan. An eligible numbered local `In Progress` record may receive a status-only `Completed` write after full preimage/postimage checks; otherwise record why no local status write occurred:
- This working Research evidence neither approves the Plan handoff by publication nor authorizes implementation; never reopen or overwrite an agreed historical version.
