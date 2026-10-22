'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const contracts = require('../scripts/verify-copilot-contracts.cjs');
const { discover, root } = require('../scripts/discover-copilot-artifacts.cjs');
const { desiredManifest, differences } = require('../scripts/sync-copilot-manifest.cjs');

const inventory = discover();
const sourceManifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const manifest = desiredManifest(sourceManifest, inventory);
const expectedSkillContributions = [
  '.github/skills/agent-question-resolution/SKILL.md',
  '.github/skills/architecture-decision-records/SKILL.md',
  '.github/skills/architecture-planning/SKILL.md',
  '.github/skills/code-review/SKILL.md',
  '.github/skills/codebase-research/SKILL.md',
  '.github/skills/create-copilot-agent/SKILL.md',
  '.github/skills/create-copilot-instruction/SKILL.md',
  '.github/skills/create-copilot-prompt/SKILL.md',
  '.github/skills/create-copilot-skill/SKILL.md',
  '.github/skills/create-runbook/SKILL.md',
  '.github/skills/local-git-checkpoints/SKILL.md',
  '.github/skills/maintain-copilot-artifacts/SKILL.md',
  '.github/skills/rpir-lifecycle-core/SKILL.md',
  '.github/skills/rpir-stage-assurance/SKILL.md',
  '.github/skills/safe-implementation/SKILL.md',
  '.github/skills/test-design/SKILL.md',
  '.github/skills/wiki-maintenance/SKILL.md'
];
const agentPaths = inventory.chatAgents;
function readArtifact(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8').replace(/\r\n/g, '\n');
}

const agents = new Map(agentPaths.map((relative) => [
  relative,
  contracts.parseFrontmatterText(readArtifact(relative), relative)
]));
const agentNames = new Set([...agents.values()].map(({ values }) => values.name));
let cases = 0;

function assertRejected(label, operation, expected) {
  assert.throws(operation, expected, `${label} must be rejected`);
  cases += 1;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function replaceOnce(text, target, replacement) {
  const matches = typeof target === 'string'
    ? text.split(target).length - 1
    : [...text.matchAll(new RegExp(target.source, `${target.flags.replace(/g/g, '')}g`))].length;
  assert.equal(matches, 1, `Fixture target must be unique: ${target}`);
  const changed = text.replace(target, replacement);
  assert.notEqual(changed, text, 'Fixture must change its intended target');
  return changed;
}

function agentPath(name) {
  return [...agents].find(([, parsed]) => parsed.values.name === name)[0];
}

// Positive controls: current discovered artifacts, tool boundaries, routes,
// manifest parity, and all supported local links are structurally valid.
assert.doesNotThrow(() => contracts.checkCustomizationContracts(inventory));
assert.deepEqual(inventory.chatSkills, expectedSkillContributions,
  'every contributed Skill must be its literal SKILL.md file path');
assert.ok(inventory.chatSkills.every((entry) => fs.statSync(path.join(root, entry)).isFile()),
  'every Skill contribution must resolve to a regular file');
assert.deepEqual(manifest.contributes.chatSkills.map((entry) => entry.path), expectedSkillContributions);
assert.deepEqual(manifest.files.filter((entry) => entry.startsWith('.github/skills/')),
  expectedSkillContributions.map((entry) => path.posix.dirname(entry)),
  'package inclusion must retain complete Skill payload roots');
assert.deepEqual(differences(manifest, inventory), [], 'the generated manifest projection must be idempotent');
const unrelatedFieldFixture = desiredManifest({
  ...clone(sourceManifest),
  customMetadata: { retained: true },
  files: [...sourceManifest.files, 'vendor/custom-payload']
}, inventory);
assert.deepEqual(unrelatedFieldFixture.customMetadata, { retained: true });
assert.ok(unrelatedFieldFixture.files.includes('vendor/custom-payload'));
assert.doesNotThrow(() => contracts.checkManifestParity(manifest, inventory));
for (const [relative, parsed] of agents) {
  assert.doesNotThrow(() => contracts.checkAgentMetadata(relative, parsed.values, parsed.blocks, agentNames));
}
for (const relative of inventory.chatPromptFiles) {
  const parsed = contracts.parseFrontmatterText(readArtifact(relative), relative);
  assert.doesNotThrow(() => contracts.checkPromptMetadata(relative, parsed.values, agentNames));
}
assert.equal(inventory.chatSkills.filter((entry) => entry === '.github/skills/local-git-checkpoints/SKILL.md').length, 1);
assert.doesNotThrow(() => contracts.checkLocalLinks(
  '.github/skills/local-git-checkpoints/SKILL.md',
  '[checklist](references/checkpoint-checklist.md)'
));
const adrPaths = {
  skill: '.github/skills/architecture-decision-records/SKILL.md',
  coverage: '.github/skills/architecture-decision-records/references/research-input-coverage.md',
  template: '.github/skills/architecture-decision-records/templates/adr.md',
  core: '.github/skills/rpir-lifecycle-core/SKILL.md',
  repository: '.github/copilot-instructions.md',
  plan: '.github/agents/plan.agent.md',
  research: '.github/agents/research.agent.md',
  implement: '.github/agents/implement.agent.md',
  review: '.github/agents/review.agent.md',
  runner: '.github/agents/script-runner.agent.md',
  lifecycleInstruction: '.github/instructions/lifecycle-records.instructions.md',
  researchSkill: '.github/skills/codebase-research/SKILL.md',
  researchTemplate: '.github/skills/codebase-research/research-brief-template.md',
  planning: '.github/skills/architecture-planning/SKILL.md',
  planTemplate: '.github/skills/architecture-planning/implementation-plan-template.md',
  safe: '.github/skills/safe-implementation/SKILL.md',
  validation: '.github/skills/safe-implementation/validation-checklist.md',
  implementationReport: '.github/skills/safe-implementation/implementation-report-template.md',
  codeReview: '.github/skills/code-review/SKILL.md',
  reviewReport: '.github/skills/code-review/review-report-template.md',
  assuranceSkill: '.github/skills/rpir-stage-assurance/SKILL.md',
  assurance: '.github/skills/rpir-stage-assurance/stage-assurance-checklist.md',
  readme: 'README.md', wikiRpir: 'docs/Wiki/rpir.md',
  wikiEvidence: 'docs/Wiki/lifecycle-evidence-and-authority.md',
  wikiCatalogue: 'docs/Wiki/artifact-catalogue.md'
};
const adrSources = Object.fromEntries(Object.entries(adrPaths).map(([key, relative]) => [key, readArtifact(relative)]));
assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract(adrSources));
assert.doesNotThrow(() => contracts.checkLocalLinks(adrPaths.skill, adrSources.skill));
cases += 5;
cases += 2;

