'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const contracts = require('../scripts/verify-copilot-contracts.cjs');
const { discover, root } = require('../scripts/discover-copilot-artifacts.cjs');
const { desiredManifest, differences } = require('../scripts/sync-copilot-manifest.cjs');

const inventory = discover();
const sourceManifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const manifest = desiredManifest(sourceManifest, inventory);
const expectedSkillContributions = [
  '.github/skills/agent-model-selection/SKILL.md',
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
  '.github/skills/implement/SKILL.md',
  '.github/skills/local-git-checkpoints/SKILL.md',
  '.github/skills/maintain-copilot-artifacts/SKILL.md',
  '.github/skills/plan/SKILL.md',
  '.github/skills/remediate-review/SKILL.md',
  '.github/skills/review/SKILL.md',
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

// Native checks are authored-contract checks, not proof of actual loading,
// dispatch, tool isolation or effective model selection.
const nativeProfile = readArtifact('.github/skills/agent-model-selection/references/role-profiles.md');
const nativeSkill = readArtifact('.github/skills/agent-model-selection/SKILL.md');
const nativeSkillNames = new Set(inventory.chatSkills.map((relative) =>
  contracts.parseFrontmatterText(readArtifact(relative), relative).values.name));
const nativeLock = JSON.parse(readArtifact('package-lock.json'));
const nativeCheck = (relative, text = readArtifact(relative), skills = nativeSkillNames, profile = nativeProfile) =>
  contracts.checkNativeAgentContract(relative, contracts.parseFrontmatterText(text, relative), agentNames, skills, profile);
for (const relative of agentPaths) {
  assert.doesNotThrow(() => nativeCheck(relative));
  cases += 1;
}
assert.doesNotThrow(() => contracts.checkNativeSupportMetadata(sourceManifest, nativeLock));
assert.doesNotThrow(() => contracts.checkNativeModelObservationContract(nativeSkill, nativeProfile));
cases += 2;
for (const [label, manifestInput, lockInput] of [
  ['old manifest baseline', { ...sourceManifest, engines: { vscode: '^1.130.0' } }, nativeLock],
  ['missing lock baseline', sourceManifest, { packages: { '': {} } }]
]) assertRejected(label, () => contracts.checkNativeSupportMetadata(manifestInput, lockInput),
  (error) => error.contractId === 'NATIVE-SUPPORT-001');

const nativeResearchPath = agentPath('Research');
const nativeResearch = readArtifact(nativeResearchPath);
const researchTools = "tools: ['read', 'search', 'web', 'edit', 'edit/createDirectory', 'agent']";
assert.ok(nativeResearch.includes(researchTools), 'Research retains the qualified directory reference alongside edit');
assert.doesNotThrow(() => nativeCheck(nativeResearchPath, nativeResearch));
cases += 1;
for (const [label, replacement] of [
  ['omitted directory reference', "tools: ['read', 'search', 'web', 'edit', 'agent']"],
  ['unqualified directory reference', "tools: ['read', 'search', 'web', 'edit', 'createDirectory', 'agent']"],
  ['invented extension prefix', "tools: ['read', 'search', 'web', 'edit', 'github.copilot/edit/createDirectory', 'agent']"],
  ['omitted edit alias', "tools: ['read', 'search', 'web', 'edit/createDirectory', 'agent']"]
]) assertRejected(`native Research ${label}`, () => nativeCheck(nativeResearchPath,
  replaceOnce(nativeResearch, researchTools, replacement)),
  (error) => error.contractId === 'NATIVE-AGENT-001' && /tools differ from the nonempty role boundary/.test(error.message));

const nativePlanPath = agentPath('Plan');
const nativePlan = readArtifact(nativePlanPath);
for (const [label, target, replacement] of [
  ['wrong target', 'target: github-copilot', 'target: vscode'],
  ['empty tools', "tools: ['read', 'search', 'edit', 'agent']", 'tools: []'],
  ['unsupported Local delegation metadata', 'target: github-copilot', "target: github-copilot\nagents: ['Script Runner']"],
  ['wrong body specialist', 'Requirements Analyst, Architecture Analyst', 'Test Worker, Architecture Analyst'],
  ['wildcard body specialist', 'Requirements Analyst, Architecture Analyst', '*, Architecture Analyst'],
  ['fallback model list', "model: 'gpt-6.1-sol'", "model: ['gpt-6.1-sol', 'gpt-6.1-terra']"],
  ['wrong effort', 'reasoning-effort: high', 'reasoning-effort: xhigh']
]) assertRejected(`native ${label}`, () => nativeCheck(nativePlanPath, replaceOnce(nativePlan, target, replacement)));
assertRejected('unresolved named skill', () => nativeCheck(nativePlanPath, nativePlan,
  new Set([...nativeSkillNames].filter((name) => name !== 'architecture-planning'))),
  (error) => error.contractId === 'NATIVE-AGENT-001' && /named skills/.test(error.message));
assertRejected('missing native profile row', () => nativeCheck(nativePlanPath, nativePlan, nativeSkillNames,
  replaceOnce(nativeProfile, '| `plan.agent.md` | `gpt-6.1-sol` | `high` |', '')),
  (error) => error.contractId === 'NATIVE-AGENT-001' && /one role row/.test(error.message));
const routeSentence = nativePlan.split('\n').find((line) => line.startsWith('Permitted specialists are exactly'));
assert.ok(routeSentence);
for (const [label, text] of [
  ['history decoy', `${replaceOnce(nativePlan, routeSentence, 'Specialists are selected as needed.')}\n\n## Historical example\n\n${routeSentence}`],
  ['metadata decoy', replaceOnce(replaceOnce(nativePlan, routeSentence, 'Specialists are selected as needed.'),
    'description: ', `description: ${routeSentence} `)],
  ['duplicate normative route', replaceOnce(nativePlan, routeSentence, `${routeSentence}\n${routeSentence}`)],
  ['additive contradiction', replaceOnce(nativePlan, routeSentence, `${routeSentence}\n\nAny workers may be used.`)]
]) assertRejected(`native route ${label}`, () => nativeCheck(nativePlanPath, text),
  (error) => error.contractId === 'NATIVE-AGENT-001');
assert.doesNotThrow(() => nativeCheck(nativePlanPath, replaceOnce(nativePlan,
  'reconcile returned evidence and effects', 'reconcile returned evidence and effects before relying on them')));
cases += 1;
for (const [name, nextAction] of [
  ['Research', 'manual request to the selected Plan coordinator with the actual inspected physical Research brief and version'],
  ['Plan', 'manual request to Implement with the inspected physical Plan'],
  ['Implement', 'manual independent Review with the actual inspected physical implementation report'],
  ['Review', 'manual Implement request with the original approved physical Plan and linked Review'],
  ['Review', 'manual Plan request with the physical Review']
]) {
  const relative = agentPath(name);
  const original = readArtifact(relative);
  const entry = original.split(/\n\s*\n/).find((part) => part.startsWith('Prospectively,'));
  assert.ok(entry && entry.includes(nextAction), `${name} has its actual native entry owner`);
  const missing = replaceOnce(original, entry, 'Stage requests are considered.');
  for (const [label, changed] of [
    ['deleted owner', missing],
    ['history decoy', `${missing}\n\n## Historical example\n\n${entry}\n`],
    ['metadata decoy', replaceOnce(missing, 'description: ', `description: ${entry} `)],
    ['wrong-section decoy', `${missing}\n\n## Other instructions\n\n${entry}\n`],
    ['duplicate owner', replaceOnce(original, entry, `${entry}\n\n${entry}`)],
    ['wrong or absent next action', replaceOnce(original, nextAction, 'automatic request to an unspecified agent')],
    ['additive automatic transition', replaceOnce(original, entry, `${entry}\n\nAutomatically invoke the next stage.`)]
  ]) assertRejected(`${name} native entry ${label}`, () => nativeCheck(relative, changed),
    (error) => error.contractId === 'NATIVE-AGENT-001');
}
assert.doesNotThrow(() => nativeCheck(agentPath('Implement'), replaceOnce(readArtifact(agentPath('Implement')),
  'manual independent Review with the actual inspected physical implementation report',
  'manual independent Review with the inspected physical implementation report')));
cases += 1;
const nativeImplementPath = agentPath('Implement');
const nativeImplement = readArtifact(nativeImplementPath);
const implementEntry = nativeImplement.split(/\n\s*\n/).find((part) => part.startsWith('Prospectively,'));
const implementEntryError = (error) => error.contractId === 'NATIVE-AGENT-001' &&
  /native entry and manual next-stage safeguards/.test(error.message);
assert.ok(implementEntry);
assert.doesNotThrow(() => nativeCheck(nativeImplementPath, nativeImplement));
cases += 1;
for (const target of [
  'receiving-role rule is already effective before invocation',
  'Where policy effective at invocation requires explicit `/implement`, use that route to bootstrap',
  'does not self-upgrade a session',
  'or make an earlier invocation retroactive'
]) {
  const missing = replaceOnce(nativeImplement, implementEntry, replaceOnce(implementEntry, target, 'omitted safeguard'));
  for (const [label, changed] of [
    ['missing', missing],
    ['history decoy', `${missing}\n\n## Historical example\n\n${implementEntry}\n`],
    ['wrong-section decoy', `${missing}\n\n## Other instructions\n\n${implementEntry}\n`],
    ['metadata decoy', replaceOnce(missing, 'description: ', `description: ${target}; `)]
  ]) assertRejected(`Implement conditional bootstrap ${label}: ${target}`,
    () => nativeCheck(nativeImplementPath, changed), implementEntryError);
}
for (const statement of ['Policy edits automatically self-upgrade a session.',
  'Earlier invocations are retroactive.', 'Explicit `/implement` is always required.']) {
  assertRejected(`Implement additive bootstrap contradiction: ${statement}`, () => nativeCheck(nativeImplementPath,
    replaceOnce(nativeImplement, implementEntry, `${implementEntry}\n\n${statement}`)), implementEntryError);
}
assert.doesNotThrow(() => nativeCheck(nativeImplementPath,
  `${nativeImplement}\n\n## Historical example\n\nEarlier invocations are retroactive.\n`));
cases += 1;
const nativeWorkerPath = agentPath('Implementation Worker');
const nativeWorker = readArtifact(nativeWorkerPath);
const nondelegation = nativeWorker.split('\n').find((line) => line.startsWith('Do not delegate or accept work beyond'));
assert.ok(nondelegation);
for (const [label, text] of [
  ['missing owner', replaceOnce(nativeWorker, nondelegation, 'Work within the delegated scope.')],
  ['history decoy', `${replaceOnce(nativeWorker, nondelegation, 'Work within the delegated scope.')}\n\n## Historical example\n\n${nondelegation}`],
  ['additive contradiction', replaceOnce(nativeWorker, nondelegation, `${nondelegation}\n\nWorkers may delegate.`)]
]) assertRejected(`native worker ${label}`, () => nativeCheck(nativeWorkerPath, text),
  (error) => error.contractId === 'NATIVE-AGENT-001');

for (const [owner, original, boundary] of [
  ['skill', nativeSkill, '## Output and boundary'],
  ['profile', nativeProfile, 'The forward target is Copilot']
]) {
  const check = (changed) => contracts.checkNativeModelObservationContract(
    owner === 'skill' ? changed : nativeSkill, owner === 'profile' ? changed : nativeProfile);
  for (const contradiction of [
    'Fallback was caused by an unavailable model.',
    'Unknown selection is a success.',
    'A known mismatch is a default pass.'
  ]) assertRejected(`${owner} additive model contradiction`, () => check(replaceOnce(original, boundary,
    `${contradiction}\n\n${boundary}`)), (error) => error.contractId === 'NATIVE-MODEL-001');
  const missing = replaceOnce(original, 'fallback cause not exposed', 'fallback explained');
  for (const [label, changed] of [
    ['history', `${missing}\n\n## Historical example\n\nfallback cause not exposed\n`],
    ...(owner === 'skill' ? [['metadata', replaceOnce(missing, 'description: ',
      'description: fallback cause not exposed; ')]] : [])
  ]) assertRejected(`${owner} ${label} cannot restore model observation rule`, () => check(changed),
    (error) => error.contractId === 'NATIVE-MODEL-001');
}
assertRejected('wrong model owner cannot restore observation rule', () => contracts.checkNativeModelObservationContract(
  replaceOnce(nativeSkill, 'fallback cause not exposed', 'fallback explained'),
  `${nativeProfile}\n\n## Historical example\n\nfallback cause not exposed\n`
), (error) => error.contractId === 'NATIVE-MODEL-001');

for (const [name, forbidden] of [['Research', 'Implementation Worker'], ['Plan', 'Security Reviewer'],
  ['Implement', 'Architecture Analyst'], ['Review', 'Test Worker']]) {
  const relative = agentPath(name);
  const original = readArtifact(relative);
  const route = original.split('\n').find((line) => line.startsWith('Permitted specialists are exactly'));
  const allowed = route.match(/\*\*([^*]+)\*\*/)[1].replace(/, and /g, ', ').split(', ');
  for (const statement of ['Only a subset of the permitted specialists may be invoked.',
    `Only ${allowed[0]} may be invoked.`, 'Only Script Runner may be delegated to.', `The coordinator may invoke ${forbidden}.`,
    `Use ${forbidden} instead.`, 'Use a generic worker instead.', 'Use an arbitrary worker.']) {
    assertRejected(`${name} additive route contradiction: ${statement}`, () => nativeCheck(relative,
      replaceOnce(original, route, `${route}\n\n${statement}`)),
    (error) => error.contractId === 'NATIVE-AGENT-001' && /contradictory body route/.test(error.message));
  }
  assert.doesNotThrow(() => nativeCheck(relative, replaceOnce(original, route,
    `${route}\n\nThe coordinator may invoke ${allowed[0]} or ${allowed[1]} when appropriate.`)));
  assert.doesNotThrow(() => nativeCheck(relative, replaceOnce(original, route,
    `${route}\n\nOnly ${allowed.join(', ')} may be invoked.`)));
  assert.doesNotThrow(() => nativeCheck(relative, replaceOnce(original, route,
    `${route}\n\nOnly ${allowed.join(', ')} may be delegated to.`)));
  assert.doesNotThrow(() => nativeCheck(relative, replaceOnce(original, route,
    `${route}\n\nDo not use an arbitrary worker.`)));
  assertRejected(`${name} hardcoded generated ID route`, () => nativeCheck(relative,
    replaceOnce(original, route, `${route}\n\nUse hardcoded generated ID \`copilot-native-agent-7f3a\`.`)),
  (error) => error.contractId === 'NATIVE-AGENT-001' && /contradictory body route/.test(error.message));
  assertRejected(`${name} literal opaque generated ID route`, () => nativeCheck(relative,
    replaceOnce(original, route, `${route}\n\nInvoke \`copilot-native-agent-7f3a11\`.`)),
  (error) => error.contractId === 'NATIVE-AGENT-001' && /contradictory body route/.test(error.message));
  for (const statement of ['Invoke `vscode-agent-7f3a`.', 'Choose `vscode-agent-7f3a1`.',
    'Do not invoke `vscode-agent-7f3a`; but invoke `vscode-agent-7f3a`.']) {
    assertRejected(`${name} short generated ID route: ${statement}`, () => nativeCheck(relative,
      replaceOnce(original, route, `${route}\n\n${statement}`)),
    (error) => error.contractId === 'NATIVE-AGENT-001' && /contradictory body route/.test(error.message));
  }
  assert.doesNotThrow(() => nativeCheck(relative, replaceOnce(original, route,
    `${route}\n\nDo not use hardcoded generated ID \`copilot-native-agent-7f3a\`.`)));
  assert.doesNotThrow(() => nativeCheck(relative, replaceOnce(original, route,
    `${route}\n\nDo not invoke \`copilot-native-agent-7f3a11\`.`)));
  for (const statement of ['Do not invoke `vscode-agent-7f3a`.', 'Never invoke `vscode-agent-7f3a`.',
    'An illustrative generated ID is `vscode-agent-7f3a`; do not hardcode it.']) {
    assert.doesNotThrow(() => nativeCheck(relative, replaceOnce(original, route, `${route}\n\n${statement}`)));
    cases += 1;
  }
  assert.doesNotThrow(() => nativeCheck(relative, `${original}\n\n## Historical example\n\nOnly Script Runner may be delegated to.\nUse an arbitrary worker.\n`));
  cases += 7;
}
for (const [owner, original, boundary] of [['skill', nativeSkill, '## Output and boundary'],
  ['profile', nativeProfile, 'The forward target is Copilot']]) {
  const check = (changed) => contracts.checkNativeModelObservationContract(
    owner === 'skill' ? changed : nativeSkill, owner === 'profile' ? changed : nativeProfile);
  assert.doesNotThrow(() => check(replaceOnce(original, boundary,
    `Observed evidence from runtime logs confirms fallback was caused by an unavailable model.\n\n${boundary}`)));
  assert.doesNotThrow(() => check(replaceOnce(original, boundary,
    `Fallback was caused by an unavailable model according to captured diagnostic logs.\n\n${boundary}`)));
  assert.doesNotThrow(() => check(replaceOnce(original, boundary,
    `Do not assert fallback was caused by an unavailable model.\n\n${boundary}`)));
  for (const statement of [
    'Do not assert the model was unavailable, which caused the fallback.',
    'Never assert that the model is unavailable, which caused fallback.'
  ]) {
    assert.doesNotThrow(() => check(replaceOnce(original, boundary, `${statement}\n\n${boundary}`)));
    cases += 1;
  }
  assert.doesNotThrow(() => check(replaceOnce(original, boundary,
    `Observed evidence from runtime logs confirms the model was unavailable, which caused the fallback.\n\n${boundary}`)));
  assert.doesNotThrow(() => check(replaceOnce(original, boundary,
    `The model was unavailable, which caused the fallback, according to captured diagnostic logs.\n\n${boundary}`)));
  assert.doesNotThrow(() => check(`${original}\n\n## Historical notes\n\nFallback was caused by an unavailable model.\n`));
  cases += 6;
  for (const statement of ['Fallback was caused by an unavailable model.', 'The model was unavailable, which caused the fallback.',
    'Do not assert the model was unavailable, which caused the fallback; but the model was unavailable, which caused the fallback.',
    'Do not assert fallback was caused by an unavailable model; but fallback was caused by an unavailable model.']) {
    assertRejected(`${owner} invented fallback cause: ${statement}`, () => check(replaceOnce(original, boundary,
      `${statement}\n\n${boundary}`)), (error) => error.contractId === 'NATIVE-MODEL-001');
  }
}

// Positive controls: current discovered artifacts, tool boundaries, routes,
// manifest parity, and all supported local links are structurally valid.
assert.deepEqual(inventory.chatSkills, expectedSkillContributions,
  'every contributed Skill must be its literal SKILL.md file path');
assert.ok(inventory.chatSkills.every((entry) => fs.statSync(path.join(root, entry)).isFile()),
  'every Skill contribution must resolve to a regular file');
assert.deepEqual(manifest.contributes.chatSkills.map((entry) => entry.path), expectedSkillContributions);
assert.deepEqual(manifest.files.filter((entry) => entry.startsWith('.github/skills/')),
  expectedSkillContributions.map((entry) => path.posix.dirname(entry)),
  'package inclusion must retain complete Skill payload roots');
assert.deepEqual(differences(manifest, inventory), [], 'the generated manifest projection must be idempotent');
assert.doesNotThrow(() => contracts.checkManifestParity(sourceManifest, inventory),
  'the checked-in manifest must match actual discovery');
// Exercise the real discovery source against a tiny in-memory filesystem;
// neither fixture setup nor cleanup writes to the host filesystem.
const discoverySource = readArtifact('scripts/discover-copilot-artifacts.cjs');
const fixtureRoot = path.resolve(root, '__discovery_fixture__');
const fixtureDirectories = new Set([fixtureRoot, path.join(fixtureRoot, '.github'),
  ...['instructions', 'agents', 'skills'].map((name) => path.join(fixtureRoot, '.github', name))]);
let promptIsFile = false;
const fixtureFs = {
  lstatSync(full) {
    const directory = fixtureDirectories.has(full);
    const file = promptIsFile && full === path.join(fixtureRoot, '.github', 'prompts');
    if (!directory && !file) throw Object.assign(new Error('missing fixture path'), { code: 'ENOENT' });
    return { isDirectory: () => directory, isFile: () => file, isSymbolicLink: () => false };
  },
  readdirSync() { return []; }
};
const fixtureModule = { exports: {} };
vm.runInNewContext(discoverySource, { module: fixtureModule, __dirname: path.join(fixtureRoot, 'scripts'),
  require: (name) => name === 'fs' ? fixtureFs : require(name) });
const fixtureDiscover = fixtureModule.exports.discover;
assert.equal(fixtureDiscover().chatPromptFiles.length, 0, 'an absent prompt directory is an empty inventory');
promptIsFile = true;
assertRejected('a prompt path that is not a directory', () => fixtureDiscover(), /Expected directory/);
for (const name of ['implement', 'plan', 'remediate-review', 'review']) {
  const skill = `.github/skills/${name}/SKILL.md`;
  assert.ok(inventory.chatSkills.includes(skill), `${name} must be discovered as a Skill`);
  assert.ok(!inventory.chatPromptFiles.includes(`.github/prompts/${name}.prompt.md`),
    `${name} must not retain an obsolete prompt contribution`);
  const text = readArtifact(skill);
  assert.doesNotThrow(() => contracts.checkLocalLinks(skill, text));
  const broken = text.replace('](../', '](../skills/');
  assert.notEqual(broken, text, `${name} must include a sibling Skill link`);
  assertRejected(`${name} retains a pre-migration relative link`,
    () => contracts.checkLocalLinks(skill, broken), /local link does not resolve/);
}
const unrelatedFieldFixture = desiredManifest({
  ...clone(sourceManifest),
  customMetadata: { retained: true },
  files: [...sourceManifest.files, 'vendor/custom-payload']
}, inventory);
assert.deepEqual(unrelatedFieldFixture.customMetadata, { retained: true });
assert.ok(unrelatedFieldFixture.files.includes('vendor/custom-payload'));
assert.doesNotThrow(() => contracts.checkManifestParity(manifest, inventory));
const profilePath = '.github/skills/agent-model-selection/references/role-profiles.md';
const profileText = readArtifact(profilePath);
const expectedProfiles = {
  'architecture-analyst': ['gpt-6.1-sol', 'high'], 'codebase-investigator': ['gpt-6.1-terra', 'high'],
  'correctness-reviewer': ['gpt-6.1-sol', 'high'], 'domain-investigator': ['gpt-6.1-terra', 'high'],
  'feasibility-investigator': ['gpt-6.1-terra', 'xhigh'], 'implement': ['gpt-6.1-sol', 'high'],
  'implementation-worker': ['gpt-6.1-terra', 'xhigh'], 'maintainability-reviewer': ['gpt-6.1-terra', 'high'],
  'plan': ['gpt-6.1-sol', 'high'], 'requirements-analyst': ['gpt-6.1-terra', 'high'],
  'research': ['gpt-6.1-sol', 'high'], 'review': ['gpt-6.1-sol', 'high'],
  'script-runner': ['gpt-6.1-sol', 'high'], 'security-reviewer': ['gpt-6.1-sol', 'high'],
  'stage-assurance': ['gpt-6.1-sol', 'high'], 'test-strategist': ['gpt-6.1-terra', 'xhigh'],
  'test-worker': ['gpt-6.1-terra', 'high'], 'validation-worker': ['gpt-6-luna', 'high']
};
function assertBaselinePairs(profiles) {
  for (const [name, [model, effort]] of Object.entries(expectedProfiles)) {
    assert.deepEqual(profiles.get(`${name}.agent.md`), { model, effort }, `${name} allocation`);
  }
}
const profiles = contracts.checkModelProfileCoverage(profileText, agentPaths);
assertBaselinePairs(profiles);

// These focused cases run before the full structural positive control so an
// unrelated missing source link cannot hide the declaration-specific result.
const effortCaseStart = cases;
const effortPaths = [
  '.github/agents/codebase-investigator.agent.md',
  '.github/agents/feasibility-investigator.agent.md'
];
function serializedEffort(relative, field) {
  const text = readArtifact(relative);
  assert.equal([...text.matchAll(/^reasoning-effort: [^\n]*$/gm)].length, 1, `${relative} has one effort header`);
  return text.replace(/^reasoning-effort: [^\n]*$/m, field);
}
function projectSerialized(relative, text, selectedProfiles = profiles) {
  const parsed = contracts.parseFrontmatterText(text, relative);
  contracts.checkModelProjection(relative, parsed.values, selectedProfiles);
}
for (const [relative, effort] of [[effortPaths[0], 'high'], [effortPaths[1], 'xhigh']]) {
  for (const scalar of [effort, `'${effort}'`, `"${effort}"`]) {
    assert.doesNotThrow(() => projectSerialized(relative, serializedEffort(relative, `reasoning-effort: ${scalar}`)));
    cases += 1;
  }
  for (const [label, field, message] of [
    ['missing', '', /must declare its non-empty profile effort/],
    ['empty', 'reasoning-effort:', /must declare its non-empty profile effort/],
    ['whitespace', 'reasoning-effort:    ', /must declare its non-empty profile effort/],
    ['single-quoted empty', "reasoning-effort: ''", /must declare its non-empty profile effort/],
    ['double-quoted empty', 'reasoning-effort: ""', /must declare its non-empty profile effort/],
    ['quoted whitespace', 'reasoning-effort: "   "', /must declare its non-empty profile effort/],
    ['wrong role', `reasoning-effort: ${effort === 'high' ? 'xhigh' : 'high'}`, /reasoning-effort must match its profile/],
    ['case mismatch', `reasoning-effort: ${effort.toUpperCase()}`, /reasoning-effort must match its profile/],
    ['medium', 'reasoning-effort: medium', /reasoning-effort must match its profile/],
    ['max', 'reasoning-effort: max', /reasoning-effort must match its profile/],
    ['array', 'reasoning-effort: [high]', /unsupported reasoning-effort metadata/],
    ['map', 'reasoning-effort: {value: high}', /unsupported reasoning-effort metadata/],
    ['alias', 'reasoning-effort: *effort', /unsupported reasoning-effort metadata/],
    ['anchor', 'reasoning-effort: &effort high', /unsupported reasoning-effort metadata/],
    ['tag', 'reasoning-effort: !effort high', /unsupported reasoning-effort metadata/],
    ['literal block', 'reasoning-effort: |', /unsupported reasoning-effort metadata/],
    ['folded block', 'reasoning-effort: >', /unsupported reasoning-effort metadata/],
    ['malformed single quote', "reasoning-effort: 'high", /unsupported reasoning-effort metadata/],
    ['malformed double quote', 'reasoning-effort: "high', /unsupported reasoning-effort metadata/],
    ['invalid escape', 'reasoning-effort: "hi\\qgh"', /unsupported reasoning-effort metadata/]
  ]) {
    assertRejected(`${relative} ${label} serialized effort`, () => projectSerialized(relative, serializedEffort(relative, field)),
      (error) => error.contractId === 'MODEL-PROJECTION-001' && message.test(error.message));
  }
  for (const [label, suffix, diagnostic] of [
    ['identical duplicate', `\nreasoning-effort: ${effort}`, /duplicate frontmatter field: reasoning-effort/],
    ['conflicting duplicate', `\nreasoning-effort: ${effort === 'high' ? 'xhigh' : 'high'}`, /duplicate frontmatter field: reasoning-effort/],
    ['continuation', '\n  continued', /unsupported continuation metadata for reasoning-effort/],
    ['block continuation', '\n  high', /unsupported continuation metadata for reasoning-effort/]
  ]) {
    const first = label === 'block continuation' ? 'reasoning-effort: |' : `reasoning-effort: ${effort}`;
    assertRejected(`${relative} ${label} serialized effort`, () => projectSerialized(relative, serializedEffort(relative, first + suffix)),
      (error) => error.contractId === 'STRUCT-001' && diagnostic.test(error.message));
  }
}
const highRow = '| `codebase-investigator.agent.md` | `gpt-6.1-terra` | `high` |';
const xhighRow = '| `feasibility-investigator.agent.md` | `gpt-6.1-terra` | `xhigh` |';
const swappedEfforts = replaceOnce(replaceOnce(profileText, highRow, highRow.replace('`high`', '`xhigh`')),
  xhighRow, xhighRow.replace('`xhigh`', '`high`'));
const swappedProfiles = contracts.checkModelProfileCoverage(swappedEfforts, agentPaths);
assert.doesNotThrow(() => projectSerialized(effortPaths[0], serializedEffort(effortPaths[0], 'reasoning-effort: xhigh'), swappedProfiles));
assert.doesNotThrow(() => projectSerialized(effortPaths[1], serializedEffort(effortPaths[1], 'reasoning-effort: high'), swappedProfiles));
cases += 2;
assertRejected('count-preserving coordinated effort swap', () => assertBaselinePairs(swappedProfiles), /codebase-investigator allocation/);

const effortOwners = {
  skill: readArtifact('.github/skills/agent-model-selection/SKILL.md'), profile: profileText
};
assert.doesNotThrow(() => contracts.checkModelEffortContract(effortOwners));
cases += 1;
for (const [owner, target, replacement, sectionName] of [
  ['skill', 'declared effort intent, and separately observed effective', 'effort', 'procedure'],
  ['skill', 'Before model configuration', 'Before any configuration', 'procedure'],
  ['skill', 'without requiring runtime support proof before declaration', 'after support has been demonstrated', 'procedure'],
  ['skill', 'runtime consumption, compatibility and harmless ignoring are not established', 'runtime behavior is established', 'procedure'],
  ['skill', 'Do not assume a root effort propagates to a child', 'Assume a root effort propagates to a child', 'procedure'],
  ['skill', 'effort declaration or escalation never grants tools', 'effort declaration or escalation grants tools', 'output'],
  ['profile', 'target effort is declared as `reasoning-effort` intent, not an observed effective setting', 'target effort is an effective setting', 'introduction'],
  ['profile', 'without requiring runtime support proof before declaration', 'after runtime support proof', 'selection'],
  ['profile', 'does not establish runtime consumption, compatibility, harmless ignoring or effective effort', 'establishes effective effort', 'selection'],
  ['profile', 'Child effort is not assumed to follow the parent', 'Child effort follows the parent', 'selection'],
  ['profile', 'effort declaration or escalation never expands authority', 'effort declaration or escalation expands authority', 'selection']
]) {
  assertRejected(`${owner} ${sectionName} missing or reversed effort rule`, () => contracts.checkModelEffortContract({
    ...effortOwners, [owner]: replaceOnce(effortOwners[owner], target, replacement)
  }), (error) => error.contractId === 'MODEL-EFFORT-CONTRACT-001' && error.message === `${sectionName}: missing effort declaration/evidence boundary`);
}
for (const [owner, boundary, sectionName] of [
  ['skill', '## Output and boundary', 'procedure'],
  ['profile', '| Agent definition | Recommended model | Target effort |', 'introduction'],
  ['profile', 'The forward target is Copilot', 'selection']
]) {
  for (const contradiction of [
    'Runtime support proof is required before declaration.',
    'Declared effort is automatically applied.',
    'The declaration proves compatibility.',
    'The declaration guarantees harmless ignoring.',
    'Unsupported effort is safely ignored.',
    'Child effort automatically inherits the parent.',
    'Effort declarations grant authority.'
  ]) {
    assertRejected(`${owner} ${sectionName} additive contradiction: ${contradiction}`, () => contracts.checkModelEffortContract({
      ...effortOwners, [owner]: replaceOnce(effortOwners[owner], boundary, `${contradiction}\n\n${boundary}`)
    }), (error) => error.contractId === 'MODEL-EFFORT-CONTRACT-001' && error.message === `${sectionName}: contradictory effort declaration/evidence boundary`);
  }
}
const noInheritance = 'Do not assume a root effort propagates to a child';
assertRejected('historical decoy cannot supply procedure no-inheritance rule', () => contracts.checkModelEffortContract({
  ...effortOwners, skill: `${replaceOnce(effortOwners.skill, noInheritance, 'Record observed settings')}\n\n## Historical example\n\n${noInheritance}.\n`
}), (error) => error.contractId === 'MODEL-EFFORT-CONTRACT-001' && /procedure: missing/.test(error.message));
for (const [owner, target, replacement] of [
  ['skill', 'without requiring runtime support proof before declaration', 'without runtime support proof as a prerequisite to declaration'],
  ['skill', 'Do not assume a root effort propagates to a child', 'Do not assume child effort inherits the root'],
  ['profile', 'without requiring runtime support proof before declaration', 'without runtime support proof as a prerequisite to declaration']
]) {
  assert.doesNotThrow(() => contracts.checkModelEffortContract({
    ...effortOwners, [owner]: replaceOnce(effortOwners[owner], target, replacement)
  }));
  cases += 1;
}
console.log(`Passed ${cases - effortCaseStart} focused effort declaration cases.`);
const authoringCaseStart = cases;
const modelAuthoringPaths = {
  agent: '.github/skills/create-copilot-agent/SKILL.md',
  agentTemplate: '.github/skills/create-copilot-agent/templates/agent.md',
  prompt: '.github/skills/create-copilot-prompt/SKILL.md',
  promptTemplate: '.github/skills/create-copilot-prompt/templates/prompt.md',
  maintenance: '.github/skills/maintain-copilot-artifacts/SKILL.md',
  checklist: '.github/skills/maintain-copilot-artifacts/references/preservation-checklist.md'
};
const modelAuthoringSources = Object.fromEntries(Object.entries(modelAuthoringPaths).map(([key, relative]) => [key, readArtifact(relative)]));
assert.doesNotThrow(() => contracts.checkModelAuthoringContract(modelAuthoringSources));
cases += 1;
for (const [owner, target] of [
  ['agent', 'disclose unresolved evidence'],
  ['agentTemplate', 'do not activate an invented `model` field'],
  ['prompt', 'accidental shadowing'],
  ['promptTemplate', 'without assuming picker precedence'],
  ['maintenance', 'override/fallback boundaries'],
  ['checklist', 'harness/evidence limits']
]) {
  assertRejected(`${owner} loses model authoring safeguard`, () => contracts.checkModelAuthoringContract({
    ...modelAuthoringSources, [owner]: replaceOnce(modelAuthoringSources[owner], target, 'omitted')
  }), (error) => error.contractId === 'MODEL-AUTHORING-001' && error.message.includes(modelAuthoringPaths[owner]));
}
assertRejected('model authoring historical decoy', () => contracts.checkModelAuthoringContract({
  ...modelAuthoringSources,
  agent: `${replaceOnce(modelAuthoringSources.agent, 'disclose unresolved evidence', 'omit evidence')}\n\n## Historical example\n\ndisclose unresolved evidence\n`
}), (error) => error.contractId === 'MODEL-AUTHORING-001' && error.message.includes(modelAuthoringPaths.agent));

const authoringOwners = [
  ['agent', '## Least-privilege capabilities and delegation'],
  ['agentTemplate', '## Least-privilege tools and delegation'],
  ['maintenance', '## Limits and authority'],
  ['checklist', '## Editing and test evidence']
];
for (const [owner, boundary] of authoringOwners) {
  const projection = owner === 'agentTemplate'
    ? 'its own canonical profile effort as `reasoning-effort` beside its model'
    : `each role's own canonical profile effort${owner === 'agent' ? '' : ' declaration'} as \`reasoning-effort\` beside its model`;
  const observation = owner === 'agent' ? 'assigned model and declared effort intent from observed effective'
    : owner === 'agentTemplate' ? 'assigned model and effort intent from separately observed effective'
      : owner === 'maintenance' ? 'assigned model and declared intent from observed effective'
        : 'recommended effort, declared intent, supported model configuration and separately observed effective effort';
  const runtime = owner === 'agent' || owner === 'agentTemplate' ? 'Runtime consumption and compatibility'
    : 'Runtime consumption, compatibility and harmless ignoring';
  const unknown = owner === 'agent' || owner === 'agentTemplate' ? 'unobservable effective model'
    : owner === 'maintenance' ? 'unobservable effective model' : 'disclose unknown support';
  for (const target of [projection, 'without requiring runtime support proof before declaration',
    'do not default all roles to `high` or inherit another role\'s effort',
    observation, runtime, unknown, ['agentTemplate', 'maintenance'].includes(owner) ? 'do not assume root effort reaches a child' : 'Do not assume root effort reaches a child']) {
    assertRejected(`${owner} omits effort rule: ${target}`, () => contracts.checkModelAuthoringContract({
      ...modelAuthoringSources, [owner]: replaceOnce(modelAuthoringSources[owner], target, 'rule omitted')
    }), (error) => error.contractId === 'MODEL-AUTHORING-001' &&
      error.message === `${modelAuthoringPaths[owner]} is missing its effort authoring safeguard`);
  }
  const noAuthority = owner === 'agent' ? 'escalation grants no authority'
    : owner === 'agentTemplate' ? 'neither escalation nor model choice grants authority'
      : owner === 'maintenance' ? 'Effort declarations grant no authority' : 'effort declarations grant no authority';
  assertRejected(`${owner} omits authority boundary`, () => contracts.checkModelAuthoringContract({
    ...modelAuthoringSources, [owner]: replaceOnce(modelAuthoringSources[owner], noAuthority, 'authority expanded')
  }), (error) => error.contractId === 'MODEL-AUTHORING-001' &&
    error.message === `${modelAuthoringPaths[owner]} is missing its effort authoring safeguard`);
  for (const contradiction of [
    'All roles must use `high`.', 'Agents must inherit the parent effort.',
    'Runtime support proof is required before declaration.', 'Declared effort is automatically applied.',
    'The declaration proves compatibility.', 'Unsupported effort is safely ignored.',
    'Child effort automatically inherits the parent.', 'Effort declarations grant authority.'
  ]) {
    assertRejected(`${owner} additive contradiction: ${contradiction}`, () => contracts.checkModelAuthoringContract({
      ...modelAuthoringSources, [owner]: replaceOnce(modelAuthoringSources[owner], boundary, `${contradiction}\n\n${boundary}`)
    }), (error) => error.contractId === 'MODEL-AUTHORING-001' &&
      error.message === `${modelAuthoringPaths[owner]} has a contradictory effort authoring rule`);
  }
  const missing = replaceOnce(modelAuthoringSources[owner], projection, 'the profile recommendation');
  assertRejected(`${owner} historical effort decoy`, () => contracts.checkModelAuthoringContract({
    ...modelAuthoringSources, [owner]: `${missing}\n\n## Historical example\n\n${projection}\n`
  }), (error) => error.contractId === 'MODEL-AUTHORING-001' &&
    error.message === `${modelAuthoringPaths[owner]} is missing its effort authoring safeguard`);
  for (const [target, replacement] of [
    ['without requiring runtime support proof before declaration', 'without runtime support proof as a prerequisite to declaration'],
    ...(owner === 'checklist' ? [['Runtime consumption, compatibility and harmless ignoring are unestablished', 'Runtime consumption, compatibility and harmless ignoring are not established']] : [])
  ]) {
    assert.doesNotThrow(() => contracts.checkModelAuthoringContract({
      ...modelAuthoringSources, [owner]: replaceOnce(modelAuthoringSources[owner], target, replacement)
    }));
    cases += 1;
  }
}
for (const entry of ['model: "<model>"', 'reasoning-effort: "<effort>"', 'reasoning-effort: high']) {
  assertRejected(`starter contains active ${entry}`, () => contracts.checkModelAuthoringContract({
    ...modelAuthoringSources, agentTemplate: replaceOnce(modelAuthoringSources.agentTemplate,
      '# Add only when justified for this specific role:', `${entry}\n# Add only when justified for this specific role:`)
  }), (error) => error.contractId === 'MODEL-AUTHORING-001' &&
    error.message === `${modelAuthoringPaths.agentTemplate} must keep model and effort frontmatter inert`);
}
const futurePath = '.github/agents/future.agent.md';
const futureValues = { name: 'Future Role', model: 'gpt-6.1-terra', 'reasoning-effort': 'xhigh',
  tools: "['read', 'search']", 'user-invocable': 'false' };
const classifiedFuture = contracts.checkModelProfileCoverage(
  `${profileText}\n| \`future.agent.md\` | \`gpt-6.1-terra\` | \`xhigh\` |\n`, [...agentPaths, futurePath]);
assert.doesNotThrow(() => contracts.checkModelProjection(futurePath, futureValues, classifiedFuture));
cases += 1;
assertRejected('profile entry cannot bypass unknown-role authority guard', () => contracts.checkAgentMetadata(
  futurePath, futureValues, {}, new Set([...agentNames, 'Future Role'])
), /unrecognized agent role/);
console.log(`Passed ${cases - authoringCaseStart} focused model authoring cases.`);
assert.doesNotThrow(() => contracts.checkCustomizationContracts(inventory));
for (const [relative, parsed] of agents) {
  assert.doesNotThrow(() => contracts.checkModelProjection(relative, parsed.values, profiles));
}
const projectionPath = '.github/agents/validation-worker.agent.md';
const projectionValues = agents.get(projectionPath).values;
for (const [label, model] of [
  ['missing', undefined], ['wrong role model', "'gpt-6.1-sol'"],
  ['fallback list', "['gpt-6-luna', 'gpt-6.1-terra']"],
  ['alias', '*luna'], ['empty', '']
]) {
  assertRejected(`${label} model projection`, () => contracts.checkModelProjection(
    projectionPath, { ...projectionValues, model }, profiles
  ), (error) => error.contractId === 'MODEL-PROJECTION-001');
}
for (const model of ['gpt-6-luna', "'gpt-6-luna'", '"gpt-6-luna"']) {
  assert.doesNotThrow(() => contracts.checkModelProjection(projectionPath, { ...projectionValues, model }, profiles));
}
const sampleRow = '| `validation-worker.agent.md` | `gpt-6-luna` | `high` |';
for (const [label, text, paths, diagnostic] of [
  ['missing profile', replaceOnce(profileText, sampleRow, ''), agentPaths, /Missing model profile/],
  ['duplicate profile', replaceOnce(profileText, sampleRow, `${sampleRow}\n${sampleRow}`), agentPaths, /Duplicate model profile/],
  ['orphan profile', `${profileText}\n| ` + '`orphan.agent.md` | `gpt-6-luna` | `high` |\n', agentPaths, /Orphan model profile/],
  ['invalid effort', replaceOnce(profileText, sampleRow, sampleRow.replace('`high`', '`max`')), agentPaths, /Unsupported model profile row/],
  ['unquoted duplicate profile', replaceOnce(profileText, sampleRow, `${sampleRow}\n| validation-worker.agent.md | \`gpt-6-luna\` | \`high\` |`), agentPaths, /Unsupported model profile row/],
  ['unquoted orphan profile', `${profileText}\n| orphan.agent.md | \`gpt-6-luna\` | \`high\` |\n`, agentPaths, /Unsupported model profile row/],
  ['unclassified future agent', profileText, [...agentPaths, '.github/agents/future.agent.md'], /Missing model profile/]
]) assertRejected(label, () => contracts.checkModelProfileCoverage(text, paths),
  (error) => error.contractId === 'MODEL-PROFILE-001' && diagnostic.test(error.message));
const futureProfile = `${profileText}\n| ` + '`future.agent.md` | `gpt-6-luna` | `high` |\n';
assert.equal(contracts.checkModelProfileCoverage(futureProfile, [...agentPaths, '.github/agents/future.agent.md']).size, agentPaths.length + 1);
const swapped = replaceOnce(profileText, sampleRow, sampleRow.replace('gpt-6-luna', 'gpt-6.1-sol'));
assertRejected('current role pair drift', () => assertBaselinePairs(contracts.checkModelProfileCoverage(swapped, agentPaths)), /validation-worker allocation/);
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
  discovery: '.github/skills/agent-question-resolution/references/research-intent-discovery.md',
  planning: '.github/skills/architecture-planning/SKILL.md',
  planTemplate: '.github/skills/architecture-planning/implementation-plan-template.md',
  safe: '.github/skills/safe-implementation/SKILL.md',
  validation: '.github/skills/safe-implementation/validation-checklist.md',
  implementationReport: '.github/skills/safe-implementation/implementation-report-template.md',
  codeReview: '.github/skills/code-review/SKILL.md',
  reviewRubric: '.github/skills/code-review/review-rubric.md',
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
// Retained entry skills are inventory during overlap, not normative owners.
// Bad or missing adapter content must not replace the real coordinator rules.
assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({
  ...adrSources, planPrompt: '', implementPrompt: ''
}));
cases += 1;
assertRejected('legacy adapter cannot replace Plan decision readiness', () => contracts.checkArchitectureDecisionRecordContract({
  ...adrSources,
  plan: replaceOnce(adrSources.plan, 'A completed Plan has no unresolved architectural choice', 'Plan readiness is assessed'),
  planPrompt: adrSources.plan
}), (error) => error.contractId === 'ADR-CONTRACT-001' && /Plan must resolve architecture/.test(error.message));
assertRejected('legacy adapter cannot replace Implement sign-off authority', () => contracts.checkArchitectureDecisionRecordContract({
  ...adrSources,
  implement: replaceOnce(adrSources.implement, 'Workers, Script Runner, Review and helpers receive no ADR authorship/status authority.',
    'Other roles may record status.'),
  implementPrompt: adrSources.implement
}), (error) => error.contractId === 'ADR-CONTRACT-001' && /Implement coordinator must bind exact sign-off/.test(error.message));

