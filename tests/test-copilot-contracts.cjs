'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const contracts = require('../scripts/verify-copilot-contracts.cjs');
const { classes, discover, root } = require('../scripts/discover-copilot-artifacts.cjs');
const { desiredManifest, differences } = require('../scripts/sync-copilot-manifest.cjs');

function readArtifact(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8').replace(/\r\n/g, '\n');
}

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

const inventory = discover();
const sourceManifest = JSON.parse(readArtifact('package.json'));
// Projection is fixture input, not synchronization or a claim that the checkout
// is valid. The normal verifier separately checks the actual manifest and agents.
const manifest = desiredManifest(sourceManifest, inventory);
const agentPaths = inventory.chatAgents;
const profilePath = '.github/skills/agent-model-selection/references/role-profiles.md';
const profileText = readArtifact(profilePath);
const profiles = contracts.checkModelProfileCoverage(profileText, agentPaths);
const expectedProfiles = {
  'architecture-analyst': 'hydrafusion', 'codebase-investigator': 'hydrafusion',
  'correctness-reviewer': 'hydrafusion', 'domain-investigator': 'hydrafusion',
  'feasibility-investigator': 'hydrafusion', 'implement': 'gpt-6.1-sol',
  'implementation-worker': 'hydrafusion', 'maintainability-reviewer': 'hydrafusion',
  'plan': 'gpt-6.1-sol', 'requirements-analyst': 'hydrafusion',
  'research': 'gpt-6.1-sol', 'review': 'gpt-6.1-sol',
  'script-runner': 'hydrafusion', 'security-reviewer': 'hydrafusion',
  'stage-assurance': 'hydrafusion', 'test-strategist': 'hydrafusion',
  'test-worker': 'hydrafusion', 'validation-worker': 'hydrafusion'
};
for (const [name, model] of Object.entries(expectedProfiles)) {
  assert.deepEqual(profiles.get(`${name}.agent.md`), {
    model, reasoningPolicy: model === 'gpt-6.1-sol' ? 'High; authored override' : 'Fusion-managed; no authored override',
    selectionPolicy: model === 'gpt-6.1-sol' ? 'Required' : 'No authored override'
  }, `${name} allocation`);
}

function frontmatter(text) {
  const match = text.match(/^---\n[\s\S]*?\n---(?:\n|$)/);
  assert.ok(match, 'fixture source has delimited frontmatter');
  return match[0];
}

// Controlled in-memory model projections deliberately do not inherit known
// checkout model/effort drift. No source file or actual-verifier result changes.
const agentTexts = new Map(agentPaths.map((relative) => {
  const expected = profiles.get(path.posix.basename(relative));
  const coordinator = expected.selectionPolicy === 'Required';
  const header = frontmatter(readArtifact(relative))
    .replace(/^(?:model|model-policy|reasoning-effort):[^\n]*\n/gm, '');
  const fields = `model: ${expected.model}\n${coordinator ? 'reasoning-effort: high\nmodel-policy: required\n' : ''}`;
  return [relative, replaceOnce(header, /^---\n/, `---\n${fields}`) + '\nNeutral fixture text.\n'];
}));
const agents = new Map([...agentTexts].map(([relative, text]) => [
  relative, contracts.parseFrontmatterText(text, relative)
]));
const agentNames = new Set([...agents.values()].map(({ values }) => values.name));
const nativeSkillNames = new Set(inventory.chatSkills.map((relative) =>
  contracts.parseFrontmatterText(readArtifact(relative), relative).values.name));
const nativeLock = JSON.parse(readArtifact('package-lock.json'));
function agentPath(name) {
  return [...agents].find(([, parsed]) => parsed.values.name === name)[0];
}
const nativeCheck = (relative, text = agentTexts.get(relative), skills = nativeSkillNames, profile = profileText) =>
  contracts.checkNativeAgentContract(relative, contracts.parseFrontmatterText(text, relative), agentNames, skills, profile);

// Native metadata checks are not observations of host loading or tool isolation.
for (const [relative, parsed] of agents) {
  assert.doesNotThrow(() => nativeCheck(relative));
  assert.doesNotThrow(() => contracts.checkAgentMetadata(relative, parsed.values, parsed.blocks, agentNames));
  assert.doesNotThrow(() => contracts.checkModelProjection(relative, parsed.values, profiles));
  cases += 3;
}
assert.doesNotThrow(() => contracts.checkNativeSupportMetadata(sourceManifest, nativeLock));
for (const [label, manifestInput, lockInput] of [
  ['old manifest baseline', { ...sourceManifest, engines: { vscode: '^1.130.0' } }, nativeLock],
  ['missing lock baseline', sourceManifest, { packages: { '': {} } }]
]) assertRejected(label, () => contracts.checkNativeSupportMetadata(manifestInput, lockInput),
  (error) => error.contractId === 'NATIVE-SUPPORT-001');

const nativeResearchPath = agentPath('RPIR Research');
const nativeResearch = agentTexts.get(nativeResearchPath);
const researchTools = "tools: ['read', 'search', 'web', 'edit', 'edit/createDirectory', 'agent', 'execute']";
assert.ok(nativeResearch.includes(researchTools), 'Research retains the qualified directory reference alongside edit');
for (const name of ['RPIR Research', 'RPIR Plan', 'RPIR Review']) {
  const relative = agentPath(name);
  assertRejected(`native ${name} requires execute`,
    () => nativeCheck(relative, replaceOnce(agentTexts.get(relative), ", 'execute']", "]")),
    (error) => error.contractId === 'NATIVE-AGENT-001' && /tools differ from the nonempty role boundary/.test(error.message));
}
for (const [label, replacement] of [
  ['omitted directory reference', "tools: ['read', 'search', 'web', 'edit', 'agent', 'execute']"],
  ['unqualified directory reference', "tools: ['read', 'search', 'web', 'edit', 'createDirectory', 'agent', 'execute']"],
  ['invented extension prefix', "tools: ['read', 'search', 'web', 'edit', 'github.copilot/edit/createDirectory', 'agent', 'execute']"],
  ['omitted edit alias', "tools: ['read', 'search', 'web', 'edit/createDirectory', 'agent', 'execute']"]
]) assertRejected(`native Research ${label}`, () => nativeCheck(nativeResearchPath,
  replaceOnce(nativeResearch, researchTools, replacement)),
  (error) => error.contractId === 'NATIVE-AGENT-001' && /tools differ from the nonempty role boundary/.test(error.message));