const executionPaths = {
  repository: '.github/copilot-instructions.md', core: '.github/skills/rpir-lifecycle-core/SKILL.md',
  checklist: '.github/skills/local-git-checkpoints/references/checkpoint-checklist.md',
  planning: '.github/skills/architecture-planning/SKILL.md',
  planTemplate: '.github/skills/architecture-planning/implementation-plan-template.md',
  runner: '.github/agents/script-runner.agent.md', implementAgent: '.github/agents/implement.agent.md',
  reviewAgent: '.github/agents/review.agent.md', researchAgent: '.github/agents/research.agent.md',
  safe: '.github/skills/safe-implementation/SKILL.md',
  validationChecklist: '.github/skills/safe-implementation/validation-checklist.md',
  implementationReport: '.github/skills/safe-implementation/implementation-report-template.md',
  reviewTemplate: '.github/skills/code-review/review-report-template.md',
  assurance: '.github/skills/rpir-stage-assurance/stage-assurance-checklist.md',
  readme: 'README.md', wikiRpir: 'docs/Wiki/rpir.md', wikiEvidence: 'docs/Wiki/lifecycle-evidence-and-authority.md'
};
const executionSources = Object.fromEntries(Object.entries(executionPaths).map(([key, relative]) => [key, readArtifact(relative)]));
assert.doesNotThrow(() => contracts.checkIncrementalRpirContract(executionSources));
cases += 1;

// The Research checkpoint sentence owns its safeguards independently of ADR
// discovery prose, paragraph layout, metadata and historical examples.
const researchEquivalent = replaceOnce(executionSources.researchAgent,
  'Explicitly identify architectural choices after existing discovery/acknowledgment or explicit-deferral limits permit investigation.',
  'Identify architectural choices explicitly once the existing discovery/acknowledgment or explicit-deferral boundary permits investigation.');
const researchCheckpointSentence = executionSources.researchAgent.match(/Script Runner may observe,[^\n]*?\.(?=\s|$)/)?.[0];
assert.ok(researchCheckpointSentence, 'Research fixture requires its normative checkpoint sentence');
for (const researchAgent of [
  researchEquivalent,
  replaceOnce(researchEquivalent, ' Script Runner may observe,', '\n\nScript Runner may observe,'),
  replaceOnce(researchEquivalent, 'separately granted local Git index/history checkpoint',
    'separately authorized local Git index/history checkpoint'),
  replaceOnce(researchEquivalent, 'eligible Research brief after physical save/readback',
    'eligible Research brief following physical save/readback')
]) {
  assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({ ...executionSources, researchAgent }));
  cases += 1;
}
for (const target of [
  'separately granted local Git index/history checkpoint',
  'eligible Research brief after physical save/readback'
]) {
  const missing = replaceOnce(researchEquivalent, target, 'safeguard omitted');
  for (const [label, researchAgent, reviewAgent] of [
    ['missing safeguard', missing, executionSources.reviewAgent],
    ['historical decoy', `${missing}\n\n## Historical example (not operating policy)\n\n${researchCheckpointSentence}\n`, executionSources.reviewAgent],
    ['metadata decoy', replaceOnce(missing, 'description: ', `description: ${researchCheckpointSentence} `), executionSources.reviewAgent],
    ['wrong-subject decoy', replaceOnce(missing, ' Script Runner may observe,',
      ` Unrelated documentation quotes: ${researchCheckpointSentence} Script Runner may observe,`), executionSources.reviewAgent],
    ['wrong-owner decoy', missing, `${executionSources.reviewAgent}\n\n## Historical Research example\n\n${researchCheckpointSentence}\n`]
  ]) {
    assertRejected(`Research ${label}: ${target}`, () => contracts.checkIncrementalRpirContract({
      ...executionSources, researchAgent, reviewAgent
    }), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' &&
      error.message === 'Research must retain its separately authorized saved-brief checkpoint route');
  }
}
assertRejected('Research checkpoint moved entirely to history', () => contracts.checkIncrementalRpirContract({
  ...executionSources,
  researchAgent: `${replaceOnce(researchEquivalent, researchCheckpointSentence, 'Research remains read-only outside its records.')}\n\n## Historical example (not operating policy)\n\n${researchCheckpointSentence}\n`
}), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' &&
  error.message === 'Research must retain its separately authorized saved-brief checkpoint route');

