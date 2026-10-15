'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const STAGING_NAME = '.test-staging';
const OWNER_FILE = 'owner.json';
const SUMMARY_FILE = 'summary.json';
const LOCK_NAME = '.rotation-lock';
const MAINTAINED_SUITES = ['copilot-contract-scenarios', 'vsix-boundary', 'test-run-lifecycle'];

function fail(message) {
  throw new Error(message);
}

function identity(value) {
  return process.platform === 'win32' ? value.toLowerCase() : value;
}

function assertPlainDirectory(full, allowCreate = false) {
  const resolved = path.resolve(full);
  const root = path.parse(resolved).root;
  let cursor = root;
  for (const segment of resolved.slice(root.length).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, segment);
    let stat;
    try { stat = fs.lstatSync(cursor); }
    catch (error) {
      if (allowCreate && error.code === 'ENOENT') { fs.mkdirSync(cursor); stat = fs.lstatSync(cursor); }
      else throw error;
    }
    if (!stat.isDirectory() || stat.isSymbolicLink()) fail(`Unsafe generated directory: ${cursor}`);
    if (identity(fs.realpathSync(cursor)) !== identity(cursor)) fail(`Indirected generated directory: ${cursor}`);
  }
  return resolved;
}

function assertPlainTree(full) {
  const stat = fs.lstatSync(full);
  if (stat.isSymbolicLink() || (!stat.isFile() && !stat.isDirectory())) fail(`Unsafe generated entry: ${full}`);
  if (identity(fs.realpathSync(full)) !== identity(full)) fail(`Indirected generated entry: ${full}`);
  if (stat.isDirectory()) for (const name of fs.readdirSync(full)) assertPlainTree(path.join(full, name));
}

function writeJson(full, value) {
  const temporary = `${full}.${crypto.randomUUID()}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
  fs.renameSync(temporary, full);
}

function readJson(full) {
  const stat = fs.lstatSync(full);
  if (!stat.isFile() || stat.isSymbolicLink()) fail(`Unsafe lifecycle record: ${full}`);
  if (identity(fs.realpathSync(full)) !== identity(full)) fail(`Indirected lifecycle record: ${full}`);
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function isProcessActive(pid) {
  if (!Number.isInteger(pid) || pid < 1) return true;
  try { process.kill(pid, 0); return true; }
  catch (error) { return error.code !== 'ESRCH'; }
}

function registerTestCompletion() {
  const runDirectory = process.env.TOOLKIT_TEST_RUN_DIR;
  if (!runDirectory) fail('Maintained test suite is missing its owned run directory.');
  assertPlainDirectory(runDirectory);
  const marker = path.join(runDirectory, 'test-completed.json');
  process.once('exit', (code) => {
    try {
      fs.writeFileSync(marker, `${JSON.stringify({ pid: process.pid, exitCode: code, completedAt: new Date().toISOString() })}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    } catch { /* Missing marker causes the parent to preserve prior latest results. */ }
  });
}