const nativePlanPath = agentPath('RPIR Plan');
const nativePlan = agentTexts.get(nativePlanPath);
for (const [label, target, replacement] of [
  ['wrong target', 'target: github-copilot', 'target: vscode'],
  ['empty tools', "tools: ['read', 'search', 'edit', 'agent', 'execute']", 'tools: []'],
  ['unsupported Local delegation metadata', 'target: github-copilot', "target: github-copilot\nagents: ['RPIR Script Runner']"],
  ['fallback model list', 'model: gpt-6.1-sol', "model: ['gpt-6.1-sol', 'gpt-6.1-terra']"],
  ['wrong effort', 'reasoning-effort: high', 'reasoning-effort:']
]) assertRejected(`native ${label}`, () => nativeCheck(nativePlanPath, replaceOnce(nativePlan, target, replacement)));
assertRejected('unresolved named skill', () => nativeCheck(nativePlanPath, nativePlan,
  new Set([...nativeSkillNames].filter((name) => name !== 'rpir-architecture-planning'))),
  (error) => error.contractId === 'NATIVE-AGENT-001' && /named skills/.test(error.message));
assertRejected('missing native profile row', () => nativeCheck(nativePlanPath, nativePlan, nativeSkillNames,
  replaceOnce(profileText, '| `plan.agent.md` | `gpt-6.1-sol` | High; authored override | Required |', '')),
  (error) => error.contractId === 'NATIVE-AGENT-001' && /one role row/.test(error.message));

const projectionPath = '.github/agents/validation-worker.agent.md';
function serializedProjection(relative, field) {
  return agentTexts.get(relative).replace(/^model: [^\n]*$/m, (model) => `${model}\n${field}`);
}
function projectSerialized(relative, text, selectedProfiles) {
  const parsed = contracts.parseFrontmatterText(text, relative);
  contracts.checkModelProjection(relative, parsed.values, selectedProfiles);
}
for (const [label, field] of [
  ['empty', 'reasoning-effort:'], ['empty quoted', "reasoning-effort: ''"],
  ['configured', 'reasoning-effort: high'], ['unsupported value', 'reasoning-effort: fusion-managed'],
  ['sequence', 'reasoning-effort: [high]']
]) assertRejected(`${label} authored reasoning-effort`, () => projectSerialized(
  projectionPath, serializedProjection(projectionPath, field), profiles
), (error) => error.contractId === 'MODEL-PROJECTION-001' && /must omit authored reasoning-effort/.test(error.message));
for (const name of ['RPIR Research', 'RPIR Plan', 'RPIR Implement', 'RPIR Review']) {
  const relative = agentPath(name);
  const original = agentTexts.get(relative);
  for (const [label, target, replacement] of [
    ['missing policy', 'model-policy: required\n', ''],
    ['wrong policy', 'model-policy: required', 'model-policy: preferred'],
    ['empty policy', 'model-policy: required', 'model-policy:'],
    ['wrong model', 'model: gpt-6.1-sol', 'model: hydrafusion'],
    ['missing effort', 'reasoning-effort: high\n', ''],
    ['wrong effort', 'reasoning-effort: high', 'reasoning-effort: medium'],
    ['fallback list', 'model: gpt-6.1-sol', "model: ['gpt-6.1-sol', 'hydrafusion']"]
  ]) {
    const changed = replaceOnce(original, target, replacement);
    assertRejected(`${name} ${label} projection`, () => projectSerialized(relative, changed, profiles),
      (error) => error.contractId === 'MODEL-PROJECTION-001');
    assertRejected(`${name} ${label} native contract`, () => nativeCheck(relative, changed),
      (error) => error.contractId === 'NATIVE-AGENT-001');
  }
  const row = `| \`${path.posix.basename(relative)}\` | \`gpt-6.1-sol\` | High; authored override | Required |`;
  for (const changed of [row.replace('Required', 'No authored override'),
    row.replace('High; authored override', 'Fusion-managed; no authored override'), row.replace('gpt-6.1-sol', 'hydrafusion')]) {
    assertRejected(`${name} profile drift`, () => contracts.checkModelProfileCoverage(replaceOnce(profileText, row, changed), agentPaths),
      (error) => error.contractId === 'MODEL-PROFILE-001');
  }
}
for (const relative of agentPaths.filter((entry) => expectedProfiles[path.posix.basename(entry, '.agent.md')] === 'hydrafusion')) {
  for (const field of ['model-policy: required', 'reasoning-effort: high']) {
    assertRejected(`${relative} specialist policy spill: ${field}`, () => projectSerialized(relative, serializedProjection(relative, field), profiles),
      (error) => error.contractId === 'MODEL-PROJECTION-001');
  }
  const row = `| \`${path.posix.basename(relative)}\` | \`hydrafusion\` | Fusion-managed; no authored override | No authored override |`;
  for (const changed of [row.replace('hydrafusion', 'gpt-6.1-sol'), row.replace('No authored override |', 'Required |'),
    row.replace('Fusion-managed; no authored override', 'High; authored override')]) {
    assertRejected(`${relative} specialist profile spill`, () => contracts.checkModelProfileCoverage(replaceOnce(profileText, row, changed), agentPaths),
      (error) => error.contractId === 'MODEL-PROFILE-001');
  }
}
assertRejected('missing model projection', () => projectSerialized(projectionPath,
  agentTexts.get(projectionPath).replace(/^model: [^\n]*\n/m, ''), profiles),
  (error) => error.contractId === 'MODEL-PROJECTION-001');
for (const [label, field] of [
  ['empty', 'model:'], ['wrong scalar', "model: 'gpt-6.1-sol'"],
  ['fallback list', "model: ['hydrafusion', 'gpt-6.1-sol']"], ['alias', 'model: *fusion']
]) assertRejected(`${label} model projection`, () => projectSerialized(projectionPath,
  agentTexts.get(projectionPath).replace(/^model: [^\n]*$/m, field), profiles),
  (error) => error.contractId === 'MODEL-PROJECTION-001');
const sampleRow = '| `validation-worker.agent.md` | `hydrafusion` | Fusion-managed; no authored override | No authored override |';
for (const [label, text, paths, diagnostic] of [
  ['missing profile', replaceOnce(profileText, sampleRow, ''), agentPaths, /Missing model profile/],
  ['duplicate profile', replaceOnce(profileText, sampleRow, `${sampleRow}\n${sampleRow}`), agentPaths, /Duplicate model profile/],
  ['orphan profile', `${profileText}\n| ` + '`orphan.agent.md` | `hydrafusion` | Fusion-managed; no authored override | No authored override |\n', agentPaths, /Orphan model profile/],
  ['invalid model', replaceOnce(profileText, sampleRow, sampleRow.replace('hydrafusion', 'unsupported-model')), agentPaths, /Unsupported model profile row/],
  ['unquoted duplicate profile', replaceOnce(profileText, sampleRow, `${sampleRow}\n| validation-worker.agent.md | \`hydrafusion\` | Fusion-managed; no authored override |`), agentPaths, /Unsupported model profile row/],
  ['unquoted orphan profile', `${profileText}\n| orphan.agent.md | \`hydrafusion\` | Fusion-managed |\n`, agentPaths, /Unsupported model profile row/],
  ['unclassified future agent', profileText, [...agentPaths, '.github/agents/future.agent.md'], /Missing model profile/]
]) assertRejected(label, () => contracts.checkModelProfileCoverage(text, paths),
  (error) => error.contractId === 'MODEL-PROFILE-001' && diagnostic.test(error.message));