for (const [label, key, mutate, diagnostic] of [
  ['duplicate grant reintroduced in checkpoint owner', 'checklist', (text) => replaceOnce(text,
    'no separate grant exchange is required', 'a separate grant exchange is required'),
  /Checkpoint checklist authorization must cover approved Plans/],
  ['future candidate distinction removed', 'checklist', (text) => replaceOnce(text,
    'Approval may precede a concrete candidate', 'Approval requires a concrete candidate'),
  /Checkpoint checklist authorization must cover approved Plans/],
  ['silent Plan negative removed', 'checklist', (text) => replaceOnce(text,
    'A silent, prohibiting, or merely optional/unapproved strategy does not authorize Git.',
    'A strategy authorizes Git.'), /Checkpoint checklist authorization must cover approved Plans/],
  ['revocation limit removed', 'checklist', (text) => replaceOnce(text,
    'validity, resume/revalidation and revocation conditions', 'validity and resume/revalidation conditions'),
  /Checkpoint checklist authorization must cover approved Plans/],
  ['material drift limit removed', 'checklist', (text) => replaceOnce(text,
    'permission or consequential helper changes require reassessment', 'permission or consequential helper changes need no reassessment'),
  /Checkpoint checklist authorization must cover approved Plans/],
  ['duplicate-grant requirement reintroduced in validation checklist', 'validationChecklist', (text) => replaceOnce(text,
    'Plan-covered Git-metadata effects', 'separately granted Git-metadata effects'),
  /Implementation checklist must use Plan-covered authority/],
  ['Review checkpoint omits Plan coverage', 'reviewAgent', (text) => replaceOnce(text,
    'only when an applicable approved Plan explicitly covers that record and phase', 'only when a checkpoint is useful'),
  /Review checkpoint summary must accept covered Plan authority/],
  ['Work Item cadence removed', 'checklist', (text) => replaceOnce(text,
    'after each completed Work Item before unrelated items', 'at convenient times'),
  /Checkpoint checklist must state normal Work Item cadence/],
  ['earlier Task consideration removed', 'checklist', (text) => replaceOnce(text,
    'proactively consider earlier coherent, validated Task boundaries', 'consider other work'),
  /Checkpoint checklist must state normal Work Item cadence/],
  ['loop order loses checkpoint disposition', 'safe', (text) => replaceOnce(text,
    '→ handle checkpoint disposition → select the next unit', '→ select the next unit'),
  /Safe implementation loop must persist progress in order/],
  ['unsaved affected-ID disclosure removed', 'safe', (text) => replaceOnce(text,
    'promptly disclose affected Step/Task/Work Item IDs as unsaved tracking', 'record a tracking issue'),
  /Safe implementation loop must persist progress in order/],
  ['report timing evidence omitted', 'implementationReport', (text) => replaceOnce(text,
    'observed late reconciliation, and unverified timing', 'timing information'),
  /Implementation report marker field must distinguish/],
  ['Review no-commit opportunity omitted', 'reviewTemplate', (text) => replaceOnce(text,
    'including no-commit dispositions', 'where relevant'),
  /Review template must assess available chronology/],
  ['assurance silence-based pass allowed', 'assurance', (text) => replaceOnce(text,
    'no silence-based pass or commit-count gate', 'silence may demonstrate compliance'),
  /Stage assurance must distinguish observed timing/]
]) {
  const fixture = { ...executionSources, [key]: mutate(executionSources[key]) };
  assertRejected(label, () => contracts.checkIncrementalRpirContract(fixture),
    (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' && diagnostic.test(error.message));
}

const supportedCheckpointEquivalent = {
  ...executionSources,
  checklist: replaceOnce(executionSources.checklist, 'no separate grant exchange is required', 'no additional grant step is required')
};
assert.doesNotThrow(() => contracts.checkIncrementalRpirContract(supportedCheckpointEquivalent));
cases += 1;

// Preserve positive rules while adding contradictions: absence-only fixtures
// cannot prove rejection of conflicting legacy requirements.
for (const [key, boundary, owner] of [
  ['checklist', '## 4. Inspect and preserve the candidate', 'Checkpoint checklist authorization'],
  ['validationChecklist', '## Evidence, records and independent review', 'Implementation checklist capabilities'],
  ['runner', 'Before every Git command,', 'Script Runner authority']
]) {
  for (const contradiction of [
    'A separate grant exchange is required for every candidate.',
    'You must obtain an additional grant for each checkpoint.'
  ]) {
    assertRejected(`additive duplicate grant in ${key}: ${contradiction}`, () => contracts.checkIncrementalRpirContract({
      ...executionSources,
      [key]: replaceOnce(executionSources[key], boundary, `${contradiction}\n\n${boundary}`)
    }), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' &&
      error.message === `${owner} must reject mandatory duplicate grants for covered effects`);
  }
}

for (const key of ['safe', 'implementAgent']) {
  for (const [target, replacement] of [
    ['→ handle checkpoint disposition → select the next unit', '→ select the next unit → handle checkpoint disposition'],
    [key === 'safe'
      ? '→ update eligible existing markers only, save and read back/verify preservation → handle checkpoint disposition'
      : '→ save eligible existing markers only and read back/verify preservation → handle checkpoint disposition',
    key === 'safe'
      ? '→ handle checkpoint disposition → update eligible existing markers only, save and read back/verify preservation'
      : '→ handle checkpoint disposition → save eligible existing markers only and read back/verify preservation']
  ]) {
    assertRejected(`phrase-preserving loop reorder in ${key}: ${target}`, () => contracts.checkIncrementalRpirContract({
      ...executionSources, [key]: replaceOnce(executionSources[key], target, replacement)
    }), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' &&
      (key === 'safe' ? /Safe implementation loop must persist progress in order/ : /Implement summary must preserve the ordered/).test(error.message));
  }
}

const runnerOpening = executionSources.runner.match(/^Accept a self-contained[^\n]*\n\nOnly `read`[^\n]*/m)?.[0];
assert.ok(runnerOpening, 'Runner fixture requires its two normative opening paragraphs');
assertRejected('Runner rules relocated to historical section', () => contracts.checkIncrementalRpirContract({
  ...executionSources,
  runner: `${replaceOnce(executionSources.runner, runnerOpening, 'Accept only the supplied goal.\n\nObserve the requested scope.')}\n\n## Historical example (not operating policy)\n\n${runnerOpening}\n`
}), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' && /Script Runner summary must consume Plan authority/.test(error.message));

for (const replacement of ['', 'reopen all markers and unaffected completed work']) {
  let safe = replaceOnce(executionSources.safe,
    'reopen only the invalidated markers and dependent parent markers whose completion is no longer supported', replacement);
  safe = replaceOnce(safe, 'on resume reopen only disproved completion and dependent parents, with evidence', 'on resume assess progress');
  assertRejected(`selective reopening removed or reversed: ${replacement}`, () => contracts.checkIncrementalRpirContract({
    ...executionSources, safe
  }), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' && /Safe implementation recovery must selectively reopen/.test(error.message));
}
assertRejected('unaffected completed work preservation reversed', () => contracts.checkIncrementalRpirContract({
  ...executionSources, safe: replaceOnce(executionSources.safe,
    'preserve unaffected completed work', 'reopen unaffected completed work')
}), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' && /Safe implementation recovery must selectively reopen/.test(error.message));

for (const [key, target, diagnostic] of [
  ['repository', 'or an explicit bounded phase-record grant', /Repository command entry must preserve/],
  ['checklist', 'do not demand an approved implementation Plan or `/implement` evidence for this route', /Checkpoint checklist must retain separately bounded/],
  ['runner', 'without requiring an approved implementation Plan or `/implement` evidence', /Script Runner must retain separately bounded/],
  ['researchAgent', 'separately granted local Git index/history checkpoint', /Research must retain/],
  ['reviewAgent', 'or other valid bounded authorization applies, ', /Review must retain/]
]) {
  assertRejected(`separate phase-record route removed from ${key}`, () => contracts.checkIncrementalRpirContract({
    ...executionSources, [key]: replaceOnce(executionSources[key], target, 'route omitted')
  }), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' && diagnostic.test(error.message));
}

// Legitimate bootstrap, uncovered effects and separate phase-record grants are
// not duplicate-grant contradictions; supported local equivalents remain valid.
for (const [key, target, replacement] of [
  ['safe', 'reopen only the invalidated markers', 'reopen only disproved markers'],
  ['safe', '→ make the coherent change, check and repair →', '→ perform the coherent change and relevant checks →'],
  ['implementAgent', '→ make/check/repair the coherent change →', '→ perform the coherent change and checks →'],
  ['checklist', '## 4. Inspect and preserve the candidate',
    'A bootstrap session still requires its distinct actual bounded grant. Genuinely uncovered effects require an engineer decision.\n\n## 4. Inspect and preserve the candidate']
]) {
  assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({
    ...executionSources, [key]: replaceOnce(executionSources[key], target, replacement)
  }));
  cases += 1;
}

// A literal candidate mention elsewhere in the checklist must not satisfy the
// authorization section's candidate requirement.
assertRejected('wrong-section candidate decoy', () => contracts.checkIncrementalRpirContract({
  ...executionSources,
  checklist: replaceOnce(executionSources.checklist,
    'literal candidate and candidate-relevant validation evidence', 'a candidate and relevant validation evidence')
}), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' &&
  /Checkpoint checklist authorization must cover approved Plans/.test(error.message));

const cadenceSectionDecoy = replaceOnce(executionSources.checklist,
  'after each completed Work Item before unrelated items', 'at convenient times');
assertRejected('wrong-section Work Item cadence decoy', () => contracts.checkIncrementalRpirContract({
  ...executionSources,
  checklist: replaceOnce(cadenceSectionDecoy, '## 4. Inspect and preserve the candidate',
    '## 4. Inspect and preserve the candidate\n\nNormally checkpoint eligible coherent work after each completed Work Item before unrelated items.')
}), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' &&
  /Checkpoint checklist must state normal Work Item cadence/.test(error.message));

const progressLoopDecoy = replaceOnce(executionSources.safe,
  '→ handle checkpoint disposition → select the next unit', '→ select the next unit');
assertRejected('wrong-section progress-loop decoy', () => contracts.checkIncrementalRpirContract({
  ...executionSources,
  safe: `${progressLoopDecoy}\n\nUnrelated note: handle checkpoint disposition before selecting the next unit.`
}), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' &&
  /Safe implementation loop must persist progress in order/.test(error.message));

const reportTimingDecoy = replaceOnce(executionSources.implementationReport,
  'observed late reconciliation, and unverified timing', 'timing information');
assertRejected('wrong-field implementation timing decoy', () => contracts.checkIncrementalRpirContract({
  ...executionSources,
  implementationReport: replaceOnce(reportTimingDecoy, '## Validation',
    '## Validation\n\nObserved late reconciliation, and unverified timing may be noted here.')
}), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' &&
  /Implementation report marker field must distinguish/.test(error.message));

const reviewTimingDecoy = replaceOnce(executionSources.reviewTemplate,
  'observed late/omitted action, or unverified timing', 'timing evidence');
assertRejected('wrong-field Review timing decoy', () => contracts.checkIncrementalRpirContract({
  ...executionSources,
  reviewTemplate: replaceOnce(reviewTimingDecoy, '## Findings',
    '## Findings\n\nObserved late/omitted action, or unverified timing is considered.')
}), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' &&
  /Review template must assess available chronology/.test(error.message));

for (const [label, key, mutate, diagnostic] of [
  ['missing mapped ADR input', 'coverage', (text) => replaceOnce(text, /^\| 4\.3[^\n]*\n/m, ''), /all 22 sample inputs/],
  ['unguarded ADR directory destination', 'core', (text) => replaceOnce(text, 'explicitly engineer-selected, verified contained destination', 'selected destination'), /Plan-only authority, guarded effects/],
  ['unresolved ADR version drift', 'implement', (text) => replaceOnce(text, 'material mismatch, ', ''), /missing material version mismatch before dependent effects/],
  ['unavailable ADR content omitted', 'implement', (text) => replaceOnce(text, 'unavailable content or ', ''), /missing unavailable content before dependent effects/],
  ['unsatisfied ADR condition omitted', 'implement', (text) => replaceOnce(text, ' or an unsatisfied condition', ''), /missing unsatisfied conditions before dependent effects/],
  ['independent work continuity omitted', 'implement', (text) => replaceOnce(text, ', while continuing independent approved work', ''), /missing independent-work continuity/],
  ['dependent-effects guard omitted', 'implement', (text) => replaceOnce(text, ' before dependent effects', ''), /missing material version mismatch before dependent effects/],
  ['Review implies architecture approval', 'review', (text) => replaceOnce(text, 'a clean Review does not establish enterprise or architectural approval.', ''), /conflates delivery acceptance/],
  ['missing decision date field', 'template', (text) => replaceOnce(text, /^- \*\*Decision date:\*\*[^\n]*\n/m, ''), /decision provenance/]
]) {
  const fixture = { ...adrSources, [key]: mutate(adrSources[key]) };
  assertRejected(label, () => contracts.checkArchitectureDecisionRecordContract(fixture), diagnostic);
}
assertRejected('Runner inherits ADR authorship', () => contracts.checkArchitectureDecisionRecordContract({
  ...adrSources,
  runner: replaceOnce(adrSources.runner, "Plan coordinator's separate associated-Proposed-ADR exception never transfers to Runner", '')
}), /Script Runner guidance must not inherit/);

for (const owner of ['skill', 'template']) {
  for (const [label, target, replacement, diagnostic] of [
    ['pending approval allowed', 'required decision approvals and ', '', /requires satisfied decision approvals/],
    ['pending condition allowed', ' and decision-critical conditions', '', /requires satisfied decision-critical conditions/],
    ['pending disposition omitted', /Otherwise retain Proposed[^.\n]*\./, '', /outstanding prerequisites require Proposed/],
    ['unconditional acceptance with outstanding prerequisites', /Unconditional Accepted requires[^.\n]*\./,
      'Unconditional Accepted is permitted with outstanding required decision approvals or decision-critical conditions.', /requires satisfied decision approvals/]
  ]) {
    const fixture = { ...adrSources, [owner]: replaceOnce(adrSources[owner], target, replacement) };
    assertRejected(`${owner}: ${label}`, () => contracts.checkArchitectureDecisionRecordContract(fixture),
      (error) => error.contractId === 'ADR-CONTRACT-001' && diagnostic.test(error.message));
  }
}

// Supported equivalent wording and satisfied-prerequisite controls. These are
// contract-source fixtures, not execution of a governance/agent state machine.
for (const [key, target, replacement] of [
  ['plan', 'against inspected ADR coverage using the',
    'against inspected ADR coverage (bind delivery evidence to its source) using the'],
  ['plan', 'description: ', 'description: Bind delivery evidence to its source. '],
  ['implement', 'continuing independent approved work', 'allowing unrelated approved work to continue'],
  ['implement', 'material mismatch, unavailable content or an unsatisfied condition before dependent effects',
    'material version mismatch, missing content or unsatisfied decision conditions before dependent changes'],
  ['plan', 'Bind each to actual ADR path/ID, identifiable section, inspected substantive version/snapshot, decision state, actual agreement evidence/conditions and affected Work Items',
    'Bind each to actual ADR identity, identifiable section, inspected substantive snapshot, decision status, evidence of actual agreement/conditions and affected Work Items'],
  ['template', 'Unconditional Accepted requires all applicable required decision approvals and decision-critical conditions to be satisfied.',
    'Unconditional Accepted requires satisfied applicable required decision approvals and decision-critical conditions, with all prerequisites satisfied.'],
  ['template', '<consumer convention; distinguish proposed decision state from delivery progress>',
    'Accepted — applicable authority and agreement verified; all required decision approvals and decision-critical conditions satisfied.'],
  ['template', '<consumer convention; distinguish proposed decision state from delivery progress>',
    'Proposed — agreement subject to an outstanding compatibility condition; dependent work remains pending.']
]) {
  const fixture = { ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement) };
  assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract(fixture));
  cases += 1;
}

for (const [label, target] of [
  ['identity', 'actual ADR path/ID, '],
  ['section', 'identifiable section, '],
  ['substantive version', 'inspected substantive version/snapshot, '],
  ['decision state', 'decision state, '],
  ['agreement evidence', 'actual agreement evidence/'],
  ['conditions', '/conditions'],
  ['dependent work', ' and affected Work Items']
]) {
  const binding = adrSources.plan.match(/\bBind each[^.]*\./)?.[0];
  assert.ok(binding);
  const fixture = { ...adrSources, plan: replaceOnce(adrSources.plan, binding, replaceOnce(binding, target, '')) };
  assertRejected(`Plan binding omits ${label}`, () => contracts.checkArchitectureDecisionRecordContract(fixture),
    (error) => error.contractId === 'ADR-CONTRACT-001' && error.message === `Plan ADR binding is missing ${label}`);
}

const planBindingSentence = 'Bind each to actual ADR path/ID, identifiable section, inspected substantive version/snapshot, decision state, actual agreement evidence/conditions and affected Work Items.';
const missingPlanBinding = replaceOnce(adrSources.plan, planBindingSentence, 'Record remaining ADR questions.');
for (const [label, plan, research] of [
  ['before ADR guidance in the same paragraph', replaceOnce(missingPlanBinding,
    'Reconcile every architectural choice identified in Research',
    `Reconcile every architectural choice identified in Research; ${planBindingSentence} Research`), adrSources.research],
  ['unrelated paragraph', replaceOnce(missingPlanBinding,
    '\n# Plan coordinator\n', `\n# Plan coordinator\n\n${planBindingSentence}\n`), adrSources.research],
  ['metadata', replaceOnce(missingPlanBinding, 'description: ', `description: ${planBindingSentence} `), adrSources.research],
  ['history', `${missingPlanBinding}\n\n## Historical example (not operating policy)\n\n${planBindingSentence}\n`, adrSources.research],
  ['wrong owner', missingPlanBinding, `${adrSources.research}\n\n## Historical Plan example\n\n${planBindingSentence}\n`]
]) {
  assertRejected(`Plan ADR binding decoy in ${label}`, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, plan, research
  }), (error) => error.contractId === 'ADR-CONTRACT-001' && error.message === 'Plan ADR binding is missing identity');
}

// Complete architecture coverage is a cross-owner contract, not a keyword
// anywhere or a check that one valid bound ADR exists. All mutations below
// use exact-once targets and require the intended coverage diagnostic.
function rejectCoverage(label, key, target, replacement, diagnostic, diagnosticOwner = key) {
  assertRejected(label, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }), (error) => error.contractId === 'ADR-COVERAGE-001' && error.message === `${diagnosticOwner}: ${diagnostic}`);
}

