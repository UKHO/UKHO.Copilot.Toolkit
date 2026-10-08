'use strict';

const fs = require('fs');
const path = require('path');
const { classes, discover, normalize, root } = require('./discover-copilot-artifacts.cjs');
const { checkWorkflow } = require('./check-copilot-workflow.cjs');

const manifestPath = path.join(root, 'package.json');
const runBookPath = 'docs/run-books/vsix-packaging.md';
const legacyGuidePath = 'docs/vsix-packaging.md';
const guideCatalogueCouplingIdentifiers = [
  'cataloguePath',
  'catalogueFieldOrder',
  'catalogueExpectedOperations',
  'parseCatalogue',
  'verifyCatalogue',
  'copilot-script-catalogue.md'
];
const coordinators = ['research', 'plan', 'implement', 'review'];
const coordinatorTools = {
  Research: ['read', 'search', 'web', 'edit', 'agent'],
  Plan: ['read', 'search', 'edit', 'agent'],
  Implement: ['read', 'search', 'edit', 'agent', 'runInTerminal'],
  Review: ['read', 'search', 'edit', 'agent']
};
const promptRoutes = {
  plan: 'Plan', implement: 'Implement', review: 'Review', 'remediate-review': 'Implement'
};
const handoffRoutes = { Research: ['Plan'], Plan: ['Implement'], Implement: ['Review'], Review: ['Implement', 'Plan'] };
const delegateRoutes = {
  Research: ['Codebase Investigator', 'Domain Investigator', 'Feasibility Investigator', 'Stage Assurance', 'Script Runner'],
  Plan: ['Requirements Analyst', 'Architecture Analyst', 'Test Strategist', 'Domain Investigator', 'Feasibility Investigator', 'Stage Assurance', 'Script Runner'],
  Implement: ['Implementation Worker', 'Test Worker', 'Validation Worker', 'Stage Assurance', 'Script Runner'],
  Review: ['Correctness Reviewer', 'Security Reviewer', 'Maintainability Reviewer', 'Stage Assurance', 'Script Runner']
};
const workerTools = {
  'Architecture Analyst': ['read', 'search'], 'Codebase Investigator': ['read', 'search'],
  'Correctness Reviewer': ['read', 'search'], 'Domain Investigator': ['read', 'search', 'web'],
  'Feasibility Investigator': ['read', 'search', 'web'], 'Implementation Worker': ['read', 'search', 'edit', 'runInTerminal'],
  'Maintainability Reviewer': ['read', 'search'], 'Requirements Analyst': ['read', 'search'],
  'Security Reviewer': ['read', 'search'], 'Stage Assurance': ['read', 'search'],
  'Test Strategist': ['read', 'search'], 'Test Worker': ['read', 'search'],
  'Validation Worker': ['read', 'search']
};
const manualHandoffCoordinators = new Set(['Research', 'Plan', 'Implement', 'Review']);
const staticContractLimitation = 'Authored-contract assertions provide static text evidence only; they do not prove runtime permissions, Workspace Trust, managed policy, URI parsing, filesystem behavior or indirection, instruction attachment, or installed-VSIX behavior.';

function fail(message) { throw new Error(message); }
function equal(actual, expected) { return JSON.stringify(actual) === JSON.stringify(expected); }

function sourcePath(relative) {
  const full = path.resolve(root, relative);
  if (full !== root && !full.startsWith(`${root}${path.sep}`)) fail(`Path escapes fixed repository root: ${relative}`);
  return full;
}

function readText(relative) {
  try { return fs.readFileSync(sourcePath(relative), 'utf8').replace(/\r\n/g, '\n'); }
  catch (error) { fail(`Cannot read ${relative}: ${error.message}`); }
}

function parseFrontmatter(relative) {
  const text = readText(relative);
  const lines = text.split('\n');
  if (lines[0] !== '---') fail(`${relative} must begin with an opening YAML delimiter`);
  const end = lines.indexOf('---', 1);
  if (end < 1) fail(`${relative} must contain a closing YAML delimiter`);
  const values = {};
  for (const line of lines.slice(1, end)) {
    if (/^\s+/.test(line)) continue;
    const match = line.match(/^([A-Za-z][A-Za-z0-9-]*):(?:\s(.*))?$/);
    if (!match || Object.hasOwn(values, match[1])) fail(`${relative} has unsupported or duplicate frontmatter`);
    values[match[1]] = match[2] || '';
  }
  if (!values.name) fail(`${relative} must declare a non-empty name`);
  return { text, values };
}

