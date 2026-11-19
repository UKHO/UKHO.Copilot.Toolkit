'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { classes, discover, inspectPath, normalize, root, skillPayloadRoots } = require('./discover-copilot-artifacts.cjs');

const coordinatorTools = {
  Research: ['read', 'search', 'web', 'edit', 'edit/createDirectory', 'agent', 'execute'],
  Plan: ['read', 'search', 'edit', 'agent', 'execute'],
  Implement: ['read', 'search', 'edit', 'agent', 'runInTerminal'],
  Review: ['read', 'search', 'edit', 'agent', 'execute']
};
const promptRoutes = { plan: 'Plan', implement: 'Implement', review: 'Review', 'remediate-review': 'Implement' };
const workerTools = {
  'Architecture Analyst': ['read', 'search'], 'Codebase Investigator': ['read', 'search'],
  'Correctness Reviewer': ['read', 'search'], 'Domain Investigator': ['read', 'search', 'web'],
  'Feasibility Investigator': ['read', 'search', 'web'], 'Implementation Worker': ['read', 'search', 'edit', 'runInTerminal'],
  'Maintainability Reviewer': ['read', 'search'], 'Requirements Analyst': ['read', 'search'],
  'Security Reviewer': ['read', 'search'], 'Stage Assurance': ['read', 'search'],
  'Test Strategist': ['read', 'search'], 'Test Worker': ['read', 'search'],
  'Validation Worker': ['read', 'search']
};
// These projections describe authored boundaries, not runtime isolation.
const nativeTools = {
  ...coordinatorTools, ...workerTools,
  Implement: ['read', 'search', 'edit', 'agent', 'execute'],
  'Implementation Worker': ['read', 'search', 'edit', 'execute'],
  'Script Runner': ['read', 'search', 'execute']
};
const nativeSkills = {
  Research: ['agent-model-selection', 'codebase-research', 'rpir-lifecycle-core', 'agent-question-resolution', 'architecture-decision-records', 'local-git-checkpoints'],
  Plan: ['agent-model-selection', 'architecture-planning', 'rpir-lifecycle-core', 'agent-question-resolution', 'architecture-decision-records', 'local-git-checkpoints'],
  Implement: ['agent-model-selection', 'safe-implementation', 'rpir-lifecycle-core', 'agent-question-resolution', 'architecture-decision-records', 'local-git-checkpoints'],
  Review: ['agent-model-selection', 'code-review', 'rpir-lifecycle-core', 'agent-question-resolution', 'architecture-decision-records', 'local-git-checkpoints', 'rpir-stage-assurance'],
  'Architecture Analyst': ['agent-model-selection', 'architecture-planning'],
  'Codebase Investigator': ['agent-model-selection', 'codebase-research'],
  'Correctness Reviewer': ['agent-model-selection', 'code-review'],
  'Domain Investigator': ['agent-model-selection', 'codebase-research'],
  'Feasibility Investigator': ['agent-model-selection', 'codebase-research'],
  'Implementation Worker': ['agent-model-selection', 'safe-implementation'],
  'Maintainability Reviewer': ['agent-model-selection', 'code-review'],
  'Requirements Analyst': ['agent-model-selection', 'architecture-planning'],
  'Security Reviewer': ['agent-model-selection', 'code-review'],
  'Stage Assurance': ['agent-model-selection', 'rpir-stage-assurance'],
  'Test Strategist': ['agent-model-selection', 'test-design'],
  'Test Worker': ['agent-model-selection', 'test-design'],
  'Validation Worker': ['agent-model-selection', 'safe-implementation'],
  'Script Runner': ['agent-model-selection', 'local-git-checkpoints']
};
const manualHandoffCoordinators = new Set(['Research', 'Plan', 'Implement', 'Review']);
const coordinatorProfileFiles = new Set(['research.agent.md', 'plan.agent.md', 'implement.agent.md', 'review.agent.md']);
const specialistProfileFiles = new Set([
  'architecture-analyst.agent.md', 'codebase-investigator.agent.md', 'correctness-reviewer.agent.md',
  'domain-investigator.agent.md', 'feasibility-investigator.agent.md', 'implementation-worker.agent.md',
  'maintainability-reviewer.agent.md', 'requirements-analyst.agent.md', 'script-runner.agent.md',
  'security-reviewer.agent.md', 'stage-assurance.agent.md', 'test-strategist.agent.md',
  'test-worker.agent.md', 'validation-worker.agent.md'
]);
const templateLinkPlaceholders = new Map([
  ['.github/skills/create-copilot-skill/templates/skill.md', 'relative-path'],
  ['.github/skills/create-runbook/templates/runbook.md', 'repository-relative-link'],
  ['.github/skills/wiki-maintenance/templates/wiki-page.md', 'repository-relative-link']
]);
const limitation = 'Static structure only: this check does not establish conversation compliance, installed loading, platform permissions, or runtime safety. It checks supported inline Markdown links and a bounded frontmatter subset; it is not a complete YAML/Markdown parser.';

