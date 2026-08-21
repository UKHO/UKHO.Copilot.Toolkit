---
name: test-design
description: Design a focused test and validation matrix covering normal, boundary, negative, regression, and compatibility behavior. Use when planning verification for an implementation or documentation-only customization change.
user-invocable: false
---

# Test design

Use this skill to make verification explicit before or during implementation.

1. Derive scenarios from acceptance criteria and identified risks.
2. Cover happy paths, boundaries, invalid inputs, regressions, and compatibility behavior where relevant.
3. Identify the most valuable automated check and distinguish it from manual or structural inspection.
4. Avoid inventing test frameworks or commands; record unavailable automation as a gap.
5. Return the [test matrix template](./test-matrix-template.md).

Do not edit production files or claim that a check ran when it was only proposed.