const transitionRow = adrSources.core.split('\n').find((line) => line.startsWith('| Plan -> Implement |'));
assert.ok(transitionRow);
const transitionDiagnostic = (error) => error.contractId === 'ADR-CONTRACT-001' &&
  /Lifecycle core Plan-to-Implement transition must bind sign-off/.test(error.message);
for (const target of ['deliberate engineer-sent Implement request with the inspected physical approved Plan',
  'when that rule is already effective before the request', 'Plan handoff identifies the exact Proposed ADR snapshot(s)',
  'signs off only those snapshots', 'no separate routine approval',
  'Plan or Review requests, answers, reports, workers and unsent prefills do not sign off']) {
  const missing = replaceOnce(adrSources.core, transitionRow, replaceOnce(transitionRow, target, 'omitted safeguard'));
  for (const [label, core, plan] of [
    ['missing', missing, adrSources.plan],
    ['history decoy', `${missing}\n\n## Historical example\n\n${transitionRow}\n`, adrSources.plan],
    ['wrong-owner decoy', missing, `${adrSources.plan}\n\n${transitionRow}\n`]
  ]) assertRejected(`native transition ${label}: ${target}`, () =>
    contracts.checkArchitectureDecisionRecordContract({ ...adrSources, core, plan }), transitionDiagnostic);
}
assertRejected('duplicate transition owner', () => contracts.checkArchitectureDecisionRecordContract({
  ...adrSources, core: replaceOnce(adrSources.core, transitionRow, `${transitionRow}\n${transitionRow}`)
}), transitionDiagnostic);
assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({
  ...adrSources, core: replaceOnce(adrSources.core, transitionRow,
    transitionRow.replace('no separate routine approval is requested', 'no separate routine approval is requested for those snapshots'))
}));
cases += 1;

