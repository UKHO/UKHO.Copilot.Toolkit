---
name: codebase-research
description: Investigate repository structure, existing patterns, and constraints with cited evidence. Use when researching a feature, issue, architecture choice, or Copilot customization before planning.
user-invocable: false
---

# Codebase research

Use this skill for read-only investigation that turns an ambiguous request into evidence a coordinator can use.

1. Identify the request, scope, success criteria, and terms that need clarification.
2. Inspect documentation and relevant files before drawing conclusions; search for symbols, patterns, and related tests.
3. Prefer existing conventions and reusable components over speculative design.
4. Separate observed facts, assumptions, options, risks, and open questions.
5. Cite precise file paths and symbols for every material claim.
6. Return a narrow evidence report containing the research question, observed facts, cited files and symbols, constraints, assumptions, risks, and unanswered questions. Omit categories that have no evidence.

This delegated evidence report is input to the Research coordinator; it is not a research brief and must not allocate, select, create, persist, revise, or authorize any lifecycle artifact, handoff, command, cleanup, scope, hierarchy, or approval. Only the coordinator may synthesize and persist a lifecycle record.

Do not edit files, invent commands or dependencies, or report an inference as a repository fact.