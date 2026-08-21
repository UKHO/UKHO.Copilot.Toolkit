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
6. Return the [research brief template](./research-brief-template.md), omitting sections that have no evidence.

Do not edit files, invent commands or dependencies, or report an inference as a repository fact.