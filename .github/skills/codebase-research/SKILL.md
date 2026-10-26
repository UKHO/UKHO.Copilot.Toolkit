---
name: codebase-research
description: Investigate repository structure, existing patterns, and constraints with cited evidence. Use when researching a feature, issue, architecture choice, or Copilot customization before planning.
user-invocable: false
---

# Codebase research

## Trigger

Use this Skill for read-only investigation that turns an ambiguous request into evidence a coordinator can use before planning.

## Inputs

- The research question and request scope, including success criteria and terms needing clarification.
- Relevant repository documentation, files, symbols, patterns, and tests.

## Procedure

1. Identify the request, scope, success criteria, and terms that need clarification.
2. Inspect documentation and relevant files before drawing conclusions; search for symbols, patterns, and related tests.
3. Prefer existing conventions and reusable components over speculative design.
4. Separate observed facts, assumptions, options, risks, and open questions.
5. Cite precise file paths and symbols for every material claim.
6. Explicitly identify architectural choices only within the existing discovery/acknowledgment or explicit-deferral boundary, using the shared [ADR capability](../architecture-decision-records/SKILL.md) and [input coverage map](../architecture-decision-records/references/research-input-coverage.md). Reuse supplied answers/citations without a questionnaire or field quota. Small reversible spikes are not exempt; proportionality governs detail, not coverage. Topology, technology/toolchain baselines, public contracts and security/data boundaries are architectural signals. Assess dependency/test-framework changes in context of platform, integration, compatibility or operating commitments; naming, helper extraction and architecture-preserving repairs are routine coding without ADR reference. Return material classification ambiguity to the coordinator for evidence-led engineer resolution, not silent exclusion.
7. Before handoff, resolve foreseeable engineer-owned architectural choices where practicable; distinguish a decision that needs engineer selection from a non-decision fact that evidence cannot yet establish. Do not present an unresolved architectural choice as a factual unknown. Do not treat a complete Proposed ADR as missing decision content merely because sign-off is pending. Return a narrow evidence report containing the research question, observed facts, cited files and symbols, constraints, assumptions, risks, and unanswered questions. Include a compact **ADR inputs and remaining gaps** handover: each architectural choice's rationale, realistic alternatives/reasons, actual selection or pending state, conditions, likely affected work, existing ADR candidates and consequential gaps/routes; separately identify remaining factual unknowns, their current evidence and consequence, and a supported next check or acquisition route. If no architecture is identified, give an evidence-supported routine-only disposition. Omit irrelevant map categories, not architectural choices. Plan reconciles Research and planning discoveries to complete inspected ADR coverage and formal Work Item IDs; Research supplies evidence only and never authors the standalone ADR or delivery hierarchy. Unknown destinations, records or conditions constrain dependent effects, not phase invocation or independent safe work.

## Outputs

- A narrow evidence report for the Research coordinator, with material claims tied to precise repository paths and symbols; omit unsupported categories.

## Limits

This delegated evidence report is input to the Research coordinator; it is not a research brief and must not allocate, select, create, persist, revise, or authorize any lifecycle artifact, handoff, command, cleanup, scope, hierarchy, or approval. Only the coordinator may synthesize and persist a lifecycle record.

Do not edit files, invent commands or dependencies, or report an inference as a repository fact.

## Validation

- Check that each material claim cites precise file paths and symbols and distinguishes observed facts from assumptions.
- Check that the report remains advisory input rather than a lifecycle record or authorization, and that unanswered questions are disclosed.