function markTestStarted() {
  const runDirectory = process.env.TOOLKIT_TEST_RUN_DIR;
  if (!runDirectory) fail('Maintained test suite is missing its owned run directory.');
  assertPlainDirectory(runDirectory);
  fs.writeFileSync(path.join(runDirectory, 'test-started.json'), `${JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() })}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
}

function executeSuite(suite, scriptFile, options = {}) {
  const root = path.resolve(options.root || path.resolve(__dirname, '..'));
  assertPlainDirectory(root);
  const staging = path.join(root, STAGING_NAME);
  assertPlainDirectory(staging, true);
  const runs = path.join(staging, 'runs');
  assertPlainDirectory(runs, true);
  const lock = path.join(staging, LOCK_NAME);
  try { fs.mkdirSync(lock, { mode: 0o700 }); }
  catch (error) {
    if (error.code !== 'EEXIST') fail(`Cannot acquire test-result lifecycle lock (${error.code || error.message}); previous results were preserved.`);
    try {
      assertPlainDirectory(lock);
      if (JSON.stringify(fs.readdirSync(lock).sort()) !== JSON.stringify(['owner.json'])) fail('Existing lifecycle lock contains unexpected content.');
      const staleLock = readJson(path.join(lock, 'owner.json'));
      if (isProcessActive(staleLock.pid)) fail('An existing test-result lifecycle may still be active; previous results were preserved.');
      fs.unlinkSync(path.join(lock, 'owner.json'));
      fs.rmdirSync(lock);
      fs.mkdirSync(lock, { mode: 0o700 });
    } catch (recoveryError) {
      fail(`Cannot safely recover the existing test-result lifecycle lock (${recoveryError.message}); previous results were preserved.`);
    }
  }
  const lockRecord = path.join(lock, 'owner.json');
  const runId = options.runId || `${new Date().toISOString().replace(/[:.]/g, '-')}-${crypto.randomUUID()}`;
  if (typeof runId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(runId)) fail('Invalid generated run identity.');
  const runDirectory = path.join(runs, runId);
  let primaryError;
  let exitCode = 1;
  try {
    fs.writeFileSync(lockRecord, JSON.stringify({ pid: process.pid, runId, startedAt: new Date().toISOString() }), { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    fs.mkdirSync(runDirectory, { mode: 0o700 });
    const owner = {
      schema: 1,
      owner: 'UKHO.Copilot.Toolkit test-run lifecycle',
      runId,
      suite,
      pid: process.pid,
      startedAt: new Date().toISOString(),
      state: 'active'
    };
    writeJson(path.join(runDirectory, OWNER_FILE), owner);
    const child = spawnSync(process.execPath, [scriptFile], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      windowsHide: true,
      env: { ...process.env, TOOLKIT_TEST_RUN_CHILD: '1', TOOLKIT_TEST_RUN_DIR: runDirectory }
    });
    const stdout = child.stdout || '';
    const stderr = child.stderr || (child.error ? `${child.error.message}\n` : '');
    fs.writeFileSync(path.join(runDirectory, 'stdout.txt'), stdout, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    fs.writeFileSync(path.join(runDirectory, 'stderr.txt'), stderr, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    exitCode = Number.isInteger(child.status) ? child.status : 1;
    const finishedAt = new Date().toISOString();
    let completionMarker;
    try { completionMarker = readJson(path.join(runDirectory, 'test-completed.json')); }
    catch { completionMarker = null; }
    let startedMarker;
    try { startedMarker = readJson(path.join(runDirectory, 'test-started.json')); }
    catch { startedMarker = null; }
    const childCompleted = Number.isInteger(child.status) && child.signal === null && child.error === undefined && completionMarker?.pid > 0 && startedMarker?.pid === completionMarker.pid;
    const completedOwner = { ...owner, state: childCompleted ? 'completed' : 'interrupted', finishedAt, exitCode };
    writeJson(path.join(runDirectory, OWNER_FILE), completedOwner);
    const replacementSummary = {
      schema: 1,
      runId,
      suite,
      startedAt: owner.startedAt,
      finishedAt,
      node: process.version,
      platform: `${process.platform}-${process.arch}`,
      cwd: root,
      completed: childCompleted,
      testStarted: startedMarker?.pid === completionMarker?.pid,
      testOutcome: childCompleted ? (exitCode === 0 ? 'passed' : 'failed') : 'interrupted',
      testExitCode: exitCode,
      suitesNotRun: MAINTAINED_SUITES.filter((name) => name !== suite || !startedMarker),
      signal: child.signal || null,
      spawnError: child.error?.message || null,
      resultFiles: ['stdout.txt', 'stderr.txt'],
      failureDiagnostics: { source: 'stderr.txt', exitCode, captured: Boolean(stderr) },
      restorationOutcome: childCompleted
        ? (exitCode === 0 ? 'completed; suite exited successfully after its restoration checks' : 'unverified; inspect stderr.txt for suite-specific restoration outcomes')
        : 'not completed; see stderr.txt',
      stage: fs.existsSync(path.join(runDirectory, 'stage')) ? 'stage/' : null,
      publication: childCompleted ? 'durable run files and completion records written before rotation' : 'replacement evidence incomplete; prior results preserved',
      cleanup: { state: 'pending', removed: [], preserved: [] }
    };
    assertPlainTree(runDirectory);
    writeJson(path.join(runDirectory, SUMMARY_FILE), replacementSummary);
    if (!childCompleted) {
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      process.stderr.write(`Test invocation did not complete; previous results were preserved. Inspect ${path.join(runDirectory, SUMMARY_FILE)}.\n`);
      return 1;
    }
    const savedOwner = readJson(path.join(runDirectory, OWNER_FILE));
    const savedSummary = readJson(path.join(runDirectory, SUMMARY_FILE));
    if (savedOwner.runId !== runId || savedOwner.state !== 'completed' || savedSummary.runId !== runId || savedSummary.suite !== suite || savedSummary.testOutcome !== (exitCode === 0 ? 'passed' : 'failed') ||
        fs.readFileSync(path.join(runDirectory, 'stdout.txt'), 'utf8') !== stdout || fs.readFileSync(path.join(runDirectory, 'stderr.txt'), 'utf8') !== stderr) {
      fail('Durable replacement evidence failed readback verification; previous results were preserved.');
    }
    const latest = path.join(staging, 'latest.json');
    writeJson(latest, { runId, suite, finishedAt, summary: `runs/${runId}/${SUMMARY_FILE}` });
    const published = readJson(latest);
    if (published.runId !== runId || published.suite !== suite || published.summary !== `runs/${runId}/${SUMMARY_FILE}`) {
      fail('Published latest-run identity failed readback verification; prior results were preserved.');
    }

    const removed = [];
    const preserved = [];
    let cleanupError = null;
    for (const name of fs.readdirSync(runs)) {
      if (name === runId) continue;
      const candidate = path.join(runs, name);
      try {
        const stat = fs.lstatSync(candidate);
        if (!stat.isDirectory() || stat.isSymbolicLink() || identity(fs.realpathSync(candidate)) !== identity(candidate)) fail(`unsafe prior run target: ${name}`);
        assertPlainTree(candidate);
        const previousOwner = readJson(path.join(candidate, OWNER_FILE));
        const previousSummary = readJson(path.join(candidate, SUMMARY_FILE));
        const priorCompleted = previousOwner.state === 'completed' && ['passed', 'failed'].includes(previousSummary.testOutcome);
        const priorInterrupted = previousOwner.state === 'interrupted' && previousSummary.testOutcome === 'interrupted' && previousSummary.completed === false;
        if (previousOwner.schema !== 1 || previousOwner.owner !== owner.owner || previousOwner.runId !== name || previousSummary.runId !== name || (!priorCompleted && !priorInterrupted)) {
          preserved.push({ runId: name, reason: 'unowned, incomplete, or ambiguous prior result' });
          continue;
        }
        assertPlainTree(candidate);
        fs.rmSync(candidate, { recursive: true, force: false });
        removed.push(name);
      } catch (error) {
        preserved.push({ runId: name, reason: error.message });
        cleanupError ||= error;
      }
    }
    replacementSummary.cleanup = {
      state: cleanupError || preserved.length ? 'incomplete' : 'complete',
      removed,
      preserved,
      error: cleanupError?.message || null
    };
    writeJson(path.join(runDirectory, SUMMARY_FILE), replacementSummary);
    const finalSummary = readJson(path.join(runDirectory, SUMMARY_FILE));
    if (finalSummary.runId !== runId || finalSummary.cleanup.state !== replacementSummary.cleanup.state ||
        JSON.stringify(finalSummary.cleanup.removed) !== JSON.stringify(removed) || JSON.stringify(finalSummary.cleanup.preserved) !== JSON.stringify(preserved)) {
      fail('Final cleanup outcome failed readback verification.');
    }
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    if (preserved.length) process.stderr.write(`Test-result rotation incomplete: preserved ${preserved.length} prior target(s); see ${path.join(runDirectory, SUMMARY_FILE)}.\n`);
    if (exitCode === 0 && preserved.length) exitCode = 1;
  } catch (error) {
    primaryError = error;
  } finally {
    try {
      if (fs.existsSync(lock)) {
        const lockStat = fs.lstatSync(lock);
        if (!lockStat.isDirectory() || lockStat.isSymbolicLink() || identity(fs.realpathSync(lock)) !== identity(lock)) fail('Lifecycle lock identity changed; it was preserved.');
        if (JSON.stringify(fs.readdirSync(lock).sort()) !== JSON.stringify(['owner.json'])) fail('Lifecycle lock contains unexpected content; it was preserved.');
        const saved = readJson(lockRecord);
        if (saved.runId !== runId || saved.pid !== process.pid) fail('Lifecycle lock ownership changed; it was preserved.');
        fs.unlinkSync(lockRecord);
        fs.rmdirSync(lock);
      }
    } catch (error) { primaryError ||= error; }
  }
  if (primaryError) {
    process.stderr.write(`Test-run lifecycle failed: ${primaryError.message}\n`);
    if (runDirectory && fs.existsSync(runDirectory)) process.stderr.write(`Previous results were preserved; inspect ${runDirectory}.\n`);
    return 1;
  }
  return exitCode;
}

function runSuite(suite, scriptFile, options = {}) {
  try { return executeSuite(suite, scriptFile, options); }
  catch (error) {
    process.stderr.write(`Test-run lifecycle failed before replacement publication: ${error.message}\n`);
    return 1;
  }
}

module.exports = { markTestStarted, registerTestCompletion, runSuite };