const downstreamCoverageOwners = [
  'implement', 'safe', 'validation', 'implementationReport', 'review',
  'codeReview', 'reviewReport', 'assuranceSkill', 'assurance'
];
const coverageDiagnostic = 'detect missing/partial choice coverage despite a valid bound ADR';
const unexpectedDiagnostic = 'unexpected architecture requires engineer-directed Plan resolution before dependent effects with independent-work continuity';
const routineDiagnostic = 'routine coding needs no ADR and material ambiguity needs engineer resolution';
const gapRule = 'including missing or partial coverage even when a valid ADR is bound';
const unexpectedRule = 'engineer-directed Plan resolution before dependent architectural effects';
for (const key of downstreamCoverageOwners) {
  for (const replacement of [
    'assessing only ADR binding consistency',
    'including only selected choices when a valid ADR is bound'
  ]) rejectCoverage(`${key} omits complete or partial-coverage assessment`, key, gapRule, replacement, coverageDiagnostic);

  const missing = replaceOnce(adrSources[key], gapRule, 'assessing only ADR binding consistency');
  for (const [label, fixture] of [
    ['history decoy', `${missing}\n\n## Historical example (not operating policy)\n\nAssess complete architectural choice coverage against Research, the approved Plan and actual changes, ${gapRule}.\n`],
    ['metadata decoy', replaceOnce(missing, 'description: ', `description: ${gapRule}; `)]
  ]) {
    assertRejected(`${key} ${label} cannot satisfy completeness`, () => contracts.checkArchitectureDecisionRecordContract({
      ...adrSources, [key]: fixture
    }), (error) => error.contractId === 'ADR-COVERAGE-001' && error.message === `${key}: ${coverageDiagnostic}`);
  }
  assertRejected(`${key} wrong-owner coverage decoy`, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: missing,
    template: `${adrSources.template}\n\n## Historical downstream example\n\n${gapRule}\n`
  }), (error) => error.contractId === 'ADR-COVERAGE-001' && error.message === `${key}: ${coverageDiagnostic}`);

  rejectCoverage(`${key} unexpected architecture is treated as routine discretion`, key, unexpectedRule,
    'Implement-owned resolution before dependent architectural effects', unexpectedDiagnostic);
  rejectCoverage(`${key} unexpected architecture loses dependent-effect guard`, key, unexpectedRule,
    'engineer-directed Plan resolution after dependent architectural effects', unexpectedDiagnostic);
  rejectCoverage(`${key} blanket stop replaces independent work`, key,
    'before dependent architectural effects; continue independent approved work',
    'before dependent architectural effects; stop all approved work', unexpectedDiagnostic);
  rejectCoverage(`${key} routine coding ADR burden`, key,
    'Routine naming, helper extraction and architecture-preserving repairs remain Implement-owned without ADR reference',
    'Routine naming, helper extraction and architecture-preserving repairs require an ADR reference', routineDiagnostic);
  rejectCoverage(`${key} classification ambiguity silently exempted`, key,
    'resolve material classification ambiguity with the engineer using evidence',
    'silently exempt material classification ambiguity', routineDiagnostic);

  assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], gapRule,
      'including missing/partial coverage even when a valid ADR is bound')
  }));
  cases += 1;
}

