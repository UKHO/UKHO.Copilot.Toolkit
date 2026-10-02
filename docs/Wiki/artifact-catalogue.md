---
title: Copilot Toolkit artifact catalogue
description: Inventory and activation boundaries for the Toolkit's Copilot customizations
---

## Purpose and audience

**Purpose:** Locate the current GitHub Copilot customization artifacts, understand what each is for and how it activates, and follow the canonical source when maintenance is needed.

**Audience:** Toolkit maintainers and reviewers who need an inventory of the repository's `.github` artifacts. Readers should understand repository-relative paths and the distinction between source artifacts and their manifest registration.

## Prerequisites

- Read [Maintain the Toolkit](maintain-the-toolkit.md) for maintainer orientation before proposing an artifact change.
- Treat `.github/copilot-instructions.md`, the artifact-specific skills, and the lifecycle policy as canonical operational sources; this catalogue is descriptive and does not authorize changes.

## Content

### Activation and packaging model

The manifest registers the discovered lifecycle instruction under `contributes.chatInstructions`, all listed agents under `contributes.chatAgents`, all four prompt files under `contributes.chatPromptFiles`, and its declared skills under `contributes.chatSkills`. The corresponding entries are also included by `package.json.files` (skills are included by directory). These are manifest and source-inventory facts, not proof of installed packaging or runtime activation. Activation remains governed by each artifact's metadata and Copilot surface:

- **Instructions** are authored to provide repository context when their scope applies. The root instruction is designated always-on; the lifecycle-record instruction declares its numbered-record `applyTo` patterns. Runtime matching and attachment are not established here.
- **Agents** are selected by a user or delegated by an explicitly allowed coordinator. Coordinator agents are user-invocable unless metadata says otherwise; worker agents in this catalogue declare `user-invocable: false` and are intended for delegation.
- **Prompt files** are deliberate, user-invoked Local shortcuts where prompt files are supported; Agent Host does not load them. A built-in `/plan` is not the Toolkit's RPIR Plan route. Verify an equivalent supported route before relying on these sign-offs in another harness.
- **Skills** are model-selected when relevant or user-invoked when their metadata permits it. Skills marked `user-invocable: false` are internal workflow capabilities.
- **Subagents and handoffs** are runtime mechanisms, not additional file categories. Their configuration is held by the relevant agent.

### Instructions

| Artifact purpose | Activation model | Canonical source path | Maintenance trigger |
| --- | --- | --- | --- |
| Repository-wide policy and artifact governance | Repository-only; always-on guidance for this repository, not packaged or applied to installed consumer workspaces | `.github/copilot-instructions.md` | Review when repository policy, packaging boundaries, lifecycle controls, or customization inventory changes. This source is not listed in the current `package.json` contribution or file arrays. |
| Numbered RPIR lifecycle-record guidance | Declared `applyTo` patterns cover numbered Research briefs, Plans, implementation reports, and Review reports under `docs/planning/` and `docs/delivery/`; actual pattern matching and attachment are not verified | `.github/instructions/lifecycle-records.instructions.md` | Review when shared numbered-record lineage, Research folder confirmation, or phase-output evidence changes. This is the one discovered lifecycle instruction listed in `contributes.chatInstructions` and `package.json.files`; declaration does not prove runtime attachment. |

### Custom agents

