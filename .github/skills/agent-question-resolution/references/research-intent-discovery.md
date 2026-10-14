# Research intent discovery

Use this resource with [Agent question resolution](../SKILL.md) and its [clarification message template](../templates/clarification-message.md). The Research coordinator owns sequencing and dialogue; the shared Skill and template own question framing. Apply this method to every engineer-facing Research question, not only the first one.

## Orient before discovery; investigate after acknowledgment

Follow **orient → discover → acknowledged readback → investigate** for each new objective. These are conversational states, not new RPIR phases or mandatory status files. Detailed, apparently factual and solution-led requests still need substantive discovery; do not answer first and append a confirmation question. Only explicit engineer-directed deferral changes this sequence.

Before acknowledgment, absent explicit deferral, read applicable operating/context material and supplied examples. Each additional factual lookup must support a specific next question: before execution, state the uncertainty it addresses, how the answer will shape that question, and the bounded source/search (such as a named file section or one exact-term search in a named folder). Stop when that uncertainty is answered or the bound is reached and return to dialogue. If unresolved, disclose the limit rather than widening into general investigation. Do not use broad factual/solution search, delegated investigation, implementation comparison or substantive solution recommendations before acknowledgment. Narrow checks are not a chain of searches that collectively solves the request.

Keep dialogue with the coordinator. Supported recommendations about which discovery direction to explore are permitted; recommendations about how to implement or solve the substantive problem wait for acknowledgment or actual explicit deferral. Generic inspect-first, independent-work or completion guidance does not override this boundary. Eligible truthful Research-note persistence under existing lifecycle guards remains allowed, without gathering broader evidence to fill a brief.

## Discover the objective adaptively

Treat the initial prompt as evidence and a hypothesis, not a complete specification. Separate what the engineer stated from inference; do not ask again for information already supplied. Elicit the underlying problem before researching a named solution: motivation, affected people, a concrete current example, desired outcome, exclusions, priorities and consequential constraints. Use these dimensions as relevant, not as a questionnaire to exhaust.

Challenge consequential assumptions or contradictions using supplied facts or eligible evidence: explain the tension and ask what would distinguish the interpretations. Respect genuine solution constraints and do not manufacture disagreement. Broaden toward overlooked needs or plausible alternative problem framings when evidence warrants it, not merely to prolong the conversation.

After each answer, state what changed in understanding and select the highest-value unresolved follow-up that depends on it. Use explicit, concise **Known → Uncertain → Recommendation → Question** fields on every question. Offer meaningful lettered paths even when asking for a fact or example: distinguish useful ways to supply/obtain evidence, unknown/other routes, or genuine directions without inventing competing facts. Give a supported next-step Recommendation and reason; if the factual conclusion is unknown, recommend a practical evidence route rather than omitting advice or guessing. Alternatives may precede the Recommendation. Invite free text or qualifications and honor the engineer's answer, not automatically the recommended path. Do not require exactly three options, letter-only answers, or cosmetic alternatives. Keep dependent decisions sequential; there is no fixed question/round quota or canned questionnaire.

For a plausible alternative framing, explicitly label it as a **hypothesis**, explain its evidence, and ask a brief focused probe to test it. Use that answer to present the competing directions with meaningful choices/trade-offs and a supported recommendation when available. Obtain the engineer's direction choice before deeper exploration; a probe answer alone is not a direction change. Preserve the original objective unless the engineer chooses otherwise. Choosing an alternative direction still requires reconciled readback before broad investigation, unless explicitly deferred.

## Read back, correct and stop

For every new Research objective, provide a meaningful confirm/correct readback after substantive discovery and before broad investigation, unless explicitly deferred. Separate engineer statements from inference and cover the problem, desired outcome, exclusions, precise supplied constraints, relevant examples and material unknowns. Include a concrete expected example and a boundary/counterexample when relevant. Invite confirmation, correction or further discovery using the shared format and the engineer's own words.

Before proposing that initial readback, assess the materially relevant dimensions: problem/motivation and affected people; desired outcome; concrete current example and boundary/exclusions; constraints and priorities; consequential assumptions and foreseeable decisions. For each material dimension, identify whether it is answered by the engineer, supported by eligible evidence, not applicable with a reason, or unresolved with its consequence and next step. Supplied information counts and must not be re-asked. If a consequential answer remains undeveloped, continue with the useful answer-dependent question rather than treating headings, a formatted paraphrase or a question count as proof of understanding. Do not force irrelevant dimensions, a quota or a complete transcript.