for (const [key, target, replacement] of [
  ['skill', 'reconcile every architectural choice, including planning discoveries, against inspected ADR coverage by Plan',
    'reconcile selected architectural choices, including planning discoveries, against inspected ADR coverage by Plan'],
  ['research', 'Explicitly identify architectural choices after', 'Identify only selected choices after'],
  ['researchSkill', 'Explicitly identify architectural choices only within', 'Identify only selected choices within'],
  ['coverage', 'Identify all architectural choices after', 'Identify selected choices after'],
  ['researchTemplate', 'Explicitly identify each architectural choice with', 'Identify selected choices with'],
  ['plan', 'Reconcile every architectural choice identified in Research and every planning discovery',
    'Reconcile selected architectural choices identified in Research and selected planning discoveries'],
  ['planning', 'Reconcile every architectural choice from Research and every planning discovery',
    'Reconcile selected architectural choices from Research and selected planning discoveries'],
  ['planTemplate', 'Reconcile every architectural choice from Research and every planning discovery',
    'Reconcile selected architectural choices from Research and selected planning discoveries'],
  ['core', 'Plan reconciles all Research choices and planning discoveries to complete inspected ADR coverage',
    'Plan reconciles selected Research choices and planning discoveries to complete inspected ADR coverage'],
  ['repository', 'Plan reconciles every choice, including planning discoveries, to inspected ADR coverage',
    'Plan reconciles selected choices, including planning discoveries, to inspected ADR coverage']
]) {
  rejectCoverage(`${key} partial upstream identification/reconciliation`, key, target, replacement,
    'complete upfront choice identification/reconciliation is required');
}