function parseStringList(value, relative) {
  if (!/^\[(?:'[^']*'(?:, )?)*\]$/.test(value)) fail(`${relative} has unsupported tools frontmatter`);
  return value === '[]' ? [] : value.slice(1, -1).split(', ').map((entry) => entry.slice(1, -1));
}

function checkLocalLinks(relative, text) {
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g)) {
    const destination = match[1];
    if (destination.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(destination)) continue;
    if (destination.startsWith('/') || destination.includes('\\')) fail(`${relative} has an unsafe local link: ${destination}`);
    const target = destination.split('#', 1)[0];
    if (!target) continue;
    const resolved = path.resolve(path.dirname(sourcePath(relative)), target);
    if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) fail(`${relative} local link escapes the repository: ${destination}`);
    if (!fs.existsSync(resolved) || !fs.lstatSync(resolved).isFile()) fail(`${relative} local link does not resolve to a file: ${destination}`);
  }
}

function readManifest() {
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); }
  catch (error) { fail(`Cannot parse package.json: ${error.message}`); }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest) || !Array.isArray(manifest.files) || !manifest.contributes || typeof manifest.contributes !== 'object') fail('package.json must contain files and contributes objects');
  for (const entry of manifest.files) {
    if (typeof entry !== 'string') fail('package.json files entries must be strings');
    try { normalize(entry); }
    catch (error) { fail(`package.json files contains an invalid path: ${error.message}`); }
  }
  return manifest;
}

function checkManifestParity(manifest, inventory) {
  const roots = classes.map((definition) => definition.directory);
  const controlled = (relative) => roots.some((directory) => relative === directory || relative.startsWith(`${directory}/`));
  const expectedFiles = classes.flatMap((definition) => inventory[definition.name]);
  const actualFiles = manifest.files.filter((entry) => controlled(normalize(entry)));
  if (!equal(actualFiles, expectedFiles)) fail('package.json controlled files do not match shared discovery inventory');
  for (const definition of classes) {
    const entries = manifest.contributes[definition.name];
    if (!Array.isArray(entries)) fail(`package.json contributes.${definition.name} must be an array`);
    const actual = entries.map((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry) || typeof entry.path !== 'string') fail(`package.json contributes.${definition.name} has an invalid path`);
      return normalize(entry.path);
    });
    if (!equal(actual, inventory[definition.name])) fail(`package.json contributes.${definition.name} does not match shared discovery inventory`);
  }
}

function checkHandoffs(relative, values, agentNames) {
  if (!manualHandoffCoordinators.has(values.name)) return;
  const text = readText(relative);
  const header = text.match(/^handoffs:\s*$/m);
  if (!header) fail(`${relative} must declare handoffs`);
  const tail = text.slice(header.index + header[0].length).split(/^\S/m, 1)[0];
  const blocks = tail.trimEnd().split(/(?=^  - label: )/m).filter((block) => block.trim());
  if (blocks.length !== handoffRoutes[values.name].length) fail(`${relative} must declare only its stage handoffs`);
  const targets = blocks.map((block) => {
    const match = block.match(/^  - label: [^\n]+\n    agent: (\w+)\n    prompt: [^\n]+\n    send: (true|false)\n?$/);
    if (!match) fail(`${relative} has incomplete, duplicate or unsupported handoff fields`);
    if (match[2] !== 'false') fail(`${relative} handoff to ${match[1]} must use send: false`);
    if (!agentNames.has(match[1])) fail(`${relative} handoff target is not a contributed agent: ${match[1]}`);
    return match[1];
  });
  if (!equal(targets, handoffRoutes[values.name])) fail(`${relative} must declare conditional stage handoffs to ${handoffRoutes[values.name].join(' and ')}`);
}

function requireAnchors(relative, anchors, contract) {
  const text = readText(relative);
  for (const anchor of anchors) {
    if (!text.includes(anchor)) fail(`${relative} is missing the authored ${contract} contract anchor: ${anchor}`);
  }
}