// Plan's decision-reuse and architecture owners both start with "Reconcile".
// Coverage must follow the actual architecture owner in either order, while
// all of its obligations remain enforced independently of the selector.
const architectureOwnerCaseStart = cases;
const planArchitectureOwner = adrSources.plan.split(/\n\s*\n/)
  .find((part) => part.startsWith('Reconcile every architectural choice'));
const planDecisionReuseOwner = adrSources.plan.split(/\n\s*\n/)
  .find((part) => part.startsWith('Reconcile supplied decisions before questioning'));
assert.ok(planArchitectureOwner && planDecisionReuseOwner, 'collision fixtures need both normative Plan owners');
assert.ok(adrSources.plan.indexOf(planDecisionReuseOwner) < adrSources.plan.indexOf(planArchitectureOwner),
  'the checked-in Plan must exercise the decision-reuse collision');
const extraReconcileOwner = replaceOnce(adrSources.plan, '\n# Plan coordinator\n',
  '\n# Plan coordinator\n\nReconcile unrelated notes without changing phase authority.\n');
const architectureFirst = replaceOnce(replaceOnce(adrSources.plan, planArchitectureOwner, ''),
  planDecisionReuseOwner, `${planArchitectureOwner}\n\n${planDecisionReuseOwner}`);
for (const plan of [
  adrSources.plan,
  extraReconcileOwner,
  architectureFirst,
  replaceOnce(extraReconcileOwner, 'Reconcile every architectural choice', 'Reconcile all architectural choices'),
  `${extraReconcileOwner}\n\n## Historical example, not operating policy\n\n${planArchitectureOwner}\n`
]) {
  assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({ ...adrSources, plan }));
  cases += 1;
}
const architectureDiagnostic = (error) => error.contractId === 'ADR-COVERAGE-001' &&
  error.message === 'plan: complete upfront choice identification/reconciliation is required';
for (const [label, plan] of [
  ['weakened real owner behind a Reconcile collision', replaceOnce(extraReconcileOwner,
    'Reconcile every architectural choice identified in Research and every planning discovery',
    'Reconcile selected architectural choices identified in Research and selected planning discoveries')],
  ['missing real owner', replaceOnce(extraReconcileOwner, planArchitectureOwner, '')],
  ['metadata architecture decoy', replaceOnce(replaceOnce(extraReconcileOwner, planArchitectureOwner, ''),
    'description: ', `description: ${planArchitectureOwner} `)],
  ['historical architecture decoy', `${replaceOnce(extraReconcileOwner, planArchitectureOwner, '')}\n\n## Historical example, not operating policy\n\n${planArchitectureOwner}\n`],
  ['ambiguous duplicate normative owners', replaceOnce(extraReconcileOwner, planArchitectureOwner,
    `${planArchitectureOwner}\n\n${planArchitectureOwner}`)]
]) {
  assertRejected(`Plan architecture selector: ${label}`, () =>
    contracts.checkArchitectureDecisionRecordContract({ ...adrSources, plan }), architectureDiagnostic);
}
assertRejected('Plan architecture selector: wrong-owner decoy', () =>
  contracts.checkArchitectureDecisionRecordContract({
    ...adrSources,
    plan: replaceOnce(extraReconcileOwner, planArchitectureOwner, ''),
    research: `${adrSources.research}\n\n## Historical Plan example\n\n${planArchitectureOwner}\n`
  }), architectureDiagnostic);
console.log(`Passed ${cases - architectureOwnerCaseStart} focused Plan architecture-owner cases.`);

// Handoff reliability: owner-local authored obligations, not an NLP oracle.
const handoffCaseStart = cases;
assert.doesNotThrow(() => contracts.checkDecisionReadinessContract(adrSources));
cases += 1;
for (const [key, target, replacement, diagnostic] of [
  ['researchSkill', 'what was investigated', 'the residual item', /explain material residuals/],
  ['researchTemplate', 'why it reasonably remains', 'its name', /explain material residuals/],
  ['plan', 'including qualified or nonrecommended answers', 'including recommended answers only', /reuse actual selections/],
  ['planning', 'cite genuinely new evidence', 'cite the old question', /justify material reopening/],
  ['plan', 'resolve genuine ambiguity with the engineer', 'guess the destination', /reuse evidenced existing ADR destinations/],
  ['planTemplate', 'Invocation is distinct from persisted Accepted metadata', 'Invocation establishes persisted Accepted metadata', /distinguish ordinary approval/]
]) {
  assertRejected(`handoff obligation: ${key} ${target}`, () => contracts.checkDecisionReadinessContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }), (error) => error.contractId === 'RPIR-HANDOFF-001' && diagnostic.test(error.message));
}
const residualReason = 'why it reasonably remains';
const missingResidualReason = replaceOnce(adrSources.researchTemplate, residualReason, 'its name');
assertRejected('historical readiness decoy', () => contracts.checkDecisionReadinessContract({
  ...adrSources, researchTemplate: `${missingResidualReason}\n\n## Historical example\n\n${residualReason}\n`
}), (error) => error.contractId === 'RPIR-HANDOFF-001' && /researchTemplate: explain material residuals/.test(error.message));
assertRejected('wrong-owner readiness decoy', () => contracts.checkDecisionReadinessContract({
  ...adrSources, researchTemplate: missingResidualReason, plan: `${adrSources.plan}\n\n${residualReason}\n`
}), (error) => error.contractId === 'RPIR-HANDOFF-001' && /researchTemplate: explain material residuals/.test(error.message));
for (const [key, target, replacement] of [
  ['researchSkill', 'proportionate decision-critical feasibility investigation', 'proportionate cited feasibility investigation'],
  ['plan', 'including qualified or nonrecommended answers', 'including qualified and nonrecommended answers'],
  ['planTemplate', 'ordinary implementation approval alone does not establish architectural agreement',
    'ordinary delivery approval alone does not establish architectural agreement']
]) {
  assert.doesNotThrow(() => contracts.checkDecisionReadinessContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }));
  cases += 1;
}
for (const [key, target, contradiction] of [
  ['researchSkill', '8. Make readiness evidence inspectable', 'Research must investigate every fact before Plan. '],
  ['plan', 'Reconcile supplied decisions before questioning', "Always substitute the recommendation for the engineer's answer. "],
  ['planning', 'Reconcile supplied decisions before questioning', 'Always re-ask answered questions. '],
  ['plan', 'Use evidenced consumer conventions', 'Every existing ADR destination requires fresh selection. '],
  ['planTemplate', 'ordinary implementation approval alone', 'Invocation alone proves persisted Accepted. ']
]) {
  // Keep the entire positive clause intact, then append inside its owner.
  const owned = key === 'planTemplate'
    ? adrSources[key].split('\n').find((line) => line.includes(target))
    : adrSources[key].split(/\n\s*\n/).find((part) => part.includes(target));
  assert.ok(owned, `${key} contradiction fixture needs its actual owner`);
  assertRejected(`additive handoff contradiction: ${contradiction}`, () => contracts.checkDecisionReadinessContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], owned, `${owned} ${contradiction}`)
  }), (error) => error.contractId === 'RPIR-HANDOFF-001' && /contradictory handoff readiness rule/.test(error.message));
}
console.log(`Passed ${cases - handoffCaseStart} focused handoff readiness cases.`);

const correctionCaseStart = cases;
for (const [key, target, replacement, diagnostic] of [
  ['implement', 'Diagnose, correct and recheck supported in-boundary issues under actual authority', 'Record supported issues for later', /require authorized correction/],
  ['safe', 'next permitted route, then identify independently authorized work', 'next route, then identify independently authorized work', /classify the dependent effect/],
  ['safe', 'independent investigation is not source-edit authority', 'independent investigation grants source-edit authority', /classify the dependent effect/],
  ['implementationReport', 'actual authorized attributable repair', 'suggested repair', /record actual correction/],
  ['safe', 'engineer evidence, affected effects and a recommended resolution', 'engineer a list of issues', /escalate material changes/],
  ['review', 'missing chronology and runtime effectiveness remain unverified despite static passes', 'static passes establish runtime effectiveness', /distinguish observed chronology/],
  ['codeReview', 'fresh implementation evidence and fresh independent re-review', 'a success report', /route supported defects/],
  ['reviewRubric', 'manual Implement resumption', 'automatic correction', /route supported defects/],
  ['reviewReport', 'do not relabel an approved-outcome defect as optional advice or accept unresolved findings', 'offer optional advice', /route supported defects/]
]) {
  assertRejected(`correction obligation: ${key} ${target}`, () => contracts.checkDecisionReadinessContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }), (error) => error.contractId === 'RPIR-HANDOFF-001' && diagnostic.test(error.message));
}
const correctionRule = 'Diagnose, correct and recheck supported in-boundary issues under actual authority';
const correctionMissing = replaceOnce(adrSources.implement, correctionRule, 'Record supported issues for later');
for (const [label, implement, safe] of [
  ['history', `${correctionMissing}\n\n## Historical example\n\n${correctionRule}\n`, adrSources.safe],
  ['metadata', replaceOnce(correctionMissing, 'description: ', `description: ${correctionRule}. `), adrSources.safe],
  ['wrong-owner', correctionMissing, `${adrSources.safe}\n\n${correctionRule}\n`]
]) {
  assertRejected(`correction ${label} decoy`, () => contracts.checkDecisionReadinessContract({
    ...adrSources, implement, safe
  }), (error) => error.contractId === 'RPIR-HANDOFF-001' && /implement: require authorized correction/.test(error.message));
}
for (const [key, target, contradiction] of [
  ['safe', 'Use existing report fields,', 'Supported in-boundary defects may be reported without repair. '],
  ['safe', 'Use existing report fields,', 'Independent investigation grants source-edit authority. '],
  ['safe', 'Use existing report fields,', 'A real denial may be bypassed. '],
  ['safe', 'Use existing report fields,', 'Material changes may proceed without engineer direction. '],
  ['review', 'Route supported original-criteria defects', 'Review may edit source to close findings. '],
  ['review', 'Route supported original-criteria defects', 'Static passes prove runtime effectiveness. '],
  ['review', 'Route supported original-criteria defects', 'Unresolved findings may be accepted. '],
  ['review', 'Route supported original-criteria defects', 'Automatically invoke Implement for correction. ']
]) {
  const owned = adrSources[key].split(/\n\s*\n/).find((part) => part.includes(target));
  assert.ok(owned, `${key} contradiction fixture needs its actual owner`);
  assertRejected(`additive correction contradiction: ${contradiction}`, () => contracts.checkDecisionReadinessContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], owned, `${owned} ${contradiction}`)
  }), (error) => error.contractId === 'RPIR-HANDOFF-001' && /contradictory correction or evidence rule/.test(error.message));
}
for (const [key, target, replacement] of [
  ['safe', 'capability** concerns the actually available route', 'capability** concerns the evidenced available mechanism'],
  ['implementationReport', 'relevant recheck and actual result', 'relevant recheck and actual result (passed, failed or unavailable)'],
  ['reviewRubric', 'fresh independent re-review', 'fresh independent re-review of the correction']
]) {
  assert.doesNotThrow(() => contracts.checkDecisionReadinessContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }));
  cases += 1;
}
console.log(`Passed ${cases - correctionCaseStart} focused correction and evidence cases.`);

// Decision readiness and residual factual unknowns are owned by normative
// Research/Plan sections and the existing Work Item detail, not metadata,
// history, or a second register. These fixtures test authored contracts, not
// arbitrary Plan meaning or runtime behavior.
for (const [label, key, target, replacement, diagnostic] of [
  ['Research skips foreseeable decisions', 'research', 'Resolve foreseeable engineer-owned choices where practicable', 'list choices when convenient', /Research must resolve foreseeable choices/],
  ['Research fails to separate facts from decisions', 'research', 'distinguish decisions from factual evidence gaps', 'record unresolved items', /Research must resolve foreseeable choices/],
  ['Research relabels a material choice as fact', 'research', 'do not present an unresolved architectural choice as a factual unknown', 'present an unresolved architectural choice as a factual unknown', /Research must resolve foreseeable choices/],
  ['Research treats Proposed as incomplete', 'research', 'Do not treat a complete Proposed ADR as missing decision content merely because sign-off is pending', 'Treat a complete Proposed ADR as missing decision content merely because sign-off is pending', /Research must resolve foreseeable choices/],
  ['Plan permits unresolved architecture', 'plan', 'A completed Plan has no unresolved architectural choice', 'A Plan may retain unresolved architectural choices', /Plan must resolve architecture/],
  ['Plan confuses Proposed state with decision content', 'plan', 'Do not treat a complete Proposed ADR as missing decision content merely because sign-off is pending', 'Treat a complete Proposed ADR as missing decision content merely because sign-off is pending', /Plan must resolve architecture/],
  ['Plan permits unbounded TBD', 'plan', 'A bare `TBD` or “investigate later” is not actionable', 'A bare `TBD` or “investigate later” is an acceptable route', /residual facts need a bounded per-Work-Item route/]
]) {
  assertRejected(label, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }), (error) => error.contractId === 'ADR-CONTRACT-001' && diagnostic.test(error.message));
}

const researchChoiceRule = 'Resolve foreseeable engineer-owned choices where practicable';
const researchWithoutChoiceRule = replaceOnce(adrSources.research, researchChoiceRule, 'list choices when convenient');
for (const [label, research, researchTemplate] of [
  ['historical decoy', `${researchWithoutChoiceRule}\n\n## Historical example, not operating policy\n\n${researchChoiceRule}\n`, adrSources.researchTemplate],
  ['metadata decoy', replaceOnce(researchWithoutChoiceRule, 'description: ', `description: ${researchChoiceRule}. `), adrSources.researchTemplate],
  ['wrong-section decoy', replaceOnce(researchWithoutChoiceRule, '\n\nOnly after actual acknowledgment', `\n\nSupplementary note: ${researchChoiceRule}.\n\nOnly after actual acknowledgment`), adrSources.researchTemplate],
  ['wrong-owner decoy', researchWithoutChoiceRule, `${adrSources.researchTemplate}\n\n${researchChoiceRule}`]
]) {
  assertRejected(`Research handover ${label} cannot replace its normative rule`, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, research, researchTemplate
  }), (error) => error.contractId === 'ADR-CONTRACT-001' && /Research must resolve foreseeable choices/.test(error.message));
}

for (const [label, key, target, replacement, diagnostic] of [
  ['Plan procedure permits unresolved architecture', 'planning', 'A completed Plan has no unresolved architectural choice: resolve foreseeable choices where practicable', 'A Plan may retain unresolved architectural choices', /Plan must resolve architecture/],
  ['Plan gap guidance permits unresolved architecture', 'planning', 'A completed Plan has no unresolved architectural choice;', 'A Plan may retain unresolved architectural choices;', /Plan must resolve architecture/],
  ['Plan coordinator permits unresolved architecture', 'plan', 'A completed Plan has no unresolved architectural choice', 'A Plan may retain unresolved architectural choices', /Plan must resolve architecture/],
  ['Plan procedure permits bare TBD', 'planning', 'A bare `TBD` or “investigate later” is not actionable. If a fact changes or invalidates an architectural choice', 'A bare `TBD` or “investigate later” is an acceptable route. If a fact changes or invalidates an architectural choice', /residual facts need a bounded per-Work-Item route/],
  ['Plan coordinator permits bare TBD', 'plan', 'A bare `TBD` or “investigate later” is not actionable', 'A bare `TBD` or “investigate later” is sufficient', /residual facts need a bounded per-Work-Item route/]
]) {
  assertRejected(label, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }), (error) => error.contractId === 'ADR-CONTRACT-001' && diagnostic.test(error.message));
}

const residualFactTemplate = adrSources.planTemplate.match(/\*\*Residual factual unknown \(include only when a material fact remains\):\*\*[^\n]*/)?.[0];
assert.ok(residualFactTemplate, 'Plan template requires an optional residual-fact field in its existing Work Item detail');
for (const [label, target, replacement] of [
  ['current evidence', 'current evidence', 'evidence'],
  ['bounded check', 'bounded check/observation', 'check'],
  ['expected interpretation and allowed response', 'expected interpretation and allowed in-scope response', 'interpretation'],
  ['affected Work Items/effects', 'affected Work Items/effects', 'affected work'],
  ['engineer escalation', 'engineer-escalation condition', 'escalation'],
  ['independent continuation', 'independent work that can continue', 'independent work'],
  ['architectural-decision boundary', 'Do not use this route for an unresolved architectural decision', 'This route may carry unresolved architecture'],
  ['zero-unknowns safeguard', 'Do not require zero unknown facts', 'Require zero unknown facts']
]) {
  assertRejected(`Plan template residual route omits ${label}`, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources,
    planTemplate: replaceOnce(adrSources.planTemplate, residualFactTemplate,
      replaceOnce(residualFactTemplate, target, replacement))
  }), (error) => error.contractId === 'ADR-CONTRACT-001' &&
    error.message === 'Plan template: existing Work Item detail must provide the complete optional factual-unknown route');
}

for (const [key, target, replacement] of [
  ['research', 'Resolve foreseeable engineer-owned choices where practicable', 'Resolve foreseeable choices when practical'],
  ['research', 'distinguish decisions from factual evidence gaps', 'separate factual evidence gaps from unresolved decisions'],
  ['plan', 'no unresolved architectural choice', 'no unsettled architectural decision'],
  ['plan', 'affected Work Items/effects', 'affected items and effects'],
  ['plan', 'escalation condition for engineer direction', 'engineer-escalation condition'],
  ['plan', 'do not require zero factual unknowns', 'this is not a zero-unknowns requirement']
]) {
  assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }));
  cases += 1;
}