Actually wait: when a material question or readback acknowledgment is pending, end the turn. Do not emit a readback and start dependent investigation in the same unanswered turn. Natural-language acknowledgment such as “That captures it; investigate” suffices; a letter is not required. A correction changes the affected interpretation and follow-up before a reconciled readback; an answer that already clearly acknowledges the corrected understanding needs no duplicate confirmation. Silence and passive non-response are not confirmation.

Stop discovery when intent supports a relevant investigation, material assumptions are resolved or explicitly carried, and the readback is acknowledged and reconciled. A clear or detailed prompt can reduce follow-up, not remove acknowledgment or turn discovery into a summary checkbox. Do not continue questioning merely to exhaust a topic list. An unresolved fact may remain a disclosed investigation limit rather than forcing certainty.

After investigation, assess foreseeable engineer-owned decisions newly exposed by evidence. Resolve them where practicable; otherwise state each material choice, its consequence, affected downstream work and a useful resolution route. Keep initial investigability distinct from technical readiness. This assessment does not acquire Plan-owned outcome, scope, acceptance or hierarchy, and does not prohibit necessary clarification when later work yields genuinely new evidence.

## Honor explicit engineer-directed deferral

If the engineer explicitly directs Research to defer discovery or acknowledgment and proceed without it, acknowledge the direction and proceed with the requested investigation using a briefly disclosed provisional objective and consequential assumptions. Do not resist, demand a second confirmation, repeatedly re-present the deferred checkpoint, call deferral confirmation, or infer it from silence, uncertainty, passive non-response, prompt clarity or generic “keep going” pressure. Record the actual direction, provisional understanding, scope/timing, remaining assumptions and dependent limits, and pass them to later investigators. Honor any requested timing for returning to discovery; otherwise revisit only when the engineer requests it or new material evidence warrants a focused question, not as an automatic prerequisite to reporting or continuing.

Deferral changes intake sequence only. It does not resolve missing material authority, waive actual safety or permission limits, authorize source edits, or invoke another phase. Neither acknowledgment nor deferral is phase approval or a `/plan` gate. “I don't know” is valid and is not itself deferral; carry the unknown truthfully, use only eligible bounded checks before acknowledgment, and offer a focused way to proceed with a disclosed limit where useful. Do not invent a preference, force certainty or prototype in Research.

## Continue or change objective

When the same objective resumes or the engineer answers/corrects pending dialogue, reuse the existing intent trace, including actual acknowledgment or deferral. A newly introduced material objective gets focused discovery of what changed unless the engineer explicitly defers it. Later contradictory evidence reopens only the affected issue; preserve prior answers and update interpretation rather than silently drifting or restarting the whole interview. Apply the same explicit question format to later clarification. Continuation is not a new interview, and an unanswered checkpoint is not erased by a request to keep working.

## Labelled illustrations — not operating scripts

These hypothetical examples illustrate the active method above. Each positive engineer-facing question demonstrates the complete shared framing and useful lettered paths. They are self-contained, not a fixed script, question quota, historical operating policy or evidence of runtime compliance. No historical record needs loading to use them.

### Positive illustration: useful choices without a reminder

**Known:** You report generated test folders accumulating, repeated manual sorting effort, and a need to preserve useful failure evidence.

**Uncertain:** Whether the problem is current clutter or recurring maintenance effort.

- **A — Current clutter:** Focus discovery on the existing backlog; future accumulation remains outside scope.
- **B — Recurring effort:** Also establish what future retention should achieve; broader discovery, but addresses repeated work.

**Recommendation:** B fits your stated concern about repeated manual effort; this is a discovery direction, not a cleanup design.

**Question:** Which focus fits, or how would you qualify it? Your answer determines the next scope question.

If the engineer chooses A, acknowledge the narrower objective and ask only a relevant backlog follow-up; do not silently proceed with recommended B.

### Positive illustration: factual example request

**Known:** You say useful failure evidence must remain available.

**Uncertain:** We have no example of what makes a retained result useful; that affects the intended boundary.