function fail(message, contractId = 'STRUCT-001') {
  const error = new Error(message);
  error.contractId = contractId;
  throw error;
}

function equal(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function sourcePath(relative) {
  try { return inspectPath(relative).full; }
  catch (error) { fail(`Cannot inspect source ${relative}: ${error.message}`); }
}

function readText(relative) {
  try {
    const { full, stat } = inspectPath(relative);
    if (!stat.isFile()) fail(`${relative} is not a regular file`);
    return fs.readFileSync(full, 'utf8').replace(/\r\n/g, '\n');
  } catch (error) {
    if (error.contractId) throw error;
    fail(`Cannot read ${relative}: ${error.message}`);
  }
}

// Support quoted identity/route/required text, not a general YAML parser.
// Double quotes use JSON-compatible escapes; other YAML forms fail explicitly.
function parseTextScalar(value, relative, field) {
  if (value.startsWith("'")) {
    if (!/^'(?:[^']|'')*'$/.test(value)) fail(`${relative} has unsupported quoted ${field} metadata`);
    return value.slice(1, -1).replace(/''/g, "'");
  }
  if (value.startsWith('"')) {
    try { return JSON.parse(value); }
    catch { fail(`${relative} has unsupported quoted ${field} metadata; expected JSON-compatible escapes`); }
  }
  // Plain text only: collection/block/tag/anchor/alias forms, comments and
  // implicit non-text scalars are outside this subset. Quote literal tokens.
  if (/^[\[\]{},&*!|>%@`#]/.test(value) || /^[?:-](?:\s|$)/.test(value) || /:\s|\s#/.test(value) ||
      /^(?:null|~|true|false|[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?|0[xob][0-9a-f]+|[-+]?\.inf|\.nan)$/i.test(value)) {
    fail(`${relative} has unsupported non-text ${field} metadata; quote literal text`);
  }
  return value;
}

function parseFrontmatterText(text, relative) {
  const lines = text.split('\n');
  if (lines[0] !== '---') fail(`${relative} must begin with an opening YAML delimiter`);
  const end = lines.indexOf('---', 1);
  if (end < 1) fail(`${relative} must contain a closing YAML delimiter`);
  const values = Object.create(null);
  const blocks = Object.create(null);
  let currentKey;
  for (const line of lines.slice(1, end)) {
    if (!line.trim() || /^\s*#/.test(line)) continue;
    if (/^\s*\t/.test(line)) fail(`${relative} uses unsupported tab indentation in frontmatter`);
    if (/^\s/.test(line)) {
      if (!currentKey) fail(`${relative} has an unsupported indented frontmatter line`);
      // Only handoffs support a block; all other metadata is single-line.
      if (currentKey !== 'handoffs') fail(`${relative} has unsupported continuation metadata for ${currentKey}`);
      blocks[currentKey].push(line);
      continue;
    }
    const match = line.match(/^([A-Za-z][A-Za-z0-9-]*):(?:[ \t]*(.*))?$/);
    if (!match) fail(`${relative} has unsupported frontmatter syntax: ${line}`);
    const [, key, value = ''] = match;
    if (Object.hasOwn(values, key)) fail(`${relative} has duplicate frontmatter field: ${key}`);
    values[key] = ['name', 'applyTo', 'agent'].includes(key) ? parseTextScalar(value.trim(), relative, key) : value;
    blocks[key] = [];
    currentKey = key;
  }
  if (typeof values.name !== 'string' || !values.name.trim()) fail(`${relative} must declare a non-empty name`);
  if (Object.hasOwn(values, 'handoffs') && values.handoffs.trim()) {
    fail(`${relative} has unsupported handoffs metadata; expected a block sequence`);
  }
  return { values, blocks, text };
}

function parseStringList(value, relative, field) {
  if (typeof value !== 'string' || !/^\[(?:'[^'\n]*'(?:, '[^'\n]*')*)?\]$/.test(value)) {
    fail(`${relative} has unsupported ${field} frontmatter; expected a single-quoted inline list`);
  }
  const entries = value === '[]' ? [] : value.slice(1, -1).split(', ').map((entry) => entry.slice(1, -1));
  if (entries.some((entry) => !entry.trim()) || new Set(entries).size !== entries.length) {
    fail(`${relative} has an empty or duplicate ${field} declaration`);
  }
  return entries;
}

function checkNativeAgentContract(relative, parsed, agentNames, skillNames, profile) {
  const { values } = parsed;
  const name = values.name;
  const reject = (message) => fail(`${relative}: ${message}`, 'NATIVE-AGENT-001');
  if (!Object.hasOwn(nativeTools, name) || !Object.hasOwn(nativeSkills, name)) reject('unrecognized role');
  if (parseTextScalar((values.target || '').trim(), relative, 'target') !== 'github-copilot') reject('target must be github-copilot');
  if (Object.hasOwn(values, 'agents') || Object.hasOwn(values, 'handoffs')) reject('Local delegation metadata is unsupported');
  const tools = parseStringList(values.tools, relative, 'tools');
  if (!tools.length || !equal(tools, nativeTools[name])) reject('tools differ from the nonempty role boundary');
  const skills = parseStringList(values.skills, relative, 'skills');
  if (!equal(skills, nativeSkills[name]) || skills.some((skill) => !skillNames.has(skill))) reject('required named skills must resolve');
  if (!manualHandoffCoordinators.has(name) && values['user-invocable'] !== 'false') reject('worker must not be user-invocable');

  const rows = section(profile, '# Authoritative role profiles').split('\n').filter((line) => line.startsWith('| `'));
  const names = rows.map((row) => row.match(/^\| `([a-z0-9-]+\.agent\.md)` \|/)?.[1]);
  if (names.filter((entry) => entry === path.posix.basename(relative)).length !== 1) reject('profile must contain one role row');
  try {
    const profiles = checkModelProfileCoverage(profile, names.map((entry) => `.github/agents/${entry}`));
    checkModelProjection(relative, values, profiles);
  } catch { reject('model, reasoning and selection policy must match the role profile'); }
  return true;
}

function checkNativeSupportMetadata(manifest, lock) {
  if (manifest?.engines?.vscode !== '^1.146.0' || lock?.packages?.['']?.engines?.vscode !== '^1.146.0') {
    fail('Manifest and root lockfile must both target ^1.146.0', 'NATIVE-SUPPORT-001');
  }
  return true;
}

function checkLocalLinks(relative, text) {
  const pattern = /!?\[[^\]]*\]\(\s*(<[^>]+>|[^)\s]+)(?:\s+[^)]*)?\)/g;
  for (const match of text.matchAll(pattern)) {
    const angleDestination = match[1].startsWith('<') && match[1].endsWith('>');
    let destination = angleDestination ? match[1].slice(1, -1) : match[1];
    if (angleDestination && templateLinkPlaceholders.get(relative) === destination) continue;
    if (/^[a-z]:/i.test(destination)) fail(`${relative} has an unsafe local link: ${destination}`);
    if (/^file:/i.test(destination)) fail(`${relative} has an unsupported filesystem link: ${destination}`);
    if (!destination || destination.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(destination)) continue;
    if (destination.startsWith('/') || destination.startsWith('\\') || destination.includes('\\')) {
      fail(`${relative} has an unsafe local link: ${destination}`);
    }
    const pathPart = destination.split(/[?#]/, 1)[0];
    if (!pathPart) continue;
    try { destination = decodeURIComponent(pathPart); }
    catch { fail(`${relative} has an invalid encoded local link: ${pathPart}`); }
    if (/^[a-z]:/i.test(destination) || destination.startsWith('/') || destination.includes('\\')) fail(`${relative} has an unsafe local link: ${destination}`);

    const resolved = path.resolve(path.dirname(sourcePath(relative)), ...destination.split('/'));
    if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) fail(`${relative} local link escapes the repository: ${destination}`);
    let stat;
    try { ({ stat } = inspectPath(path.relative(root, resolved))); }
    catch (error) { fail(`${relative} local link does not resolve to a supported file: ${destination} (${error.message})`); }
    if (!stat.isFile()) fail(`${relative} local link does not resolve to a regular file: ${destination}`);
  }
}