| Artifact purpose | Activation model | Canonical source path | Maintenance trigger |
| --- | --- | --- | --- |
| Architecture and design trade-off analysis | Delegated worker; `user-invocable: false` | `.github/agents/architecture-analyst.agent.md` | Review when planning evidence, architecture scope, or delegated tools change. |
| Repository structure and pattern investigation | Delegated worker; `user-invocable: false` | `.github/agents/codebase-investigator.agent.md` | Review when repository research boundaries or source-discovery needs change. |
| Functional and acceptance review | Delegated worker; `user-invocable: false` | `.github/agents/correctness-reviewer.agent.md` | Review when implementation acceptance or correctness criteria change. |
| Domain terminology and trusted-source investigation | Delegated worker; `user-invocable: false` | `.github/agents/domain-investigator.agent.md` | Review when domain evidence or source-trust requirements change. |
| Feasibility, dependency, and compatibility investigation | Delegated worker; `user-invocable: false` | `.github/agents/feasibility-investigator.agent.md` | Review when feasibility evidence or compatibility constraints change. |
| Approved scoped implementation coordinator | User-selected coordinator; delegates only its explicit worker allow-list | `.github/agents/implement.agent.md` | Review when implementation approval, edit, command, report, or handoff boundaries change. |
| One assigned implementation work package | Delegated worker; `user-invocable: false` | `.github/agents/implementation-worker.agent.md` | Review when worker scope, edit boundaries, or implementation reporting changes. |
| Maintainability and long-term risk review | Delegated worker; `user-invocable: false` | `.github/agents/maintainability-reviewer.agent.md` | Review when documentation, duplication, discoverability, or maintenance criteria change. |
| Research- or Review-origin Plan coordinator | User-selected coordinator; inspects Research for an initial plan or an agreed actionable Review for a new issue plan; delegates only its explicit allow-list, including `Domain Investigator` and `Feasibility Investigator` for bounded read-only evidence work | `.github/agents/plan.agent.md` | Review when either Plan intake, scope, allocation, investigator routing, or handoff boundaries change. |
| Requirements and acceptance analysis | Delegated worker; `user-invocable: false` | `.github/agents/requirements-analyst.agent.md` | Review when requirements extraction or unresolved-decision handling changes. |
| Evidence-based research coordinator | User-selected coordinator; delegates only its explicit worker allow-list | `.github/agents/research.agent.md` | Review when research evidence, source validation, or research handoff boundaries change. |
| Independent correctness, security, and maintainability review coordinator | User-selected coordinator; delegates only its explicit worker allow-list | `.github/agents/review.agent.md` | Review when review evidence, remediation, acceptance, or handoff boundaries change. |
| Goal-directed Script Runner | Named coordinator delegate; `user-invocable: false` declares it absent from direct user selection; chooses task-relevant commands/cwd for bounded phase-scoped goals, with no edit or nested agent tool; VS Code Workspace Trust, permissions, and managed organization policy govern execution | `.github/agents/script-runner.agent.md` | Review when delegated goal scope, phase boundaries, effects inspection or platform permission controls change. |
| Security and policy-boundary review | Delegated worker; `user-invocable: false` | `.github/agents/security-reviewer.agent.md` | Review when tool, delegation, data-exposure, or approval-boundary risks change. |
| Draft completeness and authority-boundary assurance | Delegated worker; `user-invocable: false`; read/search only | `.github/agents/stage-assurance.agent.md` | Review when pre-persistence assurance, draft readiness, or worker boundaries change. |
| Verification and validation strategy | Delegated worker; `user-invocable: false` | `.github/agents/test-strategist.agent.md` | Review when test scenarios or unavailable-check requirements change. |
| Test and verification assessment | Delegated worker; `user-invocable: false` | `.github/agents/test-worker.agent.md` | Review when test-worker scope or no-command boundaries change. |
| Read-only structural implementation validation | Delegated worker; `user-invocable: false` | `.github/agents/validation-worker.agent.md` | Review when structural checks, evidence reporting, or validation boundaries change. |

All 18 agent paths are registered under `package.json` → `contributes.chatAgents` and included by `package.json.files`.

For lifecycle maintenance, Research proposes one exact subject-based folder and obtains the engineer's confirmation before using or creating it; it then saves and verifies its numbered physical brief there. Plan, Implement and Review inherit that folder, independently inspect a physical same-folder predecessor, and save/read back their own numbered record there before claiming phase output complete. Initial `/plan` with the inspected physical brief completes and approves Research in that request. Later `/plan` with an engineer-agreed actionable Review version creates a distinct issue plan, without re-closing Research or approving edits. Working plans may retain unresolved questions, but RPIR phases are not labelled `Blocked`, and Implement cannot make affected edits until the agreed plan is executable. `/implement` with that version approves only its bounded pass; `/review` with its implementation report approves Review admission, not all-OK acceptance. These descriptions are consumer guidance only: the agents, skills, instructions and repository policy remain the operational sources. Static text assertions do not attest runtime sign-offs, permissions, physical writes or readback.

### Prompt files

| Artifact purpose | Activation model | Canonical source path | Maintenance trigger |
| --- | --- | --- | --- |
| Approve the inspected executable plan for one bounded initial or issue pass | Manual Local prompt invocation; `agent: Implement` | `.github/prompts/implement.prompt.md` | Review when plan intake, readiness or effect boundaries change. |
| Plan from inspected Research or an agreed actionable Review report | Manual Local prompt invocation; `agent: Plan`; the same `/plan` handles initial and issue-scoped planning | `.github/prompts/plan.prompt.md` | Review when either predecessor kind, sign-off or handoff boundaries change. |
| Redirect legacy Review remediation to new-plan intake | Deprecated compatibility-only Local prompt; `agent: Plan`; uses Review-origin `/plan` semantics, never directly implements fixes | `.github/prompts/remediate-review.prompt.md` | Retained as a contributed prompt; review before any separately approved removal. Prefer `/plan` for future issue cycles. |
| Admit the inspected implementation report to independent Review | Manual Local prompt invocation; `agent: Review` | `.github/prompts/review.prompt.md` | Review when report intake, disposition or report-first terminal boundaries change. |

