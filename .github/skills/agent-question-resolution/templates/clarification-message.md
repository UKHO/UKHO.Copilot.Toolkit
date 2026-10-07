# Clarification message template

Use this format only after evidence inspection shows that one material decision cannot be safely inferred.

## Decision context

- **Established:** <facts and supported inferences>
- **Unknown:** <information that cannot be established from available evidence>
- **Decision blocked:** <one decision only>
- **Impact of your answer:** <what will change after the decision>

## Decision

<Ask one clear, contextualized decision question. Do not add another question. Keep to one decision per message for every RPIR stage.>

### Research questions

For every engineer-facing Research question, including a synthesized-summary confirmation, use the decision context above and provide lettered response choices; do not leave the question bare. Include only genuinely supported candidate answers. When the input is unbounded or the evidence does not support specific candidates, use an honest lettered open-direction and/or uncertainty response that invites the engineer to answer in their own words or say what remains uncertain; do not manufacture alternatives.

For a summary checkpoint, make the single decision whether the synthesis is accurate: provide a lettered choice to confirm it and a lettered choice to correct it in the engineer's own words. Include a lettered unsure/add-context choice when appropriate. Confirmation continues Research and is not approval to begin another RPIR stage.

### When bounded options are useful

Use only candidate options that genuinely fit the decision. In Research, use a variable number of consecutive letters for the genuine candidates, keep any pros and cons concise and neutral, and follow them with the next letter inviting an own-words alternative or open direction. Do not add candidates to fill a sequence. For an unbounded or uncertain Research decision, use lettered open/uncertain response choices instead of invented substantive candidates. For other stages, keep options concise and neutral, with pros and cons where useful.

- **A. <candidate>** — Pros: <pros>. Cons: <cons>.
- **B. <candidate>** — Pros: <pros>. Cons: <cons>.
- **C. <candidate>** — Pros: <pros>. Cons: <cons>.
- **D. Other / open direction** — <describe another answer or direction in your own words>.

Replace the example letters with the actual sequential range and vary the number of genuine candidates as needed. The own-words/open-direction entry must use the next letter after the final candidate: for example, `D. Other / open direction` after `A.` through `C.`, or `AA. Other / open direction` after `A.` through `Z.`. It is the response route, not an invented candidate.

### When options are not useful for Plan, Implement, or Review

For Plan, Implement, or Review, when options would be artificial, preserve the plain contextualized-question route and invite the answer in the developer's own words. Do not force those stages into Research's lettered-choice format.

After the developer answers, acknowledge the direction, update the applicable assumption or constraint, and continue the current RPIR stage. Ask a dependent decision only in a later message.