function readManifest() {
  let manifest;
  try { manifest = JSON.parse(readText('package.json')); }
  catch (error) { fail(`Cannot parse package.json: ${error.message}`, 'PARITY-INPUT-001'); }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest) || !Array.isArray(manifest.files) || !manifest.contributes || typeof manifest.contributes !== 'object') {
    fail('package.json must contain files and contributes objects', 'PARITY-INPUT-001');
  }
  for (const entry of manifest.files) {
    if (typeof entry !== 'string') fail('package.json files entries must be strings', 'PARITY-001');
    try { normalize(entry); }
    catch (error) { fail(`package.json files contains an invalid path: ${error.message}`, 'PARITY-001'); }
  }
  return manifest;
}

function checkManifestParity(manifest, inventory) {
  const roots = classes.map((definition) => definition.directory);
  const controlled = (relative) => roots.some((directory) => relative === directory || relative.startsWith(`${directory}/`));
  const expectedFiles = classes.flatMap((definition) => (
    definition.kind === 'skill' ? skillPayloadRoots(inventory[definition.name]) : inventory[definition.name]
  ));
  const actualFiles = manifest.files.filter((entry) => controlled(normalize(entry)));
  if (!equal(actualFiles, expectedFiles)) fail('package.json controlled files do not match shared discovery inventory', 'PARITY-001');
  for (const definition of classes) {
    const entries = manifest.contributes[definition.name];
    if (!Array.isArray(entries)) fail(`package.json contributes.${definition.name} must be an array`, 'PARITY-001');
    const actual = entries.map((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry) || typeof entry.path !== 'string') fail(`package.json contributes.${definition.name} has an invalid path`, 'PARITY-001');
      return normalize(entry.path);
    });
    if (!equal(actual, inventory[definition.name])) fail(`package.json contributes.${definition.name} does not match shared discovery inventory`, 'PARITY-001');
  }
}

