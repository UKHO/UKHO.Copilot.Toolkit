'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { runSuite } = require('../scripts/test-run-lifecycle.cjs');
if (process.env.TOOLKIT_TEST_RUN_CHILD !== '1') {
  process.exitCode = runSuite('test-run-lifecycle', __filename);
} else {
const { markTestStarted, registerTestCompletion } = require('../scripts/test-run-lifecycle.cjs');
registerTestCompletion();

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ukho-test-lifecycle-'));
const scripts = path.join(tempRoot, 'fixtures');
const staging = path.join(tempRoot, '.test-staging');
const runs = path.join(staging, 'runs');
fs.mkdirSync(scripts);
const script = path.join(scripts, 'fixture.cjs');

function fixture(exitCode = 0, output = 'fixture passed', diagnostic = 'fixture diagnostic', delay = 0) {
  const lifecyclePath = JSON.stringify(path.resolve(__dirname, '../scripts/test-run-lifecycle.cjs'));
  fs.writeFileSync(script, `const { markTestStarted, registerTestCompletion } = require(${lifecyclePath}); registerTestCompletion(); markTestStarted(); const finish = () => { console.log(${JSON.stringify(output)}); console.error(${JSON.stringify(diagnostic)}); process.exitCode = ${exitCode}; }; ${delay ? `setTimeout(finish, ${delay});` : 'finish();'}\n`, { flag: 'w' });
}
function readJson(full) { return JSON.parse(fs.readFileSync(full, 'utf8')); }
function latest() { return readJson(path.join(staging, 'latest.json')); }
function run(name = 'fixture') { return runSuite(name, script, { root: tempRoot }); }
function exitedPid() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['-e', '']);
    child.once('error', reject);
    child.once('close', () => resolve(child.pid));
  });
}
function ownedPrior(id, pid, outcome = 'passed') {
  const folder = path.join(runs, id);
  fs.mkdirSync(folder);
  fs.writeFileSync(path.join(folder, 'owner.json'), `${JSON.stringify({ schema: 1, owner: 'UKHO.Copilot.Toolkit test-run lifecycle', runId: id, suite: 'prior', pid, state: id === 'active-sibling' ? 'active' : 'completed' })}\n`);
  fs.writeFileSync(path.join(folder, 'summary.json'), `${JSON.stringify({ runId: id, testOutcome: outcome })}\n`);
  fs.writeFileSync(path.join(folder, 'stdout.txt'), 'prior evidence');
  return folder;
}

