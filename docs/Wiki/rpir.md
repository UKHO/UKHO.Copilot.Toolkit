# Research → Plan → Implement → Review (RPIR)

## Purpose and audience

**Purpose:** Explain who owns each RPIR phase, what evidence it produces, and which decisions remain manual.

**Audience:** Consumers and maintainers who need to plan, implement, or interpret a consequential repository change.

## Prerequisites

- Start with a defined request and its exact intended scope.
- Read the [lifecycle evidence and authority reference](lifecycle-evidence-and-authority.md) when interpreting a plan or report.

## Content

RPIR separates evidence, scope, implementation, and independent review:

| Phase | Coordinator | Primary evidence | Manual decision and boundary |
| --- | --- | --- | --- |
| **Research** | Research coordinator | A cited research brief describing facts, assumptions, options, risks, and recommendation. | Evidence does not approve a plan or authorize implementation. The Plan handoff remains manual. |
| **Plan** | Plan coordinator | An implementation plan with exact scope, hierarchy, acceptance criteria, risks, and validation strategy. | The plan is authoritative for its scope and hierarchy, but plan creation or a phase request does not authorize implementation. The developer must approve the exact saved plan before Implement; planned task goals never replace that approval. |
| **Implement** | Implement coordinator | Changed files and, when authorized, an immutable implementation report describing execution and validation. | Implement changes only its approved plan scope; ordinary task commands are delegated as bounded goals to Script Runner, workers do not execute commands, and VS Code or managed policy may prompt or deny. Separate remediation and exact empty-directory cleanup retain their own gates. |
| **Review** | Review coordinator | An independent, immutable review report with evidence-based findings and one documented disposition. | Review does not authorize remediation or acceptance. Only a persisted `No remediation required` report followed by explicit developer acceptance may permit the defined status update. |

Research is iterative: a new or amended brief remains `Status: In progress` until a valid explicit `/plan` admission approves the exact canonical brief. Plan validates the input, then performs the narrowly bounded procedural status transition to `Completed`; a rejected or integrity-failing admission writes and allocates nothing. Closure approves Research for Plan only—it does not approve the implementation plan or implementation.

Plan must complete all implementation-relevant evidence and decisions before persistence. An implementation-ready plan specifies targets, operations, dependencies, safety gates, validation, acceptance, rollback, and operator effects, or it remains blocked. A fully prescribed observation may remain bounded in the plan only when it cannot create a decision. Implement and its workers refuse research, invention, unplanned targets or dependencies, design choices, and scope or hierarchy expansion; the issue returns to Plan amendment or a new Research pass. Runner's choice of task-relevant command/cwd within that bounded goal is not a new implementation decision.

A phase request processes an already validated input; it is not itself an approval, handoff, record write, or command confirmation. Developer approval of the exact saved plan is still required before Implement and is pass-scoped to the initial non-remediation work. Research, Plan and Review may delegate observational goals to Script Runner without intentionally editing project files; Implement may delegate approved scoped goals. Each goal identifies the phase, selected opened root, scope, expected observation and anticipated effects; no catalogue ID or literal plan row is required. Direct Implement terminal use remains only for separately approved exact empty-contained-directory cleanup; ordinary workers do not execute commands. External VS Code, Workspace Trust, tool-permission, and managed-policy prompts or denials remain authoritative. Do not treat a brief, Wiki, implementation report, review report or handoff as permission to expand scope, implement, remediate or accept work.

## Canonical references

- [RPIR lifecycle core](../../.github/skills/rpir-lifecycle-core/SKILL.md) — Canonical lifecycle-input, provenance, phase-boundary, plan-authority, and non-authorizing-report semantics.
- [Research coordinator](../../.github/agents/research.agent.md) — Research responsibilities, evidence boundary, and manual Plan handoff.
- [Plan coordinator](../../.github/agents/plan.agent.md) — Planning scope, hierarchy, approval boundary, and manual Implement handoff.
- [Implement coordinator](../../.github/agents/implement.agent.md) — Approved-scope implementation, validation, command, and reporting boundaries.
- [Review coordinator](../../.github/agents/review.agent.md) — Independent review, report, acceptance, and remediation boundaries.
- [Repository Copilot instructions](../../.github/copilot-instructions.md) — Repository-wide RPIR policy and least-privilege controls.

## Related links

- [Choose an artifact](choose-an-artifact.md) — Select the appropriate customization primitive before entering RPIR.
- [Lifecycle evidence and authority](lifecycle-evidence-and-authority.md) — Learn which lifecycle record or report answers which question.

## Next steps

- Identify the exact canonical input and read the applicable phase guidance.
- Approve the exact saved plan before Implement; describe bounded task goals and keep remediation and cleanup separately controlled.
- Keep handoffs and consequential decisions manual; do not infer approval from a phase request or evidence record. Repository policy cannot override external prompts or denials.
