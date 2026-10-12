---
name: test-design-rpir-case-nested
description: Design a focused test and validation matrix covering normal, boundary, negative, regression, and compatibility behavior. Use when planning verification for an implementation or documentation-only customization change.
user-invocable: false
---

# Test design

## Trigger

Use this skill to make verification explicit before or during implementation.

## Inputs

- Acceptance criteria and identified risks.
- Relevant normal, boundary, invalid-input, regression, and compatibility behaviors.

## Procedure

1. Derive scenarios from acceptance criteria and identified risks.
2. Cover happy paths, boundaries, invalid inputs, regressions, and compatibility behavior where relevant.
3. Identify the most valuable automated check and distinguish it from manual or structural inspection.
4. Avoid inventing test frameworks or commands; record unavailable automation as a gap.
5. Return the [test matrix template](../test-matrix-template.md).

## Outputs

- A focused test and validation matrix using the [test matrix template](../test-matrix-template.md), with proposed checks distinguished from performed checks.

## Limits

Do not edit production files or claim that a check ran when it was only proposed.

## Validation

- Confirm scenarios trace to acceptance criteria or identified risks and include relevant boundary, negative, regression, and compatibility behavior.
- Distinguish automated checks from manual or structural inspection, and identify unavailable automation rather than inventing commands or frameworks.