const futurePath = '.github/agents/future.agent.md';
const futureValues = { name: 'Future Role', model: 'gpt-6.1-terra',
  tools: "['read', 'search']", 'user-invocable': 'false' };
const futureProfile = `${profileText}\n| ` + '`future.agent.md` | `gpt-6.1-terra` | `Future role classification` | No authored override |\n';
const futureProfiles = contracts.checkModelProfileCoverage(futureProfile, [...agentPaths, futurePath]);
assert.equal(futureProfiles.size, agentPaths.length + 1);
assert.doesNotThrow(() => contracts.checkModelProjection(futurePath, futureValues, futureProfiles));
assertRejected('profile entry cannot bypass unknown-role guard', () => contracts.checkAgentMetadata(
  futurePath, futureValues, {}, new Set([...agentNames, 'Future Role'])
), /unrecognized agent role/);

const runnerPath = agentPath('RPIR Script Runner');
const runner = agents.get(runnerPath);
for (const [label, mutate] of [
  ['Runner edit tool', (values) => { values.tools = "['read', 'search', 'execute', 'edit']"; }],
  ['Runner agent tool', (values) => { values.tools = "['read', 'search', 'execute', 'agent']"; }],
  ['Runner user invocation', (values) => { values['user-invocable'] = 'true'; }],
  ['Runner nested delegation', (values) => { values.agents = "['RPIR Implement']"; }],
  ['Runner handoff declaration', (values) => { values.handoffs = ''; }]
]) {
  const values = clone(runner.values);
  mutate(values);
  assertRejected(label, () => contracts.checkAgentMetadata(runnerPath, values, runner.blocks, agentNames));
}
const plan = agents.get(nativePlanPath);
for (const [field, value] of [
  ['tools', "['read', 'search', 'edit', 'agent', 'runInTerminal']"],
  ['agents', "['RPIR Requirements Analyst', 'RPIR Architecture Analyst', 'RPIR Test Strategist', 'RPIR Domain Investigator', 'RPIR Feasibility Investigator', 'RPIR Stage Assurance', 'RPIR Script Runner', 'RPIR Test Worker']"]
]) assertRejected(`coordinator ${field} expansion`, () => contracts.checkAgentMetadata(
  nativePlanPath, { ...plan.values, [field]: value }, plan.blocks, agentNames));
const implementPath = agentPath('RPIR Implement');
const implementText = agentTexts.get(implementPath);
for (const [label, handoffs] of [
  ['manual legacy handoff', ['  - label: Review', '    agent: RPIR Review', '    prompt: Review the report', '    send: false']],
  ['automatic handoff', ['  - label: Review', '    agent: RPIR Review', '    prompt: Review the report', '    send: true']],
  ['wrong handoff target', ['  - label: Review', '    agent: RPIR Plan', '    prompt: Review the report', '    send: false']],
  ['incomplete handoff', ['  - label: Review', '    agent: RPIR Review', '    send: false']]
]) {
  assertRejected(label, () => nativeCheck(implementPath, replaceOnce(implementText,
    'target: github-copilot', `target: github-copilot\nhandoffs:\n${handoffs.join('\n')}`)),
  (error) => error.contractId === 'NATIVE-AGENT-001' && /Local delegation metadata/.test(error.message));
  assertRejected(`${label} parser`, () => contracts.parseHandoffs(implementPath, handoffs, ['RPIR Review'], agentNames),
    (error) => error.contractId === 'NATIVE-AGENT-001');
}
for (const [name, agent] of [['plan', 'RPIR Plan'], ['implement', 'RPIR Implement'], ['review', 'RPIR Review'], ['remediate-review', 'RPIR Implement']]) {
  for (const route of [agent, 'wrong role']) assertRejected(`legacy ${name} prompt route ${route}`,
    () => contracts.checkPromptMetadata(`.github/prompts/${name}.prompt.md`, { name, agent: route }, agentNames),
    (error) => error.contractId === 'STRUCT-PROMPT-001');
}
const ordinaryPrompt = '.github/prompts/explain-change.prompt.md';
for (const values of [{ name: 'explain-change' }, { name: 'explain-change', agent: 'RPIR Implement' },
  { name: 'explain-change', agent: 'RPIR Implement', tools: "['read', 'execute']" },
  { name: 'explain-change', agent: 'RPIR Test Worker', tools: "['read', 'search']" }]) {
  assert.doesNotThrow(() => contracts.checkPromptMetadata(ordinaryPrompt, values, agentNames));
  cases += 1;
}
for (const values of [{ name: 'wrong-name', agent: 'RPIR Implement' }, { name: 'explain-change', agent: 'Missing Role' },
  { name: 'explain-change', tools: "['read']" }, { name: 'explain-change', agent: 'RPIR Test Worker', tools: "['read', 'execute']" }]) {
  assertRejected('invalid ordinary prompt metadata', () => contracts.checkPromptMetadata(ordinaryPrompt, values, agentNames));
}

// Parser negatives target supported syntax, not the content of narrative text.
assert.equal(contracts.parseFrontmatterText("---\nname: 'quoted identity'\n---\nNeutral.", 'fixture.md').values.name, 'quoted identity');
assert.equal(contracts.parseFrontmatterText('---\nname: "quoted identity"\n---\nNeutral.', 'fixture.md').values.name, 'quoted identity');
for (const text of [
  'name: absent delimiter', '---\nname: no closing delimiter', '---\nname: one\nname: two\n---',
  '---\nname:\n---', '---\nname: [collection]\n---', '---\nname: true\n---',
  '---\nname: fixture\n  unsupported: continuation\n---', '---\nname: fixture\n\ttools: []\n---',
  '---\nname: fixture\nhandoffs: []\n---', '---\nname: "unterminated\n---'
]) assertRejected('unsupported frontmatter', () => contracts.parseFrontmatterText(text, 'fixture.md'), /fixture\.md/);
assert.deepEqual(contracts.parseStringList("['read', 'search']", 'fixture.md', 'tools'), ['read', 'search']);
for (const value of ['[read]', '["read"]', "['read', 'read']", "['']", '*tools']) {
  assertRejected('unsupported string list', () => contracts.parseStringList(value, 'fixture.md', 'tools'), /frontmatter|declaration/);
}

