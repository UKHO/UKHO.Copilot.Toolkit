'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { classes, discover, inspectPath, normalize, root, skillPayloadRoots } = require('./discover-copilot-artifacts.cjs');

const coordinatorTools = {
  Research: ['read', 'search', 'web', 'edit', 'edit/createDirectory', 'agent'],
  Plan: ['read', 'search', 'edit', 'agent'],
  Implement: ['read', 'search', 'edit', 'agent', 'runInTerminal'],
  Review: ['read', 'search', 'edit', 'agent']
};
const promptRoutes = { plan: 'Plan', implement: 'Implement', review: 'Review', 'remediate-review': 'Implement' };
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

// Recognize only immediate explicit negation, not arbitrary prose semantics.
function hasAffirmativeMatch(text, pattern, negation = /\b(?:do not|never) (?:assert (?:that )?)?$/i) {
  return [...text.matchAll(pattern)].some((match) =>
    !negation.test(text.slice(Math.max(0, match.index - 40), match.index)));
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
  const { values, text } = parsed;
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
  const matches = rows.map((row) => row.match(/^\| `([a-z0-9-]+\.agent\.md)` \| `(gpt-6\.1-sol|gpt-6\.1-terra|gpt-6-luna|hydrafusion)` \| ([^|]+) \|$/));
  if (matches.some((match) => !match)) reject('unsupported profile row');
  const own = matches.filter((match) => match[1] === path.posix.basename(relative));
  if (own.length !== 1) reject('profile must contain one role row');
  const model = parseTextScalar((values.model || '').trim(), relative, 'model');
  if (model !== own[0][2] || Object.hasOwn(values, 'reasoning-effort')) {
    reject('scalar model must match the role profile and omit authored reasoning-effort');
  }

  if (manualHandoffCoordinators.has(name)) {
    const body = section(text, '## Native entry and specialist dispatch');
    const route = [...body.matchAll(/^Permitted specialists are exactly \*\*([^*]+)\*\*/gm)];
    if (text.split('\n').filter((line) => line === '## Native entry and specialist dispatch').length !== 1 || route.length !== 1) reject('missing or ambiguous body route');
    const actual = route[0][1].replace(/, and /g, ', ').split(', ');
    if (!equal(actual, delegateRoutes[name]) || actual.some((role) => !agentNames.has(role))) reject('body route differs from permitted specialists');
    if (!/discovered native custom-agent catalogue/i.test(body) || !/hardcoded generated ID or generic substitute/i.test(body) ||
        !/reconcile (?:the )?returned evidence and effects/i.test(body) || !/behavioral controls, not a native per-parent filter/i.test(body)) reject('dispatch and reconciliation safeguards are missing');
    // Check additive route claims throughout the loaded section, while allowing
    // a second enumeration of roles already permitted for this coordinator.
    if (/\b(?:any|all) (?:specialists|workers|agents) (?:may|can) be (?:used|delegated|invoked)|\bonly (?:a |the )?(?:subset|some|selected) (?:of )?(?:the )?(?:permitted )?(?:specialists|workers|agents) (?:may|can|should) be (?:used|invoked|delegated)/i.test(body) ||
      hasAffirmativeMatch(body, /\b(?:use|choose|invoke|delegate to) (?:an? )?(?:generic|arbitrary) (?:worker|agent|specialist)(?: instead)?/gi) ||
      hasAffirmativeMatch(body, /\b(?:use|choose|invoke|delegate to) (?:the |a )?hardcoded generated (?:agent )?ID\b/gi) ||
      hasAffirmativeMatch(body, /\b(?:use|choose|invoke|delegate to) (?:the )?`(?:[a-z0-9-]*agent[a-z0-9-]*[-_][0-9a-f]{4,}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})`/gi)) reject('contradictory body route');
    for (const match of body.matchAll(/\b(?:may|can|should) (?:invoke|delegate to|use) (?:the )?([^.!?\n]+)/gi)) {
      const named = Object.values(delegateRoutes).flat().filter((role) =>
        new RegExp(`\\b${role}\\b`, 'i').test(match[1]));
      if (named.some((role) => !delegateRoutes[name].includes(role))) reject('contradictory body route');
    }
    for (const match of body.matchAll(/\bonly\s+([^.!?\n]+?)\s+(?:may|can|should) be (?:used|invoked|delegated(?: to)?)(?=\s*[.!?])/gi)) {
      const named = [...new Set(Object.values(delegateRoutes).flat().filter((role) =>
        new RegExp(`\\b${role}\\b`, 'i').test(match[1])))];
      if (named.length && (named.length !== delegateRoutes[name].length || named.some((role) => !delegateRoutes[name].includes(role)))) reject('contradictory body route');
    }
    for (const match of body.matchAll(/\b(?:use|invoke|choose)\s+([^.!?\n]+?)\s+instead\b/gi)) {
      if (Object.values(delegateRoutes).flat().some((role) => !delegateRoutes[name].includes(role) &&
          new RegExp(`\\b${role}\\b`, 'i').test(match[1]))) reject('contradictory body route');
    }
    const entries = body.split(/\n\s*\n/).filter((part) => part.trimStart().startsWith('Prospectively,'));
    const entry = entries.length === 1 ? entries[0] : '';
    const entryRules = {
      Research: [/selects Research and deliberately sends the new objective/i, /manual request to the selected Plan coordinator with the actual inspected physical Research brief and version/i, /unsent prefill does not invoke a phase/i],
      Plan: [/select this role and deliberately send a stage request with the actual physical Research predecessor/i, /manual request to Implement with the inspected physical Plan/i, /unsent prefill is not invocation or approval/i],
      Implement: [/receiving-role rule is already effective before invocation/i, /selects Implement and deliberately sends a request with the inspected physical approved Plan/i, /where policy effective at invocation requires explicit `\/implement`, use that route to bootstrap/i, /policy edit does not self-upgrade a session or make an earlier invocation retroactive/i, /manual independent Review with the (?:actual )?inspected physical implementation report/i, /suggestion does not invoke or accept it/i],
      Review: [/selects Review and deliberately sends a stage request with the actual physical implementation report/i, /manual Implement request with the original approved physical Plan and linked Review/i, /manual Plan request with the physical Review/i, /Neither suggestion invokes the receiver/i]
    };
    if (entryRules[name].some((rule) => !rule.test(entry)) ||
      (name !== 'Implement' && !/(?:current.policy bootstrap|current policy[^.\n]*bootstrap)/i.test(entry)) ||
      !/self.upgrade/i.test(entry) || /(?:automatically|auto.submit)[^.!?\n]*(?:invoke|send|transition)|(?:picker|prefill) (?:is|constitutes) (?:an? )?(?:invocation|approval)/i.test(body) ||
      (name === 'Implement' && /(?:policy edits? (?:automatically )?self-upgrades? (?:a |the )?(?:loaded )?session|(?:prior|earlier) invocations? (?:are|is) retroactive|explicit `\/implement` is always required)/i.test(body))) {
      reject('native entry and manual next-stage safeguards are missing or contradictory');
    }
  } else {
    const heading = name === 'Script Runner' ? '# Script Runner' :
      name === 'Stage Assurance' ? '## Role and inputs' : '## Role and objective';
    if (text.split('\n').filter((line) => line === heading).length !== 1) reject('missing or ambiguous worker owner');
    const body = section(text, heading).split(/^## /m)[0];
    const rules = body.split(/\n\s*\n/).filter((part) => part.trimStart().startsWith('Do not delegate or accept work beyond'));
    if (rules.length !== 1 || !/Unexpected exposed tools grant no authority; disclose and do not use them/i.test(rules[0]) ||
        !/Return evidence, effects, failed or unavailable checks and uncertainties for coordinator reconciliation/i.test(rules[0])) reject('worker nondelegation and return safeguards are missing');
    if (/workers? (?:may|can|should) delegate|unexpected tools (?:grant|confer) authority/i.test(body)) reject('contradictory worker boundary');
  }
  return true;
}

function checkNativeSupportMetadata(manifest, lock) {
  if (manifest?.engines?.vscode !== '^1.146.0' || lock?.packages?.['']?.engines?.vscode !== '^1.146.0') {
    fail('Manifest and root lockfile must both target ^1.146.0', 'NATIVE-SUPPORT-001');
  }
  return true;
}

function checkNativeModelObservationContract(skill, profile) {
  if (skill.split('\n').filter((line) => line === '## Procedure').length !== 1 ||
      profile.split('\n').filter((line) => line === '## Selection, escalation and failure').length !== 1) {
    fail('missing or ambiguous model observation owner', 'NATIVE-MODEL-001');
  }
  const owners = { procedure: section(skill, '## Procedure'), selection: section(profile, '## Selection, escalation and failure') };
  for (const [owner, text] of Object.entries(owners)) {
    if (!/assigned (?:versus|model from the) observed effective model/i.test(text) ||
        !/actual override or fallback evidence/i.test(text) || !/effective model not observable/i.test(text) ||
        !/fallback cause not exposed/i.test(text) || !/(?:do not infer fallback from missing telemetry|Missing telemetry alone neither proves fallback)/i.test(text) ||
        !/known wrong default is not a (?:pass|successful default-routing observation)/i.test(text) ||
        !/(?:unknown telemetry alone does not stop|Missing telemetry alone neither proves fallback nor stops) independent safe work/i.test(text)) {
      fail(`${owner}: missing truthful model observation boundary`, 'NATIVE-MODEL-001');
    }
    const inventedCause = text.split(/(?<=[.!?])\s+|\n/).some((sentence) => {
      const cause = hasAffirmativeMatch(sentence, /\bfallback (?:was |is )?caused by (?:an? )?unavailable model|\b(?:the |an? )?model (?:was|is) unavailable,? which caused (?:the )?fallback/gi);
      const evidence = /(?:observed|recorded|captured) evidence (?:from|in) (?:the )?(?:runtime|diagnostics|logs?)[^.!?\n]*(?:shows|confirms|establishes)|(?:according to|based on) (?:the )?(?:observed|recorded|captured) (?:runtime |diagnostic )?(?:evidence|logs?|diagnostics)/i.test(sentence);
      return cause && !evidence;
    });
    if (inventedCause || /unknown (?:effective )?(?:model|selection) (?:is|counts as) (?:a )?(?:success|pass)|(?:a )?(?:known )?(?:wrong default|mismatch) (?:is|counts as) (?:a )?(?:default )?(?:success|pass)/i.test(text)) {
      fail(`${owner}: contradictory model observation boundary`, 'NATIVE-MODEL-001');
    }
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

function requireADRRule(text, patterns, diagnostic) {
  if (patterns.some((pattern) => !pattern.test(text))) fail(diagnostic, 'ADR-CONTRACT-001');
}

// Coordinator rules belong to the normative body, not metadata or appended
// historical/example sections. This is a bounded selector, not a Markdown parser.
function coordinatorBody(text, role) {
  const heading = `# ${role} coordinator`;
  if (text.split('\n').filter((line) => line === heading).length !== 1 ||
      text.split('\n').filter((line) => line === '## Native entry and specialist dispatch').length !== 1) return '';
  const body = section(text, heading);
  return body.split(/^## /m)[0] + '\n' + section(body, '## Native entry and specialist dispatch');
}

// Heading-bounded sections and anchored paragraphs/fields keep historical,
// metadata and wrong-owner decoys out of normative contract assertions.
function section(text, heading) {
  const lines = text.split('\n');
  const start = lines.indexOf(heading);
  if (start < 0) return '';
  const depth = heading.match(/^#+/)[0].length;
  const end = lines.findIndex((line, index) => index > start &&
    new RegExp(`^#{1,${depth}} `).test(line));
  return lines.slice(start + 1, end < 0 ? undefined : end).join('\n');
}

function paragraph(text, start) {
  return text.split(/\n\s*\n/).find((part) => part.trimStart().startsWith(start)) || '';
}

function planArchitectureGuidance(text) {
  // Decision reuse also starts with "Reconcile". Identify the architecture
  // owner by its existing capability link, not prose that the checks mutate.
  // Metadata/history are outside the coordinator body; ambiguous owners fail
  // closed rather than borrowing a valid rule from another paragraph.
  const owners = coordinatorBody(text, 'Plan').split(/\n\s*\n/)
    .filter((part) => part.includes('](../skills/architecture-decision-records/SKILL.md)'));
  return owners.length === 1 ? owners[0] : '';
}

function field(text, label) {
  return text.split('\n').find((line) => line.startsWith(`- **${label}:**`)) || '';
}

function requireCoverageRule(text, patterns, owner, rule) {
  if (patterns.some((pattern) => !pattern.test(text))) {
    fail(`${owner}: ${rule}`, 'ADR-COVERAGE-001');
  }
}

function rejectArchitectureExemption(text, owner) {
  // Deliberately bounded contradiction vocabulary, not general NLP. Evaluate
  // normative owners only; quoted history outside their section is not policy.
  if (/(?:small|reversible|spike)[^.!?\n]*(?:may|can) (?:skip|omit|ignore)[^.!?\n]*(?:ADR|architectur|coverage)/i.test(text) ||
      /(?:small|reversible|spike)[^.!?\n]*(?<!not )\b(?:are|is) exempt/i.test(text) ||
      /(?:ADR|architectural) coverage is (?:optional|selective)/i.test(text) ||
      /(?:only (?:some|selected) architectural choices|(?:every|all) (?:minor |routine )?coding choices? (?:must|require|needs?)[^.!?\n]*ADR)/i.test(text) ||
      /(?:a|one) valid (?:bound )?ADR[^.!?\n]*(?:is sufficient|establishes complete coverage)/i.test(text)) {
    fail(`${owner}: contradictory architectural coverage exemption or coding burden`, 'ADR-COVERAGE-001');
  }
}

// Omission remains supported by the injectable API; an explicitly supplied
// discovery source, even an invalid one, must never borrow workspace content.
function discoverySource(sources) {
  return Object.hasOwn(sources, 'discovery')
    ? (typeof sources.discovery === 'string' ? sources.discovery : '')
    : readText('.github/skills/agent-question-resolution/references/research-intent-discovery.md');
}

function checkExplicitAssuranceSources(sources) {
  for (const key of ['assuranceSkill', 'assurance']) {
    if (Object.hasOwn(sources, key) && (typeof sources[key] !== 'string' || !sources[key].trim())) {
      fail(`${key}: missing or ambiguous technical handoff source`, 'RPIR-HANDOFF-001');
    }
  }
}

const noZeroUnknowns = /(?:do not|does not|never) require zero (?:factual )?unknowns|(?:do not|never) require zero unknown facts|do not (?:require|impose) (?:a )?zero[- ](?:factual[- ])?unknowns?(?: rule| requirement)?|(?:not a|no) zero[- ](?:factual[- ])?unknowns? (?:rule|requirement)/i;

function checkCompleteArchitectureCoverage(source) {
  const owners = {
    skill: section(source.skill, '## Purpose and consumers'),
    coverage: source.coverage.split('\n| Sample input')[0],
    research: paragraph(coordinatorBody(source.research, 'Research'), 'Explicitly identify architectural choices'),
    researchSkill: section(source.researchSkill, '## Procedure'),
    researchTemplate: section(source.researchTemplate, '### ADR inputs and remaining gaps'),
    plan: planArchitectureGuidance(source.plan),
    planning: section(source.planning, '## Procedure'),
    planTemplate: field(section(source.planTemplate, '## Outcome and boundaries'), 'Architectural choice coverage and ADR binding'),
    core: section(source.core, '### Planning-stage ADR authorship exception'),
    repository: section(source.repository, '### Planning-stage architecture decisions')
  };
  for (const [owner, text] of Object.entries(owners)) {
    const identification = ['coverage', 'research', 'researchSkill'].includes(owner);
    requireCoverageRule(text, owner === 'researchTemplate' ? [
      /Explicitly identify each architectural choice/i,
      /Plan adds planning discoveries[^.!?\n]*binds inspected ADR path\/ID/i
    ] : identification ? [
      /identify (?:all )?architectural choices/i,
      /discovery\/acknowledgment or explicit-deferral/i
    ] : [
      /(?:reconcile|reconciles)[^.!?\n]*(?:every|all)[^.!?\n]*(?:architectural choice|Research choice|choice)/i,
      /planning discover/i,
      /inspected[^.!?\n]*(?:ADR |choice |choice-to-ADR )?coverage|coverage[^.!?\n]*inspected ADR|bind the inspected ADR path\/ID/i
    ], owner, 'complete upfront choice identification/reconciliation is required');
    requireCoverageRule(text, [
      /[Pp]roportionality (?:governs|controls)[^.!?\n]*detail[^.!?\n]*not (?:architectural )?coverage/i,
      /small[^.!?\n]*(?:reversible|spike)/i
    ], owner, 'proportional detail must not exempt small/reversible architecture');
    rejectArchitectureExemption(text, owner);
  }

  const representation = {
    skill: section(source.skill, '## Complete coverage and reuse'),
    coverage: section(source.coverage, '## Choice identification and Plan reconciliation'),
    template: section(source.template, '## Decision and conditions'),
    plan: owners.plan,
    planning: owners.planning,
    planTemplate: owners.planTemplate,
    core: owners.core,
    repository: owners.repository
  };
  for (const [owner, text] of Object.entries(representation)) {
    requireCoverageRule(text, [
      /(?:each|every|individual)[^.!?\n]*choice/i,
      /(?:reuse|reusing|reused)/i, /(?:duplicate|duplication)/i,
      /[Gg]roup|Related choices may share a record/i,
      /(?:individually|individual choice|each choice|every individual choice)/i,
      /umbrella|keep each choice identifiable/i
    ], owner, 'meaningful per-choice grouped/reused coverage is required');
    const groupedRule = text.match(/(?:Group related choices|Related choices may share a record|Group only where|Group choices only|Meaningful grouping|grouped coverage must|meaningful grouping must)[^.!?\n]*[.!?]/i)?.[0] || '';
    requireCoverageRule(owner === 'template' ? text : groupedRule, owner === 'template' ? [
      /repeat for each grouped architectural choice/i,
      /keep each choice identifiable even when context is shared/i
    ] : [/(?:each choice|every individual choice)/i], owner,
    'meaningful per-choice grouped/reused coverage is required');
    // Some owners explicitly define the per-choice fields before referring to
    // them in the grouping sentence. Inspect only that anchored clause, never
    // the whole section or the group's shared-context/rationale preamble.
    const perChoice = owner === 'template'
      ? section(text, '### <Identifiable choice ID or section — repeat for each grouped architectural choice>')
      : owner === 'plan' || owner === 'planning'
        ? text.match(/(?:Preserve each choice's|For each choice retain)[^.!?\n]*[.!?]/i)?.[0] || ''
        : groupedRule.match(/(?:each choice|every individual choice)[^.!?\n]*/i)?.[0] || '';
    requireCoverageRule(perChoice, [/(?:each choice|For each choice|\*\*Choice and)/i], owner,
      'meaningful per-choice grouped/reused coverage is required');
    const groupedFields = owner === 'template' ? [
      ['rationale/reasoning', /^- \*\*Choice and (?:rationale|reasoning):\*\*/im],
      ['alternatives', /^- \*\*(?:Realistic )?alternatives and (?:reasoning|rationale):\*\*/im],
      ['selection/pending state', /^- \*\*(?:Actual )?selection or (?:explicit )?pending state:\*\*/im],
      ['conditions', /^- \*\*conditions\b[^*\n]*:\*\*/im],
      ['affected work', /^- \*\*[^*\n]*\baffected (?:Work Items|work):\*\*/im]
    ] : [
      ['rationale/reasoning', /\b(?:rationale|reasoning)\b/i],
      ['alternatives', /\balternatives\b/i],
      ['selection/pending state', /\bselection(?:\/| or (?:explicit )?)pending state\b/i],
      ['conditions', /\bconditions\b/i],
      ['affected work', /\baffected (?:Work Items?(?: IDs)?|work)\b/i]
    ];
    for (const [label, pattern] of groupedFields) {
      requireCoverageRule(perChoice, [pattern], owner, `grouped per-choice coverage is missing ${label}`);
    }
    rejectArchitectureExemption(text, owner);
  }

  const downstream = {
    implement: paragraph(coordinatorBody(source.implement, 'Implement'), 'Assess complete architectural choice coverage'),
    safe: paragraph(section(source.safe, '## Procedure'), 'Assess complete architectural choice coverage'),
    validation: section(source.validation, '## Scope and recovery').split('\n')
      .find((line) => line.startsWith('- [ ] Assess complete architectural choice coverage')) || '',
    implementationReport: field(section(source.implementationReport, '## Delivered outcome and progress'), 'Architectural choice coverage and ADR evidence'),
    review: paragraph(coordinatorBody(source.review, 'Review'), 'Independently assess complete architectural choice coverage'),
    codeReview: section(source.codeReview, '## Procedure').split('\n')
      .find((line) => line.trimStart().startsWith('Independently assess complete architectural choice coverage')) || '',
    reviewReport: field(section(source.reviewReport, '## Disposition and comparison'), 'Architectural choice coverage and ADR comparison'),
    assuranceSkill: section(source.assuranceSkill, '## Assessment').split('\n')
      .find((line) => line.trimStart().startsWith('Assess complete architectural choice coverage')) || '',
    assurance: section(source.assurance, '## Delivery and material boundaries').split('\n')
      .find((line) => line.startsWith('- [ ] Assess complete architectural choice coverage')) || ''
  };
  for (const [owner, text] of Object.entries(downstream)) {
    requireCoverageRule(text, [
      /assess complete architectural choice coverage against Research, the approved Plan and actual changes/i,
      /(?:missing or partial|missing\/partial) coverage even when a valid ADR is bound/i
    ], owner, 'detect missing/partial choice coverage despite a valid bound ADR');
    requireCoverageRule(text, [
      /(?:For )?unexpected uncovered or changed architecture,[^.!?\n]*engineer-directed Plan resolution before dependent architectural effects/i,
      /continue independent approved work/i
    ], owner, 'unexpected architecture requires engineer-directed Plan resolution before dependent effects with independent-work continuity');
    requireCoverageRule(text, [
      /Routine naming, helper extraction and architecture-preserving repairs remain Implement-owned without ADR reference/i,
      /resolve material classification ambiguity with the engineer using evidence/i
    ], owner, 'routine coding needs no ADR and material ambiguity needs engineer resolution');
    rejectArchitectureExemption(text, owner);
  }
  const assurancePlan = section(source.assurance, '## Stage-specific outcome').split('\n')
    .find((line) => line.startsWith('- **Plan:**')) || '';
  requireCoverageRule(assurancePlan, [
    /[Rr]econcile every Research architectural choice and planning discovery/i,
    /inspected ADR path\/ID, identifiable section, substantive version\/state, actual agreement\/conditions and affected Work Items/i,
    /valid ADR for some choices does not cover omissions/i,
    /gap[^.!?\n]*dependent effects[^.!?\n]*resolution route/i,
    /evidence-supported routine-only disposition/i
  ], 'assurance Plan', 'assess every choice and truthful gaps, not only bound-record consistency');

  const routine = {
    skill: section(source.skill, '## Purpose and consumers'),
    research: owners.research, researchSkill: owners.researchSkill, researchTemplate: owners.researchTemplate,
    plan: paragraph(coordinatorBody(source.plan, 'Plan'), 'Topology,'),
    planning: owners.planning,
    planTemplate: field(section(source.planTemplate, '## Outcome and boundaries'), 'Architecture boundaries and unresolved conditions'),
    core: owners.core, repository: owners.repository
  };
  for (const [owner, text] of Object.entries(routine)) {
    requireCoverageRule(text, [
      /[Nn]aming[^.!?\n]*helper extraction[^.!?\n]*architecture-preserving[^.!?\n]*(?:without|need no) ADR reference/i,
      /classification ambiguity[^.!?\n]*engineer|ambiguity[^.!?\n]*engineer/i
    ], owner, 'preserve the routine-coding boundary and evidence-led ambiguity route');
    rejectArchitectureExemption(text, owner);
  }
  for (const [owner, text] of [
    ['readme', section(source.readme, '### Complete upfront architectural coverage')],
    ['wikiRpir', section(source.wikiRpir, '## Complete upfront architectural coverage')],
    ['wikiEvidence', section(source.wikiEvidence, '### Architecture decision records are supplementary')],
    ['wikiCatalogue', section(source.wikiCatalogue, '### Skills').split('\n')
      .find((line) => line.includes('](../../.github/skills/architecture-decision-records/SKILL.md)')) || '']
  ]) {
    requireCoverageRule(text, [
      /Research[^.!?\n]*identif[^.!?\n]*architectural choices/i,
      /Plan reconciles every choice[^.!?\n]*planning discoveries[^.!?\n]*inspected ADR coverage/i,
      /[Pp]roportionality governs detail, not coverage/i,
      /missing\/partial coverage even (?:when a valid ADR is bound|with a valid binding)/i,
      /[Uu]nexpected uncovered or changed architecture[^.!?\n]*engineer-directed Plan resolution before dependent/i,
      /independent approved work continues/i,
      /routine[^.!?\n]*without ADR reference/i,
      /(?:static|Static)[^.!?\n]*(?:do not|does not|not proof)[^.!?\n]*(?:semantic completeness|installed)/i
    ], owner, 'user guidance must describe complete coverage and static/runtime limits');
    rejectArchitectureExemption(text, owner);
  }
  // Scan the entire bounded normative scope too, so an additive exemption in
  // a second paragraph cannot hide behind the still-correct owning paragraph.
  for (const [owner, text] of Object.entries({
    ...owners, ...representation, ...routine,
    core: `${owners.core}\n${section(source.core, '### Prospective exact-ADR sign-off recording effect')}`,
    planTemplate: section(source.planTemplate, '## Outcome and boundaries'),
    implement: coordinatorBody(source.implement, 'Implement'),
    review: coordinatorBody(source.review, 'Review'),
    research: coordinatorBody(source.research, 'Research'),
    plan: coordinatorBody(source.plan, 'Plan'),
    safe: section(source.safe, '## Procedure'),
    validation: section(source.validation, '## Scope and recovery'),
    implementationReport: section(source.implementationReport, '## Delivered outcome and progress'),
    codeReview: section(source.codeReview, '## Procedure'),
    reviewReport: section(source.reviewReport, '## Disposition and comparison'),
    assuranceSkill: section(source.assuranceSkill, '## Assessment'),
    assurance: section(source.assurance, '## Delivery and material boundaries')
  })) rejectArchitectureExemption(text, owner);
}

function checkDecisionReadinessContract(source) {
  checkExplicitAssuranceSources(source);
  const researchAgent = paragraph(coordinatorBody(source.research, 'Research'), 'Explicitly identify architectural choices');
  const researchSkill = section(source.researchSkill, '## Procedure').split('\n').find((line) => line.startsWith('7. Before handoff')) || '';
  const researchTemplate = section(source.researchTemplate, '### ADR inputs and remaining gaps');
  for (const [owner, text] of Object.entries({ researchAgent, researchSkill, researchTemplate })) {
    requireADRRule(text, [
      /resolve foreseeable[^.!?\n]*choices (?:where|when) practicab(?:le|ility)|resolve foreseeable[^.!?\n]*choices (?:where|when) practical/i,
      /(?:distinguish|separate|classify)[^.!?\n]*(?:decision|choice)[^.!?\n]*(?:fact|factual)|(?:distinguish|separate|classify)[^.!?\n]*(?:fact|factual)[^.!?\n]*(?:decision|choice)/i,
      /do not present an unresolved architectural choice as a factual unknown/i,
      /do not treat a complete Proposed ADR as missing decision content merely because sign-off is pending/i
    ], `${owner}: Research must resolve foreseeable choices and distinguish factual gaps from decisions`);
  }
  requireADRRule(researchAgent, [
    /separately identify factual unknowns[^.!?\n]*evidence[^.!?\n]*consequence[^.!?\n]*(?:check|acquisition) route/i
  ], 'Research coordinator must hand over factual evidence gaps separately');

  const planAgent = paragraph(coordinatorBody(source.plan, 'Plan'), 'A completed Plan');
  const planningProcedure = section(source.planning, '## Procedure').split('\n').find((line) => line.startsWith('5. Inspect relevant')) || '';
  const planningGaps = section(source.planning, '### Resolve material planning gaps');
  for (const [owner, text] of Object.entries({ planAgent, planningProcedure, planningGaps })) {
    for (const [pattern, rule] of [
      [/completed Plan has no (?:unresolved architectural choice|unsettled architectural decision)/i,
        'completed Plan must have no unresolved architectural choice'],
      [/foreseeable[^.!?\n]*choices (?:where|when) practicable/i, 'resolve foreseeable choices where practicable'],
      [/do not treat a complete Proposed ADR as missing decision content merely because sign-off is pending/i,
        'distinguish Proposed sign-off from missing decision content']
    ]) requireADRRule(text, [pattern], `${owner}: Plan must resolve architecture; ${rule}`);
    requireADRRule(text, [
      /remaining material factual unknown/i,
      /bounded (?:check|route)/i,
      /expected interpretation/i,
      /allowed in-scope response/i,
      /affected (?:Work Items\/effects|items?(?: and|\/) effects)/i,
      /engineer-(?:escalation|direction) condition|(?:condition|escalation)[^.!?\n]*engineer direction/i,
      /independent work that can continue|independent[^.!?\n]*continue/i,
      /bare `TBD`[^.!?\n]*(?:not[^.!?\n]*actionable|insufficient)/i,
      noZeroUnknowns,
      /fact[^.!?\n]*(?:changes|invalidates)[^.!?\n]*architectural choice[^.!?\n]*hold[^.!?\n]*dependent effects/i
    ], `${owner}: residual facts need a bounded per-Work-Item route without a zero-unknowns rule`);
  }

  const templateDetails = section(source.planTemplate, '## Detailed work items');
  requireADRRule(templateDetails, [
    /Residual factual unknown \(include only when a material fact remains\)/i,
    /current evidence/i, /bounded check\/observation/i,
    /expected interpretation and allowed in-scope response/i,
    /affected Work Items\/effects/i,
    /engineer-escalation condition/i,
    /independent work that can continue/i,
    /bare TBD[^.!?\n]*(?:not|insufficient)[^.!?\n]*actionable/i,
    /do not use this route for an unresolved architectural decision/i,
    noZeroUnknowns
  ], 'Plan template: existing Work Item detail must provide the complete optional factual-unknown route');

  // Bounded authored obligations in their actual owners, never an evaluator
  // for arbitrary Plan decisions or conversation behavior.
  const readinessOwners = {
    research: paragraph(coordinatorBody(source.research, 'Research'), 'Make readiness evidence inspectable'),
    researchSkill: section(source.researchSkill, '## Procedure').split('\n').find((line) => line.startsWith('8. Make readiness evidence inspectable')) || '',
    researchTemplate: paragraph(researchTemplate, '**Readiness evidence:**')
  };
  function requireHandoff(text, patterns, owner, rule) {
    if (patterns.some((pattern) => !pattern.test(text))) {
      fail(`${owner}: ${rule}`, 'RPIR-HANDOFF-001');
    }
  }
  for (const [owner, text] of Object.entries(readinessOwners)) {
    requireHandoff(text, [/proportionate[^.!?\n]*feasibility/i, /realistic alternatives/i,
      /recommendation/i, /actual engineer direction/i, /material carry-forward/i], owner,
    'connect investigation, options, recommendation, actual direction and justified residuals');
  }
  for (const [owner, pattern] of Object.entries({
    research: /(?:rather than substitute the recommended answer|keep the recommendation separate from actual engineer direction)/i,
    researchSkill: /(?:do not substitute the recommendation for the actual answer|keep actual engineer answers distinct from the recommendation)/i,
    researchTemplate: /(?:do not substitute a recommendation for an answer|keep actual engineer answers separate from the recommendation)/i
  })) requireHandoff(readinessOwners[owner], [pattern], owner,
    'keep recommendations distinct from actual engineer answers');
  for (const owner of ['researchSkill', 'researchTemplate']) {
    requireHandoff(readinessOwners[owner], [/what was investigated/i, /why it reasonably remains/i,
      /downstream consequence and supported resolution route/i, /qualified (?:or|and) nonrecommended answers/i,
      /no[^\n]*investigation quota|(?:do not|not)[^\n]*investigation quota/i], owner,
    'explain material residuals and preserve actual answers without an investigation quota');
  }
  const reuseOwners = {
    plan: paragraph(coordinatorBody(source.plan, 'Plan'), 'Reconcile supplied decisions before questioning'),
    planning: paragraph(planningGaps, 'Reconcile supplied decisions before questioning')
  };
  for (const [owner, text] of Object.entries(reuseOwners)) {
    requireHandoff(text, [/actual engineer selections/i, /qualified (?:or|and) nonrecommended answers/i,
      /genuinely new evidence/i, /consequence/i, /recheck/i], owner,
    'reuse actual selections and justify material reopening with new evidence');
    requireHandoff(text, [owner === 'plan'
      ? /(?:rather than substitute recommendations|keep actual engineer selections separate from recommendations)/i
      : /(?:do not substitute recommendations|keep actual engineer selections separate from recommendations)/i], owner,
      'keep recommendations distinct from actual engineer answers');
  }
  const destination = paragraph(coordinatorBody(source.plan, 'Plan'), 'Create/revise only a directly associated Proposed ADR');
  requireHandoff(destination, [/evidenced consumer conventions for an existing verified contained ADR destination/i,
    /resolve genuine ambiguity with the engineer/i, /necessary directory only at an explicitly engineer-selected, verified contained destination/i,
    /guard directory and file effects separately/i, /absence\/collision, effective permission, save and readback/i],
  'plan', 'reuse evidenced existing ADR destinations and guard new directory/file effects separately');
  const agreement = field(section(source.planTemplate, '## Outcome and boundaries'), 'Architectural choice coverage and ADR binding');
  requireHandoff(agreement, [/ordinary (?:implementation|delivery) approval alone does not establish architectural agreement/i,
    /qualifying deliberate engineer-sent Implement request with the inspected physical approved Plan/i, /rule already effective before invocation/i,
    /exact Proposed preimage visibly bound/i, /actual authority and satisfied conditions/i,
    /no prior invocation is retroactive/i, /Invocation is distinct from persisted Accepted metadata/i,
    /separate guarded coordinator save and full readback/i], 'planTemplate',
  'distinguish ordinary approval, qualifying exact sign-off and verified persistence');
  for (const [owner, text] of Object.entries({ ...readinessOwners, ...reuseOwners, destination, agreement })) {
    if (/Research must investigate every fact before Plan|Always substitute the recommendation for the engineer's answer|Always re-ask answered questions|Every existing ADR destination requires fresh selection|Invocation alone proves persisted Accepted/i.test(text)) {
      fail(`${owner}: contradictory handoff readiness rule`, 'RPIR-HANDOFF-001');
    }
  }

  const diagnosis = {
    implement: paragraph(coordinatorBody(source.implement, 'Implement'), 'Use the safe-implementation method for effect-specific diagnosis'),
    safe: section(source.safe, '### Effect-specific diagnosis and correction').replace(/\*\*/g, ''),
    reportRemaining: field(section(source.implementationReport, '## Delivered outcome and progress'), 'Remaining Plan work'),
    assurance: section(source.assurance, '## Delivery and material boundaries').split('\n')
      .find((line) => line.startsWith('- [ ] Each hold distinguishes')) || ''
  };
  for (const [owner, text] of Object.entries(diagnosis)) {
    requireHandoff(text, [/decision/i, /evidence/i, /ADR content(?:\/agreement\/persistence|[^\n]*agreement[^\n]*persistence)/i,
      /capability/i, /permission/i, /affected effect/i, /next permitted route/i,
      /independently authorized work/i, /(?:why|explain why) none exists/i,
      /independent investigation is not source-edit authority/i], owner,
    'classify the dependent effect and independently authorized work without inventing edit authority');
  }
  for (const [owner, text] of Object.entries({ implement: diagnosis.implement, safe: diagnosis.safe })) {
    requireHandoff(text, [/Diagnose, correct and recheck supported in-boundary issues under actual authority/i,
      /(?:rather than|do not) merely log them or defer for unpredicted files\/debugging/i,
      /(?:do not bypass a real denial|Do not bypass a real denial)/i,
      /(?:do not |or )relabel an approved-outcome defect as optional advice/i], owner,
    'require authorized correction and recheck instead of report-only evasion');
  }
  const reportCorrections = field(section(source.implementationReport, '## Delivered outcome and progress'), 'Corrections');
  requireHandoff(reportCorrections, [/diagnosis/i, /actual authorized attributable repair/i,
    /relevant recheck and actual result/i, /next permitted route/i, /not report-only deferral/i],
  'reportCorrections', 'record actual correction, recheck and unresolved dependencies in existing fields');
  const reviewOwners = {
    review: paragraph(coordinatorBody(source.review, 'Review'), 'Assess handoff evidence through'),
    codeReview: section(source.codeReview, '## Procedure').split('\n').find((line) => line.startsWith('6. Assess handoff evidence')) || '',
    reviewRubric: paragraph(section(source.reviewRubric, '## Finding format'), 'Classify actionability/uncertainty'),
    reviewEvidence: field(section(source.reviewReport, '## Disposition and comparison'), 'Evidence and risks')
  };
  for (const [owner, text] of Object.entries(reviewOwners)) {
    requireHandoff(text, [/observed messages\/tool chronology/i, /recorded claims/i,
      /chronology[^.!?\n]*runtime effectiveness[^.!?\n]*unverified despite static passes/i], owner,
    'distinguish observed chronology from claims and leave runtime unverified');
  }
  const reviewRoutes = {
    review: reviewOwners.review, codeReview: reviewOwners.codeReview, reviewRubric: reviewOwners.reviewRubric,
    reviewFindings: paragraph(section(source.reviewReport, '## Findings'), 'For each supported original-criteria defect'),
    assuranceClosure: section(source.assurance, '## Conversation evidence rubric').split('\n')
      .find((line) => line.startsWith('| Correction and closure |')) || ''
  };
  for (const [owner, text] of Object.entries(reviewRoutes)) {
    requireHandoff(text, [/original-criteria defect/i, /manual Implement resumption/i,
      /independent re-review/i, /optional advice|optional-advice evasion/i,
      /unresolved findings/i, /engineer-owned|engineer decision/i,
      /no source-edit|source-read-only|never gains source-edit/i], owner,
    'route supported defects to manual correction and independent re-review without acceptance or scope expansion');
  }
  requireHandoff(diagnosis.safe, [/genuinely new requirement/i, /engineer evidence, affected effects and a recommended resolution/i,
    /Plan-owned resolution before dependent material changes/i], 'safe',
  'escalate material changes with evidence and a recommended engineer resolution');
  const contradictionScopes = { ...diagnosis, reportCorrections, ...reviewOwners, ...reviewRoutes };
  for (const [owner, text] of Object.entries(contradictionScopes)) {
    if (/Supported in-boundary defects may be reported without repair|Independent investigation grants source-edit authority|A real denial may be bypassed|Review may edit source to close findings|Static passes prove runtime effectiveness|Unresolved findings may be accepted|Automatically invoke Implement for correction|Material changes may proceed without engineer direction/i.test(text)) {
      fail(`${owner}: contradictory correction or evidence rule`, 'RPIR-HANDOFF-001');
    }
  }
  checkResearchCompleteHandoffs(source);
}

// Select only unique normative headings and uniquely anchored paragraphs or
// fields. Never recover a missing owner from metadata, history or another
// field. These are bounded authored-text assertions, not a semantic oracle.
function checkResearchCompleteHandoffs(source) {
  function scope(key, heading) {
    const text = key === 'discovery' ? discoverySource(source) : source[key] || '';
    if (text.split('\n').filter((line) => line === heading).length !== 1) return '';
    const body = section(text, heading);
    return heading.startsWith('# ') ? coordinatorBody(text, heading.slice(2).replace(/ coordinator$/, '')) : body;
  }
  function unit(key, heading, prefix, line = false) {
    const body = scope(key, heading);
    const parts = line ? body.split('\n') : body.split(/\n\s*\n/);
    const matches = parts.filter((part) => part.trimStart().startsWith(prefix));
    return matches.length === 1 ? matches[0] : '';
  }
  function requireOwner(owner, text, patterns, rule) {
    if (!text || patterns.some((pattern) => !pattern.test(text))) {
      fail(`${owner}: ${rule}`, 'RPIR-HANDOFF-001');
    }
  }
  const research = [
    /(?:evidence-supported|supported) viable mechanism/i, /decision-critical feasibility/i,
    /realistic alternatives/i, /recommendation/i, /actual (?:qualified )?engineer (?:direction|selections?)/i,
    /(?:(?:unestablished|unresolved) essential (?:mechanism|feasibility)|essential feasibility or (?:the )?mechanism is unestablished)/i,
    /architectural or not/i, /unfinished Research/i, /affected effects/i, /evidence route/i,
    /(?:not|rather than) (?:a )?ready (?:implementation task|delivery work)/i,
    /establish(?:es)?[^.!?\n]*(?:evidence-supported|supported) viable mechanism[^.!?\n]*decision-critical feasibility/i,
    /(?:technical conclusion ready for delivery conversion establishes|before presenting the technical conclusion as ready for delivery conversion)/i
  ];
  const conversion = [
    /freshness(?: and |\/)applicability/i, /(?:convert|converts)[^.!?\n]*(?:supported|viable mechanism|conclusion)/i,
    /inherited[^.!?\n]*essential/i, /(?:genuinely )?new requirements(?: or |\/)evidence/i,
    /(?:gap|affected effects)/i, /scoped engineer-directed Research continuation or supplementation/i,
    /(?:when|where) evidence is needed/i, /(?:not hidden|do not (?:hide|silently perform)) essential (?:solution )?research/i,
    /(?:independent(?:ly)? (?:supported )?planning|independent supported work)/i,
    /truthful drafts/i, /(?:(?:without|no) automatic restart|(?:never|do not) automatically restart)/i,
    /retroactive blame/i, /(?:manual invocation|veto manual invocation|invocation veto)/i
  ];
  const residual = [
    /supported mechanism (?:(?:it|this fact|the residual) tests|(?:being )?tested)/i, /why (?:it|the fact) reasonably remains/i,
    /bounded route alone (?:does not|cannot) (?:justify|excuse) accessible essential research left undone/i,
    /(?:zero[- ](?:factual[- ])?unknowns|zero unknown facts)/i
  ];
  const execution = [
    /(?:missing or invalid|absent or invalid)/i, /essential mechanism/i, /(?:architectural or not|whether architectural or not)/i,
    /affected effects(?: and |\/)evidence/i, /engineer(?:-directed| and) Plan/i,
    /scoped Research continuation/i, /(?:when|where) evidence is needed/i,
    /independent approved work/i, /(?:ordinary|routine) (?:failed test|test failure)[^.!?\n]*alone (?:is not an automatic Research restart|does not (?:automatically )?restart Research)/i
  ];
  const scan = [/purpose/i, /relevant (?:source )?roots/i, /active owners/i, /historical exclusions/i,
    /(?:useful )?completion condition/i, /routine contradictions/i, /genuinely new material commitments/i,
    /(?:not|without|do not prescribe) (?:an )?exhaustive (?:file or command )?whitelist/i];
  const specs = [
    ['research', 'research', '# Research coordinator', 'Make readiness evidence inspectable', false, research],
    ['researchSkill', 'researchSkill', '## Procedure', '8. Make readiness evidence inspectable', true, research],
    ['researchTemplate', 'researchTemplate', '### ADR inputs and remaining gaps', '**Readiness evidence:**', false, research],
    ['researchResidual', 'research', '# Research coordinator', 'Make readiness evidence inspectable', false, residual.slice(0, 3)],
    ['researchSkillResidual', 'researchSkill', '## Procedure', '8. Make readiness evidence inspectable', true, residual],
    ['researchTemplateResidual', 'researchTemplate', '### ADR inputs and remaining gaps', '**Readiness evidence:**', false, residual],
    ['researchRecommendation', 'researchTemplate', '## Recommendation and validation', '- **Recommended approach:**', true,
      [/evidence-supported viable mechanism/i, /decision-critical feasibility/i, /realistic alternatives/i, /actual engineer selections/i,
        /distinguish actual engineer selections[^.!?\n]*from this recommendation/i,
        /unestablished/i, /unfinished Research/i, /affected effects/i, /evidence route/i, /instead of ready delivery work/i]],
    ['discovery', 'discovery', '## Read back, correct and stop', 'After investigation, assess foreseeable', false,
      [/evidence-supported viable mechanism/i, /decision-critical feasibility/i, /realistic alternatives/i, /recommendation/i,
        /recommendation, separate from actual qualified engineer selections/i, /unestablished essential feasibility/i, /architectural or not/i,
        /unfinished Research/i, /affected effects/i, /evidence route/i, /not ready delivery work/i, /does not[^.!?\n]*create a `\/plan` gate/i]],
    ['plan', 'plan', '# Plan coordinator', "Check the Research conclusion's freshness", false, conversion],
    ['planningFreshness', 'planning', '## Procedure', '1. Read the inspected Research', true,
      [/freshness and applicability/i, /evidence-supported viable mechanism/i, /decision-critical feasibility/i]],
    ['planningConversion', 'planning', '## Procedure', '4. Convert the supported Research conclusion', true,
      [/convert the supported Research conclusion/i, /delivery acceptance/i, /affected owners/i, /dependencies/i,
        /ordered actions/i, /validation/i, /distinction between recommendation and actual qualified engineer selection/i, /complete Proposed decision and its sign-off/i]],
    ['planningGaps', 'planning', '### Resolve material planning gaps', 'An inherited unestablished essential mechanism', false,
      [/inherited unestablished essential mechanism/i, /nonarchitectural/i, /unfinished Research/i, /genuinely new requirements or evidence/i,
        /affected gap/i, /scoped engineer-directed Research continuation or supplementation/i, /where evidence is needed/i,
        /do not silently perform essential solution research/i, /independently supported planning/i, /truthful drafts/i,
        /never automatically restart/i, /retroactive blame/i, /veto manual invocation/i]],
    ['planTemplateApproach', 'planTemplate', '## Outcome and boundaries', '- **Approach:**', true,
      [...conversion, /actual selections separately from recommendations/i]],
    ['planResidual', 'plan', '# Plan coordinator', 'A completed Plan', false, residual],
    ['planningResidual', 'planning', '## Procedure', '5. Inspect relevant', true, residual],
    ['planningGapResidual', 'planning', '### Resolve material planning gaps', 'For any remaining material factual unknown', false, residual],
    ['planTemplateResidual', 'planTemplate', '## Detailed work items', '**Residual factual unknown (include only when a material fact remains):**', true,
      [...residual, /current evidence/i, /bounded check\/observation/i, /expected interpretation and allowed in-scope response/i,
        /affected Work Items\/effects and acceptance/i, /engineer-escalation condition/i, /independent work that can continue/i,
        /unestablished essential mechanism, architectural or not/i, /do not require proof earlier discovery was impossible/i]],
    ['implement', 'implement', '# Implement coordinator', 'If an essential mechanism or its feasibility', false, execution],
    ['implementOperations', 'implement', '# Implement coordinator', 'Own the permitted direct edit–test–repair loop:', false,
      [/investigate ordinary failures/i, /related files and tests/i, /correct attributable errors/i, /rerun relevant checks/i,
        /projected files or debugging steps[^.!?\n]*exhaustive repair whitelist/i]],
    ['safe', 'safe', '## Procedure', 'Apply the supported mechanism', false,
      [/supported mechanism/i, /absent essential solution/i, /essential feasibility or a mechanism is missing or invalid/i,
        /architectural or not/i, /affected effects and evidence/i, /engineer-directed Plan resolution/i,
        /scoped Research continuation or supplementation when evidence is needed/i, /independent approved work/i,
        /not automatically restart Research for an ordinary failed test/i, ...residual]],
    ['validation', 'validation', '## Scope and recovery', '- [ ] Apply an evidence-supported essential mechanism', true,
      [...execution, /supported mechanism tested/i, /why it reasonably remains/i, /bounded route alone does not justify accessible essential research left undone/i, /zero unknowns/i]],
    ['planningScan', 'planning', '## Procedure', 'For execution alignment scans,', true, scan],
    ['templateScan', 'planTemplate', '## Execution guidance and validation', '- **Execution alignment scans:**', true, scan],
    ['safeScan', 'safe', '## Procedure', 'For an execution alignment scan,', false,
      [...scan, /ordinary inspection, local decisions, related-file\/test selection, diagnosis, repair and recheck/i]],
    ['validationScan', 'validation', '## Scope and recovery', '- [ ] Bound execution alignment scans', true,
      [...scan, /ordinary inspection, local decisions, related files\/tests, diagnosis, repair and recheck/i]],
    ['core', 'core', '## Transitions and outcome authority', 'Research establishes an evidence-supported', false,
      [...research.slice(0, 9), /evidence route/i, ...conversion.slice(0, 5), /scoped engineer-directed Research continuation or supplementation/i,
        /not hidden essential research/i, /truthful drafts/i, /manual invocation/i, /no automatic restart or retroactive blame/i,
        /ordinary inspection, local decisions, related files\/tests, diagnosis, repair and recheck/i, /failed test alone does not restart Research/i]],
    ['repository', 'repository', '## Lifecycle authority and transitions', '- Research establishes an evidence-supported', true,
      [...research.slice(0, 9), /evidence route/i, ...conversion.slice(0, 5), /scoped engineer-directed Research continuation or supplementation/i,
        /not hidden essential research/i, /truthful drafts/i, /manual invocation/i, /no retroactive blame or automatic restart/i,
        /ordinary inspection, local decisions and failure diagnosis/i]],
    ['lifecycleResearch', 'lifecycleInstruction', '## Stage schemas', '- **Research brief:**', true,
      [/evidence-supported viable mechanism/i, /decision-critical feasibility/i, /unestablished essential mechanism/i,
        /architectural or not/i, /unfinished Research/i, /affected effects and an evidence route/i]],
    ['lifecyclePlan', 'lifecycleInstruction', '## Stage schemas', '- **Implementation plan:**', true,
      [/freshness\/applicability/i, /convert the supported mechanism/i, /inherited essential gaps/i, /genuinely new requirements\/evidence/i,
        /scoped engineer-directed Research continuation or supplementation/i, /where evidence is needed/i, /do not hide essential research/i,
        /truthful drafts/i, /independent planning/i, /manual invocation/i, /no automatic restart or retroactive blame/i]],
    ['lifecycleImplement', 'lifecycleInstruction', '## Stage schemas', '- **Implementation report:**', true,
      [/absent or invalid essential mechanism/i, /affected effects\/evidence/i, /engineer-directed Plan resolution/i,
        /scoped Research continuation where evidence is needed/i, /independent approved work/i,
        /ordinary inspection, diagnosis, repair and recheck/i, /failed test alone does not restart Research/i]],
    ['adrResearch', 'skill', '## Phase operation', '1. **Research:**', true,
      [/actual engineer selections separately from recommendations/i, /supported viable mechanism/i, /decision-critical feasibility/i,
        /essential gap is unfinished Research whether architectural or not/i]],
    ['adrPlan', 'skill', '## Phase operation', '2. **Plan:**', true,
      [/freshness\/applicability/i, /convert the supported mechanism/i, /inherited essential gap/i, /genuinely new requirements\/evidence/i,
        /affected-gap explanation/i, /scoped engineer-directed Research continuation or supplementation/i, /when evidence is needed/i,
        /not hidden essential research/i, /truthful drafts/i, /independent planning/i, /manual invocation/i, /without automatic restart or retroactive blame/i]],
    ['adrImplement', 'skill', '## Phase operation', '3. **Implement:**', true,
      [/absent or invalid essential mechanism/i, /whether architectural or not/i, /affected effects through the engineer\/Plan/i,
        /scoped Research when evidence is needed/i, /ordinary diagnosis and recheck remain available/i]]
  ];
  const scopes = new Map();
  for (const [owner, key, heading, prefix, line, patterns] of specs) {
    const text = unit(key, heading, prefix, line);
    requireOwner(owner, text, patterns, 'missing or ambiguous technical handoff obligation');
    scopes.set(`${key}|${heading}`, [key, scope(key, heading)]);
  }
  // Scenario pairs illustrate assessment; only these actual Skill and
  // checklist units own the normative assurance obligations.
  const assuranceSpecs = [
    ['assuranceOverview', 'assuranceSkill', '## Assessment', 'Assess whether Research establishes', true,
      [/Research establishes (?:an? )?(?:evidence-supported|supported) viable mechanism and decision-critical feasibility/i,
        /realistic alternatives/i, /recommendation (?:distinct|separate) from actual engineer selections/i,
        /Plan checks freshness(?:\/| and )applicability and converts that conclusion into delivery/i,
        /inherited essential gap, architectural or not/i, /genuinely new requirements(?:\/| or )evidence reopening feasibility/i,
        /explained affected gap/i, /scoped engineer-directed Research continuation or supplementation where evidence is needed/i,
        /truthful drafts and independent supported work/i, /without retroactive blame, automatic restart or a readiness veto on manual invocation/i,
        /supported mechanism tested/i, /why the fact reasonably remains/i, /existing bounded route/i,
        /neither zero unknowns nor an inspection ban/i, /inspection, diagnosis, repair and recheck/i]],
    ['assuranceReadiness', 'assurance', '## Conversation evidence rubric', '| Downstream readiness |', true,
      [/viable mechanism and decision-critical feasibility/i, /realistic alternatives/i, /recommendation (?:distinct|separate) from actual qualified(?:\/| or )nonrecommended direction/i,
        /unestablished essential mechanism, architectural or not/i, /unfinished Research with affected effects and an evidence route/i,
        /not a ready delivery task/i, /supported mechanism tested/i, /why it reasonably remains/i, /bounded resolution route/i,
        /route alone does not justify accessible essential research left undone/i,
        /Plan checks freshness(?:\/| and )applicability[^.!?\n]*converts supported conclusions/i,
        /inherited essential gaps or genuinely new requirements(?:\/| or )evidence reopening feasibility/i,
        /scoped engineer-directed Research continuation or supplementation where evidence is needed/i,
        /not hidden research or retroactive blame/i, /Truthful drafts, independent supported work and manual invocation remain/i,
        /zero-unknowns rule, inspection ban, automatic restart or readiness veto/i]],
    ['assuranceResearch', 'assurance', '## Stage-specific outcome', '- **Research:**', true,
      [/supported technical conclusion/i, /unfinished essential feasibility/i, /affected-effect\/evidence route/i,
        /qualified\/nonrecommended choices and conditions/i, /saved brief does not invoke Plan/i]],
    ['assurancePlan', 'assurance', '## Stage-specific outcome', '- **Plan:**', true,
      [/freshness(?:\/applicability)? and delivery conversion of the supported mechanism/i,
        /inherited essential gaps or newly reopened feasibility/i,
        /scoped engineer-directed Research continuation(?:\/| or )supplementation where evidence is needed/i,
        /independent planning and truthful drafts continue/i, /supported mechanism, reason it remains and bounded evidence\/response/i,
        /affected effects, escalation and independent work/i, /saved Plan alone does not invoke Implement/i]],
    ['assuranceImplement', 'assurance', '## Stage-specific outcome', '- **Implement:**', true,
      [/absent or invalid essential mechanism/i, /engineer\/Plan resolution and scoped Research when evidence is needed/i,
        /ordinary inspection, local decisions, related-file selection, failure diagnosis, repair and recheck/i,
        /(?:without an automatic Research restart|ordinary (?:failed test|implementation failure) does not automatically restart Research)/i]]
  ];
  for (const [owner, key, heading, prefix, line, patterns] of assuranceSpecs) {
    const text = unit(key, heading, prefix, line);
    requireOwner(owner, text, patterns, 'missing or ambiguous technical handoff obligation');
    scopes.set(`assurance-owner|${owner}`, [owner, text]);
  }
  for (const [owner, key, heading] of [
    ['assuranceAssessment', 'assuranceSkill', '## Assessment'],
    ['assuranceRubric', 'assurance', '## Conversation evidence rubric'],
    ['assuranceOutcomes', 'assurance', '## Stage-specific outcome']
  ]) scopes.set(`assurance-section|${owner}`, [owner, scope(key, heading)]);
  for (const [key, text] of scopes.values()) {
    const zeroRequirements = [...text.matchAll(/\b(?:require|requires|must have) zero (?:factual )?(?:unknowns|unknown facts)\b/gi)];
    const affirmativeZero = zeroRequirements.some((match) =>
      !/(?:do not|does not|never|no)\s*$/i.test(text.slice(Math.max(0, match.index - 16), match.index)));
    const substitutions = [...text.matchAll(/\b(?:(?:treat|use) the recommendation as the engineer[’']s (?:selection|answer)|(?:replace|substitute) (?:the )?(?:actual )?(?:engineer[’']s )?(?:selection|answer) with (?:the )?recommendation)/gi)];
    const affirmativeSubstitution = substitutions.some((match) =>
      !/(?:do not|does not|never)\s*$/i.test(text.slice(Math.max(0, match.index - 16), match.index)));
    if (affirmativeZero || affirmativeSubstitution || /(?:Implement|Plan) (?:may|can|should) invent (?:an? )?(?:absent |missing )?essential (?:solution|mechanism)|(?:ban|prohibit|forbid) (?:all |ordinary )?inspection|(?:readiness|readiness advice) (?:vetoes|blocks|must veto|may veto) (?:manual )?(?:phase )?invocation|(?:Plan|Implement) (?:may|can|should) (?:silently |quietly )?(?:perform|conduct|complete) essential (?:solution )?research|(?:Plan|Implement) (?:may|can|should|will) (?:investigate|determine|discover|select) (?:the |an? )?(?:(?:missing|unestablished|essential|nonarchitectural) )+(?:solution|mechanism)\b|(?:ordinary|routine) (?:failed test|test failure|implementation failure) alone (?:automatically restarts Research|(?:is|triggers) an automatic Research restart)|(?:an? )?unestablished essential mechanism(?:, architectural or not,)? (?:is|constitutes) ready delivery work/i.test(text)) {
      fail(`${key}: contradictory technical handoff rule`, 'RPIR-HANDOFF-001');
    }
  }
}

function checkImplementSignoffContract(source) {
  const transitions = uniqueCheckpointSection(source.core, '## Transitions and outcome authority').split('\n')
    .filter((line) => line.startsWith('| Plan -> Implement |'));
  const transition = transitions.length === 1 ? transitions[0] : '';
  requireADRRule(transition, [
    /deliberate engineer-sent Implement request with the inspected physical approved Plan/i,
    /when that rule is already effective before the request/i,
    /Plan handoff identifies the exact Proposed ADR snapshot/i,
    /signs off only those snapshots/i,
    /no separate routine approval/i,
    /Plan or Review requests, answers, reports, workers and unsent prefills do not sign off/i
  ], 'Lifecycle core Plan-to-Implement transition must bind sign-off to effective policy and exact snapshots');

  const effectSection = uniqueCheckpointSection(source.core, '### Prospective exact-ADR sign-off recording effect');
  const effect = [
    uniqueCheckpointUnit(effectSection, 'This Toolkit rule applies only'),
    uniqueCheckpointUnit(effectSection, 'Only the Implement coordinator may record'),
    uniqueCheckpointUnit(effectSection, 'Assess ')
  ];
  if (effect.some((owner) => !owner)) fail('Lifecycle core sign-off effect: missing or ambiguous normative owner', 'ADR-CONTRACT-001');
  for (const [index, pattern, rule] of [
    [0, /effective before the qualifying deliberate engineer-sent Implement request with the inspected physical approved Plan/i, 'effective-before-invocation guard'],
    [0, /not retroactive sign-off/i, 'no-retroactive-sign-off guard'],
    [0, /exact bound ADR path\/ID, identifiable decision section, substantive preimage version\/snapshot/i, 'exact binding identity'],
    [0, /current `Proposed` state/i, 'Proposed preimage state'],
    [0, /actual agreement evidence\/conditions and affected Work Items/i, 'agreement, conditions and affected work'],
    [1, /only the Implement coordinator may record/i, 'coordinator-only recording authority'],
    [1, /only `Status: Accepted`, the actual decision date, and actual agreement evidence/i, 'metadata-only update fields'],
    [1, /naming the invocation, inspected Plan version and exact ADR preimage/i, 'actual agreement-evidence binding'],
    [1, /Preserve the decision text, all other metadata, and accepted\/superseded history/i, 'decision and history preservation'],
    [1, /identity, containment, absence of conflicting edits and effective permission/i, 'identity, containment, conflict and permission guards'],
    [1, /save without overwriting concurrent changes and read back the complete postimage/i, 'non-overwrite and postimage readback'],
    [2, /Assess multiple bound ADRs independently/i, 'per-record handling'],
    [2, /do not claim `Accepted`/i, 'failure is not Accepted'],
    [2, /hold only effects dependent on the unrecorded sign-off while continuing independent approved work/i, 'dependent-only hold'],
    [2, /(?:A successful record is not rolled back because another record failed|Keep a successfully recorded ADR if another independent record fails)/i,
      'partial-success preservation'],
    [2, /not general ADR authorship/i, 'no general ADR authorship']
  ]) requireADRRule(effect[index], [pattern], `Lifecycle core sign-off effect: ${rule}`);

  const adrPhase = section(source.skill, '## Phase operation');
  requireADRRule(adrPhase, [
    /only when the prospective sign-off rule[^.!?\n]*effective before[^.!?\n]*deliberate Implement request with the inspected physical approved Plan/i,
    /signs off only the exact Proposed snapshot/i,
    /prior invocation is not retroactive/i,
    /does not grant general ADR authorship/i
  ], 'ADR Skill Implement operation must describe only prospective exact-snapshot sign-off');
  const adrAuthority = section(source.skill, '## Authority and effect safeguards');
  requireADRRule(adrAuthority, [
    /separately defines a prospective Implement-coordinator-only sign-off metadata effect/i,
    /not ADR authorship/i,
    /already effective before the qualifying invocation/i
  ], 'ADR Skill must separate sign-off recording from general ADR authorship');
  requireADRRule(source.template, [
    /does not follow from Research acknowledgment, a Plan or Review request, an answer, report, worker, Script Runner, role selection, skill, unsent prefill, or delivery acceptance/i,
    /only the engineer's deliberate sent Implement request with the inspected physical approved Plan can sign off an exact Proposed ADR snapshot/i,
    /only when that prospective rule is already effective before the invocation/i,
    /status recording is a separate, narrow Implement-coordinator effect/i,
    /A prior invocation is not retroactive/i
  ], 'ADR template must distinguish exact sign-off, status persistence and non-sign-off events');

  const planOwner = paragraph(coordinatorBody(source.plan, 'Plan'), 'At the manual Implement handback');
  for (const [pattern, rule] of [
    [/exact ADR path\/ID, identifiable decision section, substantive version\/snapshot/i, 'exact identity, section and version'],
    [/current Proposed state, actual agreement evidence\/conditions and affected Work Items/i, 'state, agreement and affected work'],
    [/engineer's deliberate request to Implement with this inspected approved Plan authorizes bounded delivery and signs off only those exact preimages/i, 'dual-purpose exact-snapshot invocation'],
    [/rule is already effective before invocation/i, 'effective-before-invocation condition'],
    [/(?:no duplicate|no separate|do not request a duplicate) routine approval/i, 'no duplicate approval'],
    [/`\/plan`, answer, report, worker, Script Runner, unsent prefill or `\/review` is not sign-off/i, 'non-sign-off events'],
    [/prior invocation is not retroactive/i, 'no retroactive sign-off']
  ]) requireADRRule(planOwner, [pattern], `Plan coordinator handoff: ${rule}`);

  const implementOwner = paragraph(coordinatorBody(source.implement, 'Implement'), 'If the approved Plan binds an ADR');
  requireADRRule(implementOwner, [
    /exact associated path\/ID, section, substantive preimage version\/snapshot, Proposed state/i,
    /only if the applicable exact-snapshot sign-off rule was already effective before the engineer's qualifying Implement invocation/i,
    /sign off the visibly bound preimage/i,
    /Implement coordinator alone may then record a separate metadata-only update/i,
    /`Status: Accepted`, actual decision date and actual agreement evidence/i,
    /preserve all decision text\/history/i,
    /A prior invocation or authored policy edit is not retroactive or self-activating/i,
    /do not claim `Accepted`/i,
    /hold only dependent effects/i,
    /Assess each bound ADR separately/i,
    /Workers, Script Runner, Review and helpers receive no ADR authorship\/status authority/i
  ], 'Implement coordinator must bind exact sign-off and narrow recording guards');

  const safeSignoffSection = uniqueCheckpointSection(source.safe, '## Procedure');
  const safeSignoff = uniqueCheckpointUnit(safeSignoffSection, 'Apply the prospective Implement-request sign-off');
  requireADRRule(safeSignoff, [
    /Apply the prospective Implement-request sign-off only if that rule was already effective before the engineer's deliberate sent request with the inspected physical approved Plan/i,
    /The request signs off only that snapshot/i,
    /only `Status: Accepted`, the actual decision date and actual agreement evidence/i,
    /A prior invocation or policy edit is not retroactive or self-activating/i,
    /do not claim `Accepted`/i,
    /Multiple ADR outcomes are per-record/i
  ], 'Safe implementation Skill must sequence and report the narrow sign-off effect');
  for (const [owner, text] of [['Lifecycle core sign-off effect', effectSection], ['Safe implementation sign-off', safeSignoffSection],
    ['Implement coordinator', coordinatorBody(source.implement, 'Implement')]]) {
    if (/(?:workers?|Script Runner|Review|helpers?) (?:may|can|should) (?:sign off|(?:write|update|record|edit) (?:an? )?(?:ADR|status))|(?:prior|earlier) (?:invocations?|requests?) (?:are|is|apply) retroactive(?:ly)?|(?:a )?(?:prior|earlier)[- ]policy (?:invocation|request) (?:signs off|authorizes|accepts)|(?:policy edits?|invocation) (?:automatically )?(?:self-upgrades?|proves? (?:persistence|acceptance))/i.test(text) ||
      hasAffirmativeMatch(text, /\b(?:the )?Implement coordinator (?:may|can|should) (?:rewrite|edit|revise|change) (?:the )?ADR decision text/gi)) {
      fail(`${owner}: contradictory sign-off authority`, 'ADR-CONTRACT-001');
    }
  }
  const validationADR = source.validation.split('\n').find((line) => line.startsWith('- [ ] Apply exact-snapshot sign-off')) || '';
  requireADRRule(validationADR, [
    /only if the rule was effective before the engineer's deliberate sent Implement request with the inspected physical approved Plan/i,
    /exact Proposed preimage/i,
    /(?:only the )?Implement coordinator alone|only the Implement coordinator/i,
    /complete readback/i,
    /A prior invocation is not retroactive/i,
    /not Accepted and blocks only dependent effects/i
  ], 'Implementation checklist must validate exact preimage, authority and persistence outcome');
  const reportADR = field(section(source.implementationReport, '## Delivered outcome and progress'), 'ADR sign-off and persistence');
  requireADRRule(reportADR, [
    /whether this explicit invocation qualifies under policy effective before it/i,
    /each exact Plan-bound Proposed preimage/i,
    /actual per-record save\/readback outcome and postimage/i,
    /Distinguish invocation from persisted Accepted state/i,
    /prior invocation is not retroactive/i,
    /failed\/denied\/conflicting\/unverifiable write is not Accepted/i
  ], 'Implementation report must distinguish sign-off invocation from per-record persistence');

  // Select the actual unique normative section and owner, never a matching
  // paragraph from history, metadata or a different documentation owner.
  function summaryOwner(text, heading, prefix, line = false) {
    if (text.split('\n').filter((item) => item === heading).length !== 1) return '';
    const body = section(text, heading);
    const matches = (line ? body.split('\n') : body.split(/\n\s*\n/))
      .filter((part) => part.trimStart().startsWith(prefix));
    return matches.length === 1 ? matches[0] : '';
  }
  const readmeSignoffSummary = summaryOwner(source.readme, '### Complete upfront architectural coverage', 'Under the prospective exact-snapshot rule');
  requireADRRule(readmeSignoffSummary, [
    /deliberate Implement request with the inspected approved Plan signs off only the exact Proposed ADR preimages? visibly identified in its handoff/i,
    /only if the rule was already effective before that (?:request|invocation)/i,
    /invocation alone is not proof of persistence/i,
    /Implement coordinator[^.!?\n]*separately record[^.!?\n]*guarded metadata/i,
    /failed\/denied\/unverified writes are not `Accepted`/i,
    /no policy edit self-upgrades a session or applies retroactively/i,
    /Planning, answers, reports, workers, Script Runner, prefills and Review are not ADR sign-off/i,
    /Review remains source-read-only and records delivery acceptance only/i,
    /assurance is advisory/i,
    /authored sources do not establish runtime behavior/i
  ], 'README summary must present prospective sign-off, guarded persistence, read-only Review and runtime limits');
  const wikiRpirSummary = summaryOwner(source.wikiRpir, '## Complete upfront architectural coverage', 'When the prospective exact-snapshot rule');
  requireADRRule(wikiRpirSummary, [
    /deliberate Implement request with the inspected approved Plan[^.!?\n]*signs off only the Proposed ADR preimages? visibly identified in its handoff/i,
    /rule is already effective before/i,
    /policy edits do not self-upgrade the session and no invocation is retroactive/i,
    /Implement coordinator's metadata recording is a separate guarded effect/i,
    /report and physical ADR postimage must establish whether it persisted/i,
    /Planning, answers, reports, workers, Script Runner, prefills and Review do not sign off/i,
    /Review independently compares actual invocation\/persistence evidence but remains source-read-only/i,
    /clean Review is delivery acceptance, not ADR sign-off/i,
    /Stage Assurance only advises and receives no status-write authority/i,
    /do not prove installed behavior/i
  ], 'RPIR Wiki summary must distinguish sign-off, delivery Review and assurance authority');
  const wikiAuthoritySummary = summaryOwner(source.wikiEvidence, '### Architecture decision records are supplementary', 'The prospective ADR sign-off rule');
  requireADRRule(wikiAuthoritySummary, [
    /only a deliberate (?:engineer-sent )?Implement request with the inspected approved Plan/i,
    /when the rule was already effective/i,
    /signs off the Proposed preimages visibly named in the handoff/i,
    /Implement coordinator records any `Accepted`/i,
    /status\/date\/agreement evidence separately/i,
    /preimage, authority\/condition, identity, containment, conflict and permission checks, non-overwriting save and complete readback/i,
    /report distinguishes invocation from each record's actual persistence outcome/i,
    /failure or denial is not `Accepted`/i,
    /no prior invocation is retroactive/i,
    /Plan or Review requests, answers, reports, workers, Script Runner and prefills are not sign-off/i,
    /Review is read-only and assesses delivery/i,
    /assurance remains advisory/i,
    /does not activate itself or prove installed runtime behavior/i
  ], 'Lifecycle evidence Wiki summary must state exact sign-off timing and evidence authority');
  const catalogueSignoffSummary = summaryOwner(source.wikiCatalogue, '### Skills', '| Apply lifecycle input, provenance, phase boundaries and exact-snapshot ADR recording |', true);
  requireADRRule(catalogueSignoffSummary, [
    /(?:(?:explicit `\/implement`|deliberate (?:engineer-sent )?Implement request) with the inspected Plan and exact visible Proposed preimage, effective before invocation|prospective rule was effective before invocation[^\n]*deliberate Implement request with the inspected approved Plan signs off only exact Proposed preimages visibly enumerated in its handoff)/i,
    /(?:Implement coordinator records guarded metadata separately|Implement coordinator separately verifies each record's preimage, conditions, containment, conflict absence and permission before recording permitted metadata and reading back the complete postimage)/i,
    /Review assesses invocation and persistence(?:, assurance advises)?/i,
    /no prior invocation is retroactive/i
  ], 'Artifact catalogue must summarize the prospective sign-off capability accurately');
  requireADRRule(summaryOwner(source.wikiCatalogue, '### Skills', '| Assess RPIR draft-stage assurance readiness', true), [
    /without granting approval or vetoing invocation/i
  ], 'Artifact catalogue must preserve advisory assurance');
  const catalogueEntry = summaryOwner(source.wikiCatalogue, '### Prompt files', 'No prompt files are contributed.');
  requireADRRule(catalogueEntry, [
    /prospective native route selects the intended receiving agent and deliberately sends a request with the inspected physical predecessor/i,
    /no fixed wording or slash dependency/i,
    /prefilled suggestion is not a sign-off or automatic submission/i,
    /(?:current lifecycle policy governs bootstrap|policy effective at invocation governs any earlier required bootstrap route)/i
  ], 'Artifact catalogue must describe the prospective natural-language entry and bootstrap');
  for (const [owner, text] of Object.entries({ readmeSignoffSummary, wikiRpirSummary, wikiAuthoritySummary, catalogueSignoffSummary, catalogueEntry })) {
    if (/(?:any|every) (?:Implement |implementation )?(?:request|invocation) (?:signs off|accepts) (?:all |every )?(?:ADRs?|preimages?)|(?:Review|workers?|Script Runner|assurance) (?:may|can) (?:sign off|write ADR status)|(?:invocation|request) alone (?:proves|establishes) (?:persistence|Accepted)|(?<!no )\b(?:prior|earlier) invocations? (?:are|is|apply) retroactive(?:ly)?|(?:a )?(?:slash command|fixed wording) is (?:always )?required/i.test(text)) {
      fail(`${owner}: contradictory documentation sign-off rule`, 'ADR-CONTRACT-001');
    }
  }

  for (const [owner, text] of [
    ['repository policy', source.repository], ['lifecycle instruction', source.lifecycleInstruction]
  ]) for (const [pattern, rule] of [
    [/deliberate (?:engineer-sent )?Implement request/i, 'explicit invocation event'],
    [/exact Proposed ADR/i, 'exact Proposed binding'],
    [/already effective before/i, 'effective-before-invocation condition'],
    [/(?:only the )?Implement coordinator(?: alone)?/i, 'single coordinator recording authority'],
    [/(?:not|never) retroactive|no retroactive sign-off/i, 'no retroactive sign-off'],
    [/does not self-upgrade|not self-upgrade/i, 'no session bootstrap']
  ]) requireADRRule(text, [pattern], `${owner}: ${rule}`);
  return true;
}

function checkAdrConventionResolution(source) {
  const owners = {
    skill: section(source.skill, '## Consumer convention resolution'),
    plan: paragraph(coordinatorBody(source.plan, 'Plan'), 'Resolve ADR conventions'),
    planning: paragraph(section(source.planning, '### Resolve material planning gaps'), 'Resolve ADR conventions')
  };
  for (const [owner, text] of Object.entries(owners)) {
    const required = [
      /inspect[s]? for an established (?:consumer )?(?:ADR )?convention/i,
      /without needless confirmation or duplicate ADRs/i,
      /If no convention is evidenced, ask the engineer to select or qualify (?:one |a )concrete proposed new convention/i,
      /(?:contained destination|destination grounded in the verified consumer root)/i,
      /naming/i, /template/i, /status/i, /not (?:an )?existing (?:consumer )?rule/i,
      /Toolkit-wide default/i, /wait for the actual selection/i,
      /preserve an engineer-selected alternative and qualifications/i,
      /Plan coordinator|existing Plan exception/i, /associated Proposed ADRs/i,
      /separately guard/i, /directory|directories/i, /file/i,
      /absent selected directory (?:is not available capability|remains unavailable)/i,
      /(?:unavailable\/denied|denied or unavailable|denied\/unavailable)/i,
      /hold[s]? only dependent directory\/ADR writes/i,
      /missing-directory setup[^.!?\n]*unavailable pending[^.!?\n]*Research/i,
      /No terminal, Runner, implicit-parent[^.!?\n]*alternate-destination workaround is authorized/i
    ];
    if (required.some((pattern) => !pattern.test(text))) {
      fail(`${owner}: resolve ADR conventions through actual selection and guarded Plan-owned preparation`, 'ADR-CONVENTION-001');
    }
    if (/Use docs\/adr by default|Resolve the convention later in Implement|Selection proves directory creation|Bypass a denied directory operation/i.test(text)) {
      fail(`${owner}: contradictory ADR convention or directory rule`, 'ADR-CONVENTION-001');
    }
  }
  const skill = owners.skill;
  for (const pattern of [/save\/read back each file/i,
    /exact path\/ID, section, substantive version, state, actual agreement\/conditions and affected Work Items/i,
    /keep one delivery hierarchy and preserve accepted history/i,
    /do not claim a creation or save that was not observed/i]) {
    if (!pattern.test(skill)) fail('skill: retain exact ADR binding and observed persistence', 'ADR-CONVENTION-001');
  }
}

function checkPhaseIntakeContract(source) {
  const transition = section(source.core, '## Transitions and outcome authority');
  const role = paragraph(transition, 'Reconcile the requested stage');
  const humanOwners = {
    core: paragraph(transition, 'Verify human-input provenance'),
    questions: paragraph(section(source.questions, '## Procedure'), 'Verify answer provenance'),
    clarification: paragraph(source.clarification, 'Verify answer provenance'),
    assurance: section(source.assurance, '## Conversation evidence rubric').split('\n')
      .find((line) => line.startsWith('| Human-input provenance |')) || ''
  };
  function requireIntake(text, patterns, owner, rule) {
    if (patterns.some((pattern) => !pattern.test(text))) fail(`${owner}: ${rule}`, 'RPIR-INTAKE-001');
  }
  requireIntake(role, [/actual loaded role before phase-owned effects/i,
    /Harness mode, picker state and a loaded skill do not establish the receiving role/i,
    /role\/stage mismatch/i, /hold the mismatched phase-owned effects/i,
    /manual receiving-role action with the physical predecessor/i,
    /do not silently upgrade this role/i, /independently authorized work/i],
  'core', 'hold mismatched phase effects without role self-upgrade');
  for (const [owner, text] of Object.entries(humanOwners)) {
    requireIntake(text, [/automatic continuation, tool output, worker output and unsent prefills are not deliberate engineer/i,
      /user-labelled envelope/i, /pending material question pending and wait for the real response/i],
    owner, 'preserve pending answers and actual human-input provenance');
  }
  const roleOwners = {};
  for (const name of ['Research', 'Plan', 'Implement', 'Review']) {
    const key = name.toLowerCase();
    const body = coordinatorBody(source[key], name);
    const intake = paragraph(body, 'Reconcile the requested stage');
    const entry = paragraph(body, 'Prospectively,');
    requireIntake(intake, [/actual loaded role before phase-owned effects/i,
      /Harness mode, picker state and a loaded skill do not establish the receiving role/i,
      /role\/stage mismatch/i, /manual receiving-role action with the physical predecessor/i,
      /do not silently upgrade this role/i,
      /automatic continuation, tool output, worker output and unsent prefills are not deliberate engineer/i,
      /pending material question pending and wait for the real response/i,
      /supplies no missing essential mechanism, ADR content, tool exposure or permission/i],
    key, 'retain role-local mismatch, provenance and prerequisite safeguards');
    requireIntake(entry, [/policy effective at invocation/i,
      /if it already accepts the deliberate receiving-role request, do not demand a redundant slash command or separate blanket approval/i],
    key, 'apply actual entry policy without a redundant bootstrap ritual');
    roleOwners[key] = intake + '\n' + entry;
  }
  const readiness = paragraph(transition, 'A qualifying deliberate Implement request');
  requireIntake(readiness, [/bounded approval event under policy effective at invocation/i,
    /supplies no missing essential mechanism, ADR content, tool exposure or permission/i,
    /Plan resolves its own material selections and associated Proposed ADR preparation before a ready handoff/i,
    /do not assign Plan-only preparation or unestablished essential feasibility to Implement/i,
    /Independent supported planning and independently approved implementation remain available/i,
    /ordinary failure diagnosis and justified execution-dependent facts/i],
  'core', 'distinguish invocation approval from readiness and effect prerequisites');
  const scopes = { core: transition, questions: section(source.questions, '## Procedure'),
    clarification: source.clarification, ...roleOwners };
  for (const [owner, text] of Object.entries(scopes)) {
    if (/Harness mode establishes the receiving role|Automatically upgrade to the requested role|Automatic continuation is the engineer's answer|Worker output approves the pending choice|An Implement request supplies missing feasibility|Always require a second slash command/i.test(text)) {
      fail(`${owner}: contradictory role, provenance or readiness rule`, 'RPIR-INTAKE-001');
    }
  }
}

function checkArchitectureDecisionRecordContract(sources = {}) {
  checkExplicitAssuranceSources(sources);
  const paths = {
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
    questions: '.github/skills/agent-question-resolution/SKILL.md',
    clarification: '.github/skills/agent-question-resolution/templates/clarification-message.md',
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
  const source = Object.fromEntries(Object.entries(paths).map(([key, relative]) => [key,
    key === 'discovery' ? discoverySource(sources) : sources[key] ?? readText(relative)]));
  checkAdrConventionResolution(source);
  checkPhaseIntakeContract(source);
  const metadata = parseFrontmatterText(source.skill, paths.skill).values;
  if (metadata.name !== 'architecture-decision-records' || metadata['user-invocable'] !== 'false') {
    fail('ADR Skill must use its directory name and remain non-invocable', 'ADR-CONTRACT-001');
  }
  for (const resource of ['references/research-input-coverage.md', 'templates/adr.md']) {
    if (!source.skill.includes(`](${resource})`)) fail(`ADR Skill must directly link ${resource}`, 'ADR-CONTRACT-001');
  }
  const adrEffects = section(source.skill, '## Authority and effect safeguards');
  for (const [pattern, rule] of [
    [/Preserve accepted and superseded substantive history\./i, 'ADR skill must preserve accepted history'],
    [/Check each ADR file effect separately for identity, containment, absence\/collision, effective permission, saved result, and readback\./i, 'ADR skill must guard each file effect separately']
  ]) requireADRRule(adrEffects, [pattern], rule);
  requireADRRule(source.skill, [
    /Research[\s\S]*Plan[\s\S]*Implement[\s\S]*Review/i,
    /not a fifth RPIR phase|not an authority grant/i,
    /only a Proposed ADR directly associated with its active planning objective/i,
    /explicitly engineer-selected, verified contained destination/i,
    /Do not recursively create unselected ancestors/i,
    /absence\/collision[\s\S]*effective permission[\s\S]*readback/i
  ], 'ADR Skill is missing phase, ownership, or effect safeguards');

  checkCompleteArchitectureCoverage(source);
  checkDecisionReadinessContract(source);
  checkImplementSignoffContract(source);

  const expectedInputs = [
    '1.1', '1.2', '1.3', '1.4', '1.5',
    '2.1', '2.2', '2.3', '2.4', '2.5',
    '3.1', '3.2', '3.3', '3.4', '3.5',
    '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7'
  ];
  const mappedRows = source.coverage.split('\n').filter((line) => line.startsWith('|')).map((line) => line.split('|').map((cell) => cell.trim()));
  const mappedInputs = mappedRows.map((cells) => {
    const sample = cells[1]?.match(/^(\d\.\d)\s+(.+)$/);
    return sample ? { id: sample[1], label: sample[2], research: cells[2], owner: cells[3], complete: cells.length === 5 } : null;
  }).filter(Boolean);
  const actualInputs = mappedInputs.map((item) => item.id);
  const incompleteMapping = mappedInputs.some((item) => !item.label || !item.research || !item.owner || !item.complete);
  if (JSON.stringify(actualInputs) !== JSON.stringify(expectedInputs) || incompleteMapping) {
    fail('ADR coverage map must contain one complete, ordered disposition for all 22 sample inputs', 'ADR-CONTRACT-001');
  }
  requireADRRule(source.coverage, [
    /not a 22-question script|not a quota/i,
    /Practice alignment/i,
    /Assumptions and costs/i,
    /Diagrams and evidence/i,
    /Related decisions and references/i,
    /Open items and agreement/i
  ], 'ADR coverage map is missing supporting input categories or its non-questionnaire boundary');

  requireADRRule(source.template, [
    /^- \*\*Authored:\*\*/m,
    /^- \*\*Decision date:\*\*/m,
    /^- \*\*Decision participants and roles:\*\*/m,
    /^- \*\*Agreement evidence:\*\*/m,
    /^- \*\*Affected systems:\*\*/m,
    /^- \*\*Related decisions:\*\*/m,
    /^- \*\*Source revisions:\*\*/m,
    /^## Alternatives and reasoning$/m,
    /^## Consequences$/m,
    /state requires actual applicable decision authority and agreement evidence/i
  ], 'ADR template is missing standalone decision provenance, alternatives, consequences, or agreement safeguards');

  // Bounded owner-local assertions, not a natural-language policy verifier.
  // Each prerequisite must occur in the same normative status sentence;
  // mentions in metadata/open-item placeholders are not safeguards.
  for (const owner of ['skill', 'template']) {
    const statusRule = source[owner].match(/Unconditional `?Accepted`? requires[^.\n]*\./i)?.[0] || '';
    requireADRRule(statusRule, [/required decision approvals[^.]*satisfied/i],
      `ADR ${owner}: unconditional Accepted requires satisfied decision approvals`);
    requireADRRule(statusRule, [/decision-critical conditions[^.]*satisfied/i],
      `ADR ${owner}: unconditional Accepted requires satisfied decision-critical conditions`);
    requireADRRule(source[owner], [
      /Otherwise (?:retain|keep) Proposed[^.\n]*qualified\/pending state[^.\n]*evidenced consumer conventions/i
    ], `ADR ${owner}: outstanding prerequisites require Proposed or a qualified/pending state`);
  }

  const adrException = section(source.core, '### Planning-stage ADR authorship exception');
  requireADRRule(adrException, [/Directory creation does not grant file creation\./i],
    'Lifecycle core must separate directory and file authority');
  requireADRRule(adrException, [
    /Only the Plan coordinator may/i,
    /during active planning/i,
    /directly associated/i,
    /Proposed ADR/i,
    /explicitly engineer-selected, verified contained destination/i,
    /Do not recursively create unselected ancestor directories/i,
    /identity, containment, absence\/collision and effective permission/i,
    /save without overwrite[\s\S]*readback/i,
    /no unrelated source\/document\/register edits/i,
    /actual path\/ID, identifiable section and substantive version or snapshot/i
  ], 'Lifecycle core ADR exception lacks Plan-only authority, guarded effects, preservation, or version binding');
  requireADRRule(source.repository, [
    /Plan remains source\/configuration-read-only except for the narrow, associated Proposed-ADR exception/i,
    /Script Runner and delegated analysts remain source-read-only/i,
    /actual agreement evidence, conditions and dependent Work Items/i
  ], 'Repository policy does not preserve the narrow ADR exception and delegated read-only boundary');
  requireADRRule(source.plan, [
    /directly associated Proposed ADR/i,
    /Plan `edit` is limited to its working Plan, an eligible guarded Research status update, and the exact associated Proposed-ADR exception/i
  ], 'Plan coordinator guidance is missing associated-ADR ownership or binding safeguards');
  const adrSkillLink = '](../skills/architecture-decision-records/SKILL.md)';
  const planADR = planArchitectureGuidance(source.plan);
  // Ignore unrelated binding sentences before the owning ADR guidance.
  const planBinding = planADR.slice(planADR.indexOf(adrSkillLink) + adrSkillLink.length)
    .match(/\bBind\b[^.;\n]*[.;]/i)?.[0] || '';
  for (const [label, pattern] of [
    ['identity', /identity|path\/ID/i],
    ['section', /identifiable section/i],
    ['substantive version', /(?:inspected )?substantive (?:version|revision|snapshot)/i],
    ['decision state', /decision (?:state|status)/i],
    ['agreement evidence', /actual agreement evidence|evidence of actual agreement/i],
    ['conditions', /conditions/i],
    ['dependent work', /dependent Work Items|affected Work Items/i]
  ]) {
    requireADRRule(planBinding, [pattern], `Plan ADR binding is missing ${label}`);
  }
  requireADRRule(paragraph(coordinatorBody(source.research, 'Research'), 'Explicitly identify architectural choices'), [
    /\]\(\.\.\/skills\/architecture-decision-records\/references\/research-input-coverage\.md\)/i,
    /compact \*\*ADR inputs and remaining gaps\*\*/i,
    /Research never authors a standalone ADR/i
  ], 'Research guidance must reuse ADR coverage and hand over gaps without ADR authorship');
  const implementADR = source.implement.split(/\n\s*\n/).find((paragraph) => /^If the approved Plan binds an ADR,/i.test(paragraph)) || '';
  requireADRRule(implementADR, [
    /inspect[^.\n]*exact[^.\n]*path\/ID[^.\n]*substantive (?:preimage )?(?:version|snapshot)/i
  ], 'Implement ADR inspection is missing exact identity/version binding');
  const resolution = implementADR.match(/\bResolve\b[^.\n]*\./i)?.[0] || '';
  for (const [label, pattern] of [
    ['material version mismatch', /material (?:version )?mismatch/i],
    ['unavailable content', /unavailable content|missing content/i],
    ['unsatisfied conditions', /unsatisfied (?:decision )?conditions?/i]
  ]) {
    requireADRRule(resolution, [pattern, /before dependent (?:effects|changes)/i],
      `Implement ADR resolution is missing ${label} before dependent effects`);
  }
  requireADRRule(implementADR, [
    /(?:continu(?:e|ing)|allow(?:ing)?)[^.\n]*(?:independent|unrelated) approved work(?:[^.\n]*continue)?/i
  ], 'Implement ADR guidance is missing independent-work continuity');
  for (const [pattern, rule] of [
    [/independently compare (?:actual )?(?:delivery\/evidence|those claims)[^.!?\n]*(?:governance claims|physical ADR postimage)/i, 'independent evidence comparison'],
    [/clean (?:Review|`\/review`) does not establish enterprise or architectural approval|clean `\/review` is not ADR sign-off/i, 'Review is not architectural sign-off'],
    [/Review remains source-read-only/i, 'source-read-only boundary'],
    [/exact bound path\/ID, section, substantive version\/preimage and current state/i, 'exact ADR identity and state'],
    [/(?:implementation report's actual invocation and per-record persistence evidence|actual invocation and per-record persistence evidence from the implementation report)/i,
      'report invocation and per-record persistence evidence'],
    [/do not infer `Accepted` from invocation alone/i, 'no Accepted inference from invocation'],
    [/A prior `\/implement` invocation is not retroactive/i, 'no retroactive sign-off']
  ]) requireADRRule(paragraph(coordinatorBody(source.review, 'Review'), 'When the approved Plan binds an ADR'),
    [pattern], `Review guidance: ${rule}`);
  const reviewSkillProcedure = section(source.codeReview, '## Procedure').split('\n')
    .find((line) => line.trimStart().startsWith('When the Plan binds an ADR')) || '';
  for (const [pattern, rule] of [
    [/exact bound path\/ID, section, substantive version\/preimage and current state/i, 'exact ADR identity and state'],
    [/implementation report's actual invocation and per-record persistence evidence/i, 'report invocation and per-record persistence evidence'],
    [/do not infer `Accepted` from invocation alone/i, 'no Accepted inference from invocation'],
    [/Review gains no ADR authorship or status-write authority/i, 'no ADR write authority']
  ]) requireADRRule(reviewSkillProcedure, [pattern], `Code Review Skill: ${rule}`);
  const reviewADRField = field(section(source.reviewReport, '## Disposition and comparison'), 'Architectural choice coverage and ADR comparison');
  for (const [pattern, rule] of [
    [/actual invocation and per-record persistence evidence/i, 'invocation and per-record persistence'],
    [/do not infer `Accepted` from invocation/i, 'no Accepted inference'],
    [/prior invocation when the policy was not effective before it/i, 'no retroactive sign-off'],
    [/clean delivery Review is not ADR sign-off/i, 'Review is not ADR sign-off'],
    [/no ADR authorship or status-write authority/i, 'no Review write authority']
  ]) requireADRRule(reviewADRField, [pattern], `Review report schema: ${rule}`);
  const assuranceAssessment = section(source.assuranceSkill, '## Assessment').split('\n')
    .find((line) => line.trimStart().startsWith('When a Plan binds an ADR')) || '';
  for (const [pattern, rule] of [
    [/exact identity\/section\/preimage version\/state\/conditions/i, 'exact ADR traceability'],
    [/report's actual invocation (?:and|plus) per-record persistence claims/i, 'invocation and persistence evidence'],
    [/Do not infer `Accepted` from invocation alone/i, 'no Accepted inference'],
    [/invocation predating effective policy/i, 'no retroactive sign-off'],
    [/advisory, grants no ADR authorship or status-write authority/i, 'advisory no-write boundary']
  ]) requireADRRule(assuranceAssessment, [pattern], `Stage Assurance Skill: ${rule}`);
  const assuranceADRCheck = source.assurance.split('\n').find((line) => line.startsWith('- [ ] For exact-snapshot sign-off')) || '';
  requireADRRule(assuranceADRCheck, [
    /actual invocation and each per-record save\/readback outcome/i,
    /inspected ADR preimage\/postimage/i,
    /Invocation alone is not persisted `Accepted`/i,
    /no invocation predating effective policy is retroactive/i,
    /Assurance is advisory and grants no ADR status-write authority/i
  ], 'Stage Assurance checklist must compare sign-off evidence without granting authority');
  requireADRRule(source.runner, [
    /Script Runner itself remains source\/configuration\/customization-read-only in every phase/i,
    /Plan coordinator's separate associated-Proposed-ADR exception never transfers to Runner/i
  ], 'Script Runner guidance must not inherit Plan ADR authorship authority');
  requireADRRule(source.lifecycleInstruction, [
    /twelve `applyTo` shapes/i,
    /not canonical RPIR records/i
  ], 'Lifecycle instruction must keep ADRs outside the canonical record patterns');
  return true;
}

function requireExecutionRule(text, patterns, diagnostic) {
  if (patterns.some((pattern) => !pattern.test(text))) fail(diagnostic, 'RPIR-EXECUTION-CONTRACT-001');
}

function between(text, start, end) {
  const first = text.indexOf(start);
  if (first < 0) return '';
  const contentStart = first + start.length;
  const last = text.indexOf(end, contentStart);
  return last < 0 ? '' : text.slice(contentStart, last);
}

// Selected owner-local contradictions only, not general natural-language logic.
function rejectDuplicateGrant(text, owner) {
  if (/\b(?:A|An) (?:separate|additional|duplicate) grant (?:exchange|step|approval) is (?:required|mandatory) for (?:every|each) (?:candidate|checkpoint|commit)\b/i.test(text) ||
      /\b(?:must|shall) (?:request|obtain) (?:a |an )?(?:separate|additional|duplicate) grant for (?:every|each) (?:candidate|checkpoint|commit)\b/i.test(text)) {
    fail(`${owner} must reject mandatory duplicate grants for covered effects`, 'RPIR-EXECUTION-CONTRACT-001');
  }
}

function requireOrderedLoop(text, start, markerRule, diagnostic) {
  const loop = uniqueCheckpointUnit(text, start, true).split('. ')[0] || '';
  requireExecutionRule(loop, [new RegExp([
    'inspect[^→]+→', '(?:make|perform)[^→]+→', 'determine newly supported Step/Task outcomes[^→]+→',
    'inspect the actual Plan preimage[^→]*→', markerRule, '→ handle checkpoint disposition → select the next unit'
  ].join('\\s*'), 'i')], diagnostic);
}

// Bounded authored-contract checks only. These selectors do not parse consumer
// Plans, judge exception truth, or establish runtime Git/agent behaviour.
function requireCheckpointRule(text, patterns, owner, rule) {
  if (patterns.some((pattern) => !pattern.test(text))) {
    fail(`${owner}: ${rule}`, 'RPIR-CHECKPOINT-001');
  }
}

// Fail closed on duplicate normative headings or units; history and metadata
// cannot replace the actual checkpoint owner.
function uniqueCheckpointSection(text, heading) {
  return text.split('\n').filter((line) => line === heading).length === 1 ? section(text, heading) : '';
}

function uniqueCheckpointUnit(text, prefix, line = false) {
  const matches = (line ? text.split('\n') : text.split(/\n\s*\n/))
    .filter((part) => part.trimStart().startsWith(prefix));
  return matches.length === 1 ? matches[0] : '';
}

// Exact authored candidate shapes, not a VS Code glob/attachment evaluator.
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

// Assert the unique general record owner, separately from Research setup and
// ADR allocation. This is a bounded authored-text check, not an allocator.
function checkPhysicalRecordContract(core) {
  const allocation = uniqueCheckpointSection(core, '## Contain allocation and effects');
  const record = uniqueCheckpointUnit(allocation, 'For each numbered record,');
  requireExecutionRule(record, [
    /inspect existing files of its exact artifact suffix in the verified topic/i,
    /choose `001` when none exists or one greater than the (?:highest|maximum) valid three-digit prefix/i,
    /save only an absent exact candidate with actual containment and effective permission/i,
    /On a collision, re-read the inventory and select an absent next number in that same verified topic if identity and ownership remain clear; otherwise resolve ambiguity/i,
    /Read back the saved physical file to verify identity, intended content and direct same-folder links/i,
    /unsuccessful save or unreadable\/mismatched result is not persisted evidence/i,
    /real platform denial is a stop, not an invitation to use another route/i,
    /Do not require double inventories[^.!?\n]*standalone terminal\/reparse or ACL probes/i,
    /inconclusive actual containment still refuses the affected write/i
  ], 'Lifecycle core numbered record allocation owner must preserve allocation, collision, lineage and effect safeguards');
  const lineage = uniqueCheckpointUnit(uniqueCheckpointSection(core, '## Preserve physical lineage and historical evidence'),
    'Every canonical phase predecessor and output');
  requireExecutionRule(lineage, [
    /real, contained, numbered physical Markdown record in the verified Research lifecycle folder/i,
    /accessible direct same-folder links to the expected-kind predecessor/i,
    /Verify the Research -> Plan -> implementation report -> Review chain as applicable/i
  ], 'Lifecycle core physical record lineage owner must preserve contained direct predecessor links');
  const contradictions = /\b(?:overwrite|replace) (?:an? |the )?(?:existing|colliding) (?:record|file|candidate)|\b(?:reuse|overwrite) (?:the |a )?colliding (?:record|file|candidate)|\b(?:switch|relocate) (?:to )?(?:another|a different) (?:topic|folder) (?:after|on) (?:a )?collision|\b(?:skip|omit) (?:the )?(?:collision )?(?:inventory|readback|containment|permission|lineage)(?: check)?|\b(?:treat|claim) (?:a )?(?:failed|denied|unreadable|mismatched) (?:save|record|result) as persisted|\b(?:bypass|evade) (?:a |the )?(?:real )?(?:platform )?denial|\b(?:use|try) another route (?:after|upon) (?:a |the )?(?:platform )?denial|\b(?:require|mandate) (?:a )?(?:standalone terminal|double inventor(?:y|ies)|ACL probe)/gi;
  const affirmative = [...allocation.matchAll(contradictions)].some((match) => {
    const before = allocation.slice(0, match.index);
    return !/\b(?:do not|never)\s*$/i.test(before) &&
      !/\bdo not substitute[^.!?\n]* or\s*$/i.test(before);
  });
  if (affirmative) {
    fail('Lifecycle core has a contradictory numbered record safeguard', 'RPIR-EXECUTION-CONTRACT-001');
  }
  return true;
}

// These checks assert bounded authored passages, not runtime input validation
// or evidence that a directory operation is actually available.
function checkNativeLifecycleInputsAndSetup(source) {
  const input = uniqueCheckpointSection(source.core, '## Inspect and bind one actual document');
  const binding = uniqueCheckpointUnit(input, 'At each handoff bind one evidence envelope');
  const local = uniqueCheckpointUnit(input, 'For local paths, validate the raw alias');
  const transition = uniqueCheckpointSection(source.core, '## Transitions and outcome authority');
  const entry = uniqueCheckpointUnit(transition, 'Prospectively, the engineer selects');
  requireExecutionRule(binding, [/document kind/i, /subject\/lifecycle identity/i, /actual inspected substantive version/i,
    /direct source lineage/i, /recheck freshness before dependent effects/i,
    /Verify kind, subject, version, direct ancestry, freshness, and relationships/i,
    /versions conflict or identity\/evidence is insufficient[^.!?\n]*clarify identity before any transition or dependent effect/i],
  'Lifecycle core physical input owner must verify kind, identity, version, freshness and conflict');
  requireExecutionRule(local, [/workspace-contained absolute paths/i, /unapproved external paths/i,
    /lexical and resolved workspace containment/i, /contained non-numbered local document[^.!?\n]*not an eligible canonical phase predecessor/i],
  'Lifecycle core physical input owner must reject wrong-root and noncanonical inputs');
  requireExecutionRule(entry, [/(?:establish|verify) the actual executing role/i, /receiving coordinator independently inspects/i,
    /Picker selection[^.!?\n]*unsent prefill alone is not a request or approval/i,
    /do not infer the executing role from a picker or prefill/i, /Clarify ambiguous role, intent or input/i],
  'Lifecycle core must inspect actual role and reject picker or prefill approval');
  if (/(?:wrong[- ]kind|wrong[- ]root|stale|conflicting) (?:input|predecessor|record)s? (?:may|can|does|do) (?:approve|authorize|transition|proceed)|(?:picker|prefill) (?:is|constitutes|approves) (?:an? )?(?:request|approval|transition)|(?:infer|determine) (?:the )?executing role from (?:the )?(?:picker|prefill)/i.test(`${input}\n${transition}`)) {
    fail('Lifecycle core has a contradictory physical input or role rule', 'RPIR-EXECUTION-CONTRACT-001');
  }

  const researchBody = uniqueCheckpointSection(source.researchAgent, '# Research coordinator');
  const dispatch = uniqueCheckpointSection(researchBody, '## Native entry and specialist dispatch');
  const setup = {
    research: uniqueCheckpointUnit(dispatch, 'Inspect and reuse each safe selected documentation root'),
    core: uniqueCheckpointUnit(uniqueCheckpointSection(source.core, '## Contain allocation and effects'), 'For each missing selected documentation root'),
    method: uniqueCheckpointUnit(uniqueCheckpointSection(source.researchSkill, '## Limits'), 'When this method supports the Research coordinator')
  };
  const common = [/reuse[^.!?\n]*safe[^.!?\n]*(?:director|root)/i,
    /(?:each|every)[^.!?\n]*(?:selected )?(?:missing )?(?:documentation )?root[^.!?\n]*direct `copilot\/?` parent[^.!?\n]*(?:numbered )?topic/i,
    /(?:(?:separately|one (?:selected|chosen) directory at a time)[^.!?\n]*(?:dedicated directory operation|dedicated create-directory operation|directory operation)|(?:dedicated directory operation|dedicated create-directory operation)[^.!?\n]*one (?:selected|chosen) directory at a time)/i,
    /inspect(?:ing)? (?:each |its )?result/i, /(?:brief[^.!?\n]*(?:save|readback)|save\/read back the brief)/i,
    /(?:terminal)[^.!?\n]*(?:Runner|Script Runner)[^.!?\n]*implicit/i,
    /manual setup is recovery, not an automat(?:ic-setup|ion) pass/i];
  for (const [owner, text] of Object.entries(setup)) {
    requireExecutionRule(text, [...common, /(?:unavailable|missing operation)/i, /deni(?:al|ed)/i],
      `${owner}: missing or ambiguous guarded Research directory owner`);
    if (owner !== 'method') requireExecutionRule(text, [/identity/i, /containment/i, /absence[^.!?\n]*collision/i, /permission/i],
      `${owner}: missing or ambiguous guarded Research directory owner`);
    if (owner === 'method') requireExecutionRule(text, [/collisions/i, /containment or permission uncertainty/i, /failed or unverifiable saves/i],
      `${owner}: missing or ambiguous guarded Research directory owner`);
  }
  for (const [owner, patterns] of Object.entries({
    research: [/after checking identity, containment, absence\/collision and permission[^.!?\n]*inspect each result/i,
      /operation is unavailable or denied[^.!?\n]*report and stop the dependent effect/i, /brief save and full readback/i,
      /Never substitute terminal, Runner, implicit file-save parents or another location/i],
    core: [/independently establish identity, containment, absence including collisions and effective permission[^.!?\n]*attempt that directory operation[^.!?\n]*inspect its result/i,
      /brief's identity, containment, absence\/collision and permission[^.!?\n]*read back its complete physical content and links/i,
      /Report a missing operation, ambiguous identity, collision, conflict, failed or denied creation\/save, or unverifiable result/i,
      /Do not substitute terminal commands, Script Runner directory authorship or implicit file-save parent creation, or bypass a real denial/i,
      /Recursive operation capability is not authority to create implicit or unselected parents/i],
    method: [/Report unavailable operations, collisions, containment or permission uncertainty, denial and failed or unverifiable saves/i,
      /do not substitute terminal, Script Runner or implicit-parent file creation/i]
  })) requireExecutionRule(setup[owner], patterns, `${owner}: missing or ambiguous guarded Research directory owner`);
  for (const [owner, text] of Object.entries({ research: dispatch, core: uniqueCheckpointSection(source.core, '## Contain allocation and effects'),
    method: uniqueCheckpointSection(source.researchSkill, '## Limits') })) {
    if (/(?:Research|Script Runner|Runner) (?:may|can|should) (?:create|author|write) (?:directories|folders|parents)|(?:use|substitute) (?:a )?(?:terminal|shell|Runner|implicit[- ]parent)[^.!?\n]*(?:instead|to create|for (?:directory|folder|setup))|implicit (?:file-save )?parents? (?:may|can|should) be created|(?:manual setup|manual recovery) (?:is|counts as) (?:an? )?(?:automatic|automation) (?:setup )?pass/i.test(text) ||
      hasAffirmativeMatch(text, /\b(?:ignore|bypass) (?:a |the )?(?:collision|containment|denial)\b/gi)) {
      fail(`${owner}: contradictory Research directory safeguard`, 'RPIR-EXECUTION-CONTRACT-001');
    }
  }
}

function checkExpectedCheckpointPlanning(source) {
  const planningOwners = {
    repository: uniqueCheckpointUnit(uniqueCheckpointSection(source.repository, '## Lifecycle authority and transitions'), '- **Expected checkpoint planning, conditional execution:**'),
    core: uniqueCheckpointUnit(uniqueCheckpointSection(source.core, '## Conditional local Git checkpoints'), 'Every prospective Plan'),
    planAgent: uniqueCheckpointUnit(coordinatorBody(source.planAgent, 'Plan'), 'Plan the deliverable'),
    planning: uniqueCheckpointUnit(uniqueCheckpointSection(source.planning, '### Resolve material planning gaps'), 'Specify the approved outcome'),
    checkpointSkill: uniqueCheckpointUnit(uniqueCheckpointSection(source.checkpointSkill, '# Local Git checkpoints').split(/^## /m)[0], 'Every prospective Plan'),
    checklist: uniqueCheckpointSection(source.checklist, '## Prospective Plan coverage')
  };
  const exceptionFields = [
    /actual constraint\/reason/i, /affected IDs/i, /validation\/dependency consequence/i,
    /later (?:checkpoint )?boundary if one exists/i, /why the normal boundary is unsuitable/i
  ];
  for (const [owner, text] of Object.entries(planningOwners)) {
    requireCheckpointRule(text, [
      /(?:Every prospective Plan|Require one)[^.!?\n]*explicit bounded/i,
      /(?:Every|Each) detailed Work Item[^.!?\n]*(?:referenc|strategy)/i,
      /normal post-validation checkpoint boundary/i, /coherent content(?: and |\/)purpose/i,
      /specific justified combination/i, /deferral/i, /no-commit exception/i,
      ...exceptionFields,
      /empty heading/i, /generic exemption/i, /unexplained blanket/i,
      /historical/i, /(?:no Git authority|never supplies Git authority)/i
    ], owner, 'require bounded prospective planning and meaningful per-item exceptions without granting Git authority');
  }

  const templateStrategy = uniqueCheckpointUnit(uniqueCheckpointSection(source.planTemplate, '## Outcome and boundaries'), '- **Local Git checkpoint strategy:**', true);
  requireCheckpointRule(templateStrategy, [
    /Every prospective Plan must state one explicit bounded/i,
    /stable reference/i, /Each detailed item needs the commit-plan entry/i
  ], 'planTemplate', 'require one strategy and an entry for every detailed item');
  const details = uniqueCheckpointSection(source.planTemplate, '## Detailed work items');
  const items = details.split(/^### Work Item /m).slice(1);
  requireCheckpointRule(details, [/Add a matching `### Work Item N` section for each register row/],
    'planTemplate', 'keep register and detailed item identities aligned');
  if (!items.length) fail('planTemplate: missing detailed checkpoint entry', 'RPIR-CHECKPOINT-001');
  for (const item of items) {
    const entry = uniqueCheckpointUnit(item, '**Commit plan:**', true);
    requireCheckpointRule(entry, [
      /strategy reference/i, /normal post-validation checkpoint boundary/i,
      /coherent content(?: and |\/)purpose/i, /specific justified combination\/deferral\/no-commit exception/i,
      ...exceptionFields
    ], 'planTemplate', 'each detailed item needs a useful checkpoint or concrete justified exception field');
  }

  const accountingOwners = {
    core: uniqueCheckpointUnit(uniqueCheckpointSection(source.core, '## Conditional local Git checkpoints'), 'Every prospective Plan'),
    checkpointSkill: uniqueCheckpointUnit(uniqueCheckpointSection(source.checkpointSkill, '# Local Git checkpoints').split(/^## /m)[0], 'Coordinators propose'),
    checklist: uniqueCheckpointUnit(uniqueCheckpointSection(source.checklist, '## 6. Report evidence without lifecycle claims'), 'At every expected boundary'),
    implementAgent: uniqueCheckpointUnit(coordinatorBody(source.implementAgent, 'Implement'), 'Reconcile the inspected Plan'),
    safe: uniqueCheckpointSection(source.safe, '## Execution, validation and record evidence'),
    validationChecklist: uniqueCheckpointUnit(uniqueCheckpointSection(source.validationChecklist, '## Evidence, records and independent review'), '- [ ] Reconcile planned versus actual', true),
    implementationReport: uniqueCheckpointUnit(uniqueCheckpointSection(source.implementationReport, '## Execution and review evidence'), '- **Planned-versus-actual checkpoint accounting:**', true),
    reviewAgent: uniqueCheckpointUnit(coordinatorBody(source.reviewAgent, 'Review'), 'Assess checkpoint planning'),
    codeReview: uniqueCheckpointSection(source.codeReview, '### Checkpoint planning and boundary assessment'),
    reviewTemplate: uniqueCheckpointUnit(uniqueCheckpointSection(source.reviewTemplate, '## Disposition and comparison'), '- **Planned-versus-actual boundary assessment:**', true),
    assuranceSkill: uniqueCheckpointSection(source.assuranceSkill, '### Checkpoint coverage and accounting'),
    assurance: uniqueCheckpointUnit(uniqueCheckpointSection(source.assurance, '## Delivery and material boundaries'), '- [ ] Implement/Review compare', true)
  };
  for (const [owner, text] of Object.entries(accountingOwners)) {
    requireCheckpointRule(text, [
      /planned(?: versus |-|‑)actual|planned-versus-actual|planned strategy[^.!?\n]*actual disposition/i,
      /(?:every|each) expected (?:Work Item )?boundary/i, /before unrelated work/i,
      /(?:actual disposition evidence|actual disposition with evidence|disposition evidence|actual evidence|verified checkpoint evidence)/i,
      /(?:retrospective substantive|substantive[^.!?\n]*retrospective)/i,
      /commit(?:-| )count[^.!?\n]*technical acceptance|not commit count as technical acceptance/i
    ], owner, 'account for each planned versus actual boundary without retrospective Plan exceptions or commit-count acceptance');
  }
  for (const owner of ['implementAgent', 'safe', 'validationChecklist', 'implementationReport', 'reviewAgent', 'codeReview', 'reviewTemplate', 'assuranceSkill']) {
    requireCheckpointRule(accountingOwners[owner], [
      /actual constraint\/reason/i, /affected IDs/i, /validation\/dependency consequence/i,
      /later boundary if one exists/i, /why (?:the )?normal(?: boundary)? (?:is|was) unsuitable/i
    ], owner, 'assess each departure reason, IDs, validation consequence and later boundary');
  }

  const runtimeOwners = {
    preflight: uniqueCheckpointUnit(uniqueCheckpointSection(source.checklist, '## Prospective Plan coverage'), 'Before every Git command,'),
    applicability: uniqueCheckpointSection(source.checklist, '## 1. Decide whether a checkpoint applies'),
    authorization: uniqueCheckpointSection(source.checklist, '## 3. Bind authorization to the approved Plan'),
    candidate: uniqueCheckpointSection(source.checklist, '## 4. Inspect and preserve the candidate'),
    reconciliation: uniqueCheckpointSection(source.checklist, '## 5. Append and reconcile; never assume success'),
    evidence: uniqueCheckpointSection(source.checklist, '## 6. Report evidence without lifecycle claims')
  };
  for (const [owner, patterns] of Object.entries({
    preflight: [/incidental index refresh\/cache writes/i, /Unknown, changed or incompatible consequential effects stop that command before execution/i],
    applicability: [/outside Git or uses another VCS[^\n]*Skipped — not applicable/i,
      /no eligible change remains[^\n]*Skipped — no eligible changes/i,
      /Git is missing\/inaccessible[^\n]*membership is ambiguous[^\n]*Unavailable \/ unresolved/i,
      /Do not call this a verified no-repository skip/i, /Do not create an empty commit[^\n]*force-add/i],
    authorization: [/silent, prohibiting, or merely optional\/unapproved strategy does not authorize Git/i,
      /real platform denial stops the affected action and is never bypassed/i],
    candidate: [/unrelated staged content exists[^\n]*ownership is ambiguous/i,
      /validation actually applies to the staged snapshot/i, /HEAD\/index drift/i,
      /if drift occurs, stop and re-inspect/i, /source-read-only in every phase/i,
      /stop before invoking a source-mutating helper/i, /Do not disable a required hook/i,
      /Never bypass hooks\/signing[^\n]*invent identity\/legal signoff/i,
      /Remote\/network effects are outside this checkpoint capability/i],
    reconciliation: [/Only after the complete candidate and relevant checks are supported and state remains current/i,
      /command success alone does not verify a commit/i,
      /If completion is uncertain, reconcile[^\n]*before retry/i],
    evidence: [/actual ID|ID, parent/i, /No commit verified/i, /Commit verified with unexpected effects/i,
      /Completion uncertain/i, /chronology unverified/i, /static tests/i]
  })) requireCheckpointRule(runtimeOwners[owner], patterns, `checklist ${owner}`, 'preserve effect-specific runtime safeguards and honest dispositions');

  const userOwners = {
    readme: uniqueCheckpointSection(source.readme, '### Expected checkpoint planning; conditional execution'),
    wikiRpir: uniqueCheckpointSection(source.wikiRpir, '## Expected checkpoint planning; conditional execution'),
    wikiEvidence: uniqueCheckpointSection(source.wikiEvidence, '### Expected checkpoint planning; conditional execution'),
    wikiCatalogue: uniqueCheckpointUnit(uniqueCheckpointSection(source.wikiCatalogue, '### Skills'),
      '| Every prospective Plan requires one explicit bounded strategy;', true),
    wikiMaintenance: uniqueCheckpointSection(source.wikiMaintenance, '### Diagnose and validate without packaging')
  };
  for (const [owner, text] of Object.entries(userOwners)) {
    requireCheckpointRule(text, [
      /Every prospective Plan[^.!?\n]*bounded strategy/i,
      /every detailed Work Item[^.!?\n]*strategy reference/i,
      /normal post-validation boundary/i, /coherent content\/purpose/i,
      /specific justified exception/i, /planned versus actual[^.!?\n]*every expected boundary before unrelated work/i,
      /retrospective substantive Plan exceptions/i,
      /static[^.!?\n]*(?:not|cannot|do not)[^.!?\n]*(?:runtime|semantic)/i
    ], owner, 'align required planning, conditional accounting and static/runtime limits');
  }
  requireCheckpointRule(userOwners.wikiCatalogue, [/\]\(\.\.\/\.\.\/\.github\/skills\/local-git-checkpoints\/SKILL\.md\)/i],
    'wikiCatalogue', 'checkpoint catalogue row must identify the actual capability');
  const summaries = {
    lifecycleInstruction: uniqueCheckpointSection(source.lifecycleInstruction, '## Stage schemas')
  };
  for (const owner of ['lifecycleInstruction']) {
    requireCheckpointRule(summaries[owner], [
      /every prospective Plan[^.!?\n]*explicit bounded/i,
      /(?:each|every) detailed Work Item[^.!?\n]*strategy(?:-referenced| reference)/i,
      /actual constraint\/reason/i, /affected IDs/i, /validation\/dependency consequence/i,
      /historical/i, /no Git authority/i
    ], owner, 'summarize required strategy, per-item exceptions and prohibition compatibility');
  }
  for (const owner of ['lifecycleInstruction']) {
    requireCheckpointRule(summaries[owner], [
      /planned(?: versus |-|‑)actual|planned-versus-actual|every planned boundary/i,
      /every expected (?:correction )?boundary|every planned boundary/i,
      /before unrelated work/i, /actual disposition(?:\/exception)? evidence/i,
      /retrospective substantive Plan exceptions|Do not backfill substantive exceptions/i,
      /commit count is not technical acceptance|not commit count as technical acceptance/i
    ], owner, 'summarize actual boundary evidence without substantive Plan backfill');
  }
  const scopes = {
    ...planningOwners, ...accountingOwners, ...userOwners, ...summaries,
    planAgent: coordinatorBody(source.planAgent, 'Plan'),
    implementAgent: coordinatorBody(source.implementAgent, 'Implement'),
    reviewAgent: coordinatorBody(source.reviewAgent, 'Review'),
    planning: section(source.planning, '## Procedure'),
    planTemplate: section(source.planTemplate, '## Outcome and boundaries') + details,
    checklist: planningOwners.checklist + accountingOwners.checklist + runtimeOwners.authorization,
    safe: section(source.safe, '## Execution, validation and record evidence'),
    validationChecklist: section(source.validationChecklist, '## Capabilities and effects') +
      section(source.validationChecklist, '## Evidence, records and independent review'),
    implementationReport: section(source.implementationReport, '## Execution and review evidence'),
    reviewTemplate: section(source.reviewTemplate, '## Disposition and comparison'),
    assurance: section(source.assurance, '## Delivery and material boundaries'),
    wikiCatalogue: uniqueCheckpointSection(source.wikiCatalogue, '### Skills'),
    repository: section(source.repository, '## Lifecycle authority and transitions'),
    core: section(source.core, '## Conditional local Git checkpoints'),
    checkpointSkill: uniqueCheckpointSection(source.checkpointSkill, '# Local Git checkpoints').split(/^## /m)[0]
  };
  for (const [owner, text] of Object.entries(scopes)) {
    if (/(?:checkpoint|commit|Git) (?:planning|strategy|plans?) (?:is|are|remains?) optional|(?:only when|if) (?:local )?commits are intended|(?:Work Items? may|may) omit (?:the |a )?(?:commit|checkpoint)[^.!?\n]*entry|generic (?:blanket )?(?:exception|prohibition) (?:is sufficient|satisfies)|(?:historical )?prohibitions? (?:may be ignored|grants? Git authority)/i.test(text)) {
      fail(`${owner}: contradictory optional checkpoint planning or prohibition bypass`, 'RPIR-CHECKPOINT-001');
    }
    rejectDuplicateGrant(text, owner);
  }
}

function checkIncrementalRpirContract(sources = {}) {
  const paths = {
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
    researchSkill: '.github/skills/codebase-research/SKILL.md',
    planAgent: '.github/agents/plan.agent.md', checkpointSkill: '.github/skills/local-git-checkpoints/SKILL.md',
    codeReview: '.github/skills/code-review/SKILL.md', assuranceSkill: '.github/skills/rpir-stage-assurance/SKILL.md',
    lifecycleInstruction: '.github/instructions/lifecycle-records.instructions.md',
    readme: 'README.md', wikiRpir: 'docs/Wiki/rpir.md', wikiEvidence: 'docs/Wiki/lifecycle-evidence-and-authority.md',
    wikiCatalogue: 'docs/Wiki/artifact-catalogue.md', wikiMaintenance: 'docs/Wiki/maintain-the-toolkit.md'
  };
  const source = Object.fromEntries(Object.entries(paths).map(([key, relative]) => [key, sources[key] ?? readText(relative)]));

  const transitions = uniqueCheckpointSection(source.core, '## Transitions and outcome authority');
  const nativeTransition = uniqueCheckpointUnit(transitions, 'Prospectively, the engineer selects');
  requireExecutionRule(nativeTransition, [
    /selects the intended receiving custom agent/i, /deliberately sends a request for that stage with the actual physical predecessor/i,
    /receiving coordinator independently inspects/i, /No fixed wording, slash command or entry skill is required/i,
    /(?:Picker selection|picker)[^.!?\n]*not a request or approval/i
  ], 'Lifecycle core must retain the prospective receiving-role transition');
  requireExecutionRule(uniqueCheckpointUnit(transitions, 'This contract is prospective:'), [
    /policy actually effective in the session at invocation/i, /earlier required entry route/i,
    /does not self-upgrade a session or make an earlier request retroactive/i
  ], 'Lifecycle core must retain the effective-policy transition and bootstrap');
  requireExecutionRule(uniqueCheckpointUnit(transitions, '| Plan -> Implement |', true), [
    /deliberate engineer-sent Implement request with the inspected physical approved Plan authorizes its bounded outcome/i
  ], 'Lifecycle core must bind implementation authority to the inspected Plan and receiving request');
  if (/(?:^|[.!?]\s+)(?:a )?(?:(?:slash command|fixed wording|entry skill) is (?:always )?required|(?:picker|role|skill) selection (?:is|constitutes) (?:a )?(?:request|approval|invocation)|policy edits? (?:automatically )?self-upgrades? (?:a |the )?(?:loaded )?session)/i.test(transitions)) {
    fail('Lifecycle core has a contradictory receiving-role transition', 'RPIR-EXECUTION-CONTRACT-001');
  }

  checkNativeLifecycleInputsAndSetup(source);
  checkPhysicalRecordContract(source.core);
  checkLifecycleCandidatePatterns(source.lifecycleInstruction);

  const commandEntry = uniqueCheckpointUnit(uniqueCheckpointSection(source.repository, '## Command execution entry'), '- **Goal-directed Script Runner:**', true);
  requireExecutionRule(commandEntry, [/or an explicit bounded phase-record grant/i,
    /not duplicate approval for unchanged Plan-covered effects/i, /same runtime safeguards/i],
  'Repository command entry must preserve separately bounded phase-record checkpoints');

  const policyCheckpoint = uniqueCheckpointUnit(uniqueCheckpointSection(source.repository, '## Lifecycle authority and transitions'), '- **Conditional local Git checkpoints:**', true);
  requireExecutionRule(policyCheckpoint, [
    /explicit approval of an inspected Plan/i, /bounded local staging\/append-only commit strategy/i,
    /after the qualifying Implement transition/i, /No separate grant exchange is required/i,
    /current loaded session cannot self-upgrade/i, /effective permission/i
  ], 'Repository policy must bind covered Git authority to Plan approval, phase transition and current-session limits');

  const coreCheckpoint = uniqueCheckpointSection(source.core, '## Conditional local Git checkpoints');
  requireExecutionRule(coreCheckpoint, [
    /explicit approval of an inspected Plan/i, /no separate grant exchange is required/i,
    /after the qualifying Implement transition/i, /silent, prohibiting or unapproved-option Plan/i,
    /editing these rules does not self-upgrade/i, /staged-snapshot validation/i, /effective permission/i
  ], 'Lifecycle core checkpoint authority lacks Plan binding, phase, negative or runtime safeguards');

  const checklistAuthorization = uniqueCheckpointSection(source.checklist, '## 3. Bind authorization to the approved Plan');
  requireExecutionRule(checklistAuthorization, [
    /explicitly approved the inspected Plan\/version/i, /explicitly includes a bounded local staging\/append-only commit strategy/i,
    /no (?:separate grant exchange|additional grant step) is required/i, /(?:before|precede) a concrete candidate/i,
    /literal candidate and candidate-relevant validation/i,
    /silent, prohibiting, or merely optional\/unapproved strategy does not authorize Git/i,
    /earlier Research effects/i, /validity, resume\/revalidation and revocation conditions/i,
    /Material objective\/scope, repository\/worktree\/branch, permission or consequential helper changes require reassessment/i
  ], 'Checkpoint checklist authorization must cover approved Plans, future candidates and fail-closed cases');
  rejectDuplicateGrant(checklistAuthorization, 'Checkpoint checklist authorization');
  const phaseRecordAuthorization = checklistAuthorization.match(/^For a separately authorized phase-record checkpoint[^\n]*/m)?.[0] || '';
  requireExecutionRule(phaseRecordAuthorization, [
    /explicit bounded grant for that phase and saved\/read-back record/i,
    /do not demand an approved implementation Plan or Implement invocation evidence/i,
    /same repository\/worktree\/branch, content\/exclusions, Runner ownership, validation, local-policy\/helper\/permission, validity and revocation safeguards/i,
    /not a duplicate grant for unchanged Plan-covered effects/i,
    /both routes retain the same literal-candidate and runtime checks/i
  ], 'Checkpoint checklist must retain separately bounded phase-record authority with the same safeguards');

  const checklistCadence = uniqueCheckpointSection(source.checklist, '## 2. Apply local policy and determine eligible content');
  requireExecutionRule(checklistCadence, [
    /after each completed Work Item before unrelated items/i, /earlier coherent, validated Task boundaries/i,
    /explain justified combinations, deferrals, or no-commit outcomes/i,
    /Do not split by file type, elapsed time, line count or checkbox/i,
    /invent a numerical threshold/i
  ], 'Checkpoint checklist must state normal Work Item cadence and bounded earlier Task consideration');

  const planningGaps = uniqueCheckpointSection(source.planning, '### Resolve material planning gaps');
  const planGuidance = [uniqueCheckpointUnit(planningGaps, 'Specify the approved outcome'),
    uniqueCheckpointUnit(planningGaps, 'Approval of that inspected Plan')].join('\n\n');
  requireExecutionRule(planGuidance, [
    /bounded local staging\/append-only commit strategy/i,
    /Approval of that inspected Plan includes only its covered commits after the qualifying Implement transition/i,
    /without a separate grant exchange/i,
    /Normal cadence is a checkpoint after each completed eligible coherent(?: validated)? Work Item/i,
    /proactive consideration of earlier coherent validated Task boundaries/i,
    /Silent, prohibited or unapproved-option Plans do not authorize Git/i
  ], 'Planning guidance must require explicit bounded strategy and normal cadence without duplicate approval');

  requireExecutionRule(uniqueCheckpointUnit(uniqueCheckpointSection(source.planTemplate, '## Outcome and boundaries'), '- **Local Git checkpoint strategy:**', true), [
    /\*\*Local Git checkpoint strategy:\*\*/i, /repository\/worktree\/branch selection rule/i,
    /Script Runner ownership/i, /Explicit approval of this inspected Plan authorizes only its covered commits after the qualifying Implement transition/i,
    /no separate grant exchange is needed/i, /after each completed Work Item/i,
    /earlier coherent validated Tasks/i, /Plan publication cannot authorize its own checkpoint or earlier Research effects/i
  ], 'Plan template must capture bounded authorization fields, cadence and phase limits');

  // Only the normative opening body, never frontmatter or a historical section.
  const runner = uniqueCheckpointSection(source.runner, '# Script Runner').split(/^## /m)[0];
  const runnerAuthority = [paragraph(runner, 'Accept a self-contained'), paragraph(runner, 'Only `read`')].join('\n\n');
  requireExecutionRule(runnerAuthority, [
    /inspected approved Plan\/version/i, /explicit bounded commit strategy with approval and qualifying Implement invocation evidence/i,
    /literal candidate/i, /no duplicate grant is required/i, /silent\/prohibiting Plan/i,
    /source\/configuration\/customization-read-only/i, /source-mutating hook or helper/i
  ], 'Script Runner summary must consume Plan authority without expanding tools or effects');
  requireExecutionRule(runnerAuthority, [
    /explicit bounded phase-record grant/i,
    /without requiring an approved implementation Plan or Implement invocation evidence/i,
    /both routes retain identical candidate, ownership, validation, helper and permission safeguards/i
  ], 'Script Runner must retain separately bounded phase-record authority with the same safeguards');
  const runnerMetadata = parseFrontmatterText(source.runner, '.github/agents/script-runner.agent.md').values;
  requireExecutionRule(runnerAuthority, [/Only `read`, `search` and `execute` are declared/i],
    'Script Runner must declare the native execute alias without expanding its tool boundary');
  if (!equal(parseStringList(runnerMetadata.tools, '.github/agents/script-runner.agent.md', 'tools'), nativeTools['Script Runner'])) {
    fail('Script Runner must declare the native execute alias without expanding its tool boundary', 'RPIR-EXECUTION-CONTRACT-001');
  }
  rejectDuplicateGrant(runner, 'Script Runner authority');
  const researchCheckpoint = coordinatorBody(source.researchAgent, 'Research')
    .match(/(?:^|[.!?]\s+)(Script Runner\b[^\n]*?\.(?=\s|$))/i)?.[1] || '';
  requireExecutionRule(researchCheckpoint, [
    /separately (?:granted|authorized) local Git index\/history checkpoint/i,
    /eligible Research brief (?:after|following) physical save\/readback/i
  ], 'Research must retain its separately authorized saved-brief checkpoint route');

  const implement = uniqueCheckpointUnit(coordinatorBody(source.implementAgent, 'Implement'), 'Own the permitted direct edit', true);
  requireExecutionRule(implement, [
    /inspected approved Plan explicitly includes a bounded strategy/i,
    /approval supplies authority for covered commits after the qualifying Implement transition under policy effective at invocation without a second grant/i,
    /literal candidate/i, /candidate-relevant validation/i,
    /Silent\/prohibiting Plans, unapproved options, revocation, or material drift do not authorize effects/i,
    /effective permission/i
  ], 'Implement authority summary must bind covered commits and retain runtime candidate checks');

  const reviewAgentCheckpoint = uniqueCheckpointUnit(coordinatorBody(source.reviewAgent, 'Review'), 'Review and its Correctness', true);
  requireExecutionRule(reviewAgentCheckpoint, [
    /applicable approved Plan explicitly covers that record and phase/i,
    /after physical save\/readback/i,
    /Plan authority does not authorize its own or earlier Research checkpoints/i,
    /candidate state, helpers and permission/i
  ], 'Review checkpoint summary must accept covered Plan authority without expanding Review effects');
  requireExecutionRule(reviewAgentCheckpoint, [/other valid bounded authorization applies/i],
    'Review must retain its separately bounded record-checkpoint route');

  const progress = uniqueCheckpointSection(source.safe, '### Incremental Plan progress');
  requireExecutionRule(progress, [
    /primary loop before moving to an unrelated unit/i, /determine newly supported Step\/Task outcomes/i,
    /inspect the actual Plan preimage/i, /update eligible existing markers only, save and read back\/verify preservation/i,
    /handle checkpoint disposition/i, /select the next unit/i,
    /failed, denied or unverifiable save is unsaved tracking/i,
    /promptly disclose affected Step\/Task\/Work Item IDs/i,
    /parent-only failure or pause preserves supported children/i,
    /final checked state alone does not prove completion-to-save timing/i
  ], 'Safe implementation loop must persist progress in order and disclose honest recovery');
  requireOrderedLoop(progress, 'During the pass, use this primary loop',
    'update eligible existing markers only, save and read back/verify preservation\\s*',
    'Safe implementation loop must persist progress in order and disclose honest recovery');
  const markerCore = uniqueCheckpointSection(source.core, '### Approved Plan execution-marker exception');
  requireExecutionRule(uniqueCheckpointUnit(markerCore, 'The Implement coordinator alone may update'), [
    /only already-existing Step, Task and Work Item completion markers/i, /active inspected approved Plan/i,
    /does not change[^.!?\n]*substantive approved snapshot[^.!?\n]*scope[^.!?\n]*acceptance criteria[^.!?\n]*hierarchy[^.!?\n]*IDs[^.!?\n]*lineage[^.!?\n]*approval identity/i,
    /does not authorize edits to historical Plans or finalized reports/i, /actual preimage/i,
    /read back and verify[^.!?\n]*only in the intended marker state/i,
    /denied, failed or unverifiable marker save[^.!?\n]*unsaved tracking/i
  ], 'Lifecycle core must preserve the bounded marker-only effect and readback');
  for (const [prefix, patterns] of [
    ['- Check a Step ', [/intended outcome is achieved/i, /required check[^.!?\n]*successful result/i, /Merely attempting a check is not completion/i]],
    ['- Check a Task ', [/intended outcome and all required constituent work\/checks are complete/i, /completed child remains checked/i]],
    ['- Check the Work Item ', [/explicit approved exit gate passes/i, /acceptance is met/i, /every required validation[^.!?\n]*successful result/i, /failed, unavailable or not-run evidence leaves it unmet/i]]
  ]) requireExecutionRule(uniqueCheckpointUnit(progress, prefix, true), patterns,
    'Safe implementation must preserve Step, Task and Work Item completion gates');
  for (const [owner, text] of [['Lifecycle core', markerCore], ['Safe implementation', progress],
    ['Implement coordinator', coordinatorBody(source.implementAgent, 'Implement')]]) {
    if (/(?:workers?|Script Runner|Review) (?:may|can|should) (?:update|edit|write) (?:Plan )?markers|(?:markers|tracking) (?:are|is) optional for Implement|(?:failed|unavailable|not-run) (?:checks?|validation) (?:may|can) (?:pass|complete) (?:the )?(?:Work Item|gate)|(?<!not )(?:edit|rewrite) (?:historical Plans|finalized reports|approved Plan scope)/i.test(text) ||
      hasAffirmativeMatch(text, /\b(?:the )?Implement coordinator (?:may|can|should) add new completion markers/gi)) {
      fail(`${owner}: contradictory marker authority or completion gate`, 'RPIR-EXECUTION-CONTRACT-001');
    }
  }
  const selectiveRecovery = uniqueCheckpointUnit(progress, '- On resume,', true);
  requireExecutionRule(selectiveRecovery, [
    /reopen only (?:the invalidated|disproved) markers and dependent parent markers whose completion is no longer supported/i,
    /preserve unaffected completed work/i, /record the evidence\/reason/i
  ], 'Safe implementation recovery must selectively reopen disproved completion and preserve unaffected work');

  const implementationCapabilities = between(source.validationChecklist, '## Capabilities and effects', '\n## Evidence, records and independent review');
  requireExecutionRule(implementationCapabilities, [
    /Do not demand duplicate grants for unchanged Plan-covered effects/i,
    /verify the inspected approved Plan explicitly covers the bounded effect and phase/i,
    /bind validation to the complete staged snapshot/i,
    /Only Script Runner performs the Git mutation/i
  ], 'Implementation checklist must use Plan-covered authority while retaining candidate and executor safeguards');
  rejectDuplicateGrant(implementationCapabilities, 'Implementation checklist capabilities');

  const implementLoop = uniqueCheckpointUnit(coordinatorBody(source.implementAgent, 'Implement'), 'The prominent execution loop is:', true);
  requireExecutionRule(implementLoop, [
    /determine newly supported Step\/Task outcomes/i, /inspect the actual Plan preimage/i,
    /save eligible existing markers only and read back\/verify preservation/i,
    /handle checkpoint disposition/i, /select the next unit/i,
    /before unrelated later work/i, /disclose affected IDs promptly as unsaved tracking/i
  ], 'Implement summary must preserve the ordered completion/save/checkpoint loop');
  requireOrderedLoop(implementLoop, 'The prominent execution loop is:',
    'save eligible existing markers only and read back/verify preservation\\s*',
    'Implement summary must preserve the ordered completion/save/checkpoint loop');

  const markerReportField = uniqueCheckpointUnit(uniqueCheckpointSection(source.implementationReport, '## Delivered outcome and progress'), '- **Plan marker tracking:**', true);
  requireExecutionRule(markerReportField, [
    /completion-to-save\/readback before unrelated later work/i, /observed late reconciliation/i,
    /unverified timing/i, /denied\/failed\/conflicting\/unverified saves as unsaved tracking/i,
  ], 'Implementation report marker field must distinguish completion timing and unsaved tracking');
  const implementationCheckpointField = uniqueCheckpointUnit(uniqueCheckpointSection(source.implementationReport, '## Execution and review evidence'), '- **Planned-versus-actual checkpoint accounting:**', true);
  requireExecutionRule(implementationCheckpointField, [
    /earlier coherent validated Task opportunities/i, /even with no commits/i,
    /No commit-count technical acceptance gate/i
  ], 'Implementation report checkpoint field must assess opportunities and no-commit paths');

  const reviewCheckpointField = uniqueCheckpointUnit(uniqueCheckpointSection(source.reviewTemplate, '## Disposition and comparison'), '- **Implementation range and checkpoint evidence:**', true);
  requireExecutionRule(reviewCheckpointField, [
    /inspected Plan strategy\/approval reference/i,
    /expected completed-Work-Item and earlier coherent-Task opportunities/i,
    /including no-commit dispositions|including no-commit paths|even when no commit occurred/i,
    /timely completion-to-save\/readback/i, /observed late\/omitted action/i,
    /unverified timing/i, /silence and final markers do not prove chronology/i,
    /missing commit alone is not defective code/i
  ], 'Review template must assess available chronology and no-commit paths without overclaim');

  const assuranceImplement = uniqueCheckpointUnit(uniqueCheckpointSection(source.assurance, '## Stage-specific outcome'), '- **Implement:**', true);
  requireExecutionRule(assuranceImplement, [
    /completion-to-save\/readback before unrelated later work/i, /observed timely action/i,
    /observed late\/omitted backfill/i, /unverified timing/i,
    /expected checkpoint opportunities/i, /no silence-based pass or commit-count gate/i
  ], 'Stage assurance must distinguish observed timing, unknown evidence and checkpoint exceptions');

  const readmeCheckpointSection = uniqueCheckpointSection(source.readme, '### Expected checkpoint planning; conditional execution');
  requireExecutionRule(readmeCheckpointSection, [
    /approving that inspected Plan approves its covered commits after the qualifying Implement transition under the policy effective at invocation/i,
    /no separate grant exchange is needed/i, /after each completed Work Item/i,
    /earlier coherent validated Task boundaries/i
  ], 'README checkpoint section must explain Plan-approved authority and normal cadence');
  const readmeProgress = source.readme.match(/^During implementation,[^\n]*/m)?.[0] || '';
  requireExecutionRule(readmeProgress, [
    /before moving to unrelated work/i, /affected IDs are disclosed as unsaved/i,
    /a final checked state is not proof of when it was saved/i
  ], 'README progress guidance must explain timely persistence and honest recovery');

  const wikiRpirCheckpoint = uniqueCheckpointSection(source.wikiRpir, '## Expected checkpoint planning; conditional execution');
  const wikiEvidenceCheckpoint = uniqueCheckpointSection(source.wikiEvidence, '### Expected checkpoint planning; conditional execution');
  for (const [label, text] of [['RPIR Wiki', wikiRpirCheckpoint], ['lifecycle evidence Wiki', wikiEvidenceCheckpoint]]) {
    requireExecutionRule(text, [
      /after each completed Work Item/i, /earlier coherent validated Task/i,
      /When a Plan includes local commits|(?:explicitly includes a bounded|Plan that states a bounded) local staging\/append-only(?: commit)? strategy/i,
      /qualifying Implement transition under the effective policy/i,
      /no (?:duplicate grant|separate grant exchange)/i, /literal candidate/i, /effective permission/i
    ], `${label} must align user guidance with the canonical checkpoint strategy and cadence`);
  }
  const wikiRpirProgress = source.wikiRpir.match(/^The Implement coordinator's main loop[^\n]*/m)?.[0] || '';
  requireExecutionRule(wikiRpirProgress, [
    /before moving to unrelated work/i, /persists only eligible existing markers/i,
    /disclose affected IDs(?: promptly)? as unsaved tracking/i, /parent-only failure or pause retains supported children/i
  ], 'RPIR Wiki progress summary must preserve completion-boundary tracking and recovery');

  // Status mirrors are optional, but the adjacent active-Plan exception is
  // mandatory. Neither passage can be supplied by another owner or history.
  const statusSection = uniqueCheckpointSection(source.core, '## Status, questions and validation');
  const statusMirror = uniqueCheckpointUnit(statusSection, 'Status mirrors and completion markers');
  const markerSection = uniqueCheckpointSection(source.core, '### Approved Plan execution-marker exception');
  const markerDistinction = uniqueCheckpointUnit(markerSection, 'For clarity,');
  requireExecutionRule(statusMirror, [
    /Status mirrors and completion markers are (?:optional bookkeeping, not scope, transition or acceptance authority|bookkeeping, not scope, transition or acceptance authority; status mirrors are optional)/i,
    /(?:elects|chooses) an eligible status update/i, /inspect the current physical content/i,
    /change only the intended bookkeeping field/i, /verify the saved result/i,
    /conflict[^.!?\n]*re-read and reconcile without overwriting substantive edits/i,
    /failed mirror must be disclosed but cannot invalidate otherwise verified delivery or a clean Review/i
  ], 'Lifecycle core status-mirror owner must retain optional guarded bookkeeping without authority or loss of evidence');
  requireExecutionRule(markerDistinction, [
    /(?:does not make|never makes) Implement's active approved-Plan execution tracking optional/i,
    /only lifecycle status mirrors remain optional/i,
    /Implement must maintain the existing progress markers/i,
    /(?:not standalone validation proof, approval, transition or acceptance|neither validation proof nor approval, transition or acceptance)/i
  ], 'Lifecycle core must distinguish optional status mirrors from required active-Plan progress');

  // The receiving Implement coordinator independently owns correction intake;
  // Review guidance alone cannot satisfy this obligation.
  const implementBody = coordinatorBody(source.implementAgent, 'Implement');
  const planIntake = uniqueCheckpointUnit(implementBody, 'Apply the inspected, explicitly approved Plan outcome');
  requireExecutionRule(planIntake, [
    /inspected, explicitly approved Plan outcome/i,
    /Independently inspect the actual contained numbered physical Plan\/version and direct Research lineage/i
  ], 'Implement coordinator must independently inspect the original physical approved Plan and lineage');
  const correctionIntake = uniqueCheckpointUnit(implementBody, 'For supported in-boundary Review findings,');
  requireExecutionRule(correctionIntake, [
    /(?:engineer may manually resume Implement|engineer may resume Implement manually) with (?:the )?\*?original approved Plan\*? and (?:linked inspected physical Review context|linked physical Review context that has been inspected)/i,
    /(?:Verify|Inspect) the Review, its reviewed report and the original Plan(?:\/| and )Research lineage/i,
    /Findings are evidence, not (?:a )?new scope or automatic approval/i,
    /Preserve original acceptance criteria/i,
    /produce fresh implementation evidence/i, /(?:seek|obtain) fresh independent (?:Review|re-review)/i,
    /do not rewrite finalized reports/i,
    /New material scope[^.!?\n]*engineer decision and Plan-owned amendment\/new Plan/i
  ], 'Implement coordinator correction intake must retain original Plan, linked Review lineage, manual resumption and fresh evidence');

  const preservationNegation = /\b(?:do not|never|must not|should not|need not) (?:assert (?:that )?)?$/i;
  for (const [owner, text, contradictions] of [
    ['Lifecycle core status', `${statusSection}\n${markerSection}`,
      /\b(?:status mirrors?|completion markers?|tracking) (?:is|are) (?:approval|acceptance|transition authority)|\b(?:status mirrors?|completion markers?) (?:approve|authorize|establish) (?:a )?(?:transition|acceptance)|\b(?:failed|denied) mirrors? (?:invalidate|erase) (?:verified )?(?:delivery|evidence|Review)|\b(?:active[- ]Plan )?(?:progress markers?|execution tracking) (?:is|are) optional|\bstatus mirrors? (?:is|are) (?:mandatory|required)|\b(?:require|mandate) status mirrors?\b/gi],
    ['Implement correction intake', implementBody,
      /\b(?:automatically (?:resume|invoke) Implement|(?:findings|Review) (?:automatically )?(?:grant|grants|provide|provides) (?:new )?(?:scope|edit authority|approval)|(?:omit|skip) (?:the )?(?:original Plan|linked Review|Review lineage|fresh implementation evidence|independent re-review)|(?:rewrite|edit) finalized reports|(?:resume Implement|proceed) without (?:the )?(?:\*?original approved Plan\*?|linked (?:inspected physical|physical) Review context))/gi]
  ]) {
    if (hasAffirmativeMatch(text, contradictions, preservationNegation)) fail(`${owner}: contradictory preservation rule`, 'RPIR-EXECUTION-CONTRACT-001');
  }
  if (/\b(?:do not|never|must not|should not|need not) (?:inspect the current physical content|change only the intended bookkeeping field)\b/i.test(statusSection)) {
    fail('Lifecycle core status: contradictory preservation rule', 'RPIR-EXECUTION-CONTRACT-001');
  }
  if (/\b(?:do not|never|must not|should not|need not) produce fresh implementation evidence\b/i.test(implementBody)) {
    fail('Implement correction intake: contradictory preservation rule', 'RPIR-EXECUTION-CONTRACT-001');
  }
  checkExpectedCheckpointPlanning(source);
  return true;
}

function checkModelAuthoringContract(sources = {}) {
  const paths = {
    agent: '.github/skills/create-copilot-agent/SKILL.md',
    agentTemplate: '.github/skills/create-copilot-agent/templates/agent.md',
    prompt: '.github/skills/create-copilot-prompt/SKILL.md',
    promptTemplate: '.github/skills/create-copilot-prompt/templates/prompt.md',
    maintenance: '.github/skills/maintain-copilot-artifacts/SKILL.md',
    checklist: '.github/skills/maintain-copilot-artifacts/references/preservation-checklist.md'
  };
  const source = Object.fromEntries(Object.entries(paths).map(([key, relative]) => [key, sources[key] ?? readText(relative)]));
  const headings = {
    agent: '## Scope, role, and inputs', agentTemplate: '## Model profile (authoring guidance)',
    prompt: '## Prompt-specific constraints', promptTemplate: '## Constraints',
    maintenance: '## Procedure', checklist: '## Interfaces and loading boundaries'
  };
  const requirements = {
    agent: [/capability\/consequence classification/i, /authoritative profile/i, /supported runtime ID as a preferred model/i, /disclose unresolved evidence/i],
    agentTemplate: [/capability\/consequence classification/i, /authoritative profile/i, /supported Copilot runtime ID and preference path/i, /do not activate an invented `model` field/i],
    prompt: [/omit prompt-level model overrides unless deliberately justified/i, /actual Copilot path/i, /accidental shadowing/i, /do not assume picker or prompt precedence/i],
    promptTemplate: [/omit prompt-level model overrides unless deliberately justified/i, /actual Copilot path/i, /shadowing/i, /without assuming picker precedence/i],
    maintenance: [/shared profile/i, /configuration projections/i, /override\/fallback boundaries/i, /harness evidence/i],
    checklist: [/shared model profile/i, /configuration projections/i, /supported overrides and fallback rules/i, /harness\/evidence limits/i]
  };
  for (const [owner, patterns] of Object.entries(requirements)) {
    const owned = section(source[owner], headings[owner]);
    if (patterns.some((pattern) => !pattern.test(owned))) {
      fail(`${paths[owner]} is missing its model-profile authoring safeguard`, 'MODEL-AUTHORING-001');
    }
  }
  // These four owners govern the current no-authored-effort policy; prompt authoring remains independent.
  // This is a bounded authored-text check, not a general prose/runtime oracle.
  for (const owner of ['agent', 'agentTemplate', 'maintenance', 'checklist']) {
    const owned = section(source[owner], headings[owner]);
    const policyRules = [
      /current 18-role[^.\n]*profile/i,
      /omit(?:s)? `reasoning-effort`/i,
      /Fusion-managed reasoning/i,
      /omission does not clear inherited or external configuration or establish observed effective effort/i,
      /(?:assigned model|reasoning policy)[^\n]*observed effective/i,
      /(?:escalation grants no authority|neither escalation nor model choice grants authority|model preferences grant no authority)/i
    ];
    if (policyRules.some((pattern) => !pattern.test(owned))) {
      fail(`${paths[owner]} is missing its effort authoring safeguard`, 'MODEL-AUTHORING-001');
    }
    if (/(?:all|every) roles? (?:must|should) (?:use|declare) `?high`?|(?:omission|absence) (?:always )?(?:clears|resets|removes) (?:all )?(?:inherited|external)|(?:omission|absence) proves? (?:effective|actual) effort|model preferences? (?:grant|grants|expand|expands) (?:authority|tools|permissions)/i.test(owned)) {
      fail(`${paths[owner]} has a contradictory effort authoring rule`, 'MODEL-AUTHORING-001');
    }
  }
  const templateFrontmatter = source.agentTemplate.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] || '';
  if (!templateFrontmatter || /^\s*(?:model|reasoning-effort):/m.test(templateFrontmatter)) {
    fail(`${paths.agentTemplate} must keep model and effort frontmatter inert`, 'MODEL-AUTHORING-001');
  }
  return true;
}

function checkModelProfileCoverage(profile, agentPaths) {
  const rows = section(profile, '# Authoritative role profiles').split('\n')
    .filter((line) => /^\s*\|/.test(line))
    .filter((line) => line !== '| Agent definition | Recommended model | Reasoning policy |' &&
      line !== '| --- | --- | --- |');
  const profiles = new Map();
  for (const row of rows) {
    const match = row.match(/^\| `([a-z0-9-]+\.agent\.md)` \| `(gpt-6\.1-sol|gpt-6\.1-terra|gpt-6-luna|hydrafusion)` \| ([^|]+) \|$/);
    if (!match) fail(`Unsupported model profile row: ${row}`, 'MODEL-PROFILE-001');
    const [, name, model, reasoningPolicy] = match;
    if (profiles.has(name)) fail(`Duplicate model profile: ${name}`, 'MODEL-PROFILE-001');
    profiles.set(name, { model, reasoningPolicy: reasoningPolicy.trim() });
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
  if (Object.hasOwn(values, 'reasoning-effort')) {
    fail(`${relative} must omit authored reasoning-effort`, 'MODEL-PROJECTION-001');
  }
}

// Bounded owner-local authored-policy checks; not a natural-language or runtime oracle.
function checkModelEffortContract(sources = {}) {
  const skill = sources.skill ?? readText('.github/skills/agent-model-selection/SKILL.md');
  const profile = sources.profile ?? readText('.github/skills/agent-model-selection/references/role-profiles.md');
  const owners = {
    procedure: section(skill, '## Procedure'),
    output: section(skill, '## Output and boundary'),
    introduction: section(profile, '# Authoritative role profiles').split('\n| Agent definition')[0],
    selection: section(profile, '## Selection, escalation and failure')
  };
  const requirements = {
    procedure: [
      /assigned model[^\n]*authored reasoning policy[^\n]*separately observed effective/i,
      /Before model configuration[^\n]*supported Copilot path[^\n]*compatibility and permission/i,
      /current 18 roles[^\n]*`hydrafusion` preference and Fusion-managed reasoning policy/i,
      /current 18-role profile omits `reasoning-effort` so Fusion manages reasoning/i,
      /omission does not clear inherited or external configuration or establish effective effort/i
    ],
    output: [
      /Fusion-managed reasoning policy, separately evidenced model configuration and observed settings/i,
      /Do not claim effective routing, effort enforcement, installed loading, or compatibility/i,
      /Model choice or escalation never grants tools, edits, commands, delegation, lifecycle ownership, approval, acceptance/i
    ],
    introduction: [/current 18-role profile uses `hydrafusion` with Fusion-managed reasoning and no authored `reasoning-effort` override/i],
    selection: [
      /current Fusion profile authors no per-agent reasoning override/i,
      /omission does not establish that inherited or external settings are absent or that Fusion's effective reasoning is known/i,
      /report only separately observed effective effort/i,
      /recommendation, configuration or escalation never expands authority[^\n]*independent Review[^\n]*advisory assurance/i
    ]
  };
  for (const [owner, patterns] of Object.entries(requirements)) {
    if (patterns.some((pattern) => !pattern.test(owners[owner]))) {
      fail(`${owner}: missing effort declaration/evidence boundary`, 'MODEL-EFFORT-CONTRACT-001');
    }
  }
  for (const [owner, text] of Object.entries(owners)) {
    if (/(?:omission|absence) (?:always )?(?:clears|resets|removes) (?:all )?(?:inherited|external)|(?:omission|absence) proves? (?:effective|actual) effort|model preferences? (?:grant|grants|expand|expands) (?:authority|tools|permissions)/i.test(text)) {
      fail(`${owner}: contradictory effort declaration/evidence boundary`, 'MODEL-EFFORT-CONTRACT-001');
    }
  }
  return true;
}

// Bounded authored-output owners, not a prose judge or conversation evaluator.
// Missing/ambiguous owners fail closed; metadata/history/wrong-owner mentions
// cannot supply a rule removed from its normative location.
function checkConciseRpirContract(sources = {}) {
  const paths = {
    core: '.github/skills/rpir-lifecycle-core/SKILL.md',
    questions: '.github/skills/agent-question-resolution/SKILL.md',
    clarification: '.github/skills/agent-question-resolution/templates/clarification-message.md',
    discovery: '.github/skills/agent-question-resolution/references/research-intent-discovery.md',
    research: '.github/skills/codebase-research/research-brief-template.md',
    researchAgent: '.github/agents/research.agent.md',
    planAgent: '.github/agents/plan.agent.md',
    implementAgent: '.github/agents/implement.agent.md',
    reviewAgent: '.github/agents/review.agent.md',
    policy: '.github/copilot-instructions.md',
    instruction: '.github/instructions/lifecycle-records.instructions.md',
    assurance: '.github/skills/rpir-stage-assurance/stage-assurance-checklist.md',
    planReport: '.github/skills/architecture-planning/implementation-plan-template.md',
    implementationReport: '.github/skills/safe-implementation/implementation-report-template.md',
    reviewReport: '.github/skills/code-review/review-report-template.md'
  };
  const source = Object.fromEntries(Object.entries(paths).map(([key, relative]) => [key, sources[key] ?? readText(relative)]));
  function owned(text, heading, owner) {
    if (text.split('\n').filter((line) => line === heading).length !== 1) {
      fail(`${owner}: missing or ambiguous output owner`, 'RPIR-OUTPUT-001');
    }
    return section(text, heading);
  }
  function requireOutput(text, patterns, owner, rule) {
    if (patterns.some((pattern) => !pattern.test(text))) fail(`${owner}: ${rule}`, 'RPIR-OUTPUT-001');
  }
  const outputs = owned(source.core, '## Reader-facing outputs', 'core');
  requireOutput(outputs, [/plain English/i, /each phase's own result once/i,
    /[Ll]ink inspected predecessors/i, /source, section and version where material/i,
    /link is not proof of inspection or permission/i, /Chat opens with the result/i,
    /no hard length limit/i, /compulsory empty headings/i, /running discovery\/Q&A history/i,
    /qualified or nonrecommended selections and conditions/i, /failed, unavailable and not-run checks/i,
    /partial delivery/i, /consequential corrections\/rechecks/i, /unsaved tracking/i,
    /every expected checkpoint boundary[^.!?\n]*actual disposition and evidence/i,
    /invocation versus each record's verified recording/i, /final markers\/history do not prove chronology/i,
    /Missing or unreadable sources[^.!?\n]*evidence-gap route/i,
    /independently authorized work may continue/i, /manual transitions[^.!?\n]*independent Review/i,
    /do not establish live behavior or measured readability improvement/i], 'core', 'retain concise output and material evidence');
  const questions = owned(source.questions, '## Procedure', 'questions');
  const framing = questions.split('\n').find((line) => line.startsWith('6. ')) || '';
  requireOutput(framing, [/simple factual clarification[^.!?\n]*direct contextual question/i,
    /without mandatory four-label or lettered formatting/i,
    /evidence requests unbundled/i,
    /evidence-supply\/acquisition route instead of guessing/i,
    /Presentation never replaces actual acknowledgment, waiting, explicit deferral or manual approval/i],
  'questions', 'proportionate questions retain decision and approval safeguards');
  function requireMaterialQuestion(text, owner) {
    requireOutput(text, [/one material decision at a time/i,
      /plain[- ]English/i, /meaningful lettered alternatives/i,
      /ending (?:with|in)[^.!?\n]*free[- ]text\/unknown\/other/i,
      /supported recommendation and (?:its )?reason/i,
      /stop for the (?:engineer's )?actual answer/i],
    owner, 'retain sequential material-choice framing and actual waiting');
  }
  requireMaterialQuestion(framing, 'questions');
  const answer = questions.split('\n').find((line) => line.startsWith('7. ')) || '';
  requireOutput(answer, [/actual qualified or nonrecommended answers and conditions/i,
    /rather than automatically selecting the recommendation/i,
    /do not invoke or approve a phase transition/i], 'questions', 'retain actual answers and manual transitions');
  const clarification = source.clarification.split('\n\n**Known:**')[0];
  requireOutput(clarification, [/simple factual clarification[^\n]*direct contextual question/i,
    /without mandatory labels or letters/i, /optional aids/i], 'clarification', 'allow direct simple clarification');
  requireMaterialQuestion(clarification, 'clarification');
  const questionConsumers = {
    core: section(source.core, '## Continue phase work and resolve unknowns'),
    discovery: section(source.discovery, '## Discover the objective adaptively'),
    researchAgent: coordinatorBody(source.researchAgent, 'Research'),
    planAgent: coordinatorBody(source.planAgent, 'Plan'),
    implementAgent: coordinatorBody(source.implementAgent, 'Implement'),
    reviewAgent: coordinatorBody(source.reviewAgent, 'Review'),
    policy: section(source.policy, '## Lifecycle authority and transitions'),
    instruction: section(source.instruction, '## Shared workflow and effect contract')
  };
  for (const [owner, text] of Object.entries(questionConsumers)) requireMaterialQuestion(text, owner);
  const discovery = owned(source.discovery, '## Read back, correct and stop', 'discovery');
  requireOutput(discovery, [/actual acknowledgment|readback is acknowledged/i,
    /end the turn/i, /Do not emit a readback and start dependent investigation/i,
    /Silence and passive non-response are not confirmation/i], 'discovery', 'retain actual acknowledgment and waiting');
  const intent = owned(source.research, '## Intent and discovery', 'research');
  requireOutput(intent, [/Actual direction and conditions/i, /qualified or nonrecommended selections and their conditions/i,
    /not a running discovery\/Q&A history/i, /actual engineer acknowledgment/i,
    /scope\/timing/i, /never label provisional understanding confirmed/i], 'research', 'current substance is not a discovery history');
  const rubric = owned(source.assurance, '## Conversation evidence rubric', 'assurance');
  requireOutput(rubric, [/Simple factual clarification may be direct without mandatory labels or letters/i,
    /qualified or nonrecommended direction and conditions/i,
    /recorded claim, not an observed conversation/i], 'assurance', 'assess proportionate questions and observed evidence');
  requireMaterialQuestion(rubric, 'assurance');
  const reportScopes = {};
  for (const owner of ['planReport', 'implementationReport', 'reviewReport']) {
    const opening = source[owner].split(/^## /m)[0];
    const introductions = opening.split(/\n\s*\n/).filter((part) => part.startsWith('Use prospectively;'));
    if (introductions.length !== 1) fail(`${owner}: missing or ambiguous report introduction`, 'RPIR-OUTPUT-001');
    requireOutput(introductions[0], [/shared reader-facing rule/i, /[Ll]ink inspected/i,
      /(?:rather than retell|not a retelling|not an implementation retelling)/i,
      /Omit irrelevant fields\/headings and repeated empty entries/i,
      /[Rr]equired actions/i], owner, 'retain phase-owned linked reporting');
    if (owner !== 'planReport') {
      const validation = owned(source[owner], '## Validation', owner);
      requireOutput(validation, [/required failed, unavailable (?:or|and) not-run checks/i,
        /actual outcomes|actual state/i, /consequence/i,
        /static passes do not prove live behavior|Do not treat static passes as runtime evidence/i],
      owner, 'retain required validation outcomes without empty categories');
    }
    // Exclude metadata and appended history; these are the actual schema owners.
    reportScopes[owner] = introductions[0] + '\n' + (owner === 'planReport'
      ? owned(source[owner], '## Outcome and boundaries', owner) + owned(source[owner], '## Planned work', owner)
      : owned(source[owner], owner === 'implementationReport' ? '## Delivered outcome and progress' : '## Disposition and comparison', owner) +
        section(source[owner], '## Validation') + section(source[owner], '## Execution and review evidence') + section(source[owner], '## Findings'));
  }
  const scopes = { ...questionConsumers, core: outputs + questionConsumers.core, questions,
    clarification, discovery: discovery + questionConsumers.discovery, research: intent,
    assurance: rubric, ...reportScopes };
  for (const [owner, text] of Object.entries(scopes)) {
    if (/Every question must use four labels|All questions require lettered paths|Material choices may omit lettered alternatives|Material-choice formatting is optional|Continue without the actual answer|Require a letter-only answer|A running discovery history is required|Acknowledgment may be assumed|An answer approves the next phase|Always substitute the recommendation|Required failures may be omitted|Invocation proves persisted acceptance|Final markers prove timely handling|A real denial may be bypassed|Unresolved findings may be accepted|Decision conditions may be omitted/i.test(text)) {
      fail(`${owner}: contradictory output or authority rule`, 'RPIR-OUTPUT-001');
    }
  }
  return true;
}

function checkCustomizationContracts(inventory) {
  const artifacts = classes.flatMap((definition) => definition.kind === 'skill'
    ? inventory[definition.name]
    : inventory[definition.name]);
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
  const nativeModelSkill = readText('.github/skills/agent-model-selection/SKILL.md');
  const skillNames = new Set(inventory.chatSkills.map((relative) => parsedByPath.get(relative).values.name));
  const nativeAgentNames = new Set(agentPaths.map((relative) => parsedByPath.get(relative).values.name));
  checkNativeSupportMetadata(readManifest(), JSON.parse(readText('package-lock.json')));
  checkNativeModelObservationContract(nativeModelSkill, nativeProfile);
  for (const relative of agentPaths) {
    checkNativeAgentContract(relative, parsedByPath.get(relative), nativeAgentNames, skillNames, nativeProfile);
  }
  const profiles = checkModelProfileCoverage(readText('.github/skills/agent-model-selection/references/role-profiles.md'), agentPaths);
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
  checkIncrementalRpirContract();
  checkModelAuthoringContract();
  checkModelEffortContract();
  checkConciseRpirContract();
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
  checkNativeAgentContract, checkNativeSupportMetadata, checkNativeModelObservationContract,
  checkPhysicalRecordContract, checkLifecycleCandidatePatterns,
  checkDecisionReadinessContract, checkImplementSignoffContract,
  checkConciseRpirContract,
  checkCustomizationContracts, checkArchitectureDecisionRecordContract, checkIncrementalRpirContract, checkModelAuthoringContract, checkModelEffortContract, checkModelProfileCoverage, checkModelProjection,
  parseFrontmatterText, parseHandoffs, parseStringList
};