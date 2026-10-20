'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const contracts = require('../scripts/verify-copilot-contracts.cjs');
const { discover, root } = require('../scripts/discover-copilot-artifacts.cjs');

const inventory = discover();
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
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
assert.doesNotThrow(() => contracts.checkManifestParity(manifest, inventory));
for (const [relative, parsed] of agents) {
  assert.doesNotThrow(() => contracts.checkAgentMetadata(relative, parsed.values, parsed.blocks, agentNames));
}
for (const relative of inventory.chatPromptFiles) {
  const parsed = contracts.parseFrontmatterText(readArtifact(relative), relative);
  assert.doesNotThrow(() => contracts.checkPromptMetadata(relative, parsed.values, agentNames));
}
assert.equal(inventory.chatSkills.filter((entry) => entry === '.github/skills/local-git-checkpoints').length, 1);
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
  lifecycleInstruction: '.github/instructions/lifecycle-records.instructions.md'
};
const adrSources = Object.fromEntries(Object.entries(adrPaths).map(([key, relative]) => [key, readArtifact(relative)]));
assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract(adrSources));
assert.doesNotThrow(() => contracts.checkLocalLinks(adrPaths.skill, adrSources.skill));
cases += 5;
cases += 2;

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
  ['implement', 'continuing independent approved work', 'allowing unrelated approved work to continue'],
  ['implement', 'material mismatch, unavailable content or an unsatisfied condition before dependent effects',
    'material version mismatch, missing content or unsatisfied decision conditions before dependent changes'],
  ['plan', 'Bind its identity, substantive version, decision state, actual agreement evidence, conditions and dependent Work Items',
    'Bind its path/ID, substantive snapshot, decision status, evidence of actual agreement, conditions and affected Work Items'],
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
  ['identity', 'its identity, '],
  ['substantive version', 'substantive version, '],
  ['decision state', 'decision state, '],
  ['agreement evidence', 'actual agreement evidence, '],
  ['conditions', 'conditions and '],
  ['dependent work', ' and dependent Work Items']
]) {
  const fixture = { ...adrSources, plan: replaceOnce(adrSources.plan, target, '') };
  assertRejected(`Plan binding omits ${label}`, () => contracts.checkArchitectureDecisionRecordContract(fixture),
    (error) => error.contractId === 'ADR-CONTRACT-001' && error.message === `Plan ADR binding is missing ${label}`);
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
const checkpointSkill = '.github/skills/local-git-checkpoints';
const adrSkill = '.github/skills/architecture-decision-records';
for (const skill of [checkpointSkill, adrSkill]) {
  for (const surface of ['files', 'contributes.chatSkills']) {
    for (const defect of ['missing', 'duplicate', 'misordered']) {
    const fixture = clone(manifest);
    const entries = surface === 'files' ? fixture.files : fixture.contributes.chatSkills;
    const currentIndex = entries.findIndex((entry) => (
      typeof entry === 'string' ? entry : entry.path
    ) === skill);
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

assertRejected('unresolved Skill resource link', () => contracts.checkLocalLinks(
  '.github/skills/local-git-checkpoints/SKILL.md',
  '[missing](references/not-present.md)'
));
assertRejected('escaping Skill resource link', () => contracts.checkLocalLinks(
  '.github/skills/local-git-checkpoints/SKILL.md',
  '[outside](../../../../README.md)'
));

console.log(`Passed ${cases} Copilot contract cases, including valid structure and rejected privilege/parity/link defects.`);
