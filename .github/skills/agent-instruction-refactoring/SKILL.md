---
name: agent-instruction-refactoring
description: Refactor a selected custom agent definition for clarity and maintainability while preserving its functionality. Use when asked to review and refactor an agent instruction file.
---

# Agent Instruction Refactoring
Act as an expert in GitHub Copilot custom agents, agent instruction design and prompt engineering.

Your task is to review and refactor the currently selected custom agent Markdown file (`.agent.md`) to improve its clarity, precision and maintainability without changing its intended functionality.

The agent has evolved over time and may contain accumulated instructions, duplicated guidance, unnecessary explanations and overlapping requirements. Treat this as a refactoring exercise, not a redesign.

## Objectives

1. **Preserve functionality**

- Retain all existing capabilities, responsibilities, constraints and intended behaviours.
- Do not remove requirements simply because they appear unusual or overly specific.
- Preserve important technical conventions, workflows and decision-making rules.
- Do not weaken mandatory instructions or safety constraints.
2. **Remove unnecessary complexity**

- Identify and eliminate duplicated or substantially overlapping instructions.
- Consolidate related requirements into concise, coherent instructions.
- Remove redundant explanations, unnecessary examples and verbose commentary.
- Eliminate instructions that repeat information already clearly established elsewhere.
- Remove obsolete or contradictory instructions where their intended replacement can be established confidently.
3. **Improve instruction precision**

- Make instructions explicit in their intended outcome but concise in their wording.
- Prefer specific, actionable directives over conversational explanations.
- Use implicit context where appropriate rather than repeatedly explaining established concepts.
- Avoid over-explaining things an experienced software engineering agent should already understand.
- Replace vague language with clear expectations and constraints.
- Ensure instructions describe what the agent must do, rather than repeatedly explaining why it should do it.
4. **Improve Markdown structure**

- Establish a logical hierarchy of headings.
- Group related instructions together.
- Avoid excessive headings and unnecessary nesting.
- Prefer short paragraphs and focused bullet points.
- Use consistent terminology throughout.
- Keep the document easy to scan and maintain.
5. **Improve maintainability**

- Establish a clear separation between the agent's role, responsibilities, operating principles, workflows and constraints.
- Avoid introducing unnecessary sections or abstractions.
- Ensure instructions are sufficiently self-contained and do not depend on ambiguous references to other sections.
- Avoid creating new rules unless required to resolve an existing ambiguity or contradiction.

## Refactoring principles
Apply the following principles throughout:

- Preserve intent; reduce wording.
- Consolidate; do not accumulate.
- Be specific; avoid unnecessary explanation.
- Prefer a single authoritative instruction over multiple variations of the same rule.
- Avoid repeating global principles in individual workflow sections.
- Do not introduce requirements that change the agent's behaviour.
- Do not optimise for minimum word count at the expense of clarity or functionality.
- Do not convert meaningful requirements into vague or overly implicit statements.

## Process
Before modifying the file:

1. Read the entire agent definition and inspect relevant repository guidance, linked resources, and tests or validators that enforce its content or structure.
2. Understand the agent's role, capabilities, responsibilities and constraints. Identify the normative requirements that must remain unchanged.
3. Establish the desired structure from the engineer's stated preference or supplied example. If none is provided, use relevant local conventions and the definition's purpose to choose one coherent hierarchy; the [agent starter template](../rpir-create-copilot-agent/templates/agent.md) is an optional example of scannable headings and lists, not a required outline or content to copy. Ask only when materially different options remain.
4. Review the whole document for structural consistency. Plan how every section fits the hierarchy before editing; do not stop after improving only the first conspicuous section unless the engineer explicitly bounded the scope. Preserve sections that already work, and be ready to explain why they need no change.
5. Identify duplication, verbosity, ambiguous wording, contradictions and structural problems. Rewrite jargon or dense wording in plain language when the intended meaning is clear; if a rewrite could change meaning, retain the requirement and resolve the uncertainty with the engineer.
6. Note relevant baseline check failures before editing when practical, so they can be distinguished from regressions.

Then refactor the existing file in place.

Do not append a rewritten version to the existing content. Replace and consolidate the existing instructions so that the final file contains one coherent definition.

Treat tests and validators specifically coupled to the selected definition as related work when its structure changes. Update only the affected fixtures, selectors or assertions, preserving their behavioral intent, owner boundaries and negative detection; do not weaken checks merely to make the new structure pass. Leave unrelated tests and files unchanged.

## Validation
After refactoring:

1. Check that every original responsibility and capability remains represented.
2. Check that no important constraints or behavioural requirements have been lost.
3. Check that there are no duplicated or contradictory instructions.
4. Check that the Markdown structure is consistent across the whole definition and follows the selected style or example.
5. Check that the resulting instructions are clear, specific and unambiguous; concision is useful only when it preserves meaning.
6. Review relevant tests and validators, including negative cases, and run the narrowest applicable checks when permitted.
7. Compare results with the noted baseline. Report pre-existing failures separately from regressions, and identify checks that were unavailable or not run.
8. Confirm that the agent's intended behaviour has not been unintentionally changed.

## Final report
Once complete, provide a concise report containing:

- **Original word count**
- **Refactored word count**
- **Percentage reduction**
- **Major duplications removed**
- **Structural improvements**
- **Any ambiguities or contradictions that could not be resolved confidently**
- **Confirmation that existing functionality and constraints have been preserved**
Do not modify unrelated files.

Do not introduce new functionality.

Do not remove requirements simply to achieve a lower word count.

The objective is a lean, precise, maintainable agent definition that delivers the same functionality as the original, with less ambiguity and unnecessary instruction overhead.
