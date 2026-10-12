# Implementation report: Restore trackable plan work hierarchy

## Delivered outcome and progress

- **Approved outcome:** Initial `/implement` pass for inspected Plan P1, `restore-plan-work-hierarchy`, in `docs/copilot/004-restore-plan-work-hierarchy/001-implementation-plan.md`. The bounded outcome was a prospective Work Item → Task → Step Plan schema, aligned owner guidance and focused static regression coverage; historical Plans, lifecycle policy, permissions, handoffs, runtime behavior, dependencies and packaging were excluded.
- **Actual files and behavior:** Updated `.github/skills/architecture-planning/implementation-plan-template.md` with one unchecked Work Item register, matching numbered Task/Step detail, proportional meaningful units, item-level evidence/acceptance/validation and non-authorizing progress markers. Updated `.github/skills/architecture-planning/SKILL.md` to establish the same default while preserving Plan ownership and Implement discretion. Added `PLAN-HIERARCHY-001` in `scripts/verify-copilot-contracts.cjs` and equivalent/negative staged scenarios in `scripts/test-copilot-contract-scenarios.cjs`. No other source files were changed.
- **Completed Plan work:** Work Items 1–3. The one-item template example has matching Work Item 1 / Task 1.1 / Step 1.1.1 markers; the schema permits multi-item matching IDs without a fixed count or filler levels. The existing Plan agent and lifecycle-record instruction were inspected and did not require edits.
- **Remaining Plan work:** None within this pass. VS Code Local/Agent Host runtime behavior was not activated or established.
- **Corrections:** Corrected an initial static assertion that rejected the template's intended debugging-boundary language, and removed the superseded optional-hierarchy Procedure 6 wording. Final checks were rerun after these corrections.

## Validation

- **Performed:** `npm run verify-copilot-contracts` passed (exit 0): Manifest parity, Authored contracts, and Frontmatter/links/routes/handoffs/tools all passed. `npm run test-copilot-contract-scenarios` passed (exit 0), including healthy/equivalent wording, missing Task/Step checkbox and checkbox-as-approval cases, plus existing regression scenarios. `git diff --check` passed (exit 0). Editor diagnostics reported no errors in the four changed source files.
- **Failed:** None in final checks.
- **Unavailable:** VS Code Customizations Diagnostics and activated Local/Agent Host runtime checks were not available/permitted in this pass; static checks do not establish runtime attachment or behavior.
- **Not run:** Packaging, installation, deployment and external effects were outside the approved boundary and were not run.
- **Limits and risks:** Authored assertions are static text evidence and do not prove runtime permissions, instruction attachment, installed-VSIX behavior, filesystem behavior or runtime agent behavior. No lifecycle policy, Plan-agent permissions, runtime behavior, dependencies, historical Plan or package artifact was changed.

## Execution and review evidence

- **Commands, if any:** From `C:\Repos\UKHO.Copilot.Toolkit`, ran `npm run verify-copilot-contracts`, `npm run test-copilot-contract-scenarios` and `git diff --check`; all final exits were 0. The scenario runner retained `scripts/.rpir-contracts-c6c684d37b13f0a9e59757b0` (118 entries, 313,331 file bytes) and reported staged mutations restored. No cleanup was performed. Initial inspection found existing retained scenario trees; none were removed.
- **Diff and preservation:** Reviewed the scoped diff and final authored output. The changes implement the approved hierarchy and retain current outcome, boundary, validation, recovery, lineage and manual-handoff guidance. Historical numbered Plans, `.github/agents/plan.agent.md`, `.github/instructions/lifecycle-records.instructions.md`, lifecycle core, package configuration and VSIX artifacts remain unchanged.
- **Independent review:** Fresh independent Review is needed; implementation publication is not Review admission or acceptance.

## Identity, direct lineage and next action

- **This report:** Initial implementation report I1 for `restore-plan-work-hierarchy`, `docs/copilot/004-restore-plan-work-hierarchy/001-implementation-report.md`.
- **Plan and predecessors:** Direct predecessor is the inspected physical Plan P1, [`001-implementation-plan.md`](001-implementation-plan.md). Its direct same-folder predecessor is the inspected Research brief R1, [`001-research-brief.md`](001-research-brief.md); no Review-origin ancestry applies.
- **Provenance:** This pass was explicitly invoked through the VS Code Local `implement.prompt.md` route with the Plan supplied as an attachment; the actual contained Plan and Research records were independently read and matched before edits.
- **Physical outcome:** Saved in the verified, contained Plan/Research topic. Before allocation, the topic inventory contained `001-research-brief.md` and `001-implementation-plan.md`, with no implementation-report suffix; `001-implementation-report.md` was therefore absent. The editor reported no denial or overwrite, and this file was read back to verify its identity, substantive content and direct Plan link. No independent ACL/reparse or atomicity guarantee is claimed.
- **Next action:** Manual `/review` with this inspected report version for independent assessment; publication alone does not admit Review.