// Add contradictions in a separate normative paragraph while preserving the
// complete positive rule; wrong-owner/history controls above must still fail.
const architectureBoundaries = [
  ['skill', '## Inputs and outputs'],
  ['coverage', '| Sample input |'],
  ['template', '## Alternatives and reasoning'],
  ['research', 'Only after actual acknowledgment or explicit deferral,'],
  ['researchSkill', '## Outputs'],
  ['researchTemplate', '## Recommendation and validation'],
  ['plan', 'Create/revise only a directly associated Proposed ADR'],
  ['planning', '### Resolve material planning gaps'],
  ['planTemplate', '## Planned work'],
  ['core', '## Contain allocation and effects'],
  ['repository', '## Validation, references, and runtime limits'],
  ['implement', 'Before every engineer-facing question,'],
  ['safe', '### Incremental Plan progress'],
  ['validation', '## Capabilities and effects'],
  ['implementationReport', '## Validation'],
  ['review', 'Before every engineer-facing question,'],
  ['codeReview', '## Output and validation'],
  ['reviewReport', '## Findings'],
  ['assuranceSkill', '## Boundary'],
  ['assurance', '## Stage-specific outcome']
];
for (const [key, boundary] of architectureBoundaries) {
  for (const contradiction of [
    'Small reversible spikes may skip ADR coverage.',
    'Small projects are exempt from architectural coverage.',
    'ADR coverage is selective.',
    'A valid bound ADR is sufficient for all architectural choices.',
    'Every routine coding choice requires an ADR.'
  ]) rejectCoverage(`${key} additive contradiction: ${contradiction}`, key, boundary,
    `${contradiction}\n\n${boundary}`, 'contradictory architectural coverage exemption or coding burden');
}

for (const [key, target, replacement] of [
  ['plan', 'Reconcile every architectural choice', 'Reconcile all architectural choices'],
  ['skill', 'Group related choices only where shared context, rationale and governance make this meaningful',
    'Group related choices only where shared context, rationale and governance support meaningful reuse'],
  ['coverage', 'Related choices may share a record', 'Group related choices in a shared record'],
  ['template', 'Reuse verified appropriate existing ADR coverage without duplication.',
    'Reuse verified applicable existing ADR coverage without duplicate records.'],
  ['planTemplate', 'Inspect existing records for substantive applicability before reuse without duplicates.',
    'Inspect existing records for substantive applicability before reuse without duplication.']
]) {
  assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }));
  cases += 1;
}

for (const [key, target] of [
  ['skill', "keeping each choice's alternatives, selection/pending state, reasoning, conditions and affected Work Items individually identifiable"],
  ['coverage', "each choice must retain individually identifiable alternatives, reasoning, selection/pending state, conditions and affected Work Items"],
  ['template', 'keep each choice identifiable even when context is shared'],
  ['plan', "each choice's rationale, realistic alternatives/reasons, actual selection or explicit pending state, conditions and affected Work Items"],
  ['planning', 'For each choice retain rationale, realistic alternatives and option-specific reasons, actual selection or explicit pending state, conditions and affected Work Item IDs'],
  ['planTemplate', "Meaningful grouping preserves each choice's alternatives, reasoning, selection/pending state, conditions and affected work"],
  ['repository', "each choice's reasoning, alternatives, selection/pending state, conditions and affected Work Items"]
]) {
  rejectCoverage(`${key} vague umbrella replaces individually meaningful grouped coverage`, key, target,
    'a shared umbrella rationale covers the group', 'meaningful per-choice grouped/reused coverage is required');
}