// Retain discovery/manifest projection tests without assuming the dirty checkout
// is already synchronized. Actual parity is required by the normal verifier.
assert.ok(inventory.chatSkills.every((entry) => entry.endsWith('/SKILL.md') && fs.statSync(path.join(root, entry)).isFile()));
assert.deepEqual(manifest.contributes.chatSkills.map((entry) => entry.path), inventory.chatSkills);
assert.deepEqual(manifest.files.filter((entry) => entry.startsWith('.github/skills/')),
  inventory.chatSkills.map((entry) => path.posix.dirname(entry)));
assert.deepEqual(differences(manifest, inventory), [], 'the generated manifest projection must be idempotent');
assert.doesNotThrow(() => contracts.checkManifestParity(manifest, inventory));
// Couple the selected namespace to real discovery, parsed headers and payload
// projection. The projection still includes unrelated baseline inventory; it
// does not synchronize the checkout or conceal the actual verifier's failures.
const selectedRenames = [
  'plan', 'implement', 'review', 'remediate-review',
  'agent-question-resolution', 'architecture-decision-records', 'architecture-planning',
  'codebase-research', 'safe-implementation', 'code-review', 'local-git-checkpoints'
];
for (const oldName of selectedRenames) {
  const name = `rpir-${oldName}`;
  const relative = `.github/skills/${name}/SKILL.md`;
  assert.ok(inventory.chatSkills.includes(relative), `${name} is discovered`);
  assert.equal(contracts.parseFrontmatterText(readArtifact(relative), relative).values.name, name);
  assert.ok(!inventory.chatSkills.includes(`.github/skills/${oldName}/SKILL.md`), `${oldName} is not an alias`);
  assert.ok(manifest.files.includes(path.posix.dirname(relative)), `${name} has its payload root`);
  cases += 1;
}
for (const surface of ['files', 'contributes.chatSkills']) {
  const fixture = clone(manifest);
  if (surface === 'files') {
    const index = fixture.files.indexOf('.github/skills/rpir-plan');
    assert.ok(index >= 0);
    fixture.files[index] = '.github/skills/plan';
  } else {
    const entry = fixture.contributes.chatSkills.find((item) => item.path === '.github/skills/rpir-plan/SKILL.md');
    assert.ok(entry);
    entry.path = '.github/skills/plan/SKILL.md';
  }
  assertRejected(`stale phase path in ${surface}`, () => contracts.checkManifestParity(fixture, inventory),
    (error) => error.contractId === 'PARITY-001');
}
const unrelatedFieldFixture = desiredManifest({
  ...clone(sourceManifest), customMetadata: { retained: true },
  files: [...sourceManifest.files, 'vendor/custom-payload']
}, inventory);
assert.deepEqual(unrelatedFieldFixture.customMetadata, { retained: true });
assert.ok(unrelatedFieldFixture.files.includes('vendor/custom-payload'));
for (const name of ['rpir-research', 'rpir-implement', 'rpir-plan', 'rpir-remediate-review', 'rpir-review']) {
  const skill = `.github/skills/${name}/SKILL.md`;
  assert.ok(inventory.chatSkills.includes(skill), `${name} must be discovered as a Skill`);
  assert.ok(!inventory.chatPromptFiles.includes(`.github/prompts/${name}.prompt.md`));
  const text = readArtifact(skill);
  const values = contracts.parseFrontmatterText(text, skill).values;
  assert.equal(values.name, name);
  assert.equal(values['user-invocable'], 'true');
  assert.equal(values['disable-model-invocation'], 'true');
  assert.doesNotThrow(() => contracts.checkLocalLinks(skill, text));
  const broken = text.replace('](../', '](../skills/');
  assert.notEqual(broken, text, `${name} must include a sibling Skill link`);
  assertRejected(`${name} retains a pre-migration relative link`,
    () => contracts.checkLocalLinks(skill, broken), /local link does not resolve/);
}
const researchEntry = '.github/skills/rpir-research/SKILL.md';
assert.ok(sourceManifest.files.includes(path.posix.dirname(researchEntry)), 'actual Research payload root is listed');
assert.ok(sourceManifest.contributes.chatSkills.some((entry) => entry.path === researchEntry),
  'actual Research contribution is listed');
for (const surface of ['files', 'contributes.chatSkills']) {
  const fixture = clone(manifest);
  if (surface === 'files') fixture.files = fixture.files.filter((entry) => entry !== path.posix.dirname(researchEntry));
  else fixture.contributes.chatSkills = fixture.contributes.chatSkills.filter((entry) => entry.path !== researchEntry);
  assertRejected(`missing Research entry in ${surface}`, () => contracts.checkManifestParity(fixture, inventory),
    (error) => error.contractId === 'PARITY-001');
}
const checkpointSkill = '.github/skills/rpir-local-git-checkpoints/SKILL.md';
const adrSkill = '.github/skills/rpir-architecture-decision-records/SKILL.md';
for (const skill of [checkpointSkill, adrSkill]) {
  for (const surface of ['files', 'contributes.chatSkills']) {
    for (const defect of ['missing', 'duplicate', 'misordered']) {
      const fixture = clone(manifest);
      const entries = surface === 'files' ? fixture.files : fixture.contributes.chatSkills;
      const expectedPath = surface === 'files' ? path.posix.dirname(skill) : skill;
      const index = entries.findIndex((entry) => (typeof entry === 'string' ? entry : entry.path) === expectedPath);
      assert.ok(index >= 0 && index + 1 < entries.length);
      if (defect === 'missing') entries.splice(index, 1);
      if (defect === 'duplicate') entries.push(clone(entries[index]));
      if (defect === 'misordered') [entries[index], entries[index + 1]] = [entries[index + 1], entries[index]];
      if (surface === 'files') assert.deepEqual(fixture.contributes, manifest.contributes);
      else assert.deepEqual(fixture.files, manifest.files);
      assertRejected(`${defect} skill in ${surface}`, () => contracts.checkManifestParity(fixture, inventory),
        surface === 'files' ? /controlled files do not match shared discovery inventory/ : /contributes\.chatSkills does not match shared discovery inventory/);
    }
  }
}
for (const contribution of ['.github/skills/rpir-local-git-checkpoints', '.github/skills/rpir-local-git-checkpoints/SKILL.md/SKILL.md']) {
  const fixture = clone(manifest);
  fixture.contributes.chatSkills.find((item) => item.path === checkpointSkill).path = contribution;
  assertRejected('invalid Skill contribution', () => contracts.checkManifestParity(fixture, inventory),
    /contributes\.chatSkills does not match shared discovery inventory/);
}
assert.doesNotThrow(() => contracts.checkLocalLinks(checkpointSkill, '[checklist](references/checkpoint-checklist.md)'));
for (const destination of ['references/not-present.md', '../../../../README.md', 'C:/outside.md',
  'file:///outside.md', '/outside.md', '..\\outside.md', '%ZZ.md', '%2foutside.md', 'references']) {
  assertRejected(`invalid local link ${destination}`,
    () => contracts.checkLocalLinks(checkpointSkill, `[fixture](${destination})`), /local link|filesystem link/);
}
for (const [relative, placeholder] of [
  ['.github/skills/create-copilot-skill/templates/skill.md', 'relative-path'],
  ['.github/skills/create-runbook/templates/runbook.md', 'repository-relative-link'],
  ['.github/skills/wiki-maintenance/templates/wiki-page.md', 'repository-relative-link']
]) {
  assert.doesNotThrow(() => contracts.checkLocalLinks(relative, `[fixture](<${placeholder}>)`));
  assertRejected('placeholder outside its supported template',
    () => contracts.checkLocalLinks(checkpointSkill, `[fixture](<${placeholder}>)`), /local link/);
}

