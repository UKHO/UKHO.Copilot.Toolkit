'use strict';

// Static mutation tests only. Never mutate source or delete a retained fixture.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const source = path.resolve(__dirname, '..');
const scripts = path.join(source, 'scripts');
const identity = (value) => process.platform === 'win32' ? value.toLowerCase() : value;
function plain(full) {
  const chain = [];
  for (let cursor = path.resolve(full); ; cursor = path.dirname(cursor)) {
    chain.unshift(cursor);
    if (cursor === path.dirname(cursor)) break;
  }
  for (const part of chain) {
    const stat = fs.lstatSync(part);
    assert.ok(stat.isDirectory() && !stat.isSymbolicLink(), `unsafe directory: ${part}`);
    assert.equal(identity(fs.realpathSync(part)), identity(part), `indirected directory: ${part}`);
  }
}
function inspect(full) {
  const stat = fs.lstatSync(full);
  assert.ok(!stat.isSymbolicLink() && (stat.isDirectory() || stat.isFile()), `unsafe input: ${full}`);
  assert.equal(identity(fs.realpathSync(full)), identity(full), `indirected input: ${full}`);
  if (stat.isDirectory()) for (const name of fs.readdirSync(full)) inspect(path.join(full, name));
}
assert.equal(identity(process.cwd()), identity(source), 'scenario cwd must be the selected root');
plain(source); plain(scripts);
const files = [
  'package.json', 'README.md', 'CHANGELOG.md', 'LICENSE',
  'docs/run-books/vsix-packaging.md',
  ...['discover-copilot-artifacts', 'sync-copilot-manifest', 'verify-vsix-boundary',
    'verify-copilot-contracts', 'test-copilot-contract-scenarios', 'verify-vsix-packaging-guide',
    'check-copilot-workflow'].map((name) => `scripts/${name}.cjs`)
];
for (const file of files) inspect(path.join(source, file));
inspect(path.join(source, '.github'));
fs.accessSync(scripts, fs.constants.R_OK | fs.constants.W_OK);
const temp = path.join(scripts, `.rpir-contracts-${crypto.randomBytes(12).toString('hex')}`);
assert.ok(!fs.existsSync(temp), `staging collision: ${temp}`);
fs.mkdirSync(temp, { mode: 0o700 });
console.log(`Retained staging tree: ${temp}`);
const pending = new Map();
const touched = new Set();
function staged(relative) {
  assert.ok(!path.isAbsolute(relative) && !relative.split(/[\\/]/).includes('..'), `escaping staged path: ${relative}`);
  plain(temp);
  const full = path.resolve(temp, relative);
  assert.ok(full.startsWith(`${temp}${path.sep}`), `outside staging: ${relative}`);
  plain(path.dirname(full));
  const stat = fs.lstatSync(full);
  assert.ok(stat.isFile() && !stat.isSymbolicLink(), `not a regular staged file: ${relative}`);
  assert.equal(identity(fs.realpathSync(full)), identity(full), `indirected staged file: ${relative}`);
  return full;
}
// Load only the staged CommonJS sources from a healthy -e entry point: Node 26
// otherwise parses the malformed cwd package.json before the verifier can report it.
const bootstrap = `
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const base = path.resolve('scripts'), cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name).exports;
  const filename = path.join(base, name + '.cjs'), mod = new Module(filename);
  mod.filename = filename; mod.paths = Module._nodeModulePaths(base);
  cache.set(name, mod);
  mod.require = (request) => {
    if (request === './discover-copilot-artifacts.cjs') return load('discover-copilot-artifacts');
    if (request === './check-copilot-workflow.cjs') return load('check-copilot-workflow');
    if (Module.isBuiltin(request)) return require(request);
    throw new Error('Unexpected bootstrap dependency: ' + request);
  };
  mod._compile(fs.readFileSync(filename, 'utf8'), filename);
  return mod.exports;
}
load('verify-copilot-contracts');`;
function call(bootstrapInvocation = false) {
  plain(temp);
  const result = spawnSync(process.execPath, bootstrapInvocation ? ['-e', bootstrap] : ['scripts/verify-copilot-contracts.cjs'], { cwd: temp, encoding: 'utf8' });
  assert.equal(result.error, undefined, `verifier invocation: ${result.error?.message}`);
  assert.equal(result.signal, null, 'verifier terminated by signal');
  assert.ok(result.status === 0 || result.status === 1, `missing/invalid verifier exit ${result.status}`);
  const output = `${result.stdout}${result.stderr}`;
  const labels = ['Manifest parity', 'Authored contracts', 'Frontmatter, links, routes, handoffs and tools'];
  const summaries = labels.map((label) => {
    const matches = [...output.matchAll(new RegExp(`^${label}: (PASS|FAIL|NOT RUN)(?: \\(.*\\))?$`, 'gm'))];
    assert.equal(matches.length, 1, `${label} must have exactly one summary: ${output}`);
    return matches[0][1];
  });
  assert.equal([...output.matchAll(/^(?:Manifest parity|Authored contracts|Frontmatter, links, routes, handoffs and tools):/gm)].length, 3, 'only three group summaries');
  const diagnostics = [...output.matchAll(/^DIAGNOSTIC (FAIL|NOT RUN) ([A-Z][A-Z0-9-]+)(?: ([^:\s]+))?/gm)]
    .map((match) => [match[1], match[2], match[3]?.replace(/:$/, '') || '']);
  assert.equal((output.match(/^DIAGNOSTIC /gm) || []).length, diagnostics.length, `unparsed diagnostic: ${output}`);
  return { status: result.status, summaries, diagnostics, output };
}
const owners = {
  'RECOVERY-001': '.github/copilot-instructions.md', 'IDENTITY-001': '.github/skills/rpir-lifecycle-core/SKILL.md',
  'RECOVERY-002': '.github/copilot-instructions.md', 'PERMISSION-001': '.github/agents/script-runner.agent.md',
  'RECORD-002': '.github/skills/safe-implementation/SKILL.md',
  'PLANNING-001': '.github/skills/architecture-planning/SKILL.md',
  'PLAN-HIERARCHY-001': '.github/skills/architecture-planning/implementation-plan-template.md',
  'WORKER-001': '.github/agents/implementation-worker.agent.md',
  'STATUS-001': '.github/prompts/plan.prompt.md',
  'FRAGMENT-001': '.github/agents/validation-worker.agent.md',
  'IDENTITY-002': '.github/skills/rpir-lifecycle-core/SKILL.md', 'REVIEW-001': '.github/agents/review.agent.md',
  'RESEARCH-INTENT-001': '.github/agents/research.agent.md',
  'QUESTIONS-METHOD-001': '.github/skills/agent-question-resolution/SKILL.md',
  'RESEARCH-DISCOVERY-001': '.github/skills/agent-question-resolution/references/research-intent-discovery.md',
  'RESEARCH-POLICY-001': '.github/copilot-instructions.md',
  'RESEARCH-CORE-001': '.github/skills/rpir-lifecycle-core/SKILL.md',
  'RESEARCH-RECORDS-001': '.github/instructions/lifecycle-records.instructions.md',
  'RESEARCH-BRIEF-001': '.github/skills/codebase-research/research-brief-template.md',
  'RESEARCH-ASSURANCE-001': '.github/skills/rpir-stage-assurance/stage-assurance-checklist.md',
  'RESEARCH-GUIDE-001': 'README.md',
  'RUNNER-001': '.github/agents/script-runner.agent.md',
  'CI-001': 'package.json', 'CI-002': '.github/workflows/package.yml', 'PACKAGE-001': 'package.json',
  'PARITY-001': 'package.json', 'PARITY-INPUT-MANIFEST': 'package.json',
  'PARITY-INPUT-DISCOVERY': 'scripts/discover-copilot-artifacts.cjs', 'STRUCT-INPUT-DISCOVERY': 'scripts/discover-copilot-artifacts.cjs',
  'STRUCT-AGENT': '.github/agents/review.agent.md', 'STRUCT-PROMPT': '.github/prompts/remediate-review.prompt.md',
  'PILOT-SAFETY-001': '.github/skills/create-copilot-skill/SKILL.md',
  'MAINTAIN-AUTHORITY-001': '.github/skills/maintain-copilot-artifacts/SKILL.md',
  'MAINTAIN-PRESERVATION-001': '.github/skills/maintain-copilot-artifacts/SKILL.md',
  'MAINTAIN-STATIC-001': '.github/skills/maintain-copilot-artifacts/SKILL.md'
};
function diagnosticSet(result, expected, label) {
  const tuples = expected.map((item) => {
    const match = item.match(/^(FAIL|NOT RUN) ([A-Z][A-Z0-9-]+)(?: (.+))?$/);
    assert.ok(match && Object.hasOwn(owners, match[2]), `${label}: unknown expected diagnostic ${item}`);
    return [match[1], match[2], match[3] || owners[match[2]]];
  });
  // Structural diagnostics include the path in their explanation, not a separate owner field.
  const normalized = result.diagnostics.map(([state, id, owner]) => [state, id, owner]);
  assert.deepEqual(normalized.sort(), tuples.sort(), `${label}: unexpected or missing diagnostic\n${result.output}`);
}
function expect(label, mutations, statuses, ids = [], bootstrapInvocation = false) {
  const expectedExit = statuses.every((status) => status === 'PASS') ? 0 : 1;
  const active = [];
  try {
    for (const [relative, from, to] of mutations) {
      const full = staged(relative);
      const previous = pending.get(relative);
      const current = previous ? previous.after : fs.readFileSync(full, 'utf8');
      assert.equal(current.split(from).length - 1, 1, `${label}: mutation target must be unique in ${relative}`);
      const after = current.replace(from, to);
      pending.set(relative, { before: previous ? previous.before : current, after });
      if (!previous) active.push(relative);
      touched.add(relative);
      fs.writeFileSync(full, after);
    }
    const result = call(bootstrapInvocation);
    assert.deepEqual(result.summaries, statuses, `${label}: unexpected groups\n${result.output}`);
    assert.equal(result.status, expectedExit, `${label}: wrong exit\n${result.output}`);
    diagnosticSet(result, ids, label);
    console.log(`PASS ${expectedExit ? 'negative' : 'positive'}: ${label}`);
  } finally {
    for (const relative of active.reverse()) {
      const { before, after } = pending.get(relative);
      const full = staged(relative);
      assert.equal(fs.readFileSync(full, 'utf8'), after, `${label}: unexpected staged change; retain for inspection`);
      fs.writeFileSync(full, before);
      assert.equal(fs.readFileSync(full, 'utf8'), before, `${label}: failed attributable restoration`);
      pending.delete(relative);
    }
  }
}
function guideCase(label, mutations, failure) {
  const active = [];
  try {
    for (const [relative, from, to] of mutations) {
      const full = staged(relative), before = fs.readFileSync(full, 'utf8');
      assert.equal(before.split(from).length - 1, 1, `${label}: unique guide mutation in ${relative}`);
      const after = before.replace(from, to);
      pending.set(relative, { before, after }); active.push(relative); touched.add(relative);
      fs.writeFileSync(full, after);
    }
    const result = spawnSync(process.execPath, ['scripts/verify-vsix-packaging-guide.cjs'], { cwd: temp, encoding: 'utf8' });
    assert.equal(result.error, undefined);
    assert.equal(result.signal, null);
    assert.equal(result.status, failure ? 1 : 0, `${label}: ${result.stdout}${result.stderr}`);
    assert.ok((`${result.stdout}${result.stderr}`).includes(failure || 'scenario interface and checks-only CI/hold'), `${label}: wrong guide outcome: ${result.stdout}${result.stderr}`);
    console.log(`PASS ${failure ? 'negative' : 'positive'} guide: ${label}`);
  } finally {
    for (const relative of active.reverse()) {
      const { before, after } = pending.get(relative), full = staged(relative);
      assert.equal(fs.readFileSync(full, 'utf8'), after, `${label}: unexpected guide postimage`);
      fs.writeFileSync(full, before);
      assert.equal(fs.readFileSync(full, 'utf8'), before);
      pending.delete(relative);
    }
  }
}
const recordKinds = ['research-brief', 'implementation-plan', 'implementation-report', 'review-report'];
function assertLineage() {
  for (const parent of ['planning', 'delivery', 'copilot']) {
    const subject = parent === 'copilot' ? '001-current-fixture' : '001-legacy-fixture';
    const folder = `docs/${parent}/${subject}`;
    for (const [index, kind] of recordKinds.entries()) {
      const relative = `${folder}/001-${kind}.md`;
      const text = fs.readFileSync(staged(relative), 'utf8');
      assert.equal(text.split('\n')[0], `# Synthetic ${kind}`, `${relative}: wrong kind`);
      assert.ok(text.includes(`Subject: ${subject}\n`), `${relative}: wrong subject`);
      if (!index) {
        assert.ok(text.includes('Initial Research, no predecessor'), `${relative}: Research has no predecessor`);
        assert.ok(!text.includes('[Predecessor]'), `${relative}: unexpected Research ancestry`);
      } else {
        const links = [...text.matchAll(/\[Predecessor\]\(([^)]+)\)/g)];
        assert.equal(links.length, 1, `${relative}: exactly one predecessor`);
        assert.equal(links[0][1], `001-${recordKinds[index - 1]}.md`, `${relative}: wrong direct same-folder ancestry`);
        const target = path.resolve(path.dirname(staged(relative)), links[0][1]);
        assert.equal(target, staged(`${folder}/001-${recordKinds[index - 1]}.md`), `${relative}: escaping predecessor`);
        assert.ok(fs.statSync(target).isFile(), `${relative}: missing predecessor`);
        assert.ok(fs.readFileSync(target, 'utf8').startsWith(`# Synthetic ${recordKinds[index - 1]}\nSubject: ${subject}\n`), `${relative}: predecessor kind/subject`);
      }
    }
  }
}
function lineageDamage(label, relative, from, to) {
  const full = staged(relative), before = fs.readFileSync(full, 'utf8');
  assert.equal(before.split(from).length - 1, 1, `${label}: unique fixture mutation`);
  const after = before.replace(from, to);
  touched.add(relative); pending.set(relative, { before, after }); fs.writeFileSync(full, after);
  try { assert.throws(assertLineage, undefined, label); console.log(`PASS negative lineage: ${label}`); }
  finally {
    assert.equal(fs.readFileSync(full, 'utf8'), after);
    fs.writeFileSync(full, before); assert.equal(fs.readFileSync(full, 'utf8'), before);
    pending.delete(relative);
  }
}
const pass = ['PASS', 'PASS', 'PASS'];
const authoredFail = ['PASS', 'FAIL', 'PASS'];
const core = '.github/skills/rpir-lifecycle-core/SKILL.md';
const planTemplate = '.github/skills/architecture-planning/implementation-plan-template.md';
const policy = '.github/copilot-instructions.md';
const runner = '.github/agents/script-runner.agent.md';
const review = '.github/agents/review.agent.md';
const workflow = '.github/workflows/package.yml';
let bytes = 0;
function inventory(full = temp) {
  plain(full);
  return fs.readdirSync(full).sort().flatMap((name) => {
    const child = path.join(full, name), stat = fs.lstatSync(child);
    assert.ok(!stat.isSymbolicLink() && (stat.isFile() || stat.isDirectory()), `unsafe retained artifact: ${child}`);
    assert.equal(identity(fs.realpathSync(child)), identity(child), `indirected artifact: ${child}`);
    if (stat.isDirectory()) return [`${path.relative(temp, child)}/`, ...inventory(child)];
    bytes += stat.size;
    return [path.relative(temp, child)];
  });
}
try {
  for (const relative of files) {
    const dest = path.join(temp, relative);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.cpSync(path.join(source, relative), dest, { errorOnExist: true, force: false });
  }
  // The only copied directory is .github; never import docs history, dependency trees or old staging runs.
  fs.cpSync(path.join(source, '.github'), path.join(temp, '.github'), { recursive: true, errorOnExist: true, force: false });
  const record = (parent, subject) => {
    const folder = path.join(temp, 'docs', parent, subject);
    fs.mkdirSync(folder, { recursive: true });
    recordKinds.forEach((name, index) => {
      const predecessor = index ? `[Predecessor](001-${recordKinds[index - 1]}.md)` : 'Initial Research, no predecessor';
      fs.writeFileSync(path.join(folder, `001-${name}.md`), `# Synthetic ${name}\nSubject: ${subject}\n\n${predecessor}\n`, { flag: 'wx' });
    });
  };
  record('planning', '001-legacy-fixture');
  record('delivery', '001-legacy-fixture');
  record('copilot', '001-current-fixture');
  assertLineage();
  for (const parent of ['planning', 'delivery', 'copilot']) {
    const subject = parent === 'copilot' ? '001-current-fixture' : '001-legacy-fixture';
    const base = `docs/${parent}/${subject}`;
    lineageDamage(`${parent} wrong kind`, `${base}/001-implementation-plan.md`, '# Synthetic implementation-plan', '# Synthetic review-report');
    lineageDamage(`${parent} wrong subject`, `${base}/001-implementation-plan.md`, `Subject: ${subject}`, 'Subject: 999-other');
    lineageDamage(`${parent} broken link`, `${base}/001-implementation-plan.md`, '(001-research-brief.md)', '(001-missing-research-brief.md)');
    lineageDamage(`${parent} cross-folder ancestry`, `${base}/001-implementation-plan.md`, '(001-research-brief.md)', '(../other/001-research-brief.md)');
    lineageDamage(`${parent} Research has predecessor`, `${base}/001-research-brief.md`, 'Initial Research, no predecessor', '[Predecessor](001-review-report.md)');
  }
  expect('strict healthy baseline and synthetic legacy/current records', [], pass);
  const alternate = call(true);
  assert.deepEqual(alternate.summaries, pass);
  assert.equal(alternate.status, 0);
  diagnosticSet(alternate, [], 'healthy alternate invocation');
  const pilot = '.github/skills/create-copilot-skill/SKILL.md';
  const compactSafety = 'Prefer read-only discovery and validation. The capability list, genuine-need and user-approved-scope conditions, prohibition on inferring approval from the Skill request, and experimental-context, secret and no-tool-grant safeguards in “Limits and safety” also govern recommendations. This local reminder grants no tools or permissions.';
  const repeatedBaselineSafety = 'Prefer read-only discovery and validation. Do not add or recommend edit, terminal, web, MCP, hook, or agent-delegation capability unless the requested workflow genuinely requires it and the user has approved that scope. Do not use experimental forked context or embed secrets.';
  expect('complete baseline safety wording retained', [[pilot, compactSafety, repeatedBaselineSafety]], pass);
  expect('supported complete pilot safety paraphrase', [[pilot,
    'MUST NOT add or recommend edit, terminal, web, MCP, hook, or agent-delegation capability speculatively. Include such capability only when the requested workflow genuinely requires it and the user has approved that scope; do not infer approval from the Skill request itself.',
    "Do not add or recommend edit, terminal, web, MCP, hook, or agent-delegation capability speculatively. Include one only for a genuine workflow need and with the user's explicit approval of that scope; a request for this Skill alone is not approval."]], pass);
  expect('pilot read-only preference removed', [[pilot,
    'Prefer read-only discovery and validation.', 'Prefer efficient discovery and validation.']], authoredFail, ['FAIL PILOT-SAFETY-001']);
  expect('pilot capability coverage truncated', [[pilot,
    'edit, terminal, web, MCP, hook, or agent-delegation', 'edit and terminal']], authoredFail, ['FAIL PILOT-SAFETY-001']);
  expect('pilot recommendation safeguard removed', [[pilot,
    'add or recommend edit, terminal, web, MCP, hook, or agent-delegation capability', 'add edit, terminal, web, MCP, hook, or agent-delegation capability']], authoredFail, ['FAIL PILOT-SAFETY-001']);
  expect('pilot genuine need disjoined from approval', [[pilot,
    'genuinely requires it and the user has approved that scope', 'genuinely requires it or the user has approved that scope']], authoredFail, ['FAIL PILOT-SAFETY-001']);
  expect('pilot explicit scope approval weakened', [[pilot,
    'the user has approved that scope', 'the user may approve that scope']], authoredFail, ['FAIL PILOT-SAFETY-001']);
  expect('pilot approval inferred from Skill request', [[pilot,
    'do not infer approval from the Skill request itself', 'the Skill request itself grants approval']], authoredFail, ['FAIL PILOT-SAFETY-001']);
  expect('pilot speculative capability restriction removed', [[pilot,
    'capability speculatively.', 'capability.']], authoredFail, ['FAIL PILOT-SAFETY-001']);
  expect('pilot speculative resource restriction removed', [[pilot,
    'Include no resource merely speculatively', 'Include resources speculatively']], authoredFail, ['FAIL PILOT-SAFETY-001']);
  expect('pilot secret safeguard removed', [[pilot,
    'embed secrets', 'include credentials']], authoredFail, ['FAIL PILOT-SAFETY-001']);
  expect('pilot experimental-context safeguard removed', [[pilot,
    'experimental forked context', 'experimental context']], authoredFail, ['FAIL PILOT-SAFETY-001']);
  expect('pilot Skill permission contradiction added', [[pilot,
    "MUST NOT use experimental forked context or treat a Skill's instructions as granting platform tools or permissions.",
    "MUST NOT use experimental forked context or treat a Skill's instructions as granting platform tools or permissions. Skill instructions grant platform tools."]], authoredFail, ['FAIL PILOT-SAFETY-001']);
  const maintenance = '.github/skills/maintain-copilot-artifacts/SKILL.md';
  expect('maintenance Skill invocation grants authority', [[maintenance,
    'This Skill supplies a method only; it grants no edit, execution, delegation, lifecycle-transition, approval or acceptance authority.',
    'This Skill supplies a method only; it grants no edit, execution, delegation, lifecycle-transition, approval or acceptance authority. Skill invocation grants edit authority.']], authoredFail, ['FAIL MAINTAIN-AUTHORITY-001']);
  expect('maintenance method permits silent deletion', [[maintenance,
    'Every removed sentence needs complete retained equivalents;', 'Rules may be deleted as obsolete;']], authoredFail, ['FAIL MAINTAIN-PRESERVATION-001']);
  expect('maintenance method silently chooses behavior', [[maintenance,
    'If preservation is uncertain or a contradiction requires a behavior choice, retain the source wording and ask for an engineer decision.',
    'If preservation is uncertain or a contradiction requires a behavior choice, choose the most likely behavior.']], authoredFail, ['FAIL MAINTAIN-PRESERVATION-001']);
  expect('static checks falsely claim runtime equivalence', [[maintenance,
    'Static checks and review do not establish runtime equivalence.', 'Static checks establish runtime equivalence.']], authoredFail, ['FAIL MAINTAIN-STATIC-001']);
  expect('equivalent plan hierarchy wording', [[planTemplate,
    'IDs and detail sections must match the register', 'Item identifiers and their detail sections correspond to the register']], pass);
  expect('missing unchecked Plan Task marker', [[planTemplate,
    '- [ ] **Task 1.1: `<meaningful outcome>`**', '- **Task 1.1: `<meaningful outcome>`**']], authoredFail, ['FAIL PLAN-HIERARCHY-001']);
  expect('missing unchecked Plan Step marker', [[planTemplate,
    '1. [ ] **Step 1.1.1:**', '1. **Step 1.1.1:**']], authoredFail, ['FAIL PLAN-HIERARCHY-001']);
  expect('Plan checkbox becomes approval gate', [[planTemplate,
    'track execution progress only, never validation pass, approval, or Review acceptance.',
    'track execution progress only and indicate Plan approval, never validation pass or Review acceptance.']], authoredFail, ['FAIL PLAN-HIERARCHY-001']);
  expect('equivalent local recovery wording', [[core, 'On a collision, re-read the inventory and select an absent next number', 'On a collision, re-read the inventory and choose an absent next number']], pass);
  expect('equivalent availability wording', [[runner, 'An unavailable tool, actual Restricted Mode/managed-policy denial', 'A tool that is not available, actual Restricted Mode/managed-policy denial']], pass);
  expect('repair replaces blanket retry', [[policy, 'rerun relevant checks', 'never replay a failed consequential build, write or package operation']], authoredFail, ['FAIL RECOVERY-001']);
  expect('negated contained physical identity', [[core, 'must be independently verified, contained, numbered physical Markdown records', 'need not be independently verified, contained, numbered physical Markdown records']], authoredFail, ['FAIL IDENTITY-001']);
  expect('collision overwrite', [[core, 'save only an absent exact candidate', 'save to an existing candidate']], authoredFail, ['FAIL IDENTITY-002']);
  expect('denial bypass', [[policy, 'A real platform denial cannot be evaded by another route.', 'A real platform denial can be evaded by another route.']], authoredFail, ['FAIL RECOVERY-001']);
  expect('additive denial bypass in owner', [[policy, 'A real platform denial cannot be evaded by another route.', 'A real platform denial cannot be evaded by another route. A real platform denial can be evaded by another route.']], authoredFail, ['FAIL RECOVERY-001']);
  expect('additive uncertain effect repetition in Runner', [[runner, 'Do not blindly repeat an uncertain destructive/external effect', 'Do not blindly repeat an uncertain destructive/external effect; may blindly repeat an uncertain destructive/external effect']], authoredFail, ['FAIL RUNNER-001']);
  expect('additive Review source edit permission', [[review, 'Review and its Correctness, Security and Maintainability reviewers remain source-read-only.', 'Review and its Correctness, Security and Maintainability reviewers remain source-read-only. Review may edit source.']], authoredFail, ['FAIL REVIEW-001']);
  expect('equivalent Review source edit safeguard', [[review, 'Review and its Correctness, Security and Maintainability reviewers remain source-read-only.', 'Review and its Correctness, Security and Maintainability reviewers remain source-read-only; no implementation edits.']], pass);
  expect('Review cannot self-accept', [[review, 'Unresolved findings prohibit acceptance', 'Review can self-accept. Unresolved findings prohibit acceptance']], authoredFail, ['FAIL REVIEW-001']);
  expect('preserve user edits despite destructive permission', [[policy, 'Report partial delivery as a checkpoint, not success.', 'Report partial delivery as a checkpoint, not success. Implement may overwrite user edits.']], authoredFail, ['FAIL RECOVERY-002']);
  expect('invented successful execution', [[policy, 'Report partial delivery as a checkpoint, not success.', 'Report partial delivery as a checkpoint, not success. Implement may claim unperformed checks as passed.']], authoredFail, ['FAIL RECOVERY-002']);
  expect('weakened criteria', [[policy, 'Report partial delivery as a checkpoint, not success.', 'Report partial delivery as a checkpoint, not success. Implement may weaken original acceptance criteria.']], authoredFail, ['FAIL RECOVERY-002']);
  expect('guessed permission', [[runner, 'Native Windows is not a sandbox.', 'Native Windows is not a sandbox. Runner may assume permission without evidence.']], authoredFail, ['FAIL PERMISSION-001']);
  const implementationSkill = '.github/skills/safe-implementation/SKILL.md';
  expect('fabricated persistence', [[implementationSkill, 'A failed save is not persisted evidence.', 'A failed save is not persisted evidence. Implement may claim a failed save as persisted.']], authoredFail, ['FAIL RECORD-002']);
  const planningSkill = '.github/skills/architecture-planning/SKILL.md';
  expect('nonphysical Plan output', [[planningSkill, 'A non-local draft or locator is not a substitute', 'A non-local draft or locator is a substitute']], authoredFail, ['FAIL PLANNING-001']);
  expect('invented planning answers', [[planningSkill, 'Do not invent a target, design, rule, dependency, validation condition or operator choice.', 'Do not invent a target, design, rule, dependency, validation condition or operator choice. Plan may invent an answer for an unresolved decision.']], authoredFail, ['FAIL PLANNING-001']);
  expect('projected worker files are not an exhaustive whitelist', [], pass);
  expect('worker ignores explicit restriction', [['.github/agents/implementation-worker.agent.md', 'Honor any explicit delegation restriction', 'Ignore any explicit delegation restriction']], authoredFail, ['FAIL WORKER-001']);
  expect('required status gate', [['.github/prompts/plan.prompt.md', 'Status is optional bookkeeping, not a transition gate', 'Status write is mandatory before a transition']], authoredFail, ['FAIL STATUS-001']);
  expect('broken Validation Worker fragment', [['.github/agents/validation-worker.agent.md', 'validation-checklist.md#read-only-validation-worker', 'validation-checklist.md#validation-worker-read-only-structural-checks']], authoredFail, ['FAIL FRAGMENT-001']);
  expect('lost material boundary', [[review, 'Material new requirements, public behavior, dependencies, security/compatibility commitments or external effects require an engineer choice and a Plan-owned amendment/new Plan', 'Material new requirements may be implemented without a decision']], authoredFail, ['FAIL REVIEW-001']);
  expect('lost clean acceptance guard', [[review, 'Unresolved findings prohibit acceptance', 'Unresolved findings permit acceptance']], authoredFail, ['FAIL REVIEW-001']);
  const researchAgent = '.github/agents/research.agent.md';
  expect('equivalent detailed-request acknowledgment wording', [[researchAgent,
    'A detailed prompt is not a bypass; do not repeat facts already supplied.',
    'Even a comprehensive request still receives a confirm/correct readback; rely on details already given instead of re-asking.'
  ]], pass);
  expect('Research question method reduced to a reference', [[researchAgent,
    'load and apply [agent-question-resolution]', 'refer to [agent-question-resolution]'
  ]], authoredFail, ['FAIL RESEARCH-INTENT-001']);
  expect('additive detailed-request acknowledgment bypass', [[researchAgent,
    'A detailed prompt is not a bypass; do not repeat facts already supplied.',
    'A detailed prompt is not a bypass; do not repeat facts already supplied. A clear request proceeds without a compulsory confirmation checkpoint.'
  ]], authoredFail, ['FAIL RESEARCH-INTENT-001']);
  const questionSkill = '.github/skills/agent-question-resolution/SKILL.md';
  expect('Research deferral is resisted by shared method', [[questionSkill,
    'honor that direction without duplicate confirmation or a repeated checkpoint.',
    'resist that direction and require duplicate confirmation.'
  ]], authoredFail, ['FAIL QUESTIONS-METHOD-001']);
  const questionTemplate = '.github/skills/agent-question-resolution/templates/clarification-message.md';
  expect('clear-request exemption added to shared template', [[questionTemplate,
    'Silence, uncertainty, or a clear prompt is not deferral.',
    'Silence, uncertainty, or a clear prompt is not deferral. A clear Research request needs no confirmation.'
  ]], authoredFail, ['FAIL QUESTIONS-METHOD-001']);
  const researchDiscovery = '.github/skills/agent-question-resolution/references/research-intent-discovery.md';
  expect('discovery resource loses honored-deferral safeguards', [[researchDiscovery,
    'Do not resist, demand a second confirmation, repeatedly re-present the deferred checkpoint, call deferral confirmation, or infer it from silence, uncertainty, passive non-response, or prompt clarity.',
    'Defer acknowledgment.'
  ]], authoredFail, ['FAIL RESEARCH-DISCOVERY-001']);
  expect('repository policy makes acknowledgment a Plan gate', [[policy,
    'This is not a gate on `/plan`, and does not alter other phases\' contextual material clarification.',
    'Acknowledgment is a prerequisite for `/plan`, and does not alter other phases\' contextual material clarification.'
  ]], authoredFail, ['FAIL RESEARCH-POLICY-001']);
  expect('lifecycle core restores clear-request exemption', [[core,
    'For every new Research objective, the coordinator normally obtains explicit confirm/correct acknowledgment before broad intent-dependent investigation, including for detailed prompts;',
    'For every new Research objective, clear requests need no acknowledgment before broad intent-dependent investigation, including for detailed prompts;'
  ]], authoredFail, ['FAIL RESEARCH-CORE-001']);
  expect('lifecycle records adds contradictory no-confirmation rule', [['.github/instructions/lifecycle-records.instructions.md',
    'even when the prompt is detailed. Honor explicit engineer direction',
    'even when the prompt is detailed. Clear Research requests need no confirmation. Honor explicit engineer direction'
  ]], authoredFail, ['FAIL RESEARCH-RECORDS-001']);
  expect('brief no longer records actual deferral', [['.github/skills/codebase-research/research-brief-template.md',
    '- **Acknowledgment or deferral:** `<confirmed/corrected interpretation, or actual explicit engineer-directed deferral with its scope/timing; never label provisional understanding confirmed>`.',
    '- **Acknowledgment or deferral:** `<status>`.'
  ]], authoredFail, ['FAIL RESEARCH-BRIEF-001']);
  expect('assurance rejects honored provisional deferral', [['.github/skills/rpir-stage-assurance/stage-assurance-checklist.md',
    'truthfully provisional brief is not rejected solely for deferral.',
    'truthfully provisional brief is rejected solely for deferral.'
  ]], authoredFail, ['FAIL RESEARCH-ASSURANCE-001']);
  expect('parity plus authored failure', [
    ['package.json', '"path": ".github/prompts/review.prompt.md"', '"path": ".github/prompts/ghost.prompt.md"'],
    [core, 'save only an absent exact candidate', 'save to an existing candidate'],
    [review, 'Unresolved findings prohibit acceptance', 'Unresolved findings permit acceptance']
  ], ['FAIL', 'FAIL', 'PASS'], ['FAIL PARITY-001', 'FAIL IDENTITY-002', 'FAIL REVIEW-001']);
  expect('authored plus reviewer tool breach', [
    [review, 'Unresolved findings prohibit acceptance', 'Unresolved findings permit acceptance'],
    [review, "tools: ['read', 'search', 'edit', 'agent']", "tools: ['read', 'search', 'edit', 'agent', 'runInTerminal']"]
  ], ['PASS', 'FAIL', 'FAIL'], ['FAIL REVIEW-001', 'FAIL STRUCT-AGENT']);
  for (const [kind, replacement, bootstrapInvocation] of [
    ['syntax-invalid', '    !!!,', true], ['schema-invalid', '    null,', false]
  ]) {
    const broken = ['package.json', '    "package.json",', replacement];
    const unavailable = ['NOT RUN PARITY-INPUT-MANIFEST', 'NOT RUN CI-001', 'NOT RUN PACKAGE-001'];
    expect(`${kind} manifest alone`, [broken], ['NOT RUN', 'NOT RUN', 'PASS'], unavailable, bootstrapInvocation);
    expect(`${kind} manifest plus Review violation`, [broken,
      [review, 'Unresolved findings prohibit acceptance', 'Unresolved findings permit acceptance']
    ], ['NOT RUN', 'FAIL', 'PASS'], [...unavailable, 'FAIL REVIEW-001'], bootstrapInvocation);
    expect(`${kind} manifest plus Review and structural violation`, [broken,
      [review, 'Unresolved findings prohibit acceptance', 'Unresolved findings permit acceptance'],
      [review, "tools: ['read', 'search', 'edit', 'agent']", "tools: ['read', 'search', 'edit', 'agent', 'runInTerminal']"]
    ], ['NOT RUN', 'FAIL', 'FAIL'], [...unavailable, 'FAIL REVIEW-001', 'FAIL STRUCT-AGENT'], bootstrapInvocation);
  }
  expect('wrong remediation route', [['.github/prompts/remediate-review.prompt.md', 'agent: Implement', 'agent: Plan']], ['PASS', 'PASS', 'FAIL'], ['FAIL STRUCT-PROMPT']);
  expect('worker terminal removed', [['.github/agents/implementation-worker.agent.md', "tools: ['read', 'search', 'edit', 'runInTerminal']", "tools: ['read', 'search', 'edit']"]], ['PASS', 'PASS', 'FAIL'], ['FAIL STRUCT-AGENT .github/agents/implementation-worker.agent.md']);
  expect('worker cannot delegate', [['.github/agents/implementation-worker.agent.md', 'user-invocable: false', "user-invocable: false\nagents: ['Script Runner']"]], ['PASS', 'PASS', 'FAIL'], ['FAIL STRUCT-AGENT .github/agents/implementation-worker.agent.md']);
  const reviewNewline = fs.readFileSync(staged(review), 'utf8').includes('\r\n') ? '\r\n' : '\n';
  expect('review manual handoff becomes automatic', [[review,
    `    send: false${reviewNewline}  - label: Plan material Review scope`,
    `    send: true${reviewNewline}  - label: Plan material Review scope`
  ]], ['PASS', 'PASS', 'FAIL'], ['FAIL STRUCT-AGENT']);
  expect('duplicate handoff key', [[review, `    send: false${reviewNewline}  - label: Plan material Review scope`, `    send: false${reviewNewline}    send: false${reviewNewline}  - label: Plan material Review scope`]], ['PASS', 'PASS', 'FAIL'], ['FAIL STRUCT-AGENT']);
  expect('unsupported handoff key', [[review, `    send: false${reviewNewline}  - label: Plan material Review scope`, `    send: false${reviewNewline}    extra: unsafe${reviewNewline}  - label: Plan material Review scope`]], ['PASS', 'PASS', 'FAIL'], ['FAIL STRUCT-AGENT']);
  expect('Review delegates Implement', [[review, "agents: ['Correctness Reviewer', 'Security Reviewer', 'Maintainability Reviewer', 'Stage Assurance', 'Script Runner']", "agents: ['Correctness Reviewer', 'Security Reviewer', 'Maintainability Reviewer', 'Stage Assurance', 'Script Runner', 'Implement']"]], ['PASS', 'PASS', 'FAIL'], ['FAIL STRUCT-AGENT']);
  expect('Review delegates Implementation Worker', [[review, "agents: ['Correctness Reviewer', 'Security Reviewer', 'Maintainability Reviewer', 'Stage Assurance', 'Script Runner']", "agents: ['Correctness Reviewer', 'Security Reviewer', 'Maintainability Reviewer', 'Stage Assurance', 'Script Runner', 'Implementation Worker']"]], ['PASS', 'PASS', 'FAIL'], ['FAIL STRUCT-AGENT']);
  expect('duplicate Review delegate', [[review, "'Stage Assurance', 'Script Runner']", "'Stage Assurance', 'Script Runner', 'Script Runner']"]], ['PASS', 'PASS', 'FAIL'], ['FAIL STRUCT-AGENT']);
  expect('unknown Review delegate', [[review, "'Stage Assurance', 'Script Runner'", "'Stage Assurance', 'Script Runner', 'Unknown Worker']"]], ['PASS', 'PASS', 'FAIL'], ['FAIL STRUCT-AGENT']);
  for (const trigger of ['push', 'pull_request']) {
    const original = fs.readFileSync(staged(workflow), 'utf8');
    const newline = original.includes('\r\n') ? '\r\n' : '\n';
    const marker = trigger === 'push' ? '  pull_request:' : `${newline}permissions:`;
    const start = original.indexOf(`  ${trigger}:`), end = original.indexOf(marker, start + 1);
    assert.ok(start >= 0 && end > start, `missing ${trigger} trigger`);
    const block = original.slice(start, end);
    const damaged = block.replace(`      - scripts/test-copilot-contract-scenarios.cjs${newline}`, '');
    assert.notEqual(block, damaged, `missing ${trigger} scenario filter`);
    expect(`${trigger} trigger omits scenarios`, [[workflow, block, damaged]], authoredFail, ['FAIL CI-002']);
    const noPolicy = block.replace(`      - .github/copilot-instructions.md${newline}`, '');
    assert.notEqual(block, noPolicy);
    expect(`${trigger} trigger omits root policy`, [[workflow, block, noPolicy]], authoredFail, ['FAIL CI-002']);
    const noHelper = block.replace(`      - scripts/check-copilot-workflow.cjs${newline}`, '');
    assert.notEqual(block, noHelper);
    expect(`${trigger} trigger omits shared workflow helper`, [[workflow, block, noHelper]], authoredFail, ['FAIL CI-002']);
  }
  expect('scenario CI route removed', [[workflow, 'run: node scripts/test-copilot-contract-scenarios.cjs', 'run: echo disabled']], authoredFail, ['FAIL CI-002']);
  const workflowNewline = fs.readFileSync(staged(workflow), 'utf8').includes('\r\n') ? '\r\n' : '\n';
  const extraJob = `  extra:${workflowNewline}    runs-on: ubuntu-latest${workflowNewline}    steps:${workflowNewline}      - run: npm run package${workflowNewline}`;
  expect('extra CI packaging route', [[workflow, `  package:${workflowNewline}`, `${extraJob}  package:${workflowNewline}`]], authoredFail, ['FAIL CI-002']);
  expect('disabled scenario job', [[workflow, `  scenarios:${workflowNewline}`, `  scenarios:${workflowNewline}    if: false${workflowNewline}`]], authoredFail, ['FAIL CI-002']);
  expect('packaging step in check job', [[workflow, '        run: node scripts/verify-copilot-contracts.cjs', `        run: node scripts/verify-copilot-contracts.cjs${workflowNewline}      - run: npm run package`]], authoredFail, ['FAIL CI-002']);
  expect('dependent scenario job', [[workflow, `  scenarios:${workflowNewline}`, `  scenarios:${workflowNewline}    needs: contracts${workflowNewline}`]], authoredFail, ['FAIL CI-002']);
  expect('conditional required step', [[workflow, '        run: node scripts/verify-vsix-packaging-guide.cjs', `        if: false${workflowNewline}        run: node scripts/verify-vsix-packaging-guide.cjs`]], authoredFail, ['FAIL CI-002']);
  expect('unsupported shell composition', [[workflow, '        run: node scripts/verify-vsix-packaging-guide.cjs', '        run: node scripts/verify-vsix-packaging-guide.cjs; npm run package']], authoredFail, ['FAIL CI-002']);
  expect('unsupported YAML indirection', [[workflow, `  scenarios:${workflowNewline}    runs-on: ubuntu-latest`, `  scenarios:${workflowNewline}    runs-on: &runner ubuntu-latest`]], authoredFail, ['FAIL CI-002']);
  expect('masked guide failure', [[workflow, `  guide:${workflowNewline}`, `  guide:${workflowNewline}    continue-on-error: true${workflowNewline}`]], authoredFail, ['FAIL CI-002']);
  expect('packaging hold removed', [[workflow, 'if: false # Release hold:', 'if: true # Release hold:']], authoredFail, ['FAIL CI-002']);
  expect('scenario npm script removed', [['package.json', '"test-copilot-contract-scenarios": "node scripts/test-copilot-contract-scenarios.cjs"', '"test-copilot-contract-scenarios": "echo disabled"']], authoredFail, ['FAIL CI-001']);
  const discoverText = fs.readFileSync(staged('scripts/discover-copilot-artifacts.cjs'), 'utf8');
  const discoveryNewline = discoverText.includes('\r\n') ? '\r\n' : '\n';
  expect('unavailable discovery preserves authored checks', [['scripts/discover-copilot-artifacts.cjs',
    `function discoverFiles(definition) {${discoveryNewline}  const base = path.join(root, definition.directory);`,
    `function discoverFiles(definition) {${discoveryNewline}  const base = path.join(root, '.github', 'missing-rpir-discovery-root');`]],
    ['NOT RUN', 'PASS', 'NOT RUN'], ['NOT RUN PARITY-INPUT-DISCOVERY', 'NOT RUN STRUCT-INPUT-DISCOVERY']);
  const nested = path.join(temp, '.github', 'skills', 'test-design', '.rpir-case-nested');
  plain(path.dirname(nested)); fs.mkdirSync(nested);
  const originalSkill = fs.readFileSync(staged('.github/skills/test-design/SKILL.md'), 'utf8');
  assert.equal(originalSkill.split('name: test-design').length - 1, 1);
  const nestedSkill = originalSkill.replace('name: test-design', 'name: test-design-rpir-case-nested')
    .replaceAll('(./test-matrix-template.md)', '(../test-matrix-template.md)');
  assert.ok(fs.statSync(path.join(nested, '..', 'test-matrix-template.md')).isFile());
  fs.writeFileSync(path.join(nested, 'SKILL.md'), nestedSkill, { flag: 'wx' });
  plain(temp);
  const discovery = spawnSync(process.execPath, ['scripts/discover-copilot-artifacts.cjs'], { cwd: temp, encoding: 'utf8' });
  assert.equal(discovery.status, 0, `nested discovery: ${discovery.stderr}`);
  assert.ok(JSON.parse(discovery.stdout).chatSkills.includes('.github/skills/test-design/.rpir-case-nested'));
  expect('nested uppercase skill discovered but not in manifest', [], ['FAIL', 'PASS', 'PASS'], ['FAIL PARITY-001']);
  const guideText = fs.readFileSync(staged('docs/run-books/vsix-packaging.md'), 'utf8');
  guideCase('healthy direct guide', [], null);
  guideCase('malformed metadata JSON', [['docs/run-books/vsix-packaging.md', '"id": "toolkit-verify-copilot-contracts"', '"id": !!!']], 'Guide metadata is not valid JSON');
  const firstClassification = guideText.match(/"id": "toolkit-verify-copilot-contracts"[\s\S]*?"classification": "read-only"/)[0];
  guideCase('metadata schema regression', [['docs/run-books/vsix-packaging.md', firstClassification,
    firstClassification.replace('"classification": "read-only"', '"classification": "unsafe"')]], 'unexpected classification');
  const firstId = '"id": "toolkit-verify-copilot-contracts"';
  guideCase('metadata operation identity', [['docs/run-books/vsix-packaging.md', firstId, '"id": "toolkit-ghost"']], 'unexpected id');
  guideCase('metadata field order', [['docs/run-books/vsix-packaging.md', firstClassification,
    firstClassification.replace(/("id": "toolkit-verify-copilot-contracts")(,\s*)("classification": "read-only")/, '$3$2$1')]], 'invalid metadata schema or field order');
  const lastOperation = guideText.match(/,\s*\{\s*"id": "toolkit-verify-vsix-boundary"[\s\S]*?\}\s*\]/)[0];
  guideCase('metadata count', [['docs/run-books/vsix-packaging.md', lastOperation, ']']], 'exactly six operations');
  const firstStop = guideText.match(/"id": "toolkit-verify-copilot-contracts"[\s\S]*?"stopBehavior": "[^"]+"/)[0];
  guideCase('regressed stop behavior', [['docs/run-books/vsix-packaging.md', firstStop,
    firstStop.replace('correct a permitted local cause and rerun relevant checks', 'ignore local failure and proceed')]], 'unexpected stopBehavior');
  guideCase('scenario package interface removed', [['package.json', '"test-copilot-contract-scenarios": "node scripts/test-copilot-contract-scenarios.cjs"', '"test-copilot-contract-scenarios": "echo disabled"']], 'scripts.test-copilot-contract-scenarios');
  const retentionLine = 'console.log(`Retained staging tree (no deletion): ' + '${temp}`);';
  guideCase('scenario script interface removed', [['scripts/test-copilot-contract-scenarios.cjs', retentionLine, 'console.log(`Discarded staging tree: ${temp}`);']], 'Scenario script loses its reviewed');
  guideCase('unsafe CI packaging route', [[workflow, `  package:${workflowNewline}`, `${extraJob}  package:${workflowNewline}`]], 'unexpected workflow jobs or execution route');
  guideCase('CI hold lifted', [[workflow, 'if: false # Release hold:', 'if: true # Release hold:']], 'unsupported or unsafe package job/step structure');
} finally {
  for (const [relative, { before, after }] of pending) {
    try {
      const full = staged(relative);
      assert.equal(fs.readFileSync(full, 'utf8'), after, 'unexpected staged postimage');
      fs.writeFileSync(full, before);
      assert.equal(fs.readFileSync(full, 'utf8'), before, 'restoration failed');
      console.error(`Restored staged mutation: ${full}`);
    } catch (error) { process.exitCode = 1; console.error(`Cannot safely restore ${relative}: ${error.message}`); }
  }
  console.log(`Retained staging tree (no deletion): ${temp}`);
  console.log(`Staged files mutated: ${[...touched].sort().join(', ') || 'none'}`);
  try {
    const items = inventory();
    console.log(`Retained artifacts (${items.length} entries, ${bytes} file bytes):\n${items.join('\n')}`);
  } catch (error) { process.exitCode = 1; console.error(`Cannot inventory retained tree: ${error.message}`); }
}