const safeFactRoute = '**Residual factual unknown (include only when a material fact remains):** `Supported mechanism this fact tests: the approved deployment uses the established image baseline; why it reasonably remains: the execution-created deployment descriptor does not yet exist. Current evidence: the image baseline is approved and the descriptor will be generated during WI1. Bounded check/observation: inspect the configured image tag in the deployment descriptor after generation. Expected interpretation and allowed in-scope response: if the tag matches the approved baseline, continue the existing Work Item; otherwise hold only the affected deployment effect. Affected Work Items/effects and acceptance: WI1 deployment verification and its image-baseline acceptance. Engineer-escalation condition: if the observed value changes a security or architecture commitment, ask the engineer before that effect. Independent work that can continue: complete unrelated documentation checks. A bounded route alone does not justify accessible essential research left undone. Do not require proof earlier discovery was impossible. A bare TBD is not actionable. Do not use this route for an unresolved architectural decision or unestablished essential mechanism, architectural or not. Do not require zero unknown facts.`';
assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({
  ...adrSources, planTemplate: replaceOnce(adrSources.planTemplate, residualFactTemplate, safeFactRoute)
}), 'a concrete bounded non-decision fact route remains valid');
cases += 1;

// Every fixture targets the actual bounded owner, not a keyword elsewhere.
// The owner labels match the verifier's individual diagnostics; direct calls
// isolate this contract from unrelated structural checks and fixture failures.
const technicalStart = cases;
const legacyReadinessSources = { ...adrSources };
delete legacyReadinessSources.discovery;
assert.doesNotThrow(() => contracts.checkDecisionReadinessContract(legacyReadinessSources));
cases += 1;
assertRejected('explicitly missing discovery owner fails closed', () => contracts.checkDecisionReadinessContract({
  ...adrSources, discovery: ''
}), (error) => error.contractId === 'RPIR-HANDOFF-001' &&
  error.message === 'discovery: missing or ambiguous technical handoff obligation');
const technicalOwners = [
  ['research', 'research', '# Research coordinator', 'Make readiness evidence inspectable', false, 'An unestablished essential mechanism or feasibility'],
  ['researchSkill', 'researchSkill', '## Procedure', '8. Make readiness evidence inspectable', true, 'Establish an evidence-supported viable mechanism'],
  ['researchTemplate', 'researchTemplate', '### ADR inputs and remaining gaps', '**Readiness evidence:**', false, 'Establish an evidence-supported viable mechanism'],
  ['researchResidual', 'research', '# Research coordinator', 'Make readiness evidence inspectable', false, 'supported mechanism it tests'],
  ['researchSkillResidual', 'researchSkill', '## Procedure', '8. Make readiness evidence inspectable', true, 'supported mechanism the residual tests'],
  ['researchTemplateResidual', 'researchTemplate', '### ADR inputs and remaining gaps', '**Readiness evidence:**', false, 'supported mechanism it tests'],
  ['researchRecommendation', 'researchTemplate', '## Recommendation and validation', '- **Recommended approach:**', true, 'evidence-supported viable mechanism'],
  ['discovery', 'discovery', '## Read back, correct and stop', 'After investigation, assess foreseeable', false, 'an evidence-supported viable mechanism'],
  ['plan', 'plan', '# Plan coordinator', "Check the Research conclusion's freshness", false, 'genuinely new requirements or evidence'],
  ['planningFreshness', 'planning', '## Procedure', '1. Read the inspected Research', true, 'freshness and applicability'],
  ['planningConversion', 'planning', '## Procedure', '4. Convert the supported Research conclusion', true, 'ordered actions'],
  ['planningGaps', 'planning', '### Resolve material planning gaps', 'An inherited unestablished essential mechanism', false, 'An inherited unestablished essential mechanism'],
  ['planTemplateApproach', 'planTemplate', '## Outcome and boundaries', '- **Approach:**', true, 'freshness and applicability'],
  ['plan', 'plan', '# Plan coordinator', "Check the Research conclusion's freshness", false, 'freshness and applicability'],
  ['planResidual', 'plan', '# Plan coordinator', 'A completed Plan', false, 'Identify the supported mechanism it tests'],
  ['planningResidual', 'planning', '## Procedure', '5. Inspect relevant', true, 'Identify the supported mechanism it tests'],
  ['planningGapResidual', 'planning', '### Resolve material planning gaps', 'For any remaining material factual unknown', false, 'why the fact reasonably remains'],
  ['planningGapResidual', 'planning', '### Resolve material planning gaps', 'For any remaining material factual unknown', false, 'Name the supported mechanism tested'],
  ['planTemplateResidual', 'planTemplate', '## Detailed work items', '**Residual factual unknown (include only when a material fact remains):**', true, 'supported mechanism this fact tests'],
  ['implement', 'implement', '# Implement coordinator', 'If an essential mechanism or its feasibility', false, 'recommend scoped Research continuation when evidence is needed'],
  ['implementOperations', 'implement', '# Implement coordinator', 'Own the permitted direct edit–test–repair loop:', false, 'related files and tests'],
  ['safe', 'safe', '## Procedure', 'Apply the supported mechanism', false, 'architectural or not'],
  ['validation', 'validation', '## Scope and recovery', '- [ ] Apply an evidence-supported essential mechanism', true, 'architectural or not'],
  ['implement', 'implement', '# Implement coordinator', 'If an essential mechanism or its feasibility', false, 'architectural or not'],
  ['planningScan', 'planning', '## Procedure', 'For execution alignment scans,', true, 'historical exclusions'],
  ['templateScan', 'planTemplate', '## Execution guidance and validation', '- **Execution alignment scans:**', true, 'historical exclusions'],
  ['safeScan', 'safe', '## Procedure', 'For an execution alignment scan,', false, 'historical exclusions'],
  ['validationScan', 'validation', '## Scope and recovery', '- [ ] Bound execution alignment scans', true, 'historical exclusions'],
  ['core', 'core', '## Transitions and outcome authority', 'Research establishes an evidence-supported', false, 'an unestablished essential mechanism'],
  ['repository', 'repository', '## Lifecycle authority and transitions', '- Research establishes an evidence-supported', true, 'an unestablished essential mechanism'],
  ['lifecycleResearch', 'lifecycleInstruction', '## Stage schemas', '- **Research brief:**', true, 'an unestablished essential mechanism'],
  ['lifecyclePlan', 'lifecycleInstruction', '## Stage schemas', '- **Implementation plan:**', true, 'inherited essential gaps'],
  ['lifecycleImplement', 'lifecycleInstruction', '## Stage schemas', '- **Implementation report:**', true, 'absent or invalid essential mechanism'],
  ['adrResearch', 'skill', '## Phase operation', '1. **Research:**', true, 'an essential gap is unfinished Research whether architectural or not'],
  ['adrPlan', 'skill', '## Phase operation', '2. **Plan:**', true, 'An inherited essential gap'],
  ['adrImplement', 'skill', '## Phase operation', '3. **Implement:**', true, 'an absent or invalid essential mechanism']
];
function technicalUnit(text, heading, prefix, line) {
  assert.equal(text.split('\n').filter((item) => item === heading).length, 1, `unique fixture heading ${heading}`);
  const start = text.indexOf(`${heading}\n`) + heading.length + 1;
  const depth = heading.match(/^#+/)[0].length;
  const tail = text.slice(start);
  const next = tail.search(new RegExp(`^#{1,${depth}} `, 'm'));
  const body = next < 0 ? tail : tail.slice(0, next);
  const matches = (line ? body.split('\n') : body.split(/\n\s*\n/))
    .filter((part) => part.trimStart().startsWith(prefix));
  assert.equal(matches.length, 1, `unique fixture owner ${prefix}`);
  return matches[0];
}
function technicalDiagnostic(owner, rule = 'missing or ambiguous technical handoff obligation') {
  return (error) => error.contractId === 'RPIR-HANDOFF-001' && error.message === `${owner}: ${rule}`;
}
// Reproduce A5 failures independently, preserving the valid rule in additive
// cases. Every mutation is unique and must fail its own owner and reason.
const a5Start = cases;
for (const [owner, key, heading, prefix, line, target, equivalent] of [
  ['research', 'research', '# Research coordinator', 'Make readiness evidence inspectable', false,
    'rather than substitute the recommended answer', 'keep the recommendation separate from actual engineer direction'],
  ['researchSkill', 'researchSkill', '## Procedure', '8. Make readiness evidence inspectable', true,
    'Do not substitute the recommendation for the actual answer', 'Keep actual engineer answers distinct from the recommendation'],
  ['researchTemplate', 'researchTemplate', '### ADR inputs and remaining gaps', '**Readiness evidence:**', false,
    'Do not substitute a recommendation for an answer', 'Keep actual engineer answers separate from the recommendation'],
  ['plan', 'plan', '# Plan coordinator', 'Reconcile supplied decisions before questioning', false,
    'rather than substitute recommendations', 'keep actual engineer selections separate from recommendations'],
  ['planning', 'planning', '### Resolve material planning gaps', 'Reconcile supplied decisions before questioning', false,
    'Do not substitute recommendations', 'Keep actual engineer selections separate from recommendations']
]) {
  const owned = technicalUnit(adrSources[key], heading, prefix, line);
  const mutate = (replacement) => ({ ...adrSources, [key]: replaceOnce(adrSources[key], owned,
    replaceOnce(owned, target, replacement)) });
  assert.doesNotThrow(() => contracts.checkDecisionReadinessContract(mutate(equivalent)));
  cases += 1;
  assertRejected(`${owner} loses recommendation/answer relationship`, () => contracts.checkDecisionReadinessContract(mutate('record recommendations')),
    technicalDiagnostic(owner, 'keep recommendations distinct from actual engineer answers'));
}
for (const [owner, key, heading, prefix, line, target] of [
  ['researchRecommendation', 'researchTemplate', '## Recommendation and validation', '- **Recommended approach:**', true,
    'distinguish actual engineer selections and conditions from this recommendation'],
  ['discovery', 'discovery', '## Read back, correct and stop', 'After investigation, assess foreseeable', false,
    'recommendation, separate from actual qualified engineer selections'],
  ['planningConversion', 'planning', '## Procedure', '4. Convert the supported Research conclusion', true,
    'distinction between recommendation and actual qualified engineer selection'],
  ['planTemplateApproach', 'planTemplate', '## Outcome and boundaries', '- **Approach:**', true,
    'actual selections separately from recommendations']
]) {
  const owned = technicalUnit(adrSources[key], heading, prefix, line);
  const replacement = target.includes('qualified') ? 'recommendation and actual qualified engineer selection'
    : 'actual engineer selections and recommendation';
  assertRejected(`${owner} has tokens without the relationship`, () => contracts.checkDecisionReadinessContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], owned, replaceOnce(owned, target, replacement))
  }), technicalDiagnostic(owner));
}
for (const [key, heading, prefix, contradiction] of [
  ['research', '# Research coordinator', 'Make readiness evidence inspectable', 'Treat the recommendation as the engineer’s selection.'],
  ['plan', '# Plan coordinator', 'Reconcile supplied decisions before questioning', "Treat the recommendation as the engineer's selection."],
  ['plan', '# Plan coordinator', "Check the Research conclusion's freshness", 'Plan should investigate the missing essential mechanism.'],
  ['plan', '# Plan coordinator', "Check the Research conclusion's freshness", 'Plan will determine the essential solution during gap analysis.'],
  ['plan', '# Plan coordinator', "Check the Research conclusion's freshness", 'Plan should investigate the missing essential nonarchitectural mechanism.'],
  ['implement', '# Implement coordinator', 'If an essential mechanism or its feasibility', 'An ordinary failed test alone automatically restarts Research.'],
  ['plan', '# Plan coordinator', "Check the Research conclusion's freshness", 'A routine test failure alone is an automatic Research restart.'],
  ['plan', '# Plan coordinator', 'A completed Plan', 'Require zero unknowns.'],
  ['plan', '# Plan coordinator', 'A completed Plan', 'Require zero unknown facts.']
]) {
  const owned = technicalUnit(adrSources[key], heading, prefix, false);
  assertRejected(`${key} separate-paragraph contradiction: ${contradiction}`, () => contracts.checkDecisionReadinessContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], owned, `${owned}\n\n${contradiction}`)
  }), technicalDiagnostic(key, 'contradictory technical handoff rule'));
}
for (const [key, heading, prefix, statement] of [
  ['plan', '# Plan coordinator', "Check the Research conclusion's freshness", 'Plan should investigate the mechanism.'],
  ['plan', '# Plan coordinator', "Check the Research conclusion's freshness", 'Plan should investigate the supported mechanism.'],
  ['research', '# Research coordinator', 'Make readiness evidence inspectable', 'Do not treat the recommendation as the engineer’s selection.'],
  ['plan', '# Plan coordinator', 'Reconcile supplied decisions before questioning', "Never treat the recommendation as the engineer's selection."]
]) {
  const owned = technicalUnit(adrSources[key], heading, prefix, false);
  assert.doesNotThrow(() => contracts.checkDecisionReadinessContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], owned, `${owned}\n\n${statement}`)
  }));
  cases += 1;
}
const restartOwner = technicalUnit(adrSources.implement, '# Implement coordinator', 'If an essential mechanism or its feasibility', false);
assertRejected('Implement affirmative restart reverses the actual owner rule', () => contracts.checkDecisionReadinessContract({
  ...adrSources, implement: replaceOnce(adrSources.implement, restartOwner, replaceOnce(restartOwner,
    'A routine failed test alone is not an automatic Research restart', 'A routine failed test alone is an automatic Research restart'))
}), technicalDiagnostic('implement'));
const conversionOwner = technicalUnit(adrSources.plan, '# Plan coordinator', "Check the Research conclusion's freshness", false);
assertRejected('Plan affirmative restart reverses conversion prohibition', () => contracts.checkDecisionReadinessContract({
  ...adrSources, plan: replaceOnce(adrSources.plan, conversionOwner, replaceOnce(conversionOwner,
    'without automatic restart', 'with automatic restart'))
}), technicalDiagnostic('plan'));
for (const replacement of ['never require zero unknowns', 'never require zero factual unknowns', 'no zero-unknowns rule', 'do not require zero factual unknowns']) {
  const plan = replaceOnce(adrSources.plan, 'do not require zero factual unknowns', replacement === 'do not require zero factual unknowns'
    ? 'do not require zero factual unknowns at this stage' : replacement);
  assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({ ...adrSources, plan }));
  cases += 1;
}
for (const replacement of ['Never require zero unknowns', 'No zero-unknowns rule']) {
  const planTemplate = replaceOnce(adrSources.planTemplate, residualFactTemplate,
    replaceOnce(residualFactTemplate, 'Do not require zero unknown facts', replacement));
  assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({ ...adrSources, planTemplate }));
  cases += 1;
}
assertRejected('Plan coordinator reversed zero-unknowns safeguard', () => contracts.checkDecisionReadinessContract({
  ...adrSources, plan: replaceOnce(adrSources.plan, 'do not require zero factual unknowns', 'require zero factual unknowns')
}), (error) => error.contractId === 'ADR-CONTRACT-001' && error.message.startsWith('planAgent: residual facts need'));
for (const [label, discovery] of [
  ['empty', ''], ['non-text', null], ['missing owner', replaceOnce(adrSources.discovery,
    'After investigation, assess foreseeable', 'After investigation, record foreseeable')],
  ['duplicate heading', `${adrSources.discovery}\n\n## Read back, correct and stop\n\nDuplicate owner.\n`]
]) {
  for (const [api, check] of [['direct', contracts.checkDecisionReadinessContract], ['aggregate', contracts.checkArchitectureDecisionRecordContract]]) {
    assertRejected(`${api} explicit ${label} discovery does not fall back`, () => check({ ...adrSources, discovery }),
      technicalDiagnostic('discovery'));
  }
}
assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract(legacyReadinessSources));
cases += 1;
console.log(`Passed ${cases - a5Start} focused A5 regression cases.`);
for (const [owner, key, heading, prefix, line, target] of technicalOwners) {
  const original = adrSources[key];
  const owned = technicalUnit(original, heading, prefix, line);
  const omitted = replaceOnce(owned, target, 'omitted obligation');
  const missing = replaceOnce(original, owned, omitted);
  const test = (text, other = {}) => contracts.checkDecisionReadinessContract({ ...adrSources, ...other, [key]: text });
  assert.doesNotThrow(() => test(replaceOnce(original, owned,
    replaceOnce(owned, target, `${target} (within this bounded phase)`))));
  cases += 1;
  assertRejected(`${owner} omits its technical obligation`, () => test(missing), technicalDiagnostic(owner));
  assertRejected(`${owner} historical decoy`, () => test(`${missing}\n\n## Historical example\n\n${owned}\n`), technicalDiagnostic(owner));
  assertRejected(`${owner} wrong-owner decoy`, () => test(missing, {
    [key === 'review' ? 'runner' : 'review']: `${adrSources[key === 'review' ? 'runner' : 'review']}\n\n## Historical technical example\n\n${owned}\n`
  }), technicalDiagnostic(owner));
  const ambiguityOwner = { researchResidual: 'research', researchSkillResidual: 'researchSkill',
    researchTemplateResidual: 'researchTemplate' }[owner] || owner;
  assertRejected(`${owner} ambiguous duplicate normative owner`, () => test(replaceOnce(original, owned,
    line ? `${owned}\n${owned}` : `${owned}\n\n${owned}`)), technicalDiagnostic(ambiguityOwner));
  for (const contradiction of [
    'Implement may invent an essential solution.', 'Require zero unknowns.',
    'Ban all inspection.', 'Readiness advice may veto manual invocation.',
    'Plan may silently perform essential solution research.'
  ]) {
    assertRejected(`${owner} additive contradiction: ${contradiction}`, () => test(replaceOnce(original, owned,
      `${owned} ${contradiction}`)), technicalDiagnostic(key, 'contradictory technical handoff rule'));
  }
}
// Test independent sub-obligations, retaining the rest of each owner. This
// includes nonarchitectural gaps, new evidence, execution facts, and scans.
for (const [owner, target] of [
  ['research', 'decision-critical feasibility'],
  ['research', 'affected effects and a supported evidence route'],
  ['researchSkill', 'its decision-critical feasibility'],
  ['researchTemplate', 'before presenting the technical conclusion as ready for delivery conversion'],
  ['plan', 'genuinely new requirements or evidence'],
  ['plan', 'scoped engineer-directed Research continuation or supplementation'],
  ['plan', 'without automatic restart, retroactive blame or a readiness veto on manual invocation'],
  ['planningGaps', 'do not silently perform essential solution research'],
  ['planningConversion', 'dependencies'],
  ['planResidual', 'why the fact reasonably remains'],
  ['planResidual', 'A bounded route alone does not justify accessible essential research left undone'],
  ['planTemplateResidual', ' and acceptance'],
  ['planTemplateResidual', 'unestablished essential mechanism, architectural or not'],
  ['implement', 'recommend scoped Research continuation when evidence is needed'],
  ['implement', 'A routine failed test alone is not an automatic Research restart'],
  ['implementOperations', 'rerun relevant checks'],
  ['validationScan', 'ordinary inspection, local decisions, related files/tests, diagnosis, repair and recheck'],
  ['planningScan', 'relevant source roots and active owners'],
  ['templateScan', 'a useful completion condition'],
  ['safeScan', 'genuinely new material commitments'],
  ['core', 'no automatic restart or retroactive blame'],
  ['repository', 'not hidden essential research in Plan/Implement tasks'],
  ['lifecyclePlan', 'manual invocation'],
  ['adrImplement', 'ordinary diagnosis and recheck remain available']
]) {
  const [, key, heading, prefix, line] = technicalOwners.find((item) => item[0] === owner);
  const owned = technicalUnit(adrSources[key], heading, prefix, line);
  assertRejected(`${owner} independently omits ${target}`, () => contracts.checkDecisionReadinessContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], owned, replaceOnce(owned, target, 'omitted obligation'))
  }), technicalDiagnostic(owner));
}
for (const [owner, target, replacement] of [
  ['research', 'evidence-supported viable mechanism', 'supported viable mechanism'],
  ['researchSkill', 'evidence-supported viable mechanism', 'supported viable mechanism'],
  ['plan', 'freshness and applicability', 'freshness/applicability'],
  ['planTemplateApproach', 'freshness and applicability', 'freshness/applicability'],
  ['planResidual', 'supported mechanism it tests', 'supported mechanism being tested'],
  ['planningGapResidual', 'supported mechanism tested', 'supported mechanism being tested'],
  ['implement', 'architectural or not', 'whether architectural or not'],
  ['validation', 'architectural or not', 'whether architectural or not']
]) {
  const [, key, heading, prefix, line] = technicalOwners.find((item) => item[0] === owner);
  const owned = technicalUnit(adrSources[key], heading, prefix, line);
  assert.doesNotThrow(() => contracts.checkDecisionReadinessContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], owned, replaceOnce(owned, target, replacement))
  }));
  cases += 1;
}
// Metadata and another field in the same section must not repair a missing
// recommendation or residual field; the positive clause remains elsewhere.
for (const [owner, key, heading, prefix, target, otherField] of [
  ['researchRecommendation', 'researchTemplate', '## Recommendation and validation', '- **Recommended approach:**', 'evidence-supported viable mechanism', '- **Checks:**'],
  ['planTemplateResidual', 'planTemplate', '## Detailed work items', '**Residual factual unknown (include only when a material fact remains):**', 'supported mechanism this fact tests', '**Validation:**']
]) {
  const owned = technicalUnit(adrSources[key], heading, prefix, true);
  const missing = replaceOnce(adrSources[key], owned, replaceOnce(owned, target, 'omitted obligation'));
  for (const [label, decoy] of [
    ['metadata', replaceOnce(missing, 'description: ', `description: ${target}; `)],
    ['wrong field', replaceOnce(missing, otherField, `${otherField} ${target}.`)]
  ]) assertRejected(`${owner} ${label} decoy`, () => contracts.checkDecisionReadinessContract({
    ...adrSources, [key]: decoy
  }), technicalDiagnostic(owner));
}
console.log(`Passed ${cases - technicalStart} focused Research-complete handoff cases.`);