function checkLifecyclePatternScope(relative) {
  const { values } = parseFrontmatter(relative);
  const suffixes = ['research-brief', 'implementation-plan', 'implementation-report', 'review-report'];
  const legacy = suffixes.flatMap((suffix) => ['planning', 'delivery'].map((parent) => `docs/${parent}/**/[0-9][0-9][0-9]-${suffix}.md`));
  const prospective = suffixes.map((suffix) => `**/copilot/[0-9][0-9][0-9]-[a-z0-9]*/[0-9][0-9][0-9]-${suffix}.md`);
  const patterns = values.applyTo.replace(/^'|'$/g, '').split(',');
  if (!equal(patterns, [...legacy, ...prospective])) fail(`${relative} must declare twelve exact legacy/prospective lifecycle suffix patterns (static only)`);
  // Illustrative authored-shape examples, NOT the VS Code glob engine or runtime attachment.
  const legacyShape = /^docs\/(planning|delivery)\/.+\/[0-9]{3}-(research-brief|implementation-plan|implementation-report|review-report)\.md$/;
  const prospectiveShape = /^(?:.+\/)?copilot\/[0-9]{3}-[a-z0-9][^/]*\/[0-9]{3}-(research-brief|implementation-plan|implementation-report|review-report)\.md$/;
  const positives = suffixes.flatMap((suffix) => [
    `docs/planning/001-topic/001-${suffix}.md`, `docs/delivery/001-topic/001-${suffix}.md`,
    `docs/copilot/001-topic/001-${suffix}.md`, `team/handbook/copilot/001-topic/001-${suffix}.md`
  ]);
  positives.push('archive/copilot/001-topic/001-review-report.md'); // Unavoidable path overmatch; identity is separate.
  const negatives = ['docs/copilot/topic/001-research-brief.md', 'docs/copilot/001-topic/research-brief.md',
    'docs/copilot/001-topic/001-notes.md', 'team/handbook/001-topic/001-research-brief.md',
    'docs/planning/001-topic/001-notes.md'];
  for (const sample of positives) {
    if (!legacyShape.test(sample) && !prospectiveShape.test(sample)) fail(`${relative} loses intended static example ${sample}`);
  }
  for (const sample of negatives) {
    if (legacyShape.test(sample) || prospectiveShape.test(sample)) fail(`${relative} includes unrelated static example ${sample}`);
  }
  if (!invariant(section(relative, 'Applies to'), [/numbered local Research briefs/i, /unrelated `copilot\/` tree/i]) ||
      !invariant(section(relative, 'Validation boundaries'), [/Static examples do not prove glob attachment/i, /physical lifecycle identity, actual containment and direct lineage/i])) {
    fail(`${relative} loses physical-identity or static-attachment safeguards`);
  }
}

function checkVsixRunBook() {
  if (fs.existsSync(sourcePath(legacyGuidePath))) fail(`${legacyGuidePath} must be absent after the Run Book move`);
  const text = readText(runBookPath);
  checkLocalLinks(runBookPath, text);
  requireAnchors(runBookPath, [
    '## Purpose',
    '## Scope',
    '## Preparation',
    '## Ordered process',
    '## Expected results',
    '## Diagnostics and failure disposition',
    '## Safety limits',
    '## Validation and limitations',
    'The command examples in this section are human guidance only',
    'Native Windows is not sandbox containment.'
  ], 'moved human-readable Run Book');
  if (text.includes('## Script Runner operations')) fail(`${runBookPath} must remain human guidance, not Runner ID selection`);
}