function parseHandoffs(relative, blockLines, expectedTargets, agentNames) {
  fail(`${relative} must not use Local handoff metadata`, 'NATIVE-AGENT-001');
}

function checkPromptMetadata(relative, values, agentNames) {
  const name = path.basename(relative, '.prompt.md');
  if (Object.hasOwn(promptRoutes, name)) fail(`${relative} must not restore a legacy RPIR entry prompt`, 'STRUCT-PROMPT-001');
  if (values.name !== name || (Object.hasOwn(values, 'agent') && !agentNames.has(values.agent))) {
    fail(`${relative} must declare its valid name and, when specified, a known agent`, 'STRUCT-PROMPT-001');
  }
  if (Object.hasOwn(values, 'tools')) {
    const allowed = nativeTools[values.agent];
    if (!allowed || parseStringList(values.tools, relative, 'tools').some((tool) => !allowed.includes(tool))) {
      fail(`${relative} tools must not expand ${values.agent} capabilities`);
    }
  }
}

function checkAgentMetadata(relative, values, blocks, agentNames) {
  const name = values.name;
  if (!Object.hasOwn(nativeTools, name)) {
    fail(`${relative} has an unrecognized agent role: ${name}; declare its tool and invocation boundary in the checker`);
  }
  if (Object.hasOwn(values, 'agents') || Object.hasOwn(values, 'handoffs')) fail(`${relative} must not use Local delegation metadata`);
  if (!equal(parseStringList(values.tools, relative, 'tools'), nativeTools[name])) fail(`${relative} tools differ from its declared role boundary`);
  if (!manualHandoffCoordinators.has(name) && values['user-invocable'] !== 'false') fail(`${relative} worker must not be user-invocable`);
}