// These are normative assurance owners, not the synthetic scenario pairs.
// Mutations are confined to the actual selected line and require its own
// diagnostic; a nearby correct rule cannot replace the missing obligation.
const assuranceTechnicalStart = cases;
const assuranceTechnicalOwners = [
  ['assuranceOverview', 'assuranceSkill', '## Assessment', 'Assess whether Research establishes',
    'inherited essential gap, architectural or not', '1. Compare claims of output'],
  ['assuranceReadiness', 'assurance', '## Conversation evidence rubric', '| Downstream readiness |',
    'unestablished essential mechanism, architectural or not', '| Framing |'],
  ['assuranceResearch', 'assurance', '## Stage-specific outcome', '- **Research:**',
    'unfinished essential feasibility', '- **Every phase:**'],
  ['assurancePlan', 'assurance', '## Stage-specific outcome', '- **Plan:**',
    'inherited essential gaps or newly reopened feasibility', '- **Every phase:**'],
  ['assuranceImplement', 'assurance', '## Stage-specific outcome', '- **Implement:**',
    'absent or invalid essential mechanism', '- **Every phase:**']
];
for (const [owner, key, heading, prefix, target, wrongField] of assuranceTechnicalOwners) {
  const original = adrSources[key];
  const owned = technicalUnit(original, heading, prefix, true);
  const missing = replaceOnce(original, owned, replaceOnce(owned, target, 'omitted obligation'));
  const check = (text, other = {}) => contracts.checkDecisionReadinessContract({ ...adrSources, ...other, [key]: text });
  assertRejected(`${owner} omits its own obligation`, () => check(missing), technicalDiagnostic(owner));
  for (const [label, text, other] of [
    ['metadata', replaceOnce(missing, 'description: ', `description: ${target}; `), {}],
    ['history', `${missing}\n\n## Historical assurance example\n\n${owned}\n`, {}],
    ['wrong field', replaceOnce(missing, wrongField, `${wrongField} ${target}.`), {}],
    ['wrong owner', missing, { review: `${adrSources.review}\n\n## Historical assurance example\n\n${owned}\n` }]
  ]) assertRejected(`${owner} ${label} decoy`, () => check(text, other), technicalDiagnostic(owner));
  assertRejected(`${owner} duplicate normative unit`, () => check(replaceOnce(original, owned, `${owned}\n${owned}`)),
    technicalDiagnostic(owner));
  for (const contradiction of [
    'An unestablished essential mechanism is ready delivery work.',
    'Plan may silently perform essential solution research.',
    'An ordinary implementation failure alone automatically restarts Research.',
    'Readiness advice may veto manual invocation.'
  ]) {
    assertRejected(`${owner} additive contradiction: ${contradiction}`, () => check(replaceOnce(original, owned,
      `${owned} ${contradiction}`)), technicalDiagnostic(owner, 'contradictory technical handoff rule'));
  }
  // Appended historical examples are not operating policy.
  assert.doesNotThrow(() => check(`${original}\n\n## Historical assurance example\n\nPlan may silently perform essential solution research.\n`));
  cases += 1;
}
for (const [key, boundary, owner] of [
  ['assuranceSkill', '## Boundary', 'assuranceAssessment'],
  ['assurance', '## Delivery and material boundaries', 'assuranceRubric'],
  ['assurance', 'Assurance cannot edit, execute, allocate', 'assuranceOutcomes']
]) {
  for (const contradiction of [
    'Plan may silently perform essential solution research.',
    'An ordinary implementation failure alone automatically restarts Research.'
  ]) {
    assertRejected(`${owner} separate-paragraph contradiction: ${contradiction}`, () => contracts.checkDecisionReadinessContract({
      ...adrSources, [key]: replaceOnce(adrSources[key], boundary, `${contradiction}\n\n${boundary}`)
    }), technicalDiagnostic(owner, 'contradictory technical handoff rule'));
  }
}
for (const [owner, target] of [
  ['assuranceOverview', 'evidence-supported viable mechanism and decision-critical feasibility'],
  ['assuranceOverview', 'genuinely new requirements/evidence reopening feasibility'],
  ['assuranceOverview', 'scoped engineer-directed Research continuation or supplementation where evidence is needed'],
  ['assuranceOverview', 'supported mechanism tested, why the fact reasonably remains'],
  ['assuranceOverview', 'truthful drafts and independent supported work'],
  ['assuranceOverview', 'readiness veto on manual invocation'],
  ['assuranceReadiness', 'viable mechanism and decision-critical feasibility'],
  ['assuranceReadiness', 'unfinished Research with affected effects and an evidence route'],
  ['assuranceReadiness', 'genuinely new requirements/evidence reopening feasibility'],
  ['assuranceReadiness', 'scoped engineer-directed Research continuation or supplementation where evidence is needed'],
  ['assuranceReadiness', 'supported mechanism tested'],
  ['assuranceReadiness', 'why it reasonably remains'],
  ['assuranceReadiness', 'a route alone does not justify accessible essential research left undone'],
  ['assuranceReadiness', 'Truthful drafts, independent supported work and manual invocation remain'],
  ['assuranceResearch', 'supported technical conclusion'],
  ['assuranceResearch', 'affected-effect/evidence route'],
  ['assuranceResearch', 'saved brief does not invoke Plan'],
  ['assurancePlan', 'freshness and delivery conversion of the supported mechanism'],
  ['assurancePlan', 'scoped engineer-directed Research continuation/supplementation where evidence is needed'],
  ['assurancePlan', 'supported mechanism, reason it remains and bounded evidence/response'],
  ['assurancePlan', 'independent planning and truthful drafts continue'],
  ['assurancePlan', 'saved Plan alone does not invoke Implement'],
  ['assuranceImplement', 'engineer/Plan resolution and scoped Research when evidence is needed'],
  ['assuranceImplement', 'ordinary inspection, local decisions, related-file selection, failure diagnosis, repair and recheck'],
  ['assuranceImplement', 'without an automatic Research restart']
]) {
  const [, key, heading, prefix] = assuranceTechnicalOwners.find((item) => item[0] === owner);
  const owned = technicalUnit(adrSources[key], heading, prefix, true);
  assertRejected(`${owner} independently omits ${target}`, () => contracts.checkDecisionReadinessContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], owned, replaceOnce(owned, target, 'omitted obligation'))
  }), technicalDiagnostic(owner));
}
for (const [owner, target, equivalent] of [
  ['assuranceOverview', 'an evidence-supported viable mechanism', 'a supported viable mechanism'],
  ['assuranceOverview', 'recommendation distinct from actual engineer selections', 'recommendation separate from actual engineer selections'],
  ['assuranceReadiness', 'freshness/applicability', 'freshness and applicability'],
  ['assuranceReadiness', 'recommendation distinct from actual qualified/nonrecommended direction',
    'recommendation separate from actual qualified or nonrecommended direction'],
  ['assuranceResearch', 'supported technical conclusion', 'evidence-supported technical conclusion'],
  ['assurancePlan', 'freshness and delivery conversion', 'freshness/applicability and delivery conversion'],
  ['assurancePlan', 'Research continuation/supplementation', 'Research continuation or supplementation'],
  ['assuranceImplement', 'without an automatic Research restart', 'ordinary implementation failure does not automatically restart Research']
]) {
  const [, key, heading, prefix] = assuranceTechnicalOwners.find((item) => item[0] === owner);
  const owned = technicalUnit(adrSources[key], heading, prefix, true);
  assert.doesNotThrow(() => contracts.checkDecisionReadinessContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], owned, replaceOnce(owned, target, equivalent))
  }));
  cases += 1;
}
for (const [key, heading, owner] of [
  ['assuranceSkill', '## Assessment', 'assuranceOverview'],
  ['assurance', '## Conversation evidence rubric', 'assuranceReadiness'],
  ['assurance', '## Stage-specific outcome', 'assuranceResearch']
]) {
  assertRejected(`${owner} ambiguous heading`, () => contracts.checkDecisionReadinessContract({
    ...adrSources, [key]: `${adrSources[key]}\n\n${heading}\n\nDecoy.\n`
  }), technicalDiagnostic(owner));
}
for (const key of ['assuranceSkill', 'assurance']) {
  for (const value of ['', '  ', null, undefined, {}]) {
    for (const [api, check] of [['direct', contracts.checkDecisionReadinessContract], ['aggregate', contracts.checkArchitectureDecisionRecordContract]]) {
      assertRejected(`${api} explicit invalid ${key} cannot fall back`, () => check({ ...adrSources, [key]: value }),
        (error) => error.contractId === 'RPIR-HANDOFF-001' && error.message === `${key}: missing or ambiguous technical handoff source`);
    }
  }
}
for (const owner of ['assuranceOverview', 'assuranceReadiness']) {
  const [, key, heading, prefix, target] = assuranceTechnicalOwners.find((item) => item[0] === owner);
  const owned = technicalUnit(adrSources[key], heading, prefix, true);
  assertRejected(`aggregate respects explicitly supplied ${owner}`, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], owned, replaceOnce(owned, target, 'omitted obligation'))
  }), technicalDiagnostic(owner));
}
const legacyAssuranceSources = { ...adrSources };
delete legacyAssuranceSources.assuranceSkill;
delete legacyAssuranceSources.assurance;
assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract(legacyAssuranceSources));
cases += 1;
console.log(`Passed ${cases - assuranceTechnicalStart} focused assurance technical-handoff cases.`);

function rejectSignoff(label, key, target, replacement, diagnostic) {
  assertRejected(label, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }), (error) => error.contractId === 'ADR-CONTRACT-001' && diagnostic.test(error.message));
}

const signoffCoreDiagnostic = /Lifecycle core sign-off effect:/;
const signoffHeading = '### Prospective exact-ADR sign-off recording effect';
const signoffEffect = technicalUnit(adrSources.core, signoffHeading, 'This Toolkit rule applies only', false);
for (const prefix of ['This Toolkit rule applies only', 'Only the Implement coordinator may record', 'Assess multiple bound ADRs independently']) {
  const owned = technicalUnit(adrSources.core, signoffHeading, prefix, false);
  assertRejected(`duplicate sign-off paragraph: ${prefix}`, () => contracts.checkImplementSignoffContract({
    ...adrSources, core: replaceOnce(adrSources.core, owned, `${owned}\n\n${owned}`)
  }), (error) => error.contractId === 'ADR-CONTRACT-001' && /Lifecycle core sign-off effect: missing or ambiguous normative owner/.test(error.message));
}
const recordingOwner = technicalUnit(adrSources.core, signoffHeading, 'Only the Implement coordinator may record', false);
const preserveDecision = 'Preserve the decision text, all other metadata, and accepted/superseded history';
const misplacedPreservation = replaceOnce(replaceOnce(adrSources.core, recordingOwner,
  replaceOnce(recordingOwner, preserveDecision, 'Preserve the recorded result')), signoffEffect,
  `${signoffEffect} ${preserveDecision}.`);
assertRejected('sign-off wrong paragraph cannot restore decision preservation', () => contracts.checkImplementSignoffContract({
  ...adrSources, core: misplacedPreservation
}), (error) => error.contractId === 'ADR-CONTRACT-001' && /Lifecycle core sign-off effect: decision and history preservation/.test(error.message));
const safeSignoffOwner = technicalUnit(adrSources.safe, '## Procedure', 'Apply the prospective Implement-request sign-off', false);
const safeSignoffMissing = replaceOnce(adrSources.safe, safeSignoffOwner, 'Sign-off is considered separately.');
for (const [label, core, safe] of [
  ['duplicate core section', `${adrSources.core}\n\n${signoffHeading}\n\nHistorical copy.\n`, adrSources.safe],
  ['safe owner deleted', adrSources.core, safeSignoffMissing],
  ['safe history decoy', adrSources.core, `${safeSignoffMissing}\n\n## Historical example\n\n${safeSignoffOwner}\n`],
  ['safe wrong section', adrSources.core, `${safeSignoffMissing}\n\n## Other instructions\n\n${safeSignoffOwner}\n`],
  ['safe duplicate owner', adrSources.core, replaceOnce(adrSources.safe, safeSignoffOwner, `${safeSignoffOwner}\n\n${safeSignoffOwner}`)],
  ['safe duplicate section', adrSources.core, `${adrSources.safe}\n\n## Procedure\n\n${safeSignoffOwner}\n`]
]) assertRejected(`sign-off ${label}`, () => contracts.checkImplementSignoffContract({ ...adrSources, core, safe }),
  (error) => error.contractId === 'ADR-CONTRACT-001' && /Lifecycle core sign-off effect:|Safe implementation Skill must sequence/.test(error.message));
assertRejected('safe sign-off wrong-owner decoy', () => contracts.checkImplementSignoffContract({
  ...adrSources, safe: safeSignoffMissing, template: `${adrSources.template}\n\n## Historical example\n\n${safeSignoffOwner}\n`
}), (error) => error.contractId === 'ADR-CONTRACT-001' && /Safe implementation Skill must sequence/.test(error.message));
for (const [label, core, safe] of [
  ['deleted core owner', replaceOnce(adrSources.core, signoffEffect, ''), adrSources.safe],
  ['historical core decoy', `${replaceOnce(adrSources.core, signoffEffect, '')}\n\n## Historical example\n\n${signoffEffect}\n`, adrSources.safe],
  ['wrong-owner core decoy', replaceOnce(adrSources.core, signoffEffect, ''), `${adrSources.safe}\n\n## Historical example\n\n${signoffEffect}\n`]
]) assertRejected(`sign-off ${label}`, () => contracts.checkImplementSignoffContract({ ...adrSources, core, safe }),
  (error) => error.contractId === 'ADR-CONTRACT-001' && /Lifecycle core sign-off effect:/.test(error.message));
const implementSignoffOwner = technicalUnit(adrSources.implement, '# Implement coordinator', 'If the approved Plan binds an ADR', false);
for (const [key, anchor] of [['core', signoffHeading], ['safe', safeSignoffOwner], ['implement', implementSignoffOwner]]) {
  for (const contradiction of ['Workers may sign off ADRs.', 'Script Runner may write ADR status.',
    'Review may update ADR status.', 'Prior invocations are retroactive.', 'A prior-policy invocation signs off ADRs.',
    'Implement coordinator may rewrite ADR decision text.']) {
    assertRejected(`${key} additive sign-off contradiction: ${contradiction}`, () => contracts.checkImplementSignoffContract({
      ...adrSources, [key]: replaceOnce(adrSources[key], anchor, `${anchor}\n\n${contradiction}`)
    }), (error) => error.contractId === 'ADR-CONTRACT-001' && /contradictory sign-off authority/.test(error.message));
  }
  assert.doesNotThrow(() => contracts.checkImplementSignoffContract({ ...adrSources,
    [key]: `${adrSources[key]}\n\n## Historical example\n\nWorkers may sign off ADRs. Implement coordinator may rewrite ADR decision text.\n` }));
  assert.doesNotThrow(() => contracts.checkImplementSignoffContract({ ...adrSources,
    [key]: replaceOnce(adrSources[key], anchor, `${anchor}\n\nDo not assert the Implement coordinator may rewrite ADR decision text.`) }));
  cases += 2;
}
assertRejected('Implement sign-off contradiction inside its ADR paragraph', () => contracts.checkImplementSignoffContract({
  ...adrSources, implement: replaceOnce(adrSources.implement, implementSignoffOwner,
    `${implementSignoffOwner} Implement coordinator may rewrite ADR decision text.`)
}), (error) => error.contractId === 'ADR-CONTRACT-001' && /Implement coordinator: contradictory sign-off authority/.test(error.message));
for (const [label, target, replacement, rule] of [
  ['sign-off effective after invocation', 'effective before the qualifying deliberate engineer-sent Implement request with the inspected physical approved Plan', 'effective after the qualifying deliberate engineer-sent Implement request with the inspected physical approved Plan', /effective-before-invocation guard/],
  ['retroactive invocation accepted', 'not retroactive sign-off', 'is retroactive sign-off', /no-retroactive-sign-off guard/],
  ['non-Proposed preimage accepted', 'current `Proposed` state', 'any decision state', /Proposed preimage state/],
  ['metadata scope broadened', 'Update only `Status: Accepted`, the actual decision date, and actual agreement evidence', 'Update ADR decision content and status metadata', /metadata-only update fields/],
  ['decision rationale rewrite allowed', 'Preserve the decision text, all other metadata, and accepted/superseded history', 'Revise the decision text and metadata', /decision and history preservation/],
  ['permission guard omitted', 'identity, containment, absence of conflicting edits and effective permission', 'identity and containment', /identity, containment, conflict and permission guards/],
  ['postimage readback omitted', 'read back the complete postimage', 'assume the saved result', /non-overwrite and postimage readback/],
  ['multi-record outcomes coupled', 'Assess multiple bound ADRs independently', 'Assess all bound ADRs as one transaction', /per-record handling/],
  ['failed write described as Accepted', 'do not claim `Accepted`', 'claim `Accepted` after an attempted write', /failure is not Accepted/],
  ['partial success rollback introduced', 'A successful record is not rolled back because another record failed', 'Rollback every successful record when another record fails', /partial-success preservation/],
  ['general ADR authorship granted', 'not general ADR authorship', 'general ADR authorship', /no general ADR authorship/]
]) rejectSignoff(label, 'core', target, replacement, rule);

const exactPreimageSentence = 'The Plan handoff must visibly enumerate each exact bound ADR path/ID, identifiable decision section, substantive preimage version/snapshot, current `Proposed` state, actual agreement evidence/conditions and affected Work Items;';
const coreWithoutPreimage = replaceOnce(adrSources.core, exactPreimageSentence,
  'The Plan handoff identifies an ADR;');
for (const [label, core, template] of [
  ['historical decoy', `${coreWithoutPreimage}\n\n## Historical example, not operating policy\n\n${exactPreimageSentence}\n`, adrSources.template],
  ['wrong-owner decoy', coreWithoutPreimage, `${adrSources.template}\n\n${exactPreimageSentence}\n`]
]) assertRejected(`core exact-preimage ${label} cannot satisfy the effect`, () => contracts.checkArchitectureDecisionRecordContract({
  ...adrSources, core, template
}), (error) => error.contractId === 'ADR-CONTRACT-001' && /Lifecycle core sign-off effect: exact binding identity/.test(error.message));

for (const [label, target, replacement, rule] of [
  ['handoff omits exact substantive version', 'visibly enumerate each exact ADR path/ID, identifiable decision section, substantive version/snapshot', 'visibly enumerate each exact ADR path/ID and section', /exact identity, section and version/],
  ['handoff asks duplicate approval', 'no duplicate routine approval is requested', 'a separate routine approval is required', /no duplicate approval/],
  ['handoff makes prefill sign-off', '`/plan`, answer, report, worker, Script Runner, unsent prefill or `/review` is not sign-off', 'an unsent prefill is sign-off', /non-sign-off events/],
  ['handoff allows retroactive sign-off', 'a prior invocation is not retroactive', 'a prior invocation is retroactive', /no retroactive sign-off/]
]) rejectSignoff(label, 'plan', target, replacement, rule);

for (const [label, target, replacement, rule] of [
  ['Implement lets workers record ADR', 'Workers, Script Runner, Review and helpers receive no ADR authorship/status authority.', 'Workers, Script Runner, Review and helpers may record ADR status.', /Implement coordinator must bind exact sign-off and narrow recording guards/],
  ['Implement treats failed persistence as Accepted', 'do not claim `Accepted`', 'claim `Accepted`', /Implement coordinator must bind exact sign-off and narrow recording guards/],
  ['report conflates invocation and persistence', 'Distinguish invocation from persisted Accepted state', 'Treat invocation as persisted Accepted state', /Implementation report must distinguish sign-off invocation from per-record persistence/]
]) rejectSignoff(label, label.startsWith('report') ? 'implementationReport' : 'implement', target, replacement, rule);

for (const [key, target, replacement] of [
  ['core', 'Do not request a duplicate routine approval.', 'Do not request another confirmation.'],
  ['plan', 'no duplicate routine approval is requested', 'no separate routine approval is requested'],
  ['core', 'A successful record is not rolled back because another record failed',
    'Keep a successfully recorded ADR if another independent record fails']
]) {
  assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }));
  cases += 1;
}

const reviewInvocationCaveat = 'A prior `/implement` invocation is not retroactive if the exact-snapshot rule was not effective before it.';
const reviewWithoutInvocationCaveat = replaceOnce(adrSources.review, reviewInvocationCaveat, 'A qualifying invocation follows the effective policy.');
assertRejected('Review historical decoy cannot replace its exact-invocation rule', () => contracts.checkArchitectureDecisionRecordContract({
  ...adrSources,
  review: `${reviewWithoutInvocationCaveat}\n\n## Historical note\n\n${reviewInvocationCaveat}\n`
}), (error) => error.contractId === 'ADR-CONTRACT-001' && /Review guidance: no retroactive sign-off/.test(error.message));

const reviewCleanIsNotSignoff = 'a clean `/review` is not ADR sign-off and does not establish enterprise or architectural approval.';
rejectSignoff('Review claims a clean delivery Review signs off ADR', 'review', reviewCleanIsNotSignoff,
  'A clean `/review` is ADR sign-off and establishes architectural approval.', /Review guidance: Review is not architectural sign-off/);
rejectSignoff('Review permits ADR status writes', 'review', 'Review remains source-read-only and does not author or revise ADRs.',
  'Review may update ADR status when evidence is clear.', /Review guidance: source-read-only boundary/);

const reviewSkillNoInference = 'do not infer `Accepted` from invocation alone or assume an unverified save succeeded.';
const reviewSkillWithoutInference = replaceOnce(adrSources.codeReview, reviewSkillNoInference, 'compare available report evidence.');
assertRejected('Review Skill wrong-owner decoy cannot replace no-inference rule', () => contracts.checkArchitectureDecisionRecordContract({
  ...adrSources,
  codeReview: `${reviewSkillWithoutInference}\n\n## Unrelated note\n\n${reviewSkillNoInference}\n`
}), (error) => error.contractId === 'ADR-CONTRACT-001' && /Code Review Skill: no Accepted inference/.test(error.message));