function section(relative, heading) {
  const text = readText(relative);
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`^#{1,2} ${escaped}\\s*\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm'));
  if (!match) fail(`${relative} is missing owning section: ${heading}`);
  return match[1];
}

function paragraph(relative, heading, start) {
  const matches = section(relative, heading).split('\n').filter((line) => line.startsWith(start));
  if (matches.length !== 1) fail(`${relative} must have one owning paragraph: ${start}`);
  return matches[0];
}

// Test affirmative clauses in their owner, not a keyword anywhere in the file. A
// contradictory clause in that same owner cannot be rescued by a later quotation.
function invariant(text, required, forbidden = []) {
  return required.every((pattern) => pattern.test(text)) && !forbidden.some((pattern) => pattern.test(text));
}

function authoredChecks(manifestUnavailable) {
  const core = '.github/skills/rpir-lifecycle-core/SKILL.md';
  const policy = '.github/copilot-instructions.md';
  const review = '.github/agents/review.agent.md';
  const runner = '.github/agents/script-runner.agent.md';
  const questions = '.github/skills/agent-question-resolution/SKILL.md';
  const workflow = '.github/workflows/package.yml';
  const checks = [
    ['RECOVERY-001', policy, () => {
      const scope = section(policy, 'Lifecycle authority and transitions');
      const recovery = paragraph(policy, 'Lifecycle authority and transitions', '- An approved Plan defines the outcome');
      const denial = paragraph(policy, 'Lifecycle authority and transitions', '- Ask the engineer promptly');
      return invariant(recovery, [/Implement may investigate ordinary failures/, /correct attributable mistakes/, /rerun relevant checks/, /failed check keeps dependent acceptance unmet/], [/never (?:replay|retry) a failed consequential (?:build|write|package)/i]) &&
        invariant(denial, [/A real platform denial cannot be evaded by another route/, /Reconcile uncertain destructive or external completion before repetition/, /ordinary local test failures can be diagnosed and rechecked/], [/denial can be evaded/i]) &&
        !/blanket no-retry|never replay a failed consequential build/i.test(scope);
    }],
    ['RECOVERY-002', policy, () => invariant(section(policy, 'Lifecycle authority and transitions'),
      [/preserving user work/, /Report partial delivery as a checkpoint, not success/, /A failed check keeps dependent acceptance unmet/],
      [/\b(?:may|can|must) (?:reset|overwrite|discard) (?:unrelated )?user (?:work|edits)/i,
        /\b(?:may|can|must) (?:claim|report) (?:unperformed|failed) (?:execution|checks?|saves?) (?:as )?(?:passed|successful)/i,
        /\b(?:may|can|must) (?:weaken|drop|ignore) (?:original )?acceptance criteria/i])],
    ['PERMISSION-001', runner, () => invariant(section(runner, 'Script Runner'),
      [/establish effective platform permission/, /Absence of separate Workspace Trust telemetry alone proves neither permission nor denial/],
      [/\b(?:may|can|must) (?:assume|guess|infer) permission (?:without|from) (?:evidence|telemetry)/i])],
    ['IDENTITY-001', core, () => invariant(section(core, 'Inspect and bind one actual document'),
      [/canonical phase predecessors must be independently verified, contained, numbered physical Markdown records/i, /Verify kind, subject, version, direct ancestry, freshness/, /direct source lineage/],
      [/\b(?:need not|not required to|may skip) (?:be )?independently verified/i]) &&
      invariant(section(core, 'Preserve physical lineage and historical evidence'), [/direct same-folder links/, /real, contained, numbered physical Markdown record/])],
    ['IDENTITY-002', core, () => invariant(section(core, 'Contain allocation and effects'),
      [/save only an absent exact candidate/, /[Oo]n a collision, re-read the inventory and (?:select|choose) an absent next number/, /never overwrite/],
      [/save to an existing candidate/i, /overwrite (?:the|an) existing (?:record|candidate)/i])],
    ['REVIEW-001', review, () => invariant(section(review, 'Review coordinator'),
      [/For an in-boundary correction, offer the manual Implement route with the original approved Plan/, /fresh independent Review/, /Material new requirements, public behavior, dependencies, security\/compatibility commitments or external effects require an engineer choice and a Plan-owned amendment\/new Plan/, /Unresolved findings prohibit acceptance/, /Review and its Correctness, Security and Maintainability reviewers remain source-read-only/],
      [/material new requirements may be implemented without a decision/i, /unresolved findings permit acceptance/i, /Review (?:may|can|must) edit (?:source|implementation)/i,
        /Review (?:may|can|must) (?:self-accept|accept its own implementation)/i])],
    ['RECORD-002', '.github/skills/safe-implementation/SKILL.md', () => invariant(section('.github/skills/safe-implementation/SKILL.md', 'Execution, validation and record evidence'),
      [/A failed save is not persisted evidence/, /fresh numbered report/],
      [/\b(?:may|can|must) (?:claim|report) (?:an? )?(?:failed|unperformed) save (?:as )?persisted/i])],
    ['QUESTIONS-001', '.github/agents/research.agent.md', () => invariant(section('.github/agents/research.agent.md', 'Research coordinator'),
      [/A clear request proceeds without a compulsory confirmation checkpoint/, /Ask promptly about consequential engineer-owned decisions/],
      [/A clear request waits for an explicit confirmation checkpoint/i]) &&
      invariant(section(questions, 'Procedure'), [/A clear Research request proceeds without a synthesized-understanding confirmation/, /Ask when a material choice cannot be supported/])],
    ['RUNNER-001', runner, () => {
      const text = section(runner, 'Script Runner');
      return invariant(text, [/(?:An unavailable tool|A tool that is not available), actual Restricted Mode\/managed-policy denial or other non-permitting outcome stops/, /Absence of separate Workspace Trust telemetry alone proves neither permission nor denial/, /attribute its actual cwd within that root before a consequential action/, /inspect relevant before\/after file, generated, process and external effects/, /Do not blindly repeat an uncertain destructive\/external effect/, /If a local invocation failed before testing its requirement/, /failed check keeps dependent acceptance unmet/],
        [/denial (?:may|can) be (?:bypassed|evaded)/i, /(?:may|can|must) blindly repeat (?:an )?uncertain destructive\/external effect/i,
          /(?:stable catalogue operation IDs|complete unchanged Tier 1|## Script Runner operations)/i]);
    }],
    ['CI-001', 'package.json', () => {
      if (manifestUnavailable) return null;
      return readManifest().scripts?.['test-copilot-contract-scenarios'] === 'node scripts/test-copilot-contract-scenarios.cjs';
    }],
    ['CI-002', workflow, () => {
      return checkWorkflow(root);
    }],
    ['LIFECYCLE-001', '.github/instructions/lifecycle-records.instructions.md', () => {
      checkLifecyclePatternScope('.github/instructions/lifecycle-records.instructions.md');
      return invariant(section('.github/instructions/lifecycle-records.instructions.md', 'Shared workflow and effect contract'),
        [/matching glob is candidate coverage/, /same-folder links/, /On a collision, re-read and choose an absent next number/, /Review findings alone do not authorize edits/]);
    }],
    ['RECORD-001', '.github/skills/safe-implementation/SKILL.md', () => invariant(section('.github/skills/safe-implementation/SKILL.md', 'Execution, validation and record evidence'),
      [/actually permitted direct command capability/, /Script Runner when useful/, /failed save is not persisted evidence/, /fresh numbered report/])],
    ['GUIDE-001', runBookPath, () => {
      checkVsixRunBook();
      const guideValidator = readText('scripts/verify-vsix-packaging-guide.cjs');
      return !guideCatalogueCouplingIdentifiers.some((identifier) => guideValidator.includes(identifier));
    }],
    ['PACKAGE-001', 'package.json', () => {
      if (manifestUnavailable) return null;
      const manifest = readManifest();
      return manifest.name === 'ukho-copilot-toolkit' && manifest.scripts?.package?.includes('`${p.name}-${p.version}.vsix`') &&
        readText('scripts/verify-vsix-boundary.cjs').includes('`${manifest.name}-${manifest.version}.vsix`');
    }]
  ];
  const violations = [];
  const unavailable = [];
  for (const [id, owner, check] of checks) {
    try {
      const result = check();
      if (result === null) unavailable.push(`DIAGNOSTIC NOT RUN ${id} ${owner}: malformed manifest`);
      else if (!result) violations.push(`DIAGNOSTIC FAIL ${id} ${owner}: owning contract is missing or contradicted`);
    }
    catch (error) { violations.push(`DIAGNOSTIC FAIL ${id} ${owner}: ${error.message}`); }
  }
  return { violations, unavailable };
}

function main() {
  let inventory, manifest;
  let discoveryError, manifestError;
  try { inventory = discover(); } catch (error) { discoveryError = error.message; }
  try { manifest = readManifest(); } catch (error) { manifestError = error.message; }
  let failed = false;
  function group(label, diagnostics, unavailable = []) {
    for (const line of [...diagnostics, ...unavailable]) console.error(line);
    const state = diagnostics.length ? 'FAIL' : unavailable.length ? 'NOT RUN' : 'PASS';
    console.error(`${label}: ${state}`);
    if (state !== 'PASS') failed = true;
  }
  const parity = [];
  const parityUnavailable = [];
  if (manifestError) parityUnavailable.push(`DIAGNOSTIC NOT RUN PARITY-INPUT-MANIFEST package.json: ${manifestError}`);
  if (discoveryError) parityUnavailable.push(`DIAGNOSTIC NOT RUN PARITY-INPUT-DISCOVERY: ${discoveryError}`);
  if (!parityUnavailable.length) {
    try { checkManifestParity(manifest, inventory); }
    catch (error) { parity.push(`DIAGNOSTIC FAIL PARITY-001 package.json: ${error.message}`); }
  }
  group('Manifest parity', parity, parityUnavailable);
  // A malformed manifest makes only manifest-dependent assertions unavailable.
  const authored = authoredChecks(Boolean(manifestError));
  group('Authored contracts', authored.violations, authored.unavailable);
  const structural = [];
  const structuralUnavailable = [];
  if (discoveryError) structuralUnavailable.push(`DIAGNOSTIC NOT RUN STRUCT-INPUT-DISCOVERY: ${discoveryError}`);
  else {
    try { checkCustomizationContracts(inventory); }
    catch (error) { structural.push(`DIAGNOSTIC FAIL ${error.contractId || 'STRUCT-AGENT'} ${error.message}`); }
  }
  group('Frontmatter, links, routes, handoffs and tools', structural, structuralUnavailable);
  if (failed) process.exitCode = 1;
  console.log(staticContractLimitation);
}

function checkCustomizationContracts(inventory) {
  const artifacts = classes.flatMap((definition) => definition.kind === 'skill' ? inventory[definition.name].map((skill) => `${skill}/SKILL.md`) : inventory[definition.name]);
  const names = new Map();
  const frontmatter = new Map();
  for (const relative of artifacts) {
    const parsed = parseFrontmatter(relative);
    if (names.has(parsed.values.name)) fail(`Duplicate contributed customization name ${parsed.values.name}: ${names.get(parsed.values.name)} and ${relative}`);
    names.set(parsed.values.name, relative);
    frontmatter.set(relative, parsed);
    checkLocalLinks(relative, parsed.text);
  }
  const agentNames = new Set(inventory.chatAgents.map((relative) => frontmatter.get(relative).values.name));
  for (const relative of inventory.chatPromptFiles) {
    const values = frontmatter.get(relative).values;
    const name = path.basename(relative, '.prompt.md');
    if (!agentNames.has(values.agent) || values.agent !== promptRoutes[name] || values.name !== name) {
      const error = new Error(`${relative} must use its declared RPIR stage route`);
      error.contractId = 'STRUCT-PROMPT';
      throw error;
    }
    if (Object.hasOwn(values, 'tools')) {
      const allowed = coordinatorTools[values.agent];
      if (!parseStringList(values.tools, relative).every((tool) => allowed.includes(tool))) fail(`${relative} tools must not expand ${values.agent} capabilities`);
    }
  }
  for (const relative of inventory.chatAgents) {
    const { values } = frontmatter.get(relative);
    checkHandoffs(relative, values, agentNames);
    if (Object.hasOwn(coordinatorTools, values.name) && !equal(parseStringList(values.tools, relative), coordinatorTools[values.name])) fail(`${relative} coordinator tools exceed its stage contract`);
    if (coordinators.includes(values.name.toLowerCase())) {
      const delegates = parseStringList(values.agents, relative);
      if (!equal(delegates, delegateRoutes[values.name]) || delegates.some((delegate) => !agentNames.has(delegate)))
        fail(`${relative} must declare only its contributed least-privilege delegates`);
    }
    if (values.name === 'Script Runner') {
      if (values['user-invocable'] !== 'false' || Object.hasOwn(values, 'agents') ||
          !equal(parseStringList(values.tools, relative), ['read', 'search', 'runInTerminal'])) {
        fail(`${relative} must remain non-invocable, non-delegating and non-editing`);
      }
    }
    if (Object.hasOwn(workerTools, values.name)) {
      if (values['user-invocable'] !== 'false') fail(`${relative} worker must declare user-invocable: false`);
      if (!equal(parseStringList(values.tools, relative), workerTools[values.name])) fail(`${relative} worker tools do not match its least-privilege contract`);
    }
  }
}

try { main(); } catch (error) { console.error(`Copilot contract verification failed: ${error.message}`); process.exitCode = 1; }