async function runLifecycleCases() {
try {
  fixture(0, 'first run');
  markTestStarted();
  assert.equal(run('alpha'), 0, 'first completed suite should publish');
  const first = latest();
  const firstFolder = path.join(runs, first.runId);
  const firstSummary = readJson(path.join(firstFolder, 'summary.json'));
  assert.equal(firstSummary.testOutcome, 'passed');
  assert.equal(firstSummary.completed, true);
  assert.equal(firstSummary.testStarted, true);
  assert.equal(firstSummary.suite, 'alpha');
  assert.deepEqual(firstSummary.suitesNotRun, ['copilot-contract-scenarios', 'vsix-boundary', 'test-run-lifecycle']);
  assert.ok(firstSummary.startedAt && firstSummary.finishedAt);
  assert.equal(firstSummary.platform, `${process.platform}-${process.arch}`);
  assert.equal(firstSummary.restorationOutcome, 'completed; suite exited successfully after its restoration checks');
  assert.equal(firstSummary.failureDiagnostics.source, 'stderr.txt');
  assert.equal(firstSummary.failureDiagnostics.captured, true);
  assert.equal(fs.existsSync(path.join(firstFolder, 'test-started.json')), true);
  assert.equal(fs.existsSync(path.join(firstFolder, 'test-completed.json')), true);
  assert.equal(fs.readFileSync(path.join(firstFolder, 'stdout.txt'), 'utf8'), 'first run\n');
  assert.equal(fs.readFileSync(path.join(firstFolder, 'stderr.txt'), 'utf8'), 'fixture diagnostic\n');

  const collisionId = 'fixed-collision';
  const collisionFolder = path.join(runs, collisionId);
  fs.mkdirSync(collisionFolder);
  fs.writeFileSync(path.join(collisionFolder, 'do-not-overwrite.txt'), 'preserve collision target');
  const beforeCollision = latest();
  fixture(0, 'collision must not execute');
  assert.equal(runSuite('collision', script, { root: tempRoot, runId: collisionId }), 1, 'existing run identity is refused');
  assert.equal(latest().runId, beforeCollision.runId, 'collision preserves latest identity');
  assert.equal(fs.readFileSync(path.join(collisionFolder, 'do-not-overwrite.txt'), 'utf8'), 'preserve collision target');
  fs.rmSync(collisionFolder, { recursive: true, force: false });

  fixture(0, 'cross-suite run');
  assert.equal(run('beta'), 0, 'one different suite should replace the global prior run');
  const second = latest();
  assert.notEqual(second.runId, first.runId);
  assert.equal(fs.existsSync(firstFolder), false, 'older completed cross-suite result should be removed');

  fixture(7, 'completed failing run');
  assert.equal(run('beta'), 7, 'completed assertion failure remains the suite result');
  const failed = latest();
  const failedFolder = path.join(runs, failed.runId);
  const failedSummary = readJson(path.join(failedFolder, 'summary.json'));
  assert.equal(failedSummary.testOutcome, 'failed');
  assert.equal(failedSummary.testExitCode, 7);
  assert.equal(failedSummary.failureDiagnostics.exitCode, 7);
  assert.equal(fs.existsSync(path.join(runs, second.runId)), false, 'failing completed run replaces previous evidence');

  fixture(4, 'restoration failure', 'Cannot safely restore staged mutation');
  assert.equal(run('restoration-failure'), 4, 'restoration failure remains the original test outcome');
  const restorationRun = latest();
  const restorationSummary = readJson(path.join(runs, latest().runId, 'summary.json'));
  assert.equal(restorationSummary.testOutcome, 'failed');
  assert.equal(restorationSummary.restorationOutcome, 'unverified; inspect stderr.txt for suite-specific restoration outcomes');

  const inactiveA = ownedPrior('inactive-prior-a', 2147483000);
  const inactiveB = ownedPrior('inactive-prior-b', 2147483001, 'failed');
  fixture(0, 'multiple old results');
  assert.equal(run('archive-independent'), 0, 'one invocation should rotate multiple earlier owned runs');
  const multi = latest();
  assert.equal(fs.existsSync(inactiveA), false);
  assert.equal(fs.existsSync(inactiveB), false);
  assert.equal(fs.existsSync(failedFolder), false);
  const multiCleanup = readJson(path.join(runs, multi.runId, 'summary.json')).cleanup;
  assert.equal(multiCleanup.removed.length, 3);
  assert.ok(multiCleanup.removed.includes(restorationRun.runId));

  const unowned = path.join(runs, 'unowned-leftover');
  fs.mkdirSync(unowned);
  fs.writeFileSync(path.join(unowned, 'notes.txt'), 'unowned content');
  const unsupported = path.join(runs, 'unsupported-file-target');
  fs.writeFileSync(unsupported, 'preserve unexpected filesystem type');
  fixture(0, 'unowned sibling check');
  assert.equal(run('alpha'), 1, 'refused cleanup must not report an unqualified success');
  const withUnowned = latest();
  assert.equal(fs.readFileSync(path.join(unowned, 'notes.txt'), 'utf8'), 'unowned content');
  assert.equal(fs.readFileSync(unsupported, 'utf8'), 'preserve unexpected filesystem type');
  const incompleteCleanup = readJson(path.join(runs, withUnowned.runId, 'summary.json')).cleanup;
  assert.equal(incompleteCleanup.state, 'incomplete');
  assert.ok(incompleteCleanup.preserved.some((item) => item.runId === 'unowned-leftover'));
  assert.ok(incompleteCleanup.preserved.some((item) => item.runId === 'unsupported-file-target'));

  const active = ownedPrior('active-sibling', process.pid);
  fixture(0, 'active sibling check');
  assert.equal(run('beta'), 1, 'active sibling prevents an unqualified retention success');
  const withActive = latest();
  assert.equal(fs.existsSync(active), true);
  assert.ok(readJson(path.join(runs, withActive.runId, 'summary.json')).cleanup.preserved.some((item) => item.runId === 'active-sibling'));

  const beforeSetupFailure = latest();
  const missingScript = path.join(scripts, 'missing.cjs');
  assert.equal(runSuite('setup-failure', missingScript, { root: tempRoot }), 1);
  assert.equal(latest().runId, beforeSetupFailure.runId, 'failed invocation without replacement must preserve latest identity');
  const interrupted = fs.readdirSync(runs).map((name) => path.join(runs, name)).find((folder) => {
    try { return readJson(path.join(folder, 'owner.json')).suite === 'setup-failure'; } catch { return false; }
  });
  assert.ok(interrupted, 'interrupted setup evidence remains inspectable');
  assert.equal(readJson(path.join(interrupted, 'summary.json')).testOutcome, 'interrupted');
  fixture(0, 'recover interrupted owned result');
  assert.equal(run('interrupt-recovery'), 1, 'safe interrupted evidence can rotate while unowned and active siblings remain refused');
  const recovered = latest();
  assert.equal(fs.existsSync(interrupted), false, 'positively owned inactive interruption is cleaned after replacement');
  assert.equal(readJson(path.join(runs, recovered.runId, 'summary.json')).testOutcome, 'passed');

  const activeLock = path.join(staging, '.rotation-lock');
  fs.mkdirSync(activeLock);
  fs.writeFileSync(path.join(activeLock, 'owner.json'), JSON.stringify({ pid: process.pid, runId: 'other-active-run' }));
  const beforeLockRefusal = latest();
  assert.equal(run('lock-contention'), 1);
  assert.equal(latest().runId, beforeLockRefusal.runId, 'lock refusal does not replace latest');
  assert.equal(fs.existsSync(activeLock), true, 'unowned active lock is preserved');
  fs.rmSync(activeLock, { recursive: true, force: true });

  fixture(0, 'stale lock recovery');
  fs.mkdirSync(activeLock);
  fs.writeFileSync(path.join(activeLock, 'owner.json'), JSON.stringify({ pid: await exitedPid(), runId: 'interrupted-lock' }));
  assert.equal(run('stale-lock-recovery'), 1, 'stale lock can recover while unresolved siblings remain reported');
  assert.equal(fs.existsSync(activeLock), false, 'positively inactive owned lock is recovered');
  assert.equal(readJson(path.join(runs, latest().runId, 'summary.json')).suite, 'stale-lock-recovery');

  const concurrentRoot = path.join(tempRoot, 'concurrent-root');
  const concurrentScripts = path.join(concurrentRoot, 'fixtures');
  fs.mkdirSync(concurrentScripts, { recursive: true });
  const slowScript = path.join(concurrentScripts, 'slow.cjs');
  const lifecyclePath = JSON.stringify(path.resolve(__dirname, '../scripts/test-run-lifecycle.cjs'));
  fs.writeFileSync(slowScript, `const { markTestStarted, registerTestCompletion } = require(${lifecyclePath}); registerTestCompletion(); markTestStarted(); setTimeout(() => console.log('concurrent run finished'), 250);\n`);
  const runnerCode = `const { runSuite } = require(${lifecyclePath}); process.exitCode = runSuite('concurrent-first', ${JSON.stringify(slowScript)}, { root: ${JSON.stringify(concurrentRoot)} });`;
  const firstConcurrent = spawn(process.execPath, ['-e', runnerCode], { cwd: concurrentRoot, stdio: 'ignore' });
  const concurrentLock = path.join(concurrentRoot, '.test-staging', '.rotation-lock');
  let lockObserved = false;
  for (let attempt = 0; attempt < 200 && !lockObserved; attempt += 1) {
    lockObserved = fs.existsSync(concurrentLock);
    if (!lockObserved) await new Promise((resolve) => setTimeout(resolve, 10));
  }
  assert.equal(lockObserved, true, 'first concurrent run acquires the global lifecycle lock');
  assert.equal(runSuite('concurrent-second', slowScript, { root: concurrentRoot }), 1, 'a concurrent invocation cannot rotate an active sibling');
  const concurrentExit = await new Promise((resolve, reject) => {
    firstConcurrent.once('error', reject);
    firstConcurrent.once('close', resolve);
  });
  assert.equal(concurrentExit, 0, 'lock owner completes without a competing rotation');
  const concurrentLatest = readJson(path.join(concurrentRoot, '.test-staging', 'latest.json'));
  assert.equal(concurrentLatest.suite, 'concurrent-first');
  const concurrentSummary = readJson(path.join(concurrentRoot, '.test-staging', concurrentLatest.summary));
  assert.equal(concurrentSummary.cleanup.state, 'complete');

  const externalTarget = path.join(tempRoot, 'external-target');
  fs.mkdirSync(externalTarget);
  fs.writeFileSync(path.join(externalTarget, 'sentinel.txt'), 'external content');
  const indirected = path.join(runs, 'indirected-prior-target');
  try {
    fs.symlinkSync(externalTarget, indirected, 'junction');
    fixture(0, 'indirected target check');
    assert.equal(run('indirected-target-check'), 1, 'reparse target is refused');
    const indirectSummary = readJson(path.join(runs, latest().runId, 'summary.json'));
    assert.ok(indirectSummary.cleanup.preserved.some((item) => item.runId === 'indirected-prior-target'));
    assert.equal(fs.lstatSync(indirected).isSymbolicLink(), true);
    assert.equal(fs.readFileSync(path.join(externalTarget, 'sentinel.txt'), 'utf8'), 'external content');
    fs.unlinkSync(indirected);
  } catch (error) {
    if (!['EPERM', 'EACCES', 'ENOTSUP', 'UNKNOWN'].includes(error.code)) throw error;
    console.log(`UNAVAILABLE Windows link/reparse fixture: ${error.code}`);
  }

  console.log('Passed test-run lifecycle cases: first/global replacement, pass/fail retention, collision refusal, failure/restoration evidence, multiple prior runs, unowned/active/type/link preservation, setup failure, lock refusal/recovery, and concurrent publication serialization.');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
}
runLifecycleCases().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
}