const reportNoInference = 'do not infer `Accepted` from invocation, or retroactive sign-off from a prior invocation when the policy was not effective before it.';
rejectSignoff('Review report infers Accepted from invocation', 'reviewReport', reportNoInference,
  'Report that every invocation is Accepted.', /Review report schema: no Accepted inference/);
rejectSignoff('Review report makes Review ADR sign-off', 'reviewReport', 'A clean delivery Review is not ADR sign-off or architectural approval',
  'A clean delivery Review is ADR sign-off and architectural approval', /Review report schema: Review is not ADR sign-off/);

const assuranceNoInference = 'Do not infer `Accepted` from invocation alone or retroactive sign-off from an invocation predating effective policy.';
const assuranceWithoutInference = replaceOnce(adrSources.assuranceSkill, assuranceNoInference, 'Compare the evidence available.');
assertRejected('Assurance historical decoy cannot replace its sign-off assessment', () => contracts.checkArchitectureDecisionRecordContract({
  ...adrSources,
  assuranceSkill: `${assuranceWithoutInference}\n\n## Historical note\n\n${assuranceNoInference}\n`
}), (error) => error.contractId === 'ADR-CONTRACT-001' && /Stage Assurance Skill: no Accepted inference/.test(error.message));

rejectSignoff('Assurance checklist grants status authority', 'assurance', 'Assurance is advisory and grants no ADR status-write authority.',
  'Assurance may write ADR status.', /Stage Assurance checklist must compare sign-off evidence/);

const documentationSignoffOwners = [
  ['readme', '### Complete upfront architectural coverage', 'Under the prospective exact-snapshot rule', false,
    'deliberate Implement request with the inspected approved Plan signs off only the exact Proposed ADR preimages visibly identified in its handoff', /README summary must present/],
  ['wikiRpir', '## Complete upfront architectural coverage', 'When the prospective exact-snapshot rule', false,
    'policy edits do not self-upgrade the session and no invocation is retroactive', /RPIR Wiki summary must distinguish/],
  ['wikiEvidence', '### Architecture decision records are supplementary', 'The prospective ADR sign-off rule', false,
    'no prior invocation is retroactive', /Lifecycle evidence Wiki summary must state/],
  ['wikiCatalogue', '### Skills', '| Apply lifecycle input, provenance, phase boundaries and exact-snapshot ADR recording |', true,
    'prospective rule was effective before invocation', /Artifact catalogue must summarize/],
  ['wikiCatalogue', '### Prompt files', 'No prompt files are contributed.', false,
    'no fixed wording or slash dependency', /Artifact catalogue must describe the prospective natural-language entry/]
];
for (const [key, heading, prefix, line, target, diagnostic] of documentationSignoffOwners) {
  const owned = technicalUnit(adrSources[key], heading, prefix, line);
  const missing = replaceOnce(adrSources[key], owned, replaceOnce(owned, target, 'omitted safeguard'));
  const check = (changed, other = {}) => contracts.checkArchitectureDecisionRecordContract({ ...adrSources, ...other, [key]: changed });
  const expected = (error) => error.contractId === 'ADR-CONTRACT-001' && diagnostic.test(error.message);
  assertRejected(`${key} sign-off owner missing safeguard`, () => check(missing), expected);
  assertRejected(`${key} sign-off owner deleted`, () => check(replaceOnce(adrSources[key], owned, '')), expected);
  assertRejected(`${key} historical sign-off decoy`, () => check(`${missing}\n\n## Historical note\n\n${owned}\n`), expected);
  assertRejected(`${key} wrong-section sign-off decoy`, () => check(`${missing}\n\n## Unrelated note\n\n${owned}\n`), expected);
  assertRejected(`${key} wrong-owner sign-off decoy`, () => check(missing, {
    [key === 'readme' ? 'wikiRpir' : 'readme']: `${adrSources[key === 'readme' ? 'wikiRpir' : 'readme']}\n\n## Historical note\n\n${owned}\n`
  }), expected);
  assertRejected(`${key} ambiguous sign-off owner`, () => check(replaceOnce(adrSources[key], owned,
    line ? `${owned}\n${owned}` : `${owned}\n\n${owned}`)), expected);
  if (key !== 'readme') assertRejected(`${key} metadata sign-off decoy`, () => check(replaceOnce(missing,
    'description: ', `description: ${target}; `)), expected);
  for (const contradiction of [
    'Any implementation invocation accepts all ADRs.', 'Review may write ADR status.',
    'Invocation alone proves persistence.', 'Prior invocations are retroactive.', 'A slash command is required.'
  ]) assertRejected(`${key} additive sign-off contradiction: ${contradiction}`, () => check(replaceOnce(adrSources[key], owned,
    `${owned} ${contradiction}`)), (error) => error.contractId === 'ADR-CONTRACT-001' && /contradictory documentation sign-off rule/.test(error.message));
  assert.doesNotThrow(() => check(`${adrSources[key]}\n\n## Historical note\n\nReview may write ADR status.\n`));
  cases += 1;
}
for (const [key, target] of [
  ['readme', 'invocation alone is not proof of persistence'],
  ['readme', 'failed/denied/unverified writes are not `Accepted`'],
  ['readme', 'Review remains source-read-only and records delivery acceptance only'],
  ['readme', 'assurance is advisory'],
  ['readme', 'Authored sources do not establish runtime behavior'],
  ['wikiRpir', 'report and physical ADR postimage must establish whether it persisted'],
  ['wikiRpir', 'Review independently compares actual invocation/persistence evidence but remains source-read-only'],
  ['wikiRpir', 'Stage Assurance only advises and receives no status-write authority'],
  ['wikiRpir', 'These authored rules do not prove installed behavior'],
  ['wikiEvidence', 'preimage, authority/condition, identity, containment, conflict and permission checks, non-overwriting save and complete readback'],
  ['wikiEvidence', "report distinguishes invocation from each record's actual persistence outcome"],
  ['wikiEvidence', 'failure or denial is not `Accepted`'],
  ['wikiEvidence', 'Review is read-only and assesses delivery'],
  ['wikiEvidence', 'assurance remains advisory'],
  ['wikiCatalogue', 'Implement coordinator separately verifies each record\'s preimage, conditions, containment, conflict absence and permission before recording permitted metadata and reading back the complete postimage'],
  ['wikiCatalogue', 'Review assesses invocation and persistence']
]) {
  const diagnostic = documentationSignoffOwners.find(([owner]) => owner === key)[5];
  rejectSignoff(`${key} loses sign-off safeguard: ${target}`, key, target, 'omitted safeguard', diagnostic);
}
for (const [key, target, replacement] of [
  ['readme', 'before that request', 'before that invocation'],
  ['wikiRpir', 'Proposed ADR preimages visibly identified', 'Proposed ADR preimage visibly identified'],
  ['wikiEvidence', 'only a deliberate Implement request', 'only a deliberate engineer-sent Implement request'],
  ['wikiCatalogue', 'when the prospective rule was effective before invocation, the deliberate Implement request with the inspected approved Plan signs off only exact Proposed preimages visibly enumerated in its handoff',
    'deliberate engineer-sent Implement request with the inspected Plan and exact visible Proposed preimage, effective before invocation']
]) {
  assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }));
  cases += 1;
}

for (const [key, target, replacement] of [
  ['review', 'plus the implementation report\'s actual invocation and per-record persistence evidence',
    'plus actual invocation and per-record persistence evidence from the implementation report'],
  ['reviewReport', 'Compare actual invocation and per-record persistence evidence with the exact ADR preimage/postimage and conditions',
    'Compare the actual invocation and per-record persistence evidence against the bound ADR preimage, postimage, and conditions'],
  ['assuranceSkill', 'report\'s actual invocation and per-record persistence claims', 'report\'s actual invocation plus per-record persistence claims']
]) {
  assert.doesNotThrow(() => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, [key]: replaceOnce(adrSources[key], target, replacement)
  }));
  cases += 1;
}

const readinessSentence = 'A completed Plan has no unresolved architectural choice';
const planWithoutReadiness = replaceOnce(adrSources.plan, readinessSentence, 'Plan readiness is assessed');
for (const [label, plan, planning] of [
  ['historical decoy', `${planWithoutReadiness}\n\n## Historical example, not operating policy\n\n${readinessSentence}\n`, adrSources.planning],
  ['metadata decoy', replaceOnce(planWithoutReadiness, 'description: ', `description: ${readinessSentence}. `), adrSources.planning],
  ['wrong-owner decoy', planWithoutReadiness, `${adrSources.planning}\n\n${readinessSentence}`]
]) {
  assertRejected(`Plan readiness ${label} cannot replace its normative rule`, () => contracts.checkArchitectureDecisionRecordContract({
    ...adrSources, plan, planning
  }), (error) => error.contractId === 'ADR-CONTRACT-001' && /Plan must resolve architecture/.test(error.message));
}

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
  planAgent: '.github/agents/plan.agent.md', checkpointSkill: '.github/skills/local-git-checkpoints/SKILL.md',
  codeReview: '.github/skills/code-review/SKILL.md', assuranceSkill: '.github/skills/rpir-stage-assurance/SKILL.md',
  lifecycleInstruction: '.github/instructions/lifecycle-records.instructions.md',
  readme: 'README.md', wikiRpir: 'docs/Wiki/rpir.md', wikiEvidence: 'docs/Wiki/lifecycle-evidence-and-authority.md',
  wikiCatalogue: 'docs/Wiki/artifact-catalogue.md', wikiMaintenance: 'docs/Wiki/maintain-the-toolkit.md'
};
const executionSources = Object.fromEntries(Object.entries(executionPaths).map(([key, relative]) => [key, readArtifact(relative)]));
executionSources.researchSkill = readArtifact('.github/skills/codebase-research/SKILL.md');
assert.doesNotThrow(() => contracts.checkIncrementalRpirContract(executionSources));
cases += 1;

const correctionOwnerStart = cases;
const executionError = (pattern) => (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' && pattern.test(error.message);
// General numbered records have their own owner, independent of the Research
// directory/brief setup and the separate ADR or marker effects.
const recordCaseStart = cases;
const recordOwner = technicalUnit(executionSources.core, '## Contain allocation and effects', 'For each numbered record,', false);
const lineageOwner = technicalUnit(executionSources.core, '## Preserve physical lineage and historical evidence',
  'Every canonical phase predecessor and output', false);
const recordError = executionError(/Lifecycle core numbered record allocation owner/);
const lineageError = executionError(/Lifecycle core physical record lineage owner/);
assert.doesNotThrow(() => contracts.checkPhysicalRecordContract(executionSources.core));
cases += 1;
for (const target of [
  'existing files of its exact artifact suffix in the verified topic',
  'choose `001` when none exists or one greater than the highest valid three-digit prefix',
  'save only an absent exact candidate with actual containment and effective permission',
  're-read the inventory and select an absent next number in that same verified topic if identity and ownership remain clear; otherwise resolve ambiguity',
  'Read back the saved physical file to verify identity, intended content and direct same-folder links',
  'unsuccessful save or unreadable/mismatched result is not persisted evidence',
  'A real platform denial is a stop, not an invitation to use another route',
  'Do not require double inventories, a fixed retry quota, standalone terminal/reparse or ACL probes',
  'inconclusive actual containment still refuses the affected write'
]) {
  const missing = replaceOnce(executionSources.core, recordOwner, replaceOnce(recordOwner, target, 'omitted safeguard'));
  assertRejected(`numbered record loses ${target}`, () => contracts.checkPhysicalRecordContract(missing), recordError);
  assertRejected(`numbered record history cannot restore ${target}`, () => contracts.checkPhysicalRecordContract(
    `${missing}\n\n## Historical example\n\n${recordOwner}\n`), recordError);
}
const missingRecord = replaceOnce(executionSources.core, recordOwner, 'Record allocation is handled elsewhere.');
for (const [label, core] of [
  ['deleted', missingRecord],
  ['history', `${missingRecord}\n\n## Historical example\n\n${recordOwner}\n`],
  ['metadata', replaceOnce(missingRecord, 'description: ', `description: ${recordOwner} `)],
  ['wrong section', replaceOnce(missingRecord, '## Status, questions and validation',
    `## Status, questions and validation\n\n${recordOwner}`)],
  ['duplicate paragraph', replaceOnce(executionSources.core, recordOwner, `${recordOwner}\n\n${recordOwner}`)],
  ['duplicate section', `${executionSources.core}\n\n## Contain allocation and effects\n\n${recordOwner}\n`]
]) assertRejected(`numbered record ${label}`, () => contracts.checkPhysicalRecordContract(core), recordError);
assertRejected('record wrong-owner decoy cannot restore core', () => contracts.checkIncrementalRpirContract({
  ...executionSources, core: missingRecord, researchAgent: `${executionSources.researchAgent}\n\n${recordOwner}\n`
}), recordError);
for (const target of ['real, contained, numbered physical Markdown record in the verified Research lifecycle folder',
  'accessible direct same-folder links to the expected-kind predecessor',
  'Verify the Research -> Plan -> implementation report -> Review chain as applicable']) {
  const missing = replaceOnce(executionSources.core, lineageOwner, replaceOnce(lineageOwner, target, 'omitted safeguard'));
  assertRejected(`physical lineage loses ${target}`, () => contracts.checkPhysicalRecordContract(missing), lineageError);
  assertRejected(`physical lineage history cannot restore ${target}`, () => contracts.checkPhysicalRecordContract(
    `${missing}\n\n## Historical example\n\n${lineageOwner}\n`), lineageError);
}
assertRejected('physical lineage duplicate owner', () => contracts.checkPhysicalRecordContract(
  replaceOnce(executionSources.core, lineageOwner, `${lineageOwner}\n\n${lineageOwner}`)), lineageError);
for (const statement of ['Overwrite the existing record.', 'Reuse the colliding candidate.',
  'Switch to another topic after a collision.', 'Skip the collision inventory.', 'Skip the readback.',
  'Skip containment.', 'Skip permission.', 'Skip lineage.', 'Treat a denied save as persisted.',
  'Claim a mismatched result as persisted.', 'Bypass a real platform denial.', 'Use another route after a denial.',
  'Require a standalone terminal.', 'Mandate double inventories.']) {
  assertRejected(`record additive contradiction: ${statement}`, () => contracts.checkPhysicalRecordContract(
    replaceOnce(executionSources.core, recordOwner, `${recordOwner}\n\n${statement}`)),
  executionError(/contradictory numbered record safeguard/));
}
for (const core of [
  replaceOnce(executionSources.core, recordOwner, replaceOnce(recordOwner,
    'one greater than the highest valid three-digit prefix', 'one greater than the maximum valid three-digit prefix')),
  replaceOnce(executionSources.core, recordOwner, `${recordOwner}\n\nDo not overwrite the existing record.`),
  `${executionSources.core}\n\n## Historical example\n\nOverwrite the existing record.\n`
]) { assert.doesNotThrow(() => contracts.checkPhysicalRecordContract(core)); cases += 1; }
console.log(`Passed ${cases - recordCaseStart} focused physical-record owner cases.`);

// Exercise the authored shape subset in memory. This illustrative matcher is
// deliberately not a claim about VS Code's glob attachment semantics.
const candidateCaseStart = cases;
const instruction = executionSources.lifecycleInstruction;
const instructionValues = contracts.parseFrontmatterText(instruction, 'lifecycle-records.instructions.md').values;
const candidatePatterns = instructionValues.applyTo.split(',');
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
cases += 1;
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
assert.ok(candidatePatterns.some((pattern) => illustrativeMatch(pattern, 'archive/copilot/001-subject/001-review-report.md')),
  'a matching candidate need not be an actual lifecycle record');
cases += 1;
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
  assertRejected(`candidate patterns ${label} through aggregate`, () => contracts.checkIncrementalRpirContract({
    ...executionSources, lifecycleInstruction: changed
  }), candidateError);
}
assert.doesNotThrow(() => contracts.checkLifecycleCandidatePatterns(replaceOnce(instruction, applyLine,
  `applyTo: '${[...candidatePatterns].reverse().join(', ')}'`)));
cases += 1;
console.log(`Passed ${cases - candidateCaseStart} focused authored candidate-pattern cases.`);

const inputBinding = technicalUnit(executionSources.core, '## Inspect and bind one actual document', 'At each handoff bind one evidence envelope', false);
const localInput = technicalUnit(executionSources.core, '## Inspect and bind one actual document', 'For local paths, validate the raw alias', false);
for (const [owner, target, diagnostic] of [
  [inputBinding, 'document kind', /physical input owner must verify/],
  [inputBinding, 'recheck freshness before dependent effects', /physical input owner must verify/],
  [inputBinding, 'versions conflict or identity/evidence is insufficient', /physical input owner must verify/],
  [localInput, 'unapproved external paths', /physical input owner must reject/],
  [localInput, 'lexical and resolved workspace containment', /physical input owner must reject/]
]) {
  const missing = replaceOnce(executionSources.core, owner, replaceOnce(owner, target, 'omitted safeguard'));
  for (const [label, core, researchAgent] of [
    ['missing', missing, executionSources.researchAgent],
    ['history', `${missing}\n\n## Historical input example\n\n${owner}\n`, executionSources.researchAgent],
    ['metadata', replaceOnce(missing, 'description: ', `description: ${target}; `), executionSources.researchAgent],
    ['wrong owner', missing, `${executionSources.researchAgent}\n\n## Historical input example\n\n${owner}\n`]
  ]) assertRejected(`physical input ${target} ${label}`, () => contracts.checkIncrementalRpirContract({
    ...executionSources, core, researchAgent
  }), executionError(diagnostic));
}
for (const [label, changed] of [
  ['duplicate input section', `${executionSources.core}\n\n## Inspect and bind one actual document\n\n${inputBinding}\n`],
  ['duplicate binding', replaceOnce(executionSources.core, inputBinding, `${inputBinding}\n\n${inputBinding}`)],
  ['deleted binding with history', `${replaceOnce(executionSources.core, inputBinding, '')}\n\n## Historical input example\n\n${inputBinding}\n`]
]) assertRejected(label, () => contracts.checkIncrementalRpirContract({ ...executionSources, core: changed }),
  executionError(/physical input owner must verify/));
for (const contradiction of ['Wrong-kind inputs may authorize.', 'Wrong-root records may proceed.',
  'Stale predecessors may transition.', 'Conflicting inputs may approve.', 'Prefill constitutes approval.',
  'Determine the executing role from the picker.']) {
  assertRejected(`physical input additive ${contradiction}`, () => contracts.checkIncrementalRpirContract({
    ...executionSources, core: replaceOnce(executionSources.core, inputBinding, `${inputBinding}\n\n${contradiction}`)
  }), executionError(/contradictory physical input or role rule/));
}
assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({ ...executionSources,
  core: replaceOnce(executionSources.core, 'recheck freshness before dependent effects', 'recheck freshness before dependent effects for that record') }));
assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({ ...executionSources,
  core: replaceOnce(executionSources.core, 'establish the actual executing role', 'verify the actual executing role') }));
cases += 2;

const setupOwners = [
  ['researchAgent', 'research', '# Research coordinator', 'Inspect and reuse each safe selected documentation root',
    ['identity, containment, absence/collision and permission', 'inspect each result before the next effect',
      'report and stop the dependent effect', 'brief save and full readback', 'Never substitute terminal, Runner, implicit file-save parents or another location']],
  ['core', 'core', '## Contain allocation and effects', 'For each missing selected documentation root',
    ['identity, containment, absence including collisions and effective permission', 'inspect its result before considering the next effect',
      'Report a missing operation, ambiguous identity, collision, conflict, failed or denied creation/save, or unverifiable result',
      'read back its complete physical content and links', 'Do not substitute terminal commands, Script Runner directory authorship or implicit file-save parent creation, or bypass a real denial']],
  ['researchSkill', 'method', '## Limits', 'When this method supports the Research coordinator',
    ['each selected missing documentation root, direct `copilot/` parent and topic', 'inspecting each result before proceeding',
      'Report unavailable operations, collisions, containment or permission uncertainty, denial and failed or unverifiable saves',
      'Guard and save/read back the brief separately', 'do not substitute terminal, Script Runner or implicit-parent file creation']]
];
for (const [key, owner, heading, prefix, targets] of setupOwners) {
  const owned = technicalUnit(executionSources[key], heading, prefix, false);
  const diagnostic = executionError(new RegExp(`${owner}: missing or ambiguous guarded Research directory owner`));
  for (const target of targets) {
    const missing = replaceOnce(executionSources[key], owned, replaceOnce(owned, target, 'omitted safeguard'));
    assertRejected(`${owner} setup loses ${target}`, () => contracts.checkIncrementalRpirContract({ ...executionSources, [key]: missing }), diagnostic);
    assertRejected(`${owner} setup history decoy`, () => contracts.checkIncrementalRpirContract({
      ...executionSources, [key]: `${missing}\n\n## Historical example\n\n${owned}\n`
    }), diagnostic);
  }
  const missing = replaceOnce(executionSources[key], owned, 'Setup follows other guidance.');
  for (const [label, changed, other] of [
    ['deleted', missing, {}],
    ['wrong owner', missing, { reviewAgent: `${executionSources.reviewAgent}\n\n## Historical setup\n\n${owned}\n` }],
    ['duplicate unit', replaceOnce(executionSources[key], owned, `${owned}\n\n${owned}`), {}],
    ['duplicate heading', `${executionSources[key]}\n\n${heading}\n\n${owned}\n`, {}]
  ]) assertRejected(`${owner} setup ${label}`, () => contracts.checkIncrementalRpirContract({
    ...executionSources, ...other, [key]: changed
  }), diagnostic);
  for (const contradiction of ['Script Runner may create directories.', 'Manual setup is an automation pass.',
    'Use a terminal instead to create folders.', 'Implicit file-save parents may be created.',
    'Ignore a collision.', 'Bypass containment.', 'Bypass a denial.',
    'Do not bypass a denial; but bypass a denial.']) {
    assertRejected(`${owner} setup additive ${contradiction}`, () => contracts.checkIncrementalRpirContract({
      ...executionSources, [key]: replaceOnce(executionSources[key], owned, `${owned}\n\n${contradiction}`)
    }), executionError(new RegExp(`${owner}: contradictory Research directory safeguard`)));
  }
  assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({ ...executionSources,
    [key]: replaceOnce(executionSources[key], owned, `${owned} This remains a separate guarded effect.`) }));
  assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({ ...executionSources,
    [key]: `${executionSources[key]}\n\n## Historical example\n\nScript Runner may create directories.\n` }));
  for (const statement of ['Do not bypass a denial.', 'Never bypass a denial.', 'Do not ignore a collision.',
    'Never bypass containment.']) {
    assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({ ...executionSources,
      [key]: replaceOnce(executionSources[key], owned, `${owned}\n\n${statement}`) }));
    cases += 1;
  }
  cases += 2;
}
const coreSetup = technicalUnit(executionSources.core, '## Contain allocation and effects', 'For each missing selected documentation root', false);
for (const target of ['documentation root', 'direct `copilot/` parent', 'numbered topic']) {
  assertRejected(`core setup omits ${target}`, () => contracts.checkIncrementalRpirContract({ ...executionSources,
    core: replaceOnce(executionSources.core, coreSetup, replaceOnce(coreSetup, target, 'omitted directory'))
  }), executionError(/core: missing or ambiguous guarded Research directory owner/));
}
assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({ ...executionSources,
  core: replaceOnce(executionSources.core, coreSetup, replaceOnce(coreSetup, 'one selected directory at a time', 'one chosen directory at a time')) }));
assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({ ...executionSources,
  core: replaceOnce(executionSources.core, coreSetup, replaceOnce(coreSetup,
    'uses the existing dedicated create-directory operation, one selected directory at a time',
    'uses one selected directory at a time through the existing dedicated create-directory operation')) }));
cases += 2;

const markerFixtures = [
  ['implementAgent', '# Implement coordinator', 'The prominent execution loop is:', true, /Implement summary must preserve/],
  ['implementationReport', '## Delivered outcome and progress', '- **Plan marker tracking:**', true, /Implementation report marker field must distinguish/],
  ['reviewTemplate', '## Disposition and comparison', '- **Implementation range and checkpoint evidence:**', true, /Review template must assess available chronology/],
  ['assurance', '## Stage-specific outcome', '- **Implement:**', true, /Stage assurance must distinguish observed timing/],
  ['safe', '### Incremental Plan progress', '- Check the Work Item ', true, /Safe implementation must preserve Step, Task and Work Item completion gates/],
  ['core', '### Approved Plan execution-marker exception', 'The Implement coordinator alone may update', false, /Lifecycle core must preserve the bounded marker-only effect/]
];
const safeLoop = technicalUnit(executionSources.safe, '### Incremental Plan progress', 'During the pass, use this primary loop', false);
assertRejected('safe duplicate marker loop', () => contracts.checkIncrementalRpirContract({
  ...executionSources, safe: replaceOnce(executionSources.safe, safeLoop, `${safeLoop}\n\n${safeLoop}`)
}), executionError(/Safe implementation loop must persist progress/));
for (const [key, heading, prefix, line, diagnostic] of markerFixtures) {
  const owned = technicalUnit(executionSources[key], heading, prefix, line);
  const missing = replaceOnce(executionSources[key], owned, 'Marker evidence is considered.');
  for (const [label, changed] of [
    ['deleted', missing], ['history', `${missing}\n\n## Historical example\n\n${owned}\n`],
    ['duplicate unit', replaceOnce(executionSources[key], owned, line ? `${owned}\n${owned}` : `${owned}\n\n${owned}`)],
    ['duplicate section', `${executionSources[key]}\n\n${heading}\n\n${owned}\n`]
  ]) assertRejected(`${key} marker ${label}`, () => contracts.checkIncrementalRpirContract({ ...executionSources, [key]: changed }),
    executionError(key === 'implementAgent' && label === 'duplicate section'
      ? /Implement authority summary must bind covered commits/
      : key === 'safe' && label === 'duplicate section' ? /Safe implementation loop must persist progress/ : diagnostic));
}
for (const [key, target, replacement] of [
  ['safe', 'Merely attempting a check is not completion', 'Attempting a check is completion'],
  ['safe', 'all required constituent work/checks are complete', 'some work is complete'],
  ['safe', 'required failed, unavailable or not-run evidence leaves it unmet', 'failed evidence may be ignored'],
  ['core', 'does not authorize edits to historical Plans or finalized reports', 'permits historical edits'],
  ['core', 'postimage differs from the preimage only in the intended marker state(s)', 'postimage is accepted']
]) assertRejected(`${key} marker loses ${target}`, () => contracts.checkIncrementalRpirContract({
  ...executionSources, [key]: replaceOnce(executionSources[key], target, replacement)
}), executionError(/marker-only effect|Step, Task and Work Item completion gates/));
for (const [key, anchor] of [['safe', '### Incremental Plan progress'], ['core', '### Approved Plan execution-marker exception'],
  ['implementAgent', 'The prominent execution loop is:']]) {
  for (const contradiction of ['Workers may update Plan markers.', 'Tracking is optional for Implement.',
    'Failed validation may pass the Work Item.', 'Rewrite historical Plans.', 'Implement coordinator may add new completion markers.']) {
    assertRejected(`${key} marker additive ${contradiction}`, () => contracts.checkIncrementalRpirContract({
      ...executionSources, [key]: key === 'implementAgent'
        ? replaceOnce(executionSources[key], anchor, `${contradiction}\n\n${anchor}`)
        : replaceOnce(executionSources[key], anchor, `${anchor}\n\n${contradiction}`)
    }), executionError(/contradictory marker authority or completion gate/));
  }
  assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({ ...executionSources,
    [key]: `${executionSources[key]}\n\n## Historical marker example\n\nImplement coordinator may add new completion markers.\n` }));
  assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({ ...executionSources,
    [key]: key === 'implementAgent'
      ? replaceOnce(executionSources[key], anchor, `Do not assert the Implement coordinator may add new completion markers.\n\n${anchor}`)
      : replaceOnce(executionSources[key], anchor, `${anchor}\n\nDo not assert the Implement coordinator may add new completion markers.`) }));
  cases += 2;
}
console.log(`Passed ${cases - correctionOwnerStart} focused lifecycle owner correction cases.`);

// The surviving native owners, not entry adapters or slash text, establish
// checkpoint authority. Decoys do not restore a missing or ambiguous owner.
const checkpointNativeStart = cases;
const transitionOwner = technicalUnit(executionSources.core, '## Transitions and outcome authority',
  'Prospectively, the engineer selects', false);
const effectiveOwner = technicalUnit(executionSources.core, '## Transitions and outcome authority',
  'This contract is prospective:', false);