function skillMarkdownResources(inventory) {
  const resources = new Set();
  for (const skill of skillPayloadRoots(inventory.chatSkills)) {
    const base = sourcePath(skill);
    function visit(full, relative) {
      let stat;
      try { ({ stat } = inspectPath(relative)); }
      catch (error) { fail(`Cannot inspect Skill resource ${relative}: ${error.message}`); }
      if (stat.isSymbolicLink()) fail(`Symbolic links are not allowed in Skill resources: ${relative}`);
      if (stat.isFile()) {
        if (relative.toLowerCase().endsWith('.md')) resources.add(normalize(relative));
        return;
      }
      if (!stat.isDirectory()) fail(`Unsupported Skill resource path: ${relative}`);
      let names;
      try { names = fs.readdirSync(full).sort(); }
      catch (error) { fail(`Cannot read Skill resource directory ${relative}: ${error.message}`); }
      for (const name of names) visit(path.join(full, name), `${relative}/${name}`);
    }
    visit(base, skill);
  }
  return [...resources].sort();
}

// The role-profile table and its heading scope are a mechanically consumed interface.
function section(text, heading) {
  const lines = text.split('\n');
  const start = lines.indexOf(heading);
  if (start < 0) return '';
  const depth = heading.match(/^#+/)[0].length;
  const end = lines.findIndex((line, index) => index > start &&
    new RegExp(`^#{1,${depth}} `).test(line));
  return lines.slice(start + 1, end < 0 ? undefined : end).join('\n');
}

function checkArchitectureDecisionRecordContract(sources = {}) {
  const relative = '.github/skills/architecture-decision-records/SKILL.md';
  const skill = sources.skill ?? readText(relative);
  const metadata = parseFrontmatterText(skill, relative).values;
  if (metadata.name !== 'architecture-decision-records' || metadata['user-invocable'] !== 'false') {
    fail('ADR Skill must use its directory name and remain non-invocable', 'ADR-CONTRACT-001');
  }
  for (const resource of ['references/research-input-coverage.md', 'templates/adr.md']) {
    if (!skill.includes(`](${resource})`)) fail(`ADR Skill must directly link ${resource}`, 'ADR-CONTRACT-001');
  }
  return true;
}

function checkLifecycleCandidatePatterns(instruction) {
  const values = parseFrontmatterText(instruction, 'lifecycle-records.instructions.md').values;
  const suffixes = ['research-brief', 'implementation-plan', 'implementation-report', 'review-report'];
  const record = '[0-9][0-9][0-9]-';
  const expected = suffixes.flatMap((suffix) => [
    `docs/planning/**/${record}${suffix}.md`,
    `docs/delivery/**/${record}${suffix}.md`,
    `**/copilot/${record}[a-z0-9]*/${record}${suffix}.md`
  ]);
  const actual = typeof values.applyTo === 'string' ? values.applyTo.split(',').map((item) => item.trim()) : [];
  if (actual.length !== expected.length || new Set(actual).size !== expected.length ||
      actual.some((pattern) => !expected.includes(pattern))) {
    fail('Lifecycle instruction must declare exactly the twelve authored candidate patterns', 'RPIR-RECORD-001');
  }
  return true;
}

function checkModelAuthoringContract(sources = {}) {
  const relative = '.github/skills/create-copilot-agent/templates/agent.md';
  const template = sources.agentTemplate ?? readText(relative);
  const templateFrontmatter = template.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] || '';
  if (!templateFrontmatter || /^\s*(?:model|model-policy|reasoning-effort):/m.test(templateFrontmatter)) {
    fail(`${relative} must keep model and effort frontmatter inert`, 'MODEL-AUTHORING-001');
  }
  return true;
}