All four prompt paths, including the deprecated compatibility route, remain registered under `package.json` → `contributes.chatPromptFiles` and included by `package.json.files`. A `send: false` handoff pre-fills a prompt; it is not a sign-off or automatic submission. Confirm actual prompt discovery and RPIR semantics in the supported Local harness; Agent Host needs a separately validated supported entry route.

### Skills

| Artifact purpose | Activation model | Canonical source path | Maintenance trigger |
| --- | --- | --- | --- |
| Resolve material clarification and decision questions | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/agent-question-resolution/SKILL.md` | Review when unknown-resolution or fail-closed rules change. |
| Convert requirements and evidence into an implementation plan | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/architecture-planning/SKILL.md` | Review when planning method or acceptance design changes. |
| Review customization and policy-boundary defects | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/code-review/SKILL.md` | Review when review criteria, severity reporting, or policy-boundary checks change. |
| Research repository structure and constraints | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/codebase-research/SKILL.md` | Review when research procedure, evidence, or source-boundary expectations change. |
| Create and validate a focused custom agent | User-invocable capability | `.github/skills/create-copilot-agent/SKILL.md` | Review when agent metadata, tool-boundary, or validation guidance changes. |
| Create and validate a focused custom instruction | User-invocable capability | `.github/skills/create-copilot-instruction/SKILL.md` | Review when instruction scope or discovery guidance changes. |
| Create and validate a focused prompt file | User-invocable capability | `.github/skills/create-copilot-prompt/SKILL.md` | Review when prompt inputs, activation, or side-effect boundaries change. |
| Create and validate a resource-backed skill | User-invocable capability | `.github/skills/create-copilot-skill/SKILL.md` | Review when skill structure, resources, or validation guidance changes. |
| Create or update a human-readable repository Run Book | User-invocable capability; creates guidance only and cannot authorize Runner execution or commands | `.github/skills/create-runbook/SKILL.md` | Review when Run Book anatomy or non-authority boundaries change. |
| Apply lifecycle input, provenance, and phase boundaries | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/rpir-lifecycle-core/SKILL.md` | Review when lifecycle authority, provenance, or confirmation boundaries change. |
| Assess RPIR draft-stage assurance readiness | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/rpir-stage-assurance/SKILL.md` | Review when completeness, traceability, authority, or handoff-readiness checks change. |
| Apply narrow, approved implementation safely | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/safe-implementation/SKILL.md` | Review when implementation scope, validation, or command controls change. |
| Design focused test and validation matrices | Internal/model-selected workflow capability; `user-invocable: false` | `.github/skills/test-design/SKILL.md` | Review when test scenarios or unavailable-check requirements change. |
| Maintain repository-managed Wiki Markdown | User-invocable capability | `.github/skills/wiki-maintenance/SKILL.md` | Review when page anatomy, source validation, navigation, or RPIR maintenance guidance changes. |

All 14 listed skill directories are discovered from `.github/skills`; the manifest synchronizer derives their `package.json` → `contributes.chatSkills` and `package.json.files` registration. This descriptive inventory is not execution, packaging, or policy authority.

## Canonical references

- [`package.json`](../../package.json) — manifest contribution arrays and packaged-file inventory.
- [Repository guidance](../../.github/copilot-instructions.md) — canonical policy, lifecycle boundaries, and packaging distinctions.
- [RPIR lifecycle core](../../.github/skills/rpir-lifecycle-core/SKILL.md) — lifecycle authority and phase boundaries.

## Related links

- [Keeping the Wiki current](keeping-the-wiki-current.md) — bounded procedure for updating this catalogue and other Wiki pages.
- [Wiki maintenance skill](../../.github/skills/wiki-maintenance/SKILL.md) — canonical Wiki scope and maintenance procedure.
- [Wiki page template](../../.github/skills/wiki-maintenance/templates/wiki-page.md) — required page anatomy.
- [Wiki validation checklist](../../.github/skills/wiki-maintenance/references/wiki-validation-checklist.md) — manual structure, source, and navigation checks.

## Next steps

- Maintainers should consult the canonical source path before changing an artifact.
- Before a substantive catalogue update, follow [Keeping the Wiki current](keeping-the-wiki-current.md) and the repository RPIR controls.
- Reconcile this inventory when `package.json` contribution arrays, packaged paths, or `.github` artifact metadata changes.