// A small test-local filesystem adapter feeds both real modules. All discovery,
// guarded reads, resource traversal and routine composition run unmodified.
// There is no host fallback and no filesystem write API.
const discoverySource = readArtifact('scripts/discover-copilot-artifacts.cjs');
const verifierSource = readArtifact('scripts/verify-copilot-contracts.cjs');
const fixtureRoot = path.resolve(root, '__contract_fixture__');
function loadFixture(sources, routine = false) {
  const files = new Map([...sources].map(([relative, text]) => [path.resolve(fixtureRoot, relative), text]));
  const directories = new Set([fixtureRoot, path.join(fixtureRoot, '.github'),
    ...['instructions', 'agents', 'skills'].map((name) => path.join(fixtureRoot, '.github', name))]);
  for (const full of files.keys()) {
    for (let parent = path.dirname(full); parent.startsWith(fixtureRoot); parent = path.dirname(parent)) {
      directories.add(parent);
      if (parent === fixtureRoot) break;
    }
  }
  const reads = [];
  const missing = (full) => Object.assign(new Error(`Missing fixture path: ${full}`), { code: 'ENOENT' });
  const fixtureFs = {
    lstatSync(full) {
      if (!files.has(full) && !directories.has(full)) throw missing(full);
      return { isDirectory: () => !files.has(full) && directories.has(full),
        isFile: () => files.has(full), isSymbolicLink: () => false };
    },
    readdirSync(full) {
      if (!directories.has(full) || files.has(full)) throw missing(full);
      return [...new Set([...directories, ...files.keys()]
        .filter((entry) => entry !== full && path.dirname(entry) === full).map((entry) => path.basename(entry)))].sort();
    },
    readFileSync(full) {
      const relative = path.relative(fixtureRoot, full).split(path.sep).join('/');
      reads.push(relative);
      if (!files.has(full)) throw missing(full);
      return files.get(full);
    }
  };
  const discoveryModule = { exports: {} };
  const fixtureBuiltin = (name) => {
    if (name === 'fs' || name === 'node:fs') return fixtureFs;
    if (name === 'path' || name === 'node:path') return path;
    throw new Error(`Unsupported fixture module: ${name}`);
  };
  vm.runInNewContext(discoverySource, {
    module: discoveryModule, __dirname: path.join(fixtureRoot, 'scripts'),
    require: fixtureBuiltin
  });
  const fixtureModule = { exports: {} };
  const fixtureRequire = (name) => name === './discover-copilot-artifacts.cjs'
    ? discoveryModule.exports : fixtureBuiltin(name);
  fixtureRequire.main = routine ? fixtureModule : undefined;
  const output = [];
  const errors = [];
  const processState = { exitCode: 0 };
  vm.runInNewContext(verifierSource, {
    module: fixtureModule, require: fixtureRequire, process: processState,
    console: { log: (message) => output.push(message), error: (message) => errors.push(message) }
  });
  return { contracts: fixtureModule.exports, discover: discoveryModule.exports.discover,
    output, errors, reads, process: processState };
}

const lifecyclePath = '.github/instructions/lifecycle-records.instructions.md';
const templatePath = '.github/skills/create-copilot-agent/templates/agent.md';
const coveragePath = '.github/skills/rpir-architecture-decision-records/references/research-input-coverage.md';
const adrTemplatePath = '.github/skills/rpir-architecture-decision-records/templates/adr.md';
const nestedResourcePath = '.github/skills/rpir-architecture-decision-records/references/nested/fixture.md';
const fixtureSources = new Map();
for (const definition of classes) {
  for (const relative of inventory[definition.name]) {
    fixtureSources.set(relative, agentTexts.get(relative) ??
      `${frontmatter(readArtifact(relative))}\nNeutral fixture text.\n`);
  }
}
fixtureSources.set(adrSkill, `${fixtureSources.get(adrSkill)}\n[resource](references/research-input-coverage.md)\n[template](templates/adr.md)\n`);
fixtureSources.set(coveragePath, 'Neutral resource.\n[template](../templates/adr.md)\n[nested](nested/fixture.md)\n');
fixtureSources.set(adrTemplatePath, 'Neutral template.\n');
fixtureSources.set(nestedResourcePath, 'Neutral nested resource.\n');
fixtureSources.set(templatePath, `${frontmatter(readArtifact(templatePath))}\nNeutral starter.\n`);
fixtureSources.set(profilePath, profileText);
fixtureSources.set('package.json', JSON.stringify(manifest));
fixtureSources.set('package-lock.json', JSON.stringify(nativeLock));
// Exercise prompt wiring even when the real optional prompt directory is absent.
fixtureSources.set(ordinaryPrompt, "---\nname: explain-change\nagent: RPIR Implement\ntools: ['read']\n---\nNeutral prompt.\n");
const controlledInventory = loadFixture(fixtureSources).discover();
fixtureSources.set('package.json', JSON.stringify(desiredManifest(sourceManifest, controlledInventory)));