function checkModelProfileCoverage(profile, agentPaths) {
  const rows = section(profile, '# Authoritative role profiles').split('\n')
    .filter((line) => /^\s*\|/.test(line))
    .filter((line) => line !== '| Agent definition | Recommended model | Reasoning policy | Selection policy |' &&
      line !== '| --- | --- | --- | --- |');
  const profiles = new Map();
  for (const row of rows) {
    const match = row.match(/^\| `([a-z0-9-]+\.agent\.md)` \| `(gpt-6\.1-sol|gpt-6\.1-terra|gpt-6-luna|hydrafusion)` \| ([^|]+) \| (Required|No authored override) \|$/);
    if (!match) fail(`Unsupported model profile row: ${row}`, 'MODEL-PROFILE-001');
    const [, name, model, reasoningPolicy, selectionPolicy] = match;
    if (profiles.has(name)) fail(`Duplicate model profile: ${name}`, 'MODEL-PROFILE-001');
    const entry = { model, reasoningPolicy: reasoningPolicy.trim(), selectionPolicy };
    const fixed = coordinatorProfileFiles.has(name)
      ? { model: 'gpt-6.1-sol', reasoningPolicy: 'High; authored override', selectionPolicy: 'Required' }
      : specialistProfileFiles.has(name)
        ? { model: 'hydrafusion', reasoningPolicy: 'Fusion-managed; no authored override', selectionPolicy: 'No authored override' }
        : null;
    if (fixed && !equal(entry, fixed)) fail(`Model profile drift: ${name}`, 'MODEL-PROFILE-001');
    profiles.set(name, entry);
  }
  const expected = agentPaths.map((relative) => path.posix.basename(relative));
  if (new Set(expected).size !== expected.length) fail('Duplicate agent profile identity', 'MODEL-PROFILE-001');
  for (const name of expected) if (!profiles.has(name)) fail(`Missing model profile: ${name}`, 'MODEL-PROFILE-001');
  for (const name of profiles.keys()) if (!expected.includes(name)) fail(`Orphan model profile: ${name}`, 'MODEL-PROFILE-001');
  return profiles;
}

function checkModelProjection(relative, values, profiles) {
  const expected = profiles.get(path.posix.basename(relative));
  if (!expected || typeof values.model !== 'string' || !values.model.trim()) {
    fail(`${relative} must declare its single profile model`, 'MODEL-PROJECTION-001');
  }
  let actual;
  try { actual = parseTextScalar(values.model.trim(), relative, 'model'); }
  catch { fail(`${relative} has unsupported model metadata`, 'MODEL-PROJECTION-001'); }
  if (actual !== expected.model) {
    fail(`${relative} model must match its profile: ${expected.model}`, 'MODEL-PROJECTION-001');
  }
  const coordinator = coordinatorProfileFiles.has(path.posix.basename(relative));
  const fixed = coordinator
    ? { model: 'gpt-6.1-sol', reasoningPolicy: 'High; authored override', selectionPolicy: 'Required' }
    : specialistProfileFiles.has(path.posix.basename(relative))
      ? { model: 'hydrafusion', reasoningPolicy: 'Fusion-managed; no authored override', selectionPolicy: 'No authored override' }
      : null;
  if (fixed && !equal(expected, fixed)) fail(`${relative} profile differs from its fixed allocation`, 'MODEL-PROJECTION-001');
  if (coordinator) {
    for (const [field, expectedValue] of [['reasoning-effort', 'high'], ['model-policy', 'required']]) {
      let actualValue;
      try { actualValue = parseTextScalar((values[field] || '').trim(), relative, field); }
      catch { fail(`${relative} has unsupported ${field} metadata`, 'MODEL-PROJECTION-001'); }
      if (actualValue !== expectedValue) fail(`${relative} must declare ${field}: ${expectedValue}`, 'MODEL-PROJECTION-001');
    }
  } else {
    if (Object.hasOwn(values, 'reasoning-effort')) fail(`${relative} must omit authored reasoning-effort`, 'MODEL-PROJECTION-001');
    if (Object.hasOwn(values, 'model-policy')) fail(`${relative} must omit authored model-policy`, 'MODEL-PROJECTION-001');
    if (expected.selectionPolicy !== 'No authored override') fail(`${relative} has unsupported selection policy`, 'MODEL-PROJECTION-001');
  }
}

