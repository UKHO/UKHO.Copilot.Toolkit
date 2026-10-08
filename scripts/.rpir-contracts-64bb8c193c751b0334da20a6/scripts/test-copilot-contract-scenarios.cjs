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
  const diagnostics = [...output.matchAll(/^DIAGNOSTIC (FAIL|NOT RUN) ([A-Z][A-Z0-9-]+)(?: ([^:\r\n]+))?:/gm)]
    .map((match) => [match[1], match[2], match[3] || '']);
  assert.equal((output.match(/^DIAGNOSTIC /gm) || []).length, diagnostics.length, `unparsed diagnostic: ${output}`);
  return { status: result.status, summaries, diagnostics, output };
}
const owners = {
  'RECOVERY-001': '.github/copilot-instructions.md', 'IDENTITY-001': '.github/skills/rpir-lifecycle-core/SKILL.md',
  'IDENTITY-002': '.github/skills/rpir-lifecycle-core/SKILL.md', 'REVIEW-001': '.github/agents/review.agent.md',
  'QUESTIONS-001': '.github/agents/research.agent.md', 'RUNNER-001': '.github/agents/script-runner.agent.md',
  'CI-001': 'package.json', 'CI-002': '.github/workflows/package.yml', 'PACKAGE-001': 'package.json',
  'PARITY-001': 'package.json', 'PARITY-INPUT-MANIFEST': 'package.json',
  'STRUCT-AGENT': '', 'STRUCT-PROMPT': ''
};
function diagnosticSet(result, expected, label) {
  const tuples = expected.map((item) => {
    const match = item.match(/^(FAIL|NOT RUN) ([A-Z][A-Z0-9-]+)$/);
    assert.ok(match && Object.hasOwn(owners, match[2]), `${label}: unknown expected diagnostic ${item}`);
    return [match[1], match[2], owners[match[2]]];
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
const pass = ['PASS', 'PASS', 'PASS'];
const authoredFail = ['PASS', 'FAIL', 'PASS'];
const core = '.github/skills/rpir-lifecycle-core/SKILL.md';
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
    const names = ['research-brief', 'implementation-plan', 'implementation-report', 'review-report'];
    names.forEach((name, index) => {
      const predecessor = index ? `[Predecessor](001-${names[index - 1]}.md)` : 'Initial Research, no predecessor';
      fs.writeFileSync(path.join(folder, `001-${name}.md`), `# Synthetic ${name}\n\n${predecessor}\n`, { flag: 'wx' });
    });
  };
  record('planning', '001-legacy-fixture');
  record('delivery', '001-legacy-fixture');
  record('copilot', '001-current-fixture');
  expect('strict healthy baseline and synthetic legacy/current records', [], pass);
  expect('equivalent local recovery wording', [[core, 'On a collision, re-read the inventory and select an absent next number', 'On a collision, re-read the inventory and choose an absent next number']], pass);
  expect('equivalent availability wording', [[runner, 'An unavailable tool, actual Restricted Mode/managed-policy denial', 'A tool that is not available, actual Restricted Mode/managed-policy denial']], pass);
  expect('repair replaces blanket retry', [[policy, 'rerun relevant checks', 'never replay a failed consequential build, write or package operation']], authoredFail, ['FAIL RECOVERY-001']);
  expect('negated contained physical identity', [[core, 'must be independently verified, contained, numbered physical Markdown records', 'need not be independently verified, contained, numbered physical Markdown records']], authoredFail, ['FAIL IDENTITY-001']);
  expect('collision overwrite', [[core, 'save only an absent exact candidate', 'save to an existing candidate']], authoredFail, ['FAIL IDENTITY-002']);
  expect('denial bypass', [[policy, 'A real platform denial cannot be evaded by another route.', 'A real platform denial can be evaded by another route.']], authoredFail, ['FAIL RECOVERY-001']);
  expect('lost material boundary', [[review, 'Material new requirements, public behavior, dependencies, security/compatibility commitments or external effects require an engineer choice and a Plan-owned amendment/new Plan', 'Material new requirements may be implemented without a decision']], authoredFail, ['FAIL REVIEW-001']);
  expect('lost clean acceptance guard', [[review, 'Unresolved findings prohibit acceptance', 'Unresolved findings permit acceptance']], authoredFail, ['FAIL REVIEW-001']);
  expect('forced Research confirmation', [['.github/agents/research.agent.md', 'A clear request proceeds without a compulsory confirmation checkpoint', 'A clear request waits for an explicit confirmation checkpoint']], authoredFail, ['FAIL QUESTIONS-001']);
  expect('two independent authored violations', [
    [core, 'save only an absent exact candidate', 'save to an existing candidate'],
    [review, 'Unresolved findings prohibit acceptance', 'Unresolved findings permit acceptance']
  ], authoredFail, ['FAIL IDENTITY-002', 'FAIL REVIEW-001']);
  expect('parity plus authored failure', [
    ['package.json', '"path": ".github/prompts/review.prompt.md"', '"path": ".github/prompts/ghost.prompt.md"'],
    [review, 'Unresolved findings prohibit acceptance', 'Unresolved findings permit acceptance']
  ], ['FAIL', 'FAIL', 'PASS'], ['FAIL PARITY-001', 'FAIL REVIEW-001']);
  expect('authored plus reviewer tool breach', [
    [review, 'Unresolved findings prohibit acceptance', 'Unresolved findings permit acceptance'],
    [review, "tools: ['read', 'search', 'edit', 'agent']", "tools: ['read', 'search', 'edit', 'agent', 'runInTerminal']"]
  ], ['PASS', 'FAIL', 'FAIL'], ['FAIL REVIEW-001', 'FAIL STRUCT-AGENT']);
  // Keep the staged package parseable for Node's module loader while making
  // the manifest schema invalid for the verifier's dependency-scoped checks.
  expect('invalid manifest files entry leaves independent authored and structural checks reachable', [
    ['package.json', '    "package.json",', '    null,'],
    [review, 'Unresolved findings prohibit acceptance', 'Unresolved findings permit acceptance']
  ], ['NOT RUN', 'FAIL', 'PASS'], ['NOT RUN PARITY-INPUT-MANIFEST', 'FAIL REVIEW-001']);
  expect('wrong remediation route', [['.github/prompts/remediate-review.prompt.md', 'agent: Implement', 'agent: Plan']], ['PASS', 'PASS', 'FAIL'], ['FAIL STRUCT-PROMPT']);
  expect('worker terminal removed', [['.github/agents/implementation-worker.agent.md', "tools: ['read', 'search', 'edit', 'runInTerminal']", "tools: ['read', 'search', 'edit']"]], ['PASS', 'PASS', 'FAIL'], ['FAIL STRUCT-AGENT']);
  const reviewNewline = fs.readFileSync(staged(review), 'utf8').includes('\r\n') ? '\r\n' : '\n';
  expect('review manual handoff becomes automatic', [[review,
    `    send: false${reviewNewline}  - label: Plan material Review scope`,
    `    send: true${reviewNewline}  - label: Plan material Review scope`
  ]], ['PASS', 'PASS', 'FAIL'], ['FAIL STRUCT-AGENT']);
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
  }
  expect('scenario CI route removed', [[workflow, 'run: node scripts/test-copilot-contract-scenarios.cjs', 'run: echo disabled']], authoredFail, ['FAIL CI-002']);
  expect('packaging hold removed', [[workflow, 'if: false # Release hold:', 'if: true # Release hold:']], authoredFail, ['FAIL CI-002']);
  expect('scenario npm script removed', [['package.json', '"test-copilot-contract-scenarios": "node scripts/test-copilot-contract-scenarios.cjs"', '"test-copilot-contract-scenarios": "echo disabled"']], authoredFail, ['FAIL CI-001']);
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