const imported = loadFixture(fixtureSources);
assert.equal(imported.output.length + imported.errors.length + imported.reads.length, 0, 'import must not run main');
const aggregate = imported.contracts.checkCustomizationContracts(imported.discover());
assert.equal(aggregate.artifactCount, classes.reduce((count, definition) => count + controlledInventory[definition.name].length, 0));
assert.ok(aggregate.resourceCount >= controlledInventory.chatSkills.length + 5);
assert.ok(imported.reads.includes(nestedResourcePath), 'aggregate must traverse nested Skill resources');
const routine = loadFixture(fixtureSources, true);
assert.equal(routine.process.exitCode, 0);
assert.equal(routine.errors.length, 0);
assert.ok(routine.output.some((line) => /Manifest\/discovery parity: PASS/.test(line)));
assert.ok(routine.output.some((line) => /Customization structure .*: PASS/.test(line)));
assert.ok(routine.output.some((line) => /Static structure only:/.test(line)));
cases += 2;

function changedSources(relative, change) {
  const sources = new Map(fixtureSources);
  if (change === null) sources.delete(relative);
  else sources.set(relative, change(sources.get(relative)));
  return sources;
}
function rejectWired(label, sources, expected) {
  const fixture = loadFixture(sources);
  assertRejected(`${label} aggregate`, () => fixture.contracts.checkCustomizationContracts(fixture.discover()), expected);
  const result = loadFixture(sources, true);
  assert.equal(result.process.exitCode, 1, `${label} routine must fail`);
  assert.ok(result.errors.some((line) => /DIAGNOSTIC FAIL/.test(line)), `${label} must report an explicit failure`);
  assert.ok(result.output.some((line) => /Static structure only:/.test(line)));
  cases += 1;
  return result;
}

// Neutral bodies exercise discovery -> parser -> entry checker -> routine.
// Require the intended entry diagnostic, not unrelated model/parity failure.
for (const [label, sources, diagnostic] of [
  ['missing Research entry', changedSources(researchEntry, null), /required manual entry must be discovered/],
  ['Research directory/header mismatch', changedSources(researchEntry,
    (text) => replaceOnce(text, 'name: rpir-research', 'name: research-entry-mismatch')), /entry name must match its directory/],
  ['automatic Research invocation', changedSources(researchEntry,
    (text) => replaceOnce(text, 'disable-model-invocation: true', 'disable-model-invocation: false')),
  /entry must explicitly declare/],
  ['implicit manual Plan invocation', changedSources('.github/skills/rpir-plan/SKILL.md',
    (text) => replaceOnce(text, 'user-invocable: true\n', '')), /entry must explicitly declare/],
  ...['agent: RPIR Research', "tools: ['read']", 'model: hydrafusion', 'context: fork'].map((field) => [
    `unsupported entry selector ${field}`, changedSources(researchEntry,
      (text) => replaceOnce(text, /^---\n/, `---\n${field}\n`)), /unsupported manual entry metadata/
  ])
]) {
  const result = rejectWired(label, sources,
    (error) => error.contractId === 'ENTRY-CONTRACT-001' && diagnostic.test(error.message));
  assert.ok(result.errors.some((line) => /DIAGNOSTIC FAIL ENTRY-CONTRACT-001:/.test(line) && diagnostic.test(line)),
    `${label} routine must expose the intended entry diagnostic`);
}

rejectWired('stale coordinator display name', changedSources(nativePlanPath,
  (text) => replaceOnce(text, 'name: RPIR Plan', 'name: Plan')),
  (error) => error.contractId === 'NATIVE-AGENT-001' && /unrecognized role/.test(error.message));
rejectWired('stale specialist Skill projection', changedSources(runnerPath,
  (text) => replaceOnce(text, "'rpir-local-git-checkpoints'", "'local-git-checkpoints'")),
  (error) => error.contractId === 'NATIVE-AGENT-001' && /named skills/.test(error.message));
const staleDirectorySources = new Map(fixtureSources);
staleDirectorySources.set('.github/skills/architecture-decision-records/SKILL.md',
  replaceOnce(staleDirectorySources.get(adrSkill), 'name: rpir-architecture-decision-records', 'name: architecture-decision-records'));
staleDirectorySources.delete(adrSkill);
const staleDirectoryInventory = loadFixture(staleDirectorySources).discover();
assert.ok(staleDirectoryInventory.chatSkills.includes('.github/skills/architecture-decision-records/SKILL.md'));
assert.ok(!staleDirectoryInventory.chatSkills.includes(adrSkill));
rejectWired('stale discovered method directory', staleDirectorySources,
  (error) => error.contractId === 'NATIVE-AGENT-001' && /named skills/.test(error.message));
rejectWired('stale moved-resource sibling link', changedSources(coveragePath,
  () => '[method](../../architecture-planning/SKILL.md)\n'),
  /local link does not resolve/);

// Neutral bodies above remove *all* original coordinator/worker narratives.
// Additional unrelated bodies must also pass through native, aggregate and main.
for (const name of ['RPIR Research', 'RPIR Plan', 'RPIR Implement', 'RPIR Review', 'RPIR Implementation Worker', 'RPIR Script Runner', 'RPIR Stage Assurance']) {
  const relative = agentPath(name);
  const text = `${frontmatter(agentTexts.get(relative))}\n# Neutral heading\n\nBlue triangles.\n`;
  assert.doesNotThrow(() => nativeCheck(relative, text));
  const sources = changedSources(relative, () => text);
  const fixture = loadFixture(sources);
  assert.doesNotThrow(() => fixture.contracts.checkCustomizationContracts(fixture.discover()));
  assert.equal(loadFixture(sources, true).process.exitCode, 0);
  cases += 3;
}
rejectWired('neutral coordinator missing required tool', changedSources(nativePlanPath,
  (text) => replaceOnce(text, ", 'execute']", "]")),
  (error) => error.contractId === 'NATIVE-AGENT-001' && /tools differ/.test(error.message));
rejectWired('neutral worker invalid invocation', changedSources(runnerPath,
  (text) => replaceOnce(text, 'user-invocable: false', 'user-invocable: true')),
  (error) => error.contractId === 'NATIVE-AGENT-001' && /user-invocable/.test(error.message));