- **A — Share an example:** Describe a recent result you needed to keep and why.
- **B — Point to evidence:** Identify an existing guide or source that illustrates the need.
- **C — Unknown/other:** Say you do not know yet or describe another useful route.

**Recommendation:** A is the most direct way to understand the concrete need; if no example is available, B can ground the boundary in existing evidence.

**Question:** Which path is useful, or what would you add? A natural-language or qualified answer is welcome.

### Positive illustration: bounded lookup, then dialogue

Before a lookup: “The uncertainty is whether the supplied test guide identifies an owner for retained evidence. I will read only its retention section to decide whether my next question should concern ownership or retention needs, then return to dialogue when answered or that section ends.”

If that section names no owner, stop; do not trace scripts or search the whole repository:

**Known:** The supplied guide's retention section does not name an owner.

**Uncertain:** Who uses retained results; this determines whose needs discovery should capture.

- **A — Name a user or team:** Describe who relies on the results and how.
- **B — Share a source:** Point to another bounded source that identifies users.
- **C — Unknown/other:** Say this is not known or provide another lead.

**Recommendation:** A is the clearest route if you know the users; otherwise B can establish the fact without guessing.

**Question:** Which path can you answer, or what relevant qualification should I retain?

### Positive illustration: challenge, hypothesis, probe, then direction choice

**Known:** You asked for a larger results dashboard, but your example says people miss failures while away from it.

**Uncertain:** **Hypothesis:** awareness away from the dashboard, rather than display space, may be the underlying need.

**Recommendation:** A concrete account of what would make the failure noticeable is the best evidence for testing the hypothesis; do not infer an implementation from it.

- **A — Display still matters:** Explain how a larger display would help the affected person.
- **B — Awareness matters:** Describe when and how someone needs to notice the failure.
- **C — Neither/unknown/other:** Qualify the example or say what remains unclear.

**Question:** In that example, would a larger dashboard have helped while nobody was viewing it, or which path better describes the need? This tests the hypothesis, not an implementation.

After the engineer replies that nobody was watching:

**Known:** Your answer makes the unattended period central; the larger-display request alone would not address that example.

**Uncertain:** Whether to keep the original display focus or explore the awareness need.

- **A — Display focus:** Preserve the original objective; leave unattended awareness outside this investigation.
- **B — Awareness focus:** Explore when people need to notice failures; broader than display layout, without choosing a technical solution.

**Recommendation:** B better matches the example you supplied.

**Question:** Which direction should we explore, or what have I missed? I will wait for your choice before deeper exploration.

The probe answer did not authorize switching objectives. After the direction choice, update understanding and continue toward reconciled readback, not implementation research.

### Positive illustration: readback, wait and natural-language continuation

**Known:** You want less recurring effort managing generated test results, while preserving useful failure evidence. You excluded one-off deletion and supplied a constraint that investigation must not modify files. Your example is a failed run needed later for diagnosis. I infer that reducing manual sorting matters more than disk usage; that is not yet your statement.

**Uncertain:** That inference needs confirmation; the required retention duration remains unknown.

- **A — Mostly accurate:** Investigate this objective and carry the unknown duration.
- **B — Correct a point:** Identify the statement, inference or boundary to revise.
- **C — Deepen first:** Add the missing example, priority or constraint that changes the objective.

**Recommendation:** A is reasonable if the inference is close; B or C is better if a correction would change what investigation is relevant.

**Question:** Does this capture your intent, or what should I correct? A natural-language answer is welcome.

End the turn here; no broad searches or delegation follows this unanswered readback. If the engineer says “That captures it; investigate,” accept acknowledgment and proceed without demanding A. If they say “I don't know the duration,” retain that unknown and address only any remaining material acknowledgment gap, not the whole interview. If they explicitly say “Defer the readback and investigate ownership first,” disclose provisional understanding and honor that scope without treating it as confirmation.

### Negative illustration: answer first, readback last

An agent traces all folder-creation code, compares retention implementations, recommends automatic deletion, then asks “Does that capture your intent?” This is noncompliant before acknowledgment absent explicit deferral: factual wording does not excuse broad investigation or solution advice. Adding a readback at the end, offering letters afterward, or continuing because of generic “keep going” pressure does not repair the ordering. Start with bounded orientation and substantive discovery instead; do not copy the negative example as an instruction.
