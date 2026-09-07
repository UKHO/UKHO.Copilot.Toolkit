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
| **Plan** | Plan coordinator | An implementation plan with exact scope, hierarchy, acceptance criteria, risks, and validation strategy. | The plan is authoritative for its scope and hierarchy, but plan creation or a phase request does not authorize implementation. The developer must approve the exact plan before Implement. |
| **Implement** | Implement coordinator | Changed files and, when authorized, an immutable implementation report describing execution and validation. | Implement changes only the approved plan scope. Commands require separate fresh confirmation; workers do not execute commands. |
| **Review** | Review coordinator | An independent, immutable review report with evidence-based findings and one documented disposition. | Review does not authorize remediation or acceptance. Only a persisted `No remediation required` report followed by explicit developer acceptance may permit the defined status update. |

A phase request processes an already validated input; it is not itself an approval, handoff, record write, or command confirmation. Do not cross boundaries by treating a research brief, Wiki page, implementation report, review report, or handoff as permission to expand scope, implement, remediate, or accept work.

## Canonical references

- [RPIR lifecycle core](../.github/skills/rpir-lifecycle-core/SKILL.md) — Canonical lifecycle-input, provenance, phase-boundary, plan-authority, and non-authorizing-report semantics.
- [Research coordinator](../.github/agents/research.agent.md) — Research responsibilities, evidence boundary, and manual Plan handoff.
- [Plan coordinator](../.github/agents/plan.agent.md) — Planning scope, hierarchy, approval boundary, and manual Implement handoff.
- [Implement coordinator](../.github/agents/implement.agent.md) — Approved-scope implementation, validation, command, and reporting boundaries.
- [Review coordinator](../.github/agents/review.agent.md) — Independent review, report, acceptance, and remediation boundaries.
- [Repository Copilot instructions](../.github/copilot-instructions.md) — Repository-wide RPIR policy and least-privilege controls.

## Related links

- [Choose an artifact](choose-an-artifact.md) — Select the appropriate customization primitive before entering RPIR.
- [Lifecycle evidence and authority](lifecycle-evidence-and-authority.md) — Learn which lifecycle record or report answers which question.

## Next steps

- Identify the exact canonical input and read the applicable phase guidance.
- Keep handoffs and consequential decisions manual; do not infer approval from a phase request or evidence record.