for (const [owned, target, diagnostic] of [
  [transitionOwner, 'selects the intended receiving custom agent', /prospective receiving-role transition/],
  [transitionOwner, 'actual physical predecessor', /prospective receiving-role transition/],
  [transitionOwner, 'No fixed wording, slash command or entry skill is required', /prospective receiving-role transition/],
  [effectiveOwner, 'policy actually effective in the session at invocation', /effective-policy transition and bootstrap/],
  [effectiveOwner, 'including any earlier required entry route', /effective-policy transition and bootstrap/]
]) {
  const missing = replaceOnce(executionSources.core, owned, replaceOnce(owned, target, 'omitted safeguard'));
  for (const core of [missing, `${missing}\n\n## Historical example\n\n${owned}\n`,
    replaceOnce(missing, 'description: ', `description: ${target}; `)]) {
    assertRejected(`native checkpoint transition loses ${target}`, () => contracts.checkIncrementalRpirContract({
      ...executionSources, core
    }), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' && diagnostic.test(error.message));
  }
}
assertRejected('duplicate native transition owner', () => contracts.checkIncrementalRpirContract({
  ...executionSources, core: replaceOnce(executionSources.core, transitionOwner, `${transitionOwner}\n\n${transitionOwner}`)
}), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' && /prospective receiving-role transition/.test(error.message));
for (const contradiction of ['A slash command is always required.', 'Role selection is approval.',
  'Policy edits automatically self-upgrade the session.']) {
  assertRejected(`additive native transition contradiction: ${contradiction}`, () => contracts.checkIncrementalRpirContract({
    ...executionSources, core: replaceOnce(executionSources.core, transitionOwner, `${transitionOwner}\n\n${contradiction}`)
  }), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' && /contradictory receiving-role transition/.test(error.message));
}
assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({
  ...executionSources, core: `${executionSources.core}\n\n## Historical transition example\n\nA slash command is always required.\n`
}));
cases += 1;
assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({
  ...executionSources,
  wikiCatalogue: replaceOnce(executionSources.wikiCatalogue,
    'explicitly approved bounded Plan strategy authorizes only covered commits after a qualifying Implement transition under policy effective at invocation',
    'explicitly approved bounded Plan strategy authorizes only covered commits after a qualifying Implement transition under policy effective at invocation and applicable permission')
}));
cases += 1;

for (const [key, heading, diagnostic] of [
  ['readme', '### Expected checkpoint planning; conditional execution', /README checkpoint section must explain/],
  ['wikiRpir', '## Expected checkpoint planning; conditional execution', /RPIR Wiki must align/],
  ['wikiEvidence', '### Expected checkpoint planning; conditional execution', /lifecycle evidence Wiki must align/]
]) {
  const owned = technicalUnit(executionSources[key], heading, 'Every prospective Plan', false);
  for (const changed of [
    replaceOnce(executionSources[key], heading, '### Unrelated checkpoint note'),
    `${replaceOnce(executionSources[key], heading, '### Unrelated checkpoint note')}\n\n## Historical example\n\n${owned}`,
    `${executionSources[key]}\n\n${heading}\n\n${owned}`
  ]) assertRejected(`${key} missing, historical or ambiguous checkpoint owner`, () => contracts.checkIncrementalRpirContract({
    ...executionSources, [key]: changed
  }), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' && diagnostic.test(error.message));
  assertRejected(`${key} additive checkpoint contradiction`, () => contracts.checkIncrementalRpirContract({
    ...executionSources, [key]: replaceOnce(executionSources[key], owned, `${owned}\n\nCheckpoint planning is optional.`)
  }), (error) => error.contractId === 'RPIR-CHECKPOINT-001' && /contradictory optional checkpoint planning/.test(error.message));
}
for (const [key, heading, prefix, target] of [
  ['readme', '### Expected checkpoint planning; conditional execution', 'A prospective Plan', 'under the policy effective at invocation'],
  ['wikiRpir', '## Expected checkpoint planning; conditional execution', 'Local commit execution remains conditional', 'qualifying Implement transition under the effective policy'],
  ['wikiEvidence', '### Expected checkpoint planning; conditional execution', 'A local commit remains conditional', 'qualifying Implement transition under the effective policy']
]) {
  const owned = technicalUnit(executionSources[key], heading, prefix, false);
  assertRejected(`${key} omits effective-policy checkpoint transition`, () => contracts.checkIncrementalRpirContract({
    ...executionSources, [key]: replaceOnce(executionSources[key], owned, replaceOnce(owned, target, 'unconditionally'))
  }), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001');
}
for (const [target, replacement] of [
  ["tools: ['read', 'search', 'execute']", "tools: ['read', 'search', 'runInTerminal']"],
  ["tools: ['read', 'search', 'execute']", "tools: ['read', 'search', 'execute', 'edit']"],
  ['Only `read`, `search` and `execute` are declared', 'Only `read`, `search` and `runInTerminal` are declared']
]) assertRejected(`Runner checkpoint tool boundary ${replacement}`, () => contracts.checkIncrementalRpirContract({
  ...executionSources, runner: replaceOnce(executionSources.runner, target, replacement)
}), (error) => error.contractId === 'RPIR-EXECUTION-CONTRACT-001' && /native execute alias/.test(error.message));
const checkpointPlanningOwner = technicalUnit(executionSources.checkpointSkill, '# Local Git checkpoints', 'Every prospective Plan', false);
const noCheckpointOwner = replaceOnce(executionSources.checkpointSkill, checkpointPlanningOwner, 'Checkpoint planning is described elsewhere.');
for (const [label, checkpointSkill, planAgent] of [
  ['deleted', noCheckpointOwner, executionSources.planAgent],
  ['history', `${noCheckpointOwner}\n\n## Historical checkpoint example\n\n${checkpointPlanningOwner}`, executionSources.planAgent],
  ['metadata', replaceOnce(noCheckpointOwner, 'description: ', `description: ${checkpointPlanningOwner} `), executionSources.planAgent],
  ['wrong owner', noCheckpointOwner, `${executionSources.planAgent}\n\n## Historical checkpoint example\n\n${checkpointPlanningOwner}`]
]) assertRejected(`checkpoint skill ${label} owner decoy`, () => contracts.checkIncrementalRpirContract({
  ...executionSources, checkpointSkill, planAgent
}), (error) => error.contractId === 'RPIR-CHECKPOINT-001' && /checkpointSkill: require bounded prospective planning/.test(error.message));
assertRejected('duplicate checkpoint skill planning owner', () => contracts.checkIncrementalRpirContract({
  ...executionSources, checkpointSkill: replaceOnce(executionSources.checkpointSkill, checkpointPlanningOwner,
    `${checkpointPlanningOwner}\n\n${checkpointPlanningOwner}`)
}), (error) => error.contractId === 'RPIR-CHECKPOINT-001' && /checkpointSkill: require bounded prospective planning/.test(error.message));
console.log(`Passed ${cases - checkpointNativeStart} focused native checkpoint owner cases.`);

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
    'Do not demand duplicate grants for unchanged Plan-covered effects.', 'Demand duplicate grants for unchanged Plan-covered effects.'),
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
  ['checklist', 'do not demand an approved implementation Plan or Implement invocation evidence for this route', /Checkpoint checklist must retain separately bounded/],
  ['runner', 'without requiring an approved implementation Plan or Implement invocation evidence', /Script Runner must retain separately bounded/],
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
  ['independent work continuity omitted', 'implement', (text) => {
    const changed = text.replaceAll('independent approved work', '');
    assert.notEqual(changed, text);
    return changed;
  }, /unexpected architecture requires engineer-directed Plan resolution/],
  ['dependent-effects guard omitted', 'implement', (text) => replaceOnce(text, ' before dependent effects', ''), /missing material version mismatch before dependent effects/],
  ['Review implies architecture approval', 'review', (text) => replaceOnce(
    text, 'a clean `/review` is not ADR sign-off and does not establish enterprise or architectural approval.',
    'a clean `/review` is ADR sign-off and establishes architectural approval.'
  ), /Review guidance: Review is not architectural sign-off/],
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

// Expected checkpoint planning is an authored owner contract, not a runtime
// arbitrary-Plan validation service. Each mutation is exact-once and must fail
// its own diagnostic; keep the independent Research/architecture tests above.
function rejectCheckpoint(label, key, target, replacement, owner, diagnostic) {
  assertRejected(label, () => contracts.checkIncrementalRpirContract({
    ...executionSources, [key]: replaceOnce(executionSources[key], target, replacement)
  }), (error) => error.contractId === 'RPIR-CHECKPOINT-001' &&
    error.message === `${owner}: ${diagnostic}`);
}
const planningDiagnostic = 'require bounded prospective planning and meaningful per-item exceptions without granting Git authority';
const entryDiagnostic = 'each detailed item needs a useful checkpoint or concrete justified exception field';
const accountingDiagnostic = 'account for each planned versus actual boundary without retrospective Plan exceptions or commit-count acceptance';
const runtimeDiagnostic = 'preserve effect-specific runtime safeguards and honest dispositions';
const entry = executionSources.planTemplate.split('\n').find((line) => line.startsWith('**Commit plan:**'));
assert.ok(entry, 'Plan template requires an owned commit field');
for (const replacement of ['', '**Commit plan:**', '**Commit plan:** `<No commits for any Work Item.>`',
  '**Commit plan:** `<Combine everything because it is simpler.>`']) {
  rejectCheckpoint(`missing/empty/generic blanket item field: ${replacement}`, 'planTemplate', entry, replacement,
    'planTemplate', entryDiagnostic);
}
const exceptionParts = ['actual constraint/reason', 'affected IDs', 'validation/dependency consequence',
  'later checkpoint boundary if one exists', 'why the normal boundary is unsuitable'];
for (const target of ['strategy reference', 'normal post-validation checkpoint boundary', 'coherent content and purpose', ...exceptionParts]) {
  rejectCheckpoint(`template item independently loses ${target}`, 'planTemplate', entry,
    replaceOnce(entry, target, 'omitted'), 'planTemplate', entryDiagnostic);
}
const missingEntry = replaceOnce(executionSources.planTemplate, entry, '**Commit plan:**');
for (const [label, planTemplate, readme] of [
  ['wrong section', replaceOnce(missingEntry, '## Execution guidance and validation', `## Execution guidance and validation\n\n${entry}`), executionSources.readme],
  ['history', `${missingEntry}\n\n## Historical example\n\n${entry}`, executionSources.readme],
  ['wrong owner', missingEntry, `${executionSources.readme}\n\n${entry}`]
]) assertRejected(`item-entry ${label} decoy`, () => contracts.checkIncrementalRpirContract({
  ...executionSources, planTemplate, readme
}), (error) => error.contractId === 'RPIR-CHECKPOINT-001' && error.message === `planTemplate: ${entryDiagnostic}`);
// A second detailed item cannot borrow the first item's intact entry.
assertRejected('second detailed item lacks checkpoint entry', () => contracts.checkIncrementalRpirContract({
  ...executionSources, planTemplate: replaceOnce(executionSources.planTemplate, '## Execution guidance and validation',
    '### Work Item 2: coupled tests\n\n**Validation:** both required checks pass.\n\n## Execution guidance and validation')
}), (error) => error.contractId === 'RPIR-CHECKPOINT-001' && error.message === `planTemplate: ${entryDiagnostic}`);

for (const [key, anchor] of [
  ['repository', '- **Expected checkpoint planning, conditional execution:**'],
  ['core', 'Every prospective Plan includes'], ['planAgent', 'Plan the deliverable'],
  ['planning', 'Specify the approved outcome'], ['checkpointSkill', 'Every prospective Plan must include'],
  ['checklist', 'Require one explicit bounded strategy']
]) {
  const paragraph = executionSources[key].split(/\n\s*\n/).find((part) => part.startsWith(anchor));
  assert.ok(paragraph, `${key} planning paragraph must exist`);
  for (const target of ['actual constraint/reason', 'affected IDs', 'validation/dependency consequence',
    'later boundary if one exists', 'why the normal boundary is unsuitable']) {
    rejectCheckpoint(`${key} independently loses exception ${target}`, key, paragraph,
      replaceOnce(paragraph, target, 'omitted'), key, planningDiagnostic);
  }
  const weakened = replaceOnce(paragraph, 'explicit bounded', 'bounded');
  rejectCheckpoint(`${key} missing explicit strategy requirement`, key, paragraph,
    weakened, key, planningDiagnostic);
  assertRejected(`${key} historical decoy cannot restore explicit strategy requirement`, () => contracts.checkIncrementalRpirContract({
    ...executionSources, [key]: `${replaceOnce(executionSources[key], paragraph, weakened)}\n\n## Historical planning example, not operating policy\n\n${paragraph}`
  }), (error) => error.contractId === 'RPIR-CHECKPOINT-001' && error.message === `${key}: ${planningDiagnostic}`);
  for (const contradiction of ['Checkpoint planning is optional.', 'Git strategy remains optional.',
    'Work Items may omit the commit entry.', 'A generic blanket exception is sufficient.',
    'Historical prohibitions may be ignored.']) {
    rejectCheckpoint(`${key} additive contradiction with positive rule intact: ${contradiction}`, key,
      paragraph, `${paragraph}\n\n${contradiction}`, key,
      'contradictory optional checkpoint planning or prohibition bypass');
  }
}

const combination = `**Commit plan:** Strategy reference G1: normal post-validation checkpoint boundary after WI1 is deferred to WI2; coherent content and purpose are the contract change plus coupled regression tests. This specific justified combination/deferral/no-commit exception has actual constraint/reason: WI1 changes a contract that WI2's fixtures must consume, so separate snapshots fail required checks; affected IDs: WI1 and WI2; validation/dependency consequence: neither is independently validated until both contract entries pass together; later checkpoint boundary if one exists: immediately after WI2 validation before unrelated WI3; why the normal boundary is unsuitable: WI1 alone would preserve a knowingly broken contract/test snapshot.`;
// This positive illustrates a useful exception, not proof that prose keywords
// establish its truth. Manually reconcile its IDs, dependency and later gate.
for (const planTemplate of [
  replaceOnce(executionSources.planTemplate, entry, combination),
  replaceOnce(executionSources.planTemplate, entry, replaceOnce(entry, 'coherent content and purpose', 'coherent content/purpose')),
  replaceOnce(executionSources.planTemplate, entry, entry.replace('coherent content and purpose', 'coherent content and purpose (policy, tests and directly related docs together)')),
  replaceOnce(executionSources.planTemplate, 'Every prospective Plan must state one explicit bounded', 'Every prospective Plan must state one explicit bounded and reviewable'),
  `${executionSources.planTemplate}\n\n## Historical evidence, not prospective policy\n\nA historical prohibition supplies no Git authority. Checkpoint planning is optional in this quoted historical example only.`
]) {
  assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({ ...executionSources, planTemplate }));
  cases += 1;
}
for (const [key, target, replacement] of [
  ['planAgent', 'Each detailed Work Item must reference that strategy', 'Every detailed Work Item must reference that strategy'],
  ['checkpointSkill', 'Every detailed Work Item references it', 'Each detailed Work Item references it'],
  ['checkpointSkill', 'coherent content and purpose', 'coherent content/purpose']
]) {
  assert.doesNotThrow(() => contracts.checkIncrementalRpirContract({
    ...executionSources, [key]: replaceOnce(executionSources[key], target, replacement)
  }));
  cases += 1;
}
for (const [key, anchor] of [
  ['implementationReport', '- **Planned-versus-actual checkpoint accounting:**'],
  ['reviewTemplate', '- **Planned-versus-actual boundary assessment:**'],
  ['validationChecklist', '- [ ] Reconcile planned versus actual'],
  ['implementAgent', 'Reconcile the inspected Plan']
]) {
  const owned = executionSources[key].split('\n').find((line) => line.startsWith(anchor));
  assert.ok(owned);
  for (const target of ['before unrelated work', key === 'implementAgent'
    ? 'substantive approved Plan content to invent retrospective' : 'retrospective substantive']) {
    rejectCheckpoint(`${key} boundary evidence loses ${target}`, key, owned,
      replaceOnce(owned, target, 'omitted'), key, accountingDiagnostic);
  }
  for (const target of ['actual constraint/reason', 'affected IDs', 'validation/dependency consequence', 'later boundary if one exists']) {
    rejectCheckpoint(`${key} departure loses ${target}`, key, owned,
      replaceOnce(owned, target, 'omitted'), key,
      'assess each departure reason, IDs, validation consequence and later boundary');
  }
}
for (const [owner, target] of [
  ['preflight', 'incidental index refresh/cache writes'],
  ['preflight', 'Unknown, changed or incompatible consequential effects stop that command before execution'],
  ['applicability', 'Skipped — not applicable'], ['applicability', 'Skipped — no eligible changes'],
  ['applicability', 'Unavailable / unresolved'], ['applicability', 'Do not call this a verified no-repository skip'],
  ['authorization', 'A real platform denial stops the affected action and is never bypassed through another role.'],
  ['candidate', 'unrelated staged content exists'], ['candidate', 'partial staging/same-file ownership is ambiguous'],
  ['candidate', 'validation actually applies to the staged snapshot'], ['candidate', 'HEAD/index drift'],
  ['candidate', 'if drift occurs, stop and re-inspect'], ['candidate', 'source-read-only in every phase'],
  ['candidate', 'stop before invoking a source-mutating helper'], ['candidate', 'Do not disable a required hook'],
  ['candidate', 'Never bypass hooks/signing'], ['candidate', 'invent identity/legal signoff'],
  ['candidate', 'Remote/network effects are outside this checkpoint capability'],
  ['reconciliation', 'Only after the complete candidate and relevant checks are supported and state remains current'],
  ['reconciliation', 'A command success alone does not verify a commit'],
  ['reconciliation', 'If completion is uncertain, reconcile'], ['evidence', 'No commit verified'],
  ['evidence', 'Commit verified with unexpected effects'], ['evidence', 'Completion uncertain'],
  ['evidence', 'chronology unverified']
]) {
  // Isolate the actual owner occurrence when outcome labels also appear in §6.
  const headings = { preflight: '## Prospective Plan coverage', applicability: '## 1. Decide whether a checkpoint applies',
    authorization: '## 3. Bind authorization to the approved Plan', candidate: '## 4. Inspect and preserve the candidate',
    reconciliation: '## 5. Append and reconcile; never assume success', evidence: '## 6. Report evidence without lifecycle claims' };
  const start = executionSources.checklist.indexOf(headings[owner]);
  const end = executionSources.checklist.indexOf('\n## ', start + headings[owner].length);
  const owned = executionSources.checklist.slice(start, end < 0 ? undefined : end);
  rejectCheckpoint(`runtime ${owner} loses ${target}`, 'checklist', owned,
    replaceOnce(owned, target, 'safeguard omitted'), `checklist ${owner}`, runtimeDiagnostic);
}

for (const [key, boundary] of [
  ['planTemplate', '## Planned work'], ['implementAgent', 'Before every engineer-facing question,'],
  ['reviewAgent', 'Before every engineer-facing question,'], ['safe', '## Outputs'],
  ['validationChecklist', '## Read-only Validation Worker'], ['implementationReport', '## Identity, direct lineage and next action'],
  ['reviewTemplate', '## Findings'], ['codeReview', 'Return cited, severity-ranked findings'],
  ['assuranceSkill', 'Do not edit, run commands, delegate, persist records'], ['assurance', '## Stage-specific outcome'],
  ['readme', 'Plan, Implement and Review retain contextual material clarification'], ['wikiRpir', '## Canonical references'],
  ['wikiEvidence', '## Canonical references'], ['wikiCatalogue', '## Canonical references'],
  ['wikiMaintenance', '## Canonical references'],
  ['lifecycleInstruction', '## Validation boundaries']
]) {
  // Insert inside the relevant normative section, not before the next heading
  // for catalogue/maintenance whose Skills/diagnostic sections end earlier.
  const target = key === 'wikiCatalogue'
    ? '| Convert requirements and evidence into an implementation plan'
    : key === 'wikiMaintenance' ? 'The retained [archive-boundary fixture suite]' : boundary;
  for (const contradiction of ['Checkpoint planning is optional.', 'A generic blanket exception is sufficient.']) {
    rejectCheckpoint(`${key} additive optional-planning contradiction`, key, target,
      `${contradiction}\n\n${target}`, key, 'contradictory optional checkpoint planning or prohibition bypass');
  }
}

const runnerPath = agentPath('Script Runner');
const runner = agents.get(runnerPath);
for (const [label, mutate] of [
  ['Runner edit tool', (values) => { values.tools = "['read', 'search', 'execute', 'edit']"; }],
  ['Runner agent tool', (values) => { values.tools = "['read', 'search', 'execute', 'agent']"; }],
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
const implementText = readArtifact(implementPath);
for (const [label, handoffs] of [
  ['manual legacy handoff', ['  - label: Review', '    agent: Review', '    prompt: Review the report', '    send: false']],
  ['automatic handoff', ['  - label: Review', '    agent: Review', '    prompt: Review the report', '    send: true']],
  ['wrong handoff target', ['  - label: Review', '    agent: Plan', '    prompt: Review the report', '    send: false']],
  ['incomplete handoff', ['  - label: Review', '    agent: Review', '    send: false']]
]) {
  assertRejected(label, () => nativeCheck(implementPath, replaceOnce(implementText,
    'target: github-copilot', `target: github-copilot\nhandoffs:\n${handoffs.join('\n')}`)),
  (error) => error.contractId === 'NATIVE-AGENT-001' && /Local delegation metadata/.test(error.message));
  assertRejected(`${label} parser`, () => contracts.parseHandoffs(implementPath, handoffs, ['Review'], agentNames),
    (error) => error.contractId === 'NATIVE-AGENT-001');
}
for (const [label, target, replacement] of [
  ['automatic transition', 'the suggestion does not invoke or accept it', 'automatically invoke Review'],
  ['wrong next role', 'manual independent Review with the actual inspected physical implementation report', 'manual Plan with the actual inspected physical implementation report'],
  ['missing physical predecessor', 'manual independent Review with the actual inspected physical implementation report', 'manual independent Review'],
  ['prefill treated as authority', 'unsent prefill is not invocation or sign-off', 'unsent prefill is invocation or sign-off']
]) assertRejected(`native ${label}`, () => nativeCheck(implementPath, replaceOnce(implementText, target, replacement)),
  (error) => error.contractId === 'NATIVE-AGENT-001');
for (const [name, agent] of [['plan', 'Plan'], ['implement', 'Implement'], ['review', 'Review'], ['remediate-review', 'Implement']]) {
  for (const route of [agent, 'wrong role']) assertRejected(`legacy ${name} prompt route ${route}`,
    () => contracts.checkPromptMetadata(`.github/prompts/${name}.prompt.md`, { name, agent: route }, agentNames),
    (error) => error.contractId === 'STRUCT-PROMPT-001');
}
const ordinaryPrompt = '.github/prompts/explain-change.prompt.md';
for (const values of [{ name: 'explain-change' }, { name: 'explain-change', agent: 'Implement' },
  { name: 'explain-change', agent: 'Implement', tools: "['read', 'execute']" },
  { name: 'explain-change', agent: 'Test Worker', tools: "['read', 'search']" }]) {
  assert.doesNotThrow(() => contracts.checkPromptMetadata(ordinaryPrompt, values, agentNames));
  cases += 1;
}
for (const values of [{ name: 'wrong-name', agent: 'Implement' }, { name: 'explain-change', agent: 'Missing Role' },
  { name: 'explain-change', tools: "['read']" }, { name: 'explain-change', agent: 'Test Worker', tools: "['read', 'execute']" }]) {
  assertRejected('invalid ordinary prompt metadata', () => contracts.checkPromptMetadata(ordinaryPrompt, values, agentNames));
}

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

// The packaging Run Book must describe only implemented interfaces and keep
// confirmed release-input writes separately bounded and interactive.
const runbookPath = 'docs/run-books/vsix-packaging.md';
const runbook = readArtifact(runbookPath);
const runbookSkill = readArtifact('.github/skills/create-runbook/SKILL.md');
const runbookTemplate = readArtifact('.github/skills/create-runbook/templates/runbook.md');
const packagingScripts = JSON.parse(readArtifact('package.json')).scripts;
const prepareVsix = require('../scripts/prepare-vsix.cjs');
assert.equal(packagingScripts['prepare-vsix'], 'node scripts/prepare-vsix.cjs prepare');
assert.equal(packagingScripts['inspect-vsix-candidate'], 'node scripts/prepare-vsix.cjs inspect');
assert.equal(packagingScripts['confirm-release-inputs'], 'node scripts/prepare-vsix.cjs release-inputs');
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
assert.equal(typeof prepareVsix.applyConfirmedReleaseInputs, 'function',
  'the confirmed-input helper API exists separately from an operational CLI');
for (const [label, text] of [
  ['Run Book', runbook],
  ['authoring Skill', runbookSkill],
  ['authoring template', runbookTemplate]
]) {
  assert.match(text, /Run Book itself|Run Books?.*never|does not confer/i,
    `${label} must not make itself authority`);
}
assert.match(runbook, /npm run prepare-vsix/);
assert.match(runbook, /npm run inspect-vsix-candidate -- --candidate <explicit-candidate-directory>/);
assert.match(runbook, /Releases\/YYYY-MM-DD\/HHmmssZ-<unique-id>\//);
assert.match(runbook, /candidate\.json.*verification-evidence\.json.*status\.json/s);
assert.match(runbook, /pending\/unknown/);
assert.match(runbook, /exact candidate.*SHA-256/s);
assert.match(runbook, /maintainer owns backup outside this workflow/i);
assert.match(runbook, /npm run confirm-release-inputs/);
assert.match(runbook, /--change-summary .*--expected-pending-notes .*--proposed-notes/);
assert.match(runbook, /interactive `CONFIRM <version>` response/i);
assert.match(runbook, /partial state without rollback/i);
assert.match(runbook, /current pending text to match exactly once.*replacement must begin with/s);
assert.match(runbook, /## Operating mode and authority/);
assert.match(runbookSkill, /specifically authorized.*Agent-followable/is);
assert.match(runbookSkill, /never Script Runner command-selection input/i);
assert.match(runbookTemplate, /## Operating mode and authority/);
assert.doesNotThrow(() => contracts.checkLocalLinks(runbookPath, runbook));
assert.doesNotThrow(() => contracts.checkLocalLinks(
  '.github/skills/create-runbook/SKILL.md', runbookSkill
));
assert.doesNotThrow(() => contracts.checkLocalLinks(
  '.github/skills/create-runbook/templates/runbook.md', runbookTemplate
));
const repositoryPolicy = readArtifact('.github/copilot-instructions.md');
const packagingPolicy = repositoryPolicy.split('\n## Packaging\n')[1] || '';
const packagingWorkflow = readArtifact('.github/workflows/package.yml');
assert.match(packagingPolicy, /^### Prospective local candidate preparation/m);
assert.match(packagingPolicy, /built-in VS Code Agent mode may follow the canonical \[VSIX candidate preparation Run Book\]/);
assert.match(packagingPolicy, /explicit interactive confirmation/);
assert.match(packagingPolicy, /prepare, verify, retain and hand off one local candidate/);
assert.match(packagingPolicy, /agent stops after candidate handoff/);
assert.match(packagingPolicy, /do not self-upgrade a currently loaded session/);
for (const prohibited of [
  'dependency installation', 'manifest synchronization', 'arbitrary source/customization edits',
  'Git effects', 'installation/activation', 'manual testing', 'credentials',
  'network/account queries', 'publication', 'backup', 'archive migration/pruning',
  "changes to Script Runner's tools or role"
]) assert.ok(packagingPolicy.includes(prohibited), `Prospective packaging policy must retain prohibition: ${prohibited}`);
assert.match(packagingWorkflow, /package:\s*\n\s+if: false/,
  'the hosted package job remains disabled');
assert.match(packagingPolicy, /Real packaging remains deferred outside this prospective local-candidate task/);
cases += 38;

// Concise presentation must not become evidence/approval loss. These fixtures
// mutate normative owners in memory; no agent or packaging operation is run.
const conciseStart = cases;
const concisePaths = {
  core: '.github/skills/rpir-lifecycle-core/SKILL.md',
  questions: '.github/skills/agent-question-resolution/SKILL.md',
  clarification: '.github/skills/agent-question-resolution/templates/clarification-message.md',
  discovery: '.github/skills/agent-question-resolution/references/research-intent-discovery.md',
  research: '.github/skills/codebase-research/research-brief-template.md',
  researchAgent: '.github/agents/research.agent.md',
  assurance: '.github/skills/rpir-stage-assurance/stage-assurance-checklist.md',
  planReport: '.github/skills/architecture-planning/implementation-plan-template.md',
  implementationReport: '.github/skills/safe-implementation/implementation-report-template.md',
  reviewReport: '.github/skills/code-review/review-report-template.md'
};
const conciseSources = Object.fromEntries(Object.entries(concisePaths).map(([key, relative]) => [key, readArtifact(relative)]));
assert.doesNotThrow(() => contracts.checkConciseRpirContract(conciseSources));
cases += 1;
for (const [owner, target, replacement] of [
  ['questions', 'direct contextual question', 'direct contextual question in plain English'],
  ['clarification', 'Which local file contains the example you mean?', 'Which saved example should I inspect?'],
  ['core', 'plain English', 'clear plain English']
]) {
  assert.doesNotThrow(() => contracts.checkConciseRpirContract({ ...conciseSources,
    [owner]: replaceOnce(conciseSources[owner], target, replacement) }));
  cases += 1;
}
const conciseDiagnostic = (owner, rule) => (error) => error.contractId === 'RPIR-OUTPUT-001' &&
  error.message === `${owner}: ${rule}`;
for (const [owner, target, replacement, rule] of [
  ['questions', 'Presentation never replaces actual acknowledgment, waiting, explicit deferral or manual approval',
    'Presentation replaces acknowledgment', 'proportionate questions retain decision and approval safeguards'],
  ['questions', 'Preserve actual qualified or nonrecommended answers and conditions',
    'Preserve recommended answers only', 'retain actual answers and manual transitions'],
  ['questions', 'do not invoke or approve a phase transition', 'approve a phase transition', 'retain actual answers and manual transitions'],
  ['core', 'required failed, unavailable and not-run checks', 'successful checks only', 'retain concise output and material evidence'],
  ['core', 'every expected checkpoint boundary', 'selected checkpoint boundaries', 'retain concise output and material evidence'],
  ['research', 'never label provisional understanding confirmed', 'label provisional understanding confirmed', 'current substance is not a discovery history'],
  ['discovery', 'Do not emit a readback and start dependent investigation', 'Emit a readback and start dependent investigation', 'retain actual acknowledgment and waiting']
]) {
  assertRejected(`${owner} concise contract loses ${target}`, () => contracts.checkConciseRpirContract({
    ...conciseSources, [owner]: replaceOnce(conciseSources[owner], target, replacement)
  }), conciseDiagnostic(owner, rule));
}
for (const [owner, boundary] of [
  ['core', '## Inspect and bind one actual document'], ['questions', '## Outputs'],
  ['discovery', '## Honor explicit engineer-directed deferral'], ['research', '## Evidence and reasoning'],
  ['assurance', '## Delivery and material boundaries']
]) {
  for (const contradiction of ['Every question must use four labels.', 'All questions require lettered paths.',
    'A running discovery history is required.', 'Acknowledgment may be assumed.', 'An answer approves the next phase.',
    'Always substitute the recommendation.', 'Required failures may be omitted.',
    'Invocation proves persisted acceptance.', 'Final markers prove timely handling.']) {
    assertRejected(`${owner} additive output contradiction: ${contradiction}`, () => contracts.checkConciseRpirContract({
      ...conciseSources, [owner]: replaceOnce(conciseSources[owner], boundary, `${contradiction}\n\n${boundary}`)
    }), conciseDiagnostic(owner, 'contradictory output or authority rule'));
  }
}
const conciseEvidenceRule = 'required failed, unavailable and not-run checks';
const missingConciseEvidence = replaceOnce(conciseSources.core, conciseEvidenceRule, 'successful checks only');
for (const [label, core, research] of [
  ['history', `${missingConciseEvidence}\n\n## Historical example\n\n${conciseEvidenceRule}`, conciseSources.research],
  ['metadata', replaceOnce(missingConciseEvidence, 'description: ', `description: ${conciseEvidenceRule}. `), conciseSources.research],
  ['wrong-owner', missingConciseEvidence, `${conciseSources.research}\n\n${conciseEvidenceRule}`],
  ['wrong-section', replaceOnce(missingConciseEvidence, '## Inspect and bind one actual document',
    `## Inspect and bind one actual document\n\n${conciseEvidenceRule}`), conciseSources.research]
]) {
  assertRejected(`concise evidence ${label} decoy`, () => contracts.checkConciseRpirContract({
    ...conciseSources, core, research
  }), conciseDiagnostic('core', 'retain concise output and material evidence'));
}
for (const heading of ['## Reader-facing outputs', '## Intent and discovery']) {
  const owner = heading.includes('Reader') ? 'core' : 'research';
  assertRejected(`${owner} ambiguous output owner`, () => contracts.checkConciseRpirContract({
    ...conciseSources, [owner]: `${conciseSources[owner]}\n\n${heading}\n\nDecoy.\n`
  }), conciseDiagnostic(owner, 'missing or ambiguous output owner'));
}
for (const owner of ['planReport', 'implementationReport', 'reviewReport']) {
  for (const [target, replacement] of [
    ['Link inspected', 'Link inspected and version-bound'],
    ['Omit irrelevant fields/headings and repeated empty entries', 'Omit irrelevant fields/headings and repeated empty entries where inapplicable']
  ]) {
    assert.doesNotThrow(() => contracts.checkConciseRpirContract({ ...conciseSources,
      [owner]: replaceOnce(conciseSources[owner], target, replacement) }));
    cases += 1;
  }
  for (const contradiction of ['Required failures may be omitted.', 'Decision conditions may be omitted.',
    'Invocation proves persisted acceptance.', 'Final markers prove timely handling.',
    'A real denial may be bypassed.', 'Unresolved findings may be accepted.']) {
    const boundary = owner === 'planReport' ? '## Planned work' : owner === 'implementationReport' ? '## Validation' : '## Findings';
    assertRejected(`${owner} additive report contradiction`, () => contracts.checkConciseRpirContract({
      ...conciseSources, [owner]: replaceOnce(conciseSources[owner], boundary, `${contradiction}\n\n${boundary}`)
    }), conciseDiagnostic(owner, 'contradictory output or authority rule'));
  }
  const intro = conciseSources[owner].split(/\n\s*\n/).find((part) => part.startsWith('Use prospectively;'));
  assert.ok(intro);
  const missing = replaceOnce(conciseSources[owner], intro, 'Report the result.');
  for (const [label, text] of [
    ['missing', missing], ['history', `${missing}\n\n## Historical example\n\n${intro}`],
    ['metadata', replaceOnce(missing, 'description: ', `description: ${intro.replace(/\n/g, ' ')} `)],
    ...(owner === 'planReport' ? [] : [
      ['wrong-section', replaceOnce(missing, '## Validation', `## Validation\n\n${intro}`)]
    ])
  ]) {
    assertRejected(`${owner} ${label} report-owner decoy`, () => contracts.checkConciseRpirContract({
      ...conciseSources, [owner]: text
    }), conciseDiagnostic(owner, 'missing or ambiguous report introduction'));
  }
  assertRejected(`${owner} duplicate report introduction`, () => contracts.checkConciseRpirContract({
    ...conciseSources, [owner]: replaceOnce(conciseSources[owner], intro, `${intro}\n\n${intro}`)
  }), conciseDiagnostic(owner, 'missing or ambiguous report introduction'));
}
for (const owner of ['implementationReport', 'reviewReport']) {
  const rule = 'required failed, unavailable or not-run checks';
  // The introduction also retains evidence; only Validation can satisfy its
  // own outcome rule. Mutation stays scoped to that normative section.
  const start = conciseSources[owner].indexOf('\n## Validation\n');
  const end = conciseSources[owner].indexOf('\n## ', start + 1);
  const validation = conciseSources[owner].slice(start, end);
  for (const [target, replacement] of [[rule, 'successful checks'],
    [owner === 'implementationReport' ? 'actual state and consequence' : 'actual outcomes, reasons, consequences', 'summary only']]) {
    assertRejected(`${owner} hides required check evidence`, () => contracts.checkConciseRpirContract({
      ...conciseSources, [owner]: replaceOnce(conciseSources[owner], validation, replaceOnce(validation, target, replacement))
    }), conciseDiagnostic(owner, 'retain required validation outcomes without empty categories'));
  }
}
console.log(`Passed ${cases - conciseStart} focused concise-output cases.`);
console.log(`Passed ${cases} Copilot contract cases, including valid structure and rejected privilege/parity/link defects.`);