// Mutate only the explicit per-choice clause/field, once. Leave all surrounding
// owner text intact: nearby rationale/binding/context tokens must not mask a
// missing grouped field. These are bounded authored-wording controls, not NLP.
const groupedCoverageFixtures = [
  ['skill', "keeping each choice's alternatives, selection/pending state, reasoning, conditions and affected Work Items individually identifiable",
    ['reasoning', 'alternatives', 'selection/pending state', 'conditions', 'affected Work Items']],
  ['coverage', 'each choice must retain individually identifiable alternatives, reasoning, selection/pending state, conditions and affected Work Items',
    ['reasoning', 'alternatives', 'selection/pending state', 'conditions', 'affected Work Items']],
  ['plan', "Preserve each choice's rationale, realistic alternatives/reasons, actual selection or explicit pending state, conditions and affected Work Items.",
    ['rationale', 'realistic alternatives/reasons', 'actual selection or explicit pending state', 'conditions', 'affected Work Items']],
  ['planning', 'For each choice retain rationale, realistic alternatives and option-specific reasons, actual selection or explicit pending state, conditions and affected Work Item IDs.',
    ['rationale', 'realistic alternatives and option-specific reasons', 'actual selection or explicit pending state', 'conditions', 'affected Work Item IDs']],
  ['planTemplate', "Meaningful grouping preserves each choice's alternatives, reasoning, selection/pending state, conditions and affected work",
    ['reasoning', 'alternatives', 'selection/pending state', 'conditions', 'affected work']],
  ['core', "grouped coverage must retain each choice's rationale, alternatives, selection/pending state, conditions and affected Work Items, not hide choices in a vague umbrella record.",
    ['rationale', 'alternatives', 'selection/pending state', 'conditions', 'affected Work Items']],
  ['repository', "meaningful grouping must preserve each choice's reasoning, alternatives, selection/pending state, conditions and affected Work Items, not hide choices in an umbrella record.",
    ['reasoning', 'alternatives', 'selection/pending state', 'conditions', 'affected Work Items']],
  ['template', null, ['Choice and rationale', 'Realistic alternatives and reasoning', 'Actual selection or pending state', 'Conditions', 'affected Work Items']]
];
const groupedFieldNames = ['rationale/reasoning', 'alternatives', 'selection/pending state', 'conditions', 'affected work'];
const groupedFieldEquivalents = ['reasoning', 'realistic alternatives', 'selection or explicit pending state', 'conditions', 'affected work'];
const groupedFieldWeakening = ['group-wide motivation', 'a common option', 'selection only', 'unqualified context', 'unmapped delivery'];
for (const [key, clause, targets] of groupedCoverageFixtures) {
  for (const [index, target] of targets.entries()) {
    const templateLabel = index < 3 ? target : 'Conditions and affected Work Items';
    const owned = clause || adrSources.template.split('\n').find((line) => line.startsWith(`- **${templateLabel}:**`));
    assert.ok(owned, `${key} requires its literal grouped field`);
    for (const [label, replacement] of [['removal', ''], ['weakening', groupedFieldWeakening[index]]]) {
      const mutated = replaceOnce(owned, target, replacement);
      rejectCoverage(`${key} independent grouped ${groupedFieldNames[index]} ${label}`, key,
        owned, mutated, `grouped per-choice coverage is missing ${groupedFieldNames[index]}`);
    }
    // Field-level equivalent phrasing remains valid, including existing ADR
    // reuse and meaningful grouping; never require one document per choice.
    const equivalent = key === 'template'
      ? [
          ['Choice and rationale', 'Choice and reasoning'],
          ['Realistic alternatives and reasoning', 'Alternatives and rationale'],
          ['Actual selection or pending state', 'Selection or explicit pending state'],
          ['Conditions', 'conditions'], ['affected Work Items', 'affected work']
        ][index][1]
      : groupedFieldEquivalents[index];
    const rewritten = replaceOnce(owned, target, equivalent === target ? `${target} (choice-specific)` : equivalent);
    assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({
      ...adrSources, [key]: replaceOnce(adrSources[key], owned, rewritten)
    }));
    cases += 1;
  }
}

// Remove only individual traceability, retaining all grouped field names and
// every other per-choice rule elsewhere in the same owner.
for (const [key, clause, target, replacement] of [
  ['skill', groupedCoverageFixtures[0][1], 'each choice', 'the group'],
  ['coverage', groupedCoverageFixtures[1][1], 'each choice', 'the group'],
  ['plan', 'Group only where shared context, rationale and governance are meaningful, keeping every individual choice traceable;',
    'every individual choice', 'the group'],
  ['planning', 'Group choices only where shared context, rationale and governance are clear, preserving each choice individually rather than hiding omissions in an umbrella record.',
    'each choice individually', 'the group collectively'],
  ['planTemplate', groupedCoverageFixtures[4][1], 'each choice', 'the group'],
  ['core', groupedCoverageFixtures[5][1], 'each choice', 'the group'],
  ['repository', groupedCoverageFixtures[6][1], 'each choice', 'the group'],
  ['template', 'keep each choice identifiable even when context is shared', 'each choice', 'the group']
]) {
  rejectCoverage(`${key} grouped fields lose individual traceability`, key, clause,
    replaceOnce(clause, target, replacement), 'meaningful per-choice grouped/reused coverage is required');
}

rejectCoverage('assurance Plan checks only existing bindings', 'assurance',
  'Reconcile every Research architectural choice and planning discovery',
  'Check only existing ADR bindings', 'assess every choice and truthful gaps, not only bound-record consistency', 'assurance Plan');

for (const [key, target, replacement] of [
  ['readme', 'Plan reconciles every choice, including planning discoveries, to inspected ADR coverage',
    'Plan reconciles selected choices, including planning discoveries, to inspected ADR coverage'],
  ['wikiRpir', 'Plan reconciles every choice, including planning discoveries, to inspected ADR coverage',
    'Plan reconciles selected choices, including planning discoveries, to inspected ADR coverage'],
  ['wikiEvidence', 'Plan reconciles every choice, including planning discoveries, to inspected ADR coverage',
    'Plan reconciles selected choices, including planning discoveries, to inspected ADR coverage'],
  ['wikiCatalogue', 'Plan reconciles every choice, including planning discoveries, to complete inspected ADR coverage',
    'Plan reconciles selected choices, including planning discoveries, to complete inspected ADR coverage']
]) rejectCoverage(`${key} user summary retains selective coverage`, key, target, replacement,
  'user guidance must describe complete coverage and static/runtime limits');

for (const [key, target, diagnostic] of [
  ['skill', 'explicitly engineer-selected, verified contained destination',
    'ADR Skill is missing phase, ownership, or effect safeguards'],
  ['skill', 'Do not recursively create unselected ancestors',
    'ADR Skill is missing phase, ownership, or effect safeguards'],
  ['core', 'Do not recursively create unselected ancestor directories',
    'Lifecycle core ADR exception lacks Plan-only authority, guarded effects, preservation, or version binding'],
  ['core', 'identity, containment, absence/collision and effective permission',
    'Lifecycle core ADR exception lacks Plan-only authority, guarded effects, preservation, or version binding'],
  ['core', 'save without overwrite',
    'Lifecycle core ADR exception lacks Plan-only authority, guarded effects, preservation, or version binding'],
  ['core', 'no unrelated source/document/register edits',
    'Lifecycle core ADR exception lacks Plan-only authority, guarded effects, preservation, or version binding']
]) {
  assertRejected(`${key} complete coverage must preserve ${target}`, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, 'safeguard omitted')
  }), (error) => error.contractId === 'ADR-CONTRACT-001' && error.message === diagnostic);
}