// Skill/template/instruction prose has been replaced, and policy-only inputs
// are absent. Linked resources remain discoverable for mechanical validation.
for (const obsolete of ['.github/copilot-instructions.md', 'README.md', 'docs/Wiki/rpir.md',
  '.github/skills/rpir-agent-question-resolution/references/research-intent-discovery.md',
  '.github/skills/rpir-safe-implementation/implementation-report-template.md',
  '.github/skills/rpir-local-git-checkpoints/references/checkpoint-checklist.md']) {
  assert.ok(!fixtureSources.has(obsolete), `${obsolete} is not a required read dependency`);
  assert.ok(!routine.reads.includes(obsolete), `${obsolete} must not be eagerly read`);
}
for (const [label, sources, expected] of [
  ['missing ADR direct resource reference', changedSources(adrSkill,
    (text) => replaceOnce(text, '[template](templates/adr.md)', 'Neutral text.')),
  (error) => error.contractId === 'ADR-CONTRACT-001' && /directly link/.test(error.message)],
  ['missing required resource file', changedSources(adrTemplatePath, null), /local link does not resolve/],
  ['broken nested resource link', changedSources(nestedResourcePath, () => '[missing](absent.md)'), /local link does not resolve/],
  ['missing inert starter source', changedSources(templatePath, null), /Cannot read/],
  ['active starter model', changedSources(templatePath, (text) => replaceOnce(text, /^---\n/, '---\nmodel: hydrafusion\n')),
  (error) => error.contractId === 'MODEL-AUTHORING-001'],
  ['wrong ADR identity', changedSources(adrSkill, (text) => replaceOnce(text, 'name: rpir-architecture-decision-records', 'name: neutral-adr')),
  (error) => error.contractId === 'NATIVE-AGENT-001' && /named skills/.test(error.message)],
  ['invocable ADR Skill', changedSources(adrSkill, (text) => replaceOnce(text, 'user-invocable: false', 'user-invocable: true')),
  (error) => error.contractId === 'ADR-CONTRACT-001']
]) rejectWired(label, sources, expected);
assertRejected('ADR identity directly', () => contracts.checkArchitectureDecisionRecordContract({
  skill: replaceOnce(fixtureSources.get(adrSkill), 'name: rpir-architecture-decision-records', 'name: neutral-adr')
}), (error) => error.contractId === 'ADR-CONTRACT-001' && /directory name/.test(error.message));

// Vary only narrative outside the structured profile table/scope.
const profileTable = profileText.split('\n').filter((line) => line.startsWith('|')).join('\n');
const neutralProfile = `# Authoritative role profiles\n\nBlue triangles.\n\n${profileTable}\n\n## Neutral section\n\nGreen circles.\n`;
assert.equal(contracts.checkModelProfileCoverage(neutralProfile, agentPaths).size, profiles.size);
const neutralProfileSources = changedSources(profilePath, () => neutralProfile);
const neutralProfileFixture = loadFixture(neutralProfileSources);
assert.doesNotThrow(() => neutralProfileFixture.contracts.checkCustomizationContracts(neutralProfileFixture.discover()));
assert.equal(loadFixture(neutralProfileSources, true).process.exitCode, 0);
for (const [label, relative, target, replacement] of [
  ['model', nativePlanPath, 'model: gpt-6.1-sol', 'model: hydrafusion'],
  ['effort', nativePlanPath, 'reasoning-effort: high', 'reasoning-effort: medium'],
  ['selection', nativePlanPath, 'model-policy: required', 'model-policy: preferred'],
  ['specialist effort', runnerPath, 'model: hydrafusion', 'model: hydrafusion\nreasoning-effort: high']
]) {
  const sources = new Map(neutralProfileSources);
  sources.set(relative, replaceOnce(sources.get(relative), target, replacement));
  rejectWired(`neutral profile paired ${label} defect`, sources,
    (error) => error.contractId === 'NATIVE-AGENT-001' && /model, reasoning and selection policy/.test(error.message));
}
rejectWired('neutral profile structured row drift', changedSources(profilePath,
  () => replaceOnce(neutralProfile, sampleRow, sampleRow.replace('hydrafusion', 'gpt-6.1-sol'))),
  (error) => error.contractId === 'NATIVE-AGENT-001');

// Lifecycle patterns are independently retained and wired through the aggregate.
// This illustrative matcher is not VS Code glob-runtime evidence.
const instruction = fixtureSources.get(lifecyclePath);
const candidatePatterns = contracts.parseFrontmatterText(instruction, lifecyclePath).values.applyTo.split(',');
function illustrativeMatch(pattern, value) {
  let regex = '^';
  for (let i = 0; i < pattern.length;) {
    if (pattern.startsWith('**/', i)) { regex += '(?:[^/]+/)*'; i += 3; }
    else if (pattern.startsWith('[0-9]', i)) { regex += '[0-9]'; i += 5; }
    else if (pattern.startsWith('[a-z0-9]', i)) { regex += '[a-z0-9]'; i += 8; }
    else if (pattern[i] === '*') { regex += '[^/]*'; i += 1; }
    else { regex += pattern[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); i += 1; }
  }
  return new RegExp(`${regex}$`).test(value);
}
assert.doesNotThrow(() => contracts.checkLifecycleCandidatePatterns(instruction));
for (const suffix of ['research-brief', 'implementation-plan', 'implementation-report', 'review-report']) {
  for (const example of [`docs/planning/topic/001-${suffix}.md`, `docs/delivery/topic/001-${suffix}.md`,
    `docs/copilot/001-subject/001-${suffix}.md`, `team/handbook/copilot/001-subject/001-${suffix}.md`]) {
    assert.ok(candidatePatterns.some((pattern) => illustrativeMatch(pattern, example)), example);
    cases += 1;
  }
}
for (const example of ['docs/copilot/subject/001-research-brief.md', 'docs/copilot/001-subject/research-brief.md',
  'docs/copilot/001-subject/001-adr.md', 'team/handbook/other/001-subject/001-implementation-plan.md',
  'docs/planning/topic/01-review-report.md', 'docs/delivery/topic/001-review-report.txt']) {
  assert.ok(!candidatePatterns.some((pattern) => illustrativeMatch(pattern, example)), example);
  cases += 1;
}
assert.ok(candidatePatterns.some((pattern) => illustrativeMatch(pattern, 'archive/copilot/001-subject/001-review-report.md')));
const applyLine = instruction.split('\n').find((line) => line.startsWith('applyTo: '));
const candidateError = (error) => error.contractId === 'RPIR-RECORD-001' && /exactly the twelve authored candidate patterns/.test(error.message);
for (const [label, patterns] of [
  ['missing', candidatePatterns.slice(1)], ['duplicate', [...candidatePatterns.slice(1), candidatePatterns[1]]],
  ['extra', [...candidatePatterns, '**/*.md']],
  ['broadened legacy', candidatePatterns.map((p, i) => i === 0 ? p.replace('docs/planning/', '**/') : p)],
  ['broadened topic', candidatePatterns.map((p, i) => i === 8 ? p.replace('[a-z0-9]*', '*') : p)],
  ['wrong suffix', candidatePatterns.map((p, i) => i === 11 ? p.replace('review-report', 'adr') : p)]
]) {
  const changed = replaceOnce(instruction, applyLine, `applyTo: '${patterns.join(',')}'`);
  assertRejected(`candidate patterns ${label}`, () => contracts.checkLifecycleCandidatePatterns(changed), candidateError);
  rejectWired(`candidate patterns ${label}`, changedSources(lifecyclePath, () => changed), candidateError);
}
const reorderedInstruction = replaceOnce(instruction, applyLine, `applyTo: '${[...candidatePatterns].reverse().join(', ')}'`);
assert.doesNotThrow(() => contracts.checkLifecycleCandidatePatterns(reorderedInstruction));
assert.equal(loadFixture(changedSources(lifecyclePath, () => reorderedInstruction), true).process.exitCode, 0);
for (const entry of ['model: "<model>"', 'model-policy: required', 'reasoning-effort: "<effort>"', 'reasoning-effort: high']) {
  assertRejected(`starter contains active ${entry}`, () => contracts.checkModelAuthoringContract({
    agentTemplate: replaceOnce(fixtureSources.get(templatePath), /^---\n/, `---\n${entry}\n`)
  }), (error) => error.contractId === 'MODEL-AUTHORING-001' && /frontmatter inert/.test(error.message));
}

