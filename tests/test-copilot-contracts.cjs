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
cases += 5;

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
for (const surface of ['files', 'contributes.chatSkills']) {
  for (const defect of ['missing', 'duplicate', 'misordered']) {
    const fixture = clone(manifest);
    const entries = surface === 'files' ? fixture.files : fixture.contributes.chatSkills;
    const currentIndex = entries.findIndex((entry) => (
      typeof entry === 'string' ? entry : entry.path
    ) === checkpointSkill);
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

assertRejected('unresolved Skill resource link', () => contracts.checkLocalLinks(
  '.github/skills/local-git-checkpoints/SKILL.md',
  '[missing](references/not-present.md)'
));
assertRejected('escaping Skill resource link', () => contracts.checkLocalLinks(
  '.github/skills/local-git-checkpoints/SKILL.md',
  '[outside](../../../../README.md)'
));

console.log(`Passed ${cases} Copilot contract cases, including valid structure and rejected privilege/parity/link defects.`);