// Directory authority never substitutes for a separately guarded file effect;
// complete coverage never licenses accepted-history rewrites.
for (const [target, diagnostic] of [
  ['Preserve accepted and superseded substantive history.', 'ADR skill must preserve accepted history'],
  ['Check each ADR file effect separately for identity, containment, absence/collision, effective permission, saved result, and readback.',
    'ADR skill must guard each file effect separately'],
  ['Directory creation does not grant file creation.', 'Lifecycle core must separate directory and file authority']
]) {
  const key = target.startsWith('Directory') ? 'core' : 'skill';
  assertRejected(`governance regression: ${target}`, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, '')
  }), (error) => error.contractId === 'ADR-CONTRACT-001' && error.message === diagnostic);
}

assertRejected('broken ADR resource link', () => contracts.checkLocalLinks(
  adrPaths.skill, '[missing](references/not-present.md)'
));
assertRejected('escaping ADR resource link', () => contracts.checkLocalLinks(
  adrPaths.skill, '[outside](../../../../README.md)'
));

const runnerPath = agentPath('Script Runner');
const runner = agents.get(runnerPath);
for (const [label, mutate] of [
  ['Runner edit tool', (values) => { values.tools = "['read', 'search', 'runInTerminal', 'edit']"; }],
  ['Runner agent tool', (values) => { values.tools = "['read', 'search', 'runInTerminal', 'agent']"; }],
  ['Runner user invocation', (values) => { values['user-invocable'] = 'true'; }],
  ['Runner nested delegation', (values) => { values.agents = "['Implement']"; }],
  ['Runner handoff declaration', (values) => { values.handoffs = ''; }]
]) {
  const values = clone(runner.values);
  mutate(values);
  assertRejected(label, () => contracts.checkAgentMetadata(runnerPath, values, runner.blocks, agentNames));
}

const planPath = agentPath('Plan');
const plan = agents.get(planPath);
const expandedCoordinatorTools = clone(plan.values);
expandedCoordinatorTools.tools = "['read', 'search', 'edit', 'agent', 'runInTerminal']";
assertRejected('coordinator terminal-tool expansion', () => contracts.checkAgentMetadata(
  planPath, expandedCoordinatorTools, plan.blocks, agentNames
));
const expandedDelegates = clone(plan.values);
expandedDelegates.agents = "['Requirements Analyst', 'Architecture Analyst', 'Test Strategist', 'Domain Investigator', 'Feasibility Investigator', 'Stage Assurance', 'Script Runner', 'Test Worker']";
assertRejected('coordinator delegation expansion', () => contracts.checkAgentMetadata(
  planPath, expandedDelegates, plan.blocks, agentNames
));

const implementPath = agentPath('Implement');
const implement = agents.get(implementPath);
const handoffCases = [
  ['automatic handoff', implement.blocks.handoffs.map((line) => line.replace('send: false', 'send: true'))],
  ['wrong handoff target', implement.blocks.handoffs.map((line) => line.replace('agent: Review', 'agent: Plan'))],
  ['incomplete handoff', implement.blocks.handoffs.filter((line) => !line.includes('prompt:'))]
];
for (const [label, handoffs] of handoffCases) {
  assertRejected(label, () => contracts.parseHandoffs(implementPath, handoffs, ['Review'], agentNames));
}
const wrongPromptRoute = contracts.parseFrontmatterText(
  readArtifact('.github/prompts/plan.prompt.md'),
  '.github/prompts/plan.prompt.md'
).values;
wrongPromptRoute.agent = 'Implement';
assertRejected('wrong prompt route', () => contracts.checkPromptMetadata(
  '.github/prompts/plan.prompt.md', wrongPromptRoute, agentNames
));

// Isolate each defect to one manifest surface. Check the diagnostic so a
// contribution failure cannot be masked by an earlier controlled-files failure.
const checkpointSkill = '.github/skills/local-git-checkpoints/SKILL.md';
const adrSkill = '.github/skills/architecture-decision-records/SKILL.md';
for (const skill of [checkpointSkill, adrSkill]) {
  for (const surface of ['files', 'contributes.chatSkills']) {
    for (const defect of ['missing', 'duplicate', 'misordered']) {
    const fixture = clone(manifest);
    const entries = surface === 'files' ? fixture.files : fixture.contributes.chatSkills;
    const expectedPath = surface === 'files' ? path.posix.dirname(skill) : skill;
    const currentIndex = entries.findIndex((entry) => (
      typeof entry === 'string' ? entry : entry.path
    ) === expectedPath);
    assert.ok(currentIndex >= 0 && currentIndex + 1 < entries.length);
    if (defect === 'missing') entries.splice(currentIndex, 1);
    if (defect === 'duplicate') entries.push(clone(entries[currentIndex]));
    if (defect === 'misordered') {
      [entries[currentIndex], entries[currentIndex + 1]] = [entries[currentIndex + 1], entries[currentIndex]];
    }
    if (surface === 'files') {
      assert.deepEqual(fixture.contributes, manifest.contributes);
    } else {
      assert.deepEqual(fixture.files, manifest.files);
    }
    const diagnostic = surface === 'files'
      ? /controlled files do not match shared discovery inventory/
      : /contributes\.chatSkills does not match shared discovery inventory/;
    assertRejected(`${defect} skill in ${surface}`, () => contracts.checkManifestParity(fixture, inventory), diagnostic);
    }
  }
}
cases += 6;

for (const [label, contribution] of [
  ['directory-valued skill contribution', '.github/skills/local-git-checkpoints'],
  ['doubled skill filename', '.github/skills/local-git-checkpoints/SKILL.md/SKILL.md']
]) {
  const fixture = clone(manifest);
  const entry = fixture.contributes.chatSkills.find((item) => item.path === checkpointSkill);
  assert.ok(entry);
  entry.path = contribution;
  assertRejected(label, () => contracts.checkManifestParity(fixture, inventory),
    /contributes\.chatSkills does not match shared discovery inventory/);
}

assertRejected('unresolved Skill resource link', () => contracts.checkLocalLinks(
  '.github/skills/local-git-checkpoints/SKILL.md',
  '[missing](references/not-present.md)'
));
assertRejected('escaping Skill resource link', () => contracts.checkLocalLinks(
  '.github/skills/local-git-checkpoints/SKILL.md',
  '[outside](../../../../README.md)'
));

console.log(`Passed ${cases} Copilot contract cases, including valid structure and rejected privilege/parity/link defects.`);