// Required-input failures and the entry path remain explicit, never success-shaped.
for (const [label, sources, expected] of [
  ['missing profile source', changedSources(profilePath, null), /Cannot read/],
  ['missing lock source', changedSources('package-lock.json', null), /Cannot read/],
  ['missing lifecycle instruction source', changedSources(lifecyclePath, null), /Cannot read/],
  ['invalid prompt target', changedSources(ordinaryPrompt, (text) => replaceOnce(text, 'agent: RPIR Implement', 'agent: Missing')),
  (error) => error.contractId === 'STRUCT-PROMPT-001'],
  ['engine drift', changedSources('package-lock.json', () => JSON.stringify({ packages: { '': { engines: { vscode: '^1.130.0' } } } })),
  (error) => error.contractId === 'NATIVE-SUPPORT-001'],
  ['empty Skill description', changedSources(checkpointSkill, (text) => replaceOnce(text, /^description:.*$/m, 'description:')),
  /non-empty text description/],
  ['duplicate contributed name', changedSources(ordinaryPrompt, (text) => replaceOnce(text, 'name: explain-change', 'name: RPIR Plan')),
  /Duplicate contributed customization name/],
  ['instruction applicability missing', changedSources(lifecyclePath, (text) => replaceOnce(text, applyLine, "applyTo: ''")),
  /non-empty applyTo/]
]) rejectWired(label, sources, expected);
const missingManifest = loadFixture(changedSources('package.json', null), true);
assert.equal(missingManifest.process.exitCode, 1);
assert.ok(missingManifest.errors.some((line) => /DIAGNOSTIC FAIL PARITY-INPUT-001/.test(line)));
assert.ok(missingManifest.errors.includes('Manifest/discovery parity: NOT RUN (required input unavailable)'));
const malformedManifest = loadFixture(changedSources('package.json', () => '{'), true);
assert.equal(malformedManifest.process.exitCode, 1);
assert.ok(malformedManifest.errors.some((line) => /DIAGNOSTIC FAIL PARITY-INPUT-001/.test(line)));
const malformedInventory = new Map(fixtureSources);
malformedInventory.set('.github/prompts', 'not a directory');
const discoveryFailure = loadFixture(malformedInventory, true);
assert.equal(discoveryFailure.process.exitCode, 1);
assert.ok(discoveryFailure.errors.some((line) => /DIAGNOSTIC FAIL DISCOVERY-001/.test(line)));
assert.ok(discoveryFailure.errors.includes('Customization structure: NOT RUN (discovery unavailable)'));
const paritySources = changedSources('package.json', (text) => {
  const fixture = JSON.parse(text);
  fixture.files = fixture.files.filter((entry) => entry !== path.posix.dirname(checkpointSkill));
  return JSON.stringify(fixture);
});
const parityFailure = loadFixture(paritySources, true);
assert.equal(parityFailure.process.exitCode, 1);
assert.ok(parityFailure.errors.some((line) => /DIAGNOSTIC FAIL PARITY-001/.test(line)));
assert.ok(parityFailure.output.some((line) => /Customization structure .*: PASS/.test(line)),
  'routine must still run customization checks after a parity failure');
const noPromptSources = changedSources(ordinaryPrompt, null);
assert.equal(loadFixture(noPromptSources).discover().chatPromptFiles.length, inventory.chatPromptFiles.length,
  'an absent optional prompt directory is supported');
cases += 5;

// Retain mechanical Run Book links and actual package/CLI interfaces, not
// assertions about whether its English states authority or operating rules.
const packagingScripts = sourceManifest.scripts;
const prepareVsix = require('../scripts/prepare-vsix.cjs');
assert.equal(packagingScripts['prepare-vsix'], 'node scripts/prepare-vsix.cjs prepare');
assert.equal(packagingScripts['inspect-vsix-candidate'], 'node scripts/prepare-vsix.cjs inspect');
assert.equal(packagingScripts['confirm-release-inputs'], 'node scripts/prepare-vsix.cjs release-inputs');
assert.equal(packagingScripts['verify-copilot-contracts'], 'node scripts/verify-copilot-contracts.cjs');
assert.equal(packagingScripts['test-copilot-contracts'], 'node tests/test-copilot-contracts.cjs');
assert.equal(packagingScripts['test-vsix-boundary'], 'node tests/test-vsix-boundary.cjs');
assert.deepEqual(prepareVsix.validateArguments(['prepare']), { command: 'prepare' });
assert.deepEqual(prepareVsix.validateArguments(['inspect', '--candidate', 'candidate']), {
  command: 'inspect', candidateDirectory: 'candidate'
});
assert.deepEqual(prepareVsix.validateArguments([
  'release-inputs', '--version', '2.4.8', '--change-summary', 'Evidence summary',
  '--expected-pending-notes', 'old notes', '--proposed-notes', 'new notes'
]), {
  command: 'release-inputs', version: '2.4.8', changeSummary: 'Evidence summary',
  expectedPendingNotes: 'old notes', proposedNotes: 'new notes'
});
assert.equal(typeof prepareVsix.applyConfirmedReleaseInputs, 'function');
for (const relative of ['docs/run-books/vsix-packaging.md', '.github/skills/create-runbook/SKILL.md',
  '.github/skills/create-runbook/templates/runbook.md']) {
  assert.doesNotThrow(() => contracts.checkLocalLinks(relative, readArtifact(relative)));
}
assert.match(readArtifact('.github/workflows/package.yml'), /package:\s*\n\s+if: false/,
  'the hosted package job remains disabled');
console.log(`Passed ${cases} focused Copilot mechanical cases; controlled fixtures do not establish checkout or runtime validity.`);