function checkCustomizationContracts(inventory) {
  const artifacts = classes.flatMap((definition) => inventory[definition.name]);
  const parsedByPath = new Map();
  const names = new Map();
  const skillEntries = new Set(inventory.chatSkills);
  for (const relative of artifacts) {
    const parsed = parseFrontmatterText(readText(relative), relative);
    if (skillEntries.has(relative)) {
      const description = parseTextScalar((parsed.values.description || '').trim(), relative, 'description');
      if (!description.trim()) fail(`${relative} must declare a non-empty text description`);
    }
    if (names.has(parsed.values.name)) fail(`Duplicate contributed customization name ${parsed.values.name}: ${names.get(parsed.values.name)} and ${relative}`);
    names.set(parsed.values.name, relative);
    parsedByPath.set(relative, parsed);
  }

  const agentPaths = inventory.chatAgents;
  const nativeProfile = readText('.github/skills/agent-model-selection/references/role-profiles.md');
  const skillNames = new Set(inventory.chatSkills.map((relative) => parsedByPath.get(relative).values.name));
  const nativeAgentNames = new Set(agentPaths.map((relative) => parsedByPath.get(relative).values.name));
  checkNativeSupportMetadata(readManifest(), JSON.parse(readText('package-lock.json')));
  for (const relative of agentPaths) {
    checkNativeAgentContract(relative, parsedByPath.get(relative), nativeAgentNames, skillNames, nativeProfile);
  }
  const profiles = checkModelProfileCoverage(nativeProfile, agentPaths);
  const agentNames = new Set(agentPaths.map((relative) => parsedByPath.get(relative).values.name));
  const promptPaths = inventory.chatPromptFiles;
  for (const relative of promptPaths) {
    checkPromptMetadata(relative, parsedByPath.get(relative).values, agentNames);
  }

  for (const relative of agentPaths) {
    const { values, blocks } = parsedByPath.get(relative);
    checkAgentMetadata(relative, values, blocks, agentNames);
    checkModelProjection(relative, values, profiles);
  }

  for (const relative of artifacts) {
    const parsed = parsedByPath.get(relative);
    if (relative.startsWith('.github/instructions/') && !parsed.values.applyTo?.trim()) {
      fail(`${relative} must declare a non-empty applyTo field`);
    }
    checkLocalLinks(relative, parsed.text);
  }

  const resources = skillMarkdownResources(inventory);
  for (const relative of resources) {
    if (!parsedByPath.has(relative)) checkLocalLinks(relative, readText(relative));
  }
  checkArchitectureDecisionRecordContract();
  checkLifecycleCandidatePatterns(readText('.github/instructions/lifecycle-records.instructions.md'));
  checkModelAuthoringContract();
  return { artifactCount: artifacts.length, resourceCount: resources.length };
}

function report(label, error, category) {
  if (!error) {
    console.log(`${label}: PASS`);
    return false;
  }
  console.error(`DIAGNOSTIC FAIL ${error.contractId || category}: ${error.message}`);
  console.error(`${label}: FAIL`);
  return true;
}

function main() {
  let failed = false;
  let inventory;
  let manifest;
  try { inventory = discover(); }
  catch (error) { failed = report('Discovery', error, 'DISCOVERY-001'); }
  try { manifest = readManifest(); }
  catch (error) { failed = report('Manifest input', error, 'PARITY-INPUT-001') || failed; }

  if (manifest && inventory) {
    try { checkManifestParity(manifest, inventory); failed = report('Manifest/discovery parity', null, 'PARITY-001') || failed; }
    catch (error) { failed = report('Manifest/discovery parity', error, 'PARITY-001') || failed; }
  } else {
    console.error('Manifest/discovery parity: NOT RUN (required input unavailable)');
    failed = true;
  }

  if (inventory) {
    try {
      const { artifactCount, resourceCount } = checkCustomizationContracts(inventory);
      failed = report(`Customization structure (${artifactCount} artifacts; ${resourceCount} Skill Markdown files)`, null, 'STRUCT-001') || failed;
    } catch (error) { failed = report('Customization structure', error, 'STRUCT-001') || failed; }
  } else {
    console.error('Customization structure: NOT RUN (discovery unavailable)');
    failed = true;
  }

  console.log(limitation);
  if (failed) process.exitCode = 1;
}

if (require.main === module) {
  try { main(); }
  catch (error) {
    console.error(`Copilot structural verification failed: ${error.message}`);
    process.exitCode = 1;
    console.log(limitation);
  }
}

module.exports = {
  checkAgentMetadata, checkLocalLinks, checkManifestParity, checkPromptMetadata,
  checkNativeAgentContract, checkNativeSupportMetadata,
  checkLifecycleCandidatePatterns,
  checkCustomizationContracts, checkArchitectureDecisionRecordContract, checkModelAuthoringContract, checkModelProfileCoverage, checkModelProjection,
  parseFrontmatterText, parseHandoffs, parseStringList
};
