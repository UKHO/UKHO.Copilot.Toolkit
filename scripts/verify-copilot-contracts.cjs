'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { classes, discover, inspectPath, normalize, root, skillPayloadRoots } = require('./discover-copilot-artifacts.cjs');

const coordinatorTools = {
  Research: ['read', 'search', 'web', 'edit', 'agent'],
  Plan: ['read', 'search', 'edit', 'agent'],
  Implement: ['read', 'search', 'edit', 'agent', 'runInTerminal'],
  Review: ['read', 'search', 'edit', 'agent']
};
const promptRoutes = { plan: 'Plan', implement: 'Implement', review: 'Review', 'remediate-review': 'Implement' };
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
  const blocks = [];
  let current;
  let itemIndent;
  const fields = ['label', 'agent', 'prompt', 'send'];
  for (const line of blockLines) {
    if (!line.trim()) continue;
    const item = line.match(/^( +)- ([A-Za-z][A-Za-z0-9-]*): *(.*)$/);
    let key;
    let value;
    if (item) {
      if (itemIndent === undefined) itemIndent = item[1].length;
      if (item[1].length !== itemIndent) fail(`${relative} has unsupported handoff sequence indentation`);
      current = Object.create(null);
      blocks.push(current);
      [, , key, value] = item;
    } else {
      const field = line.match(/^( +)([A-Za-z][A-Za-z0-9-]*): *(.*)$/);
      if (!field || !current || field[1].length !== itemIndent + 2) {
        fail(`${relative} has unsupported handoff property indentation or nesting`);
      }
      [, , key, value] = field;
    }
    if (!fields.includes(key)) fail(`${relative} has unsupported handoff field: ${key}`);
    if (Object.hasOwn(current, key)) fail(`${relative} has duplicate handoff field: ${key}`);
    current[key] = key === 'send' ? value.trim() : parseTextScalar(value.trim(), relative, `handoff ${key}`);
  }
  if (blocks.length !== expectedTargets.length) fail(`${relative} must declare only its stage handoffs`);
  const targets = blocks.map((block) => {
    if (!fields.every((field) => typeof block[field] === 'string' && block[field].trim())) {
      fail(`${relative} has an incomplete handoff declaration`);
    }
    if (block.send !== 'false') fail(`${relative} handoff to ${block.agent} must use send: false`);
    if (!agentNames.has(block.agent)) fail(`${relative} handoff target is not a contributed agent: ${block.agent}`);
    return block.agent;
  });
  if (!equal(targets, expectedTargets)) fail(`${relative} must declare stage handoffs to ${expectedTargets.join(' and ')}`);
}

function checkPromptMetadata(relative, values, agentNames) {
  const name = path.basename(relative, '.prompt.md');
  if (!agentNames.has(values.agent) || values.agent !== promptRoutes[name] || values.name !== name) {
    fail(`${relative} must declare its valid name and RPIR stage route`, 'STRUCT-PROMPT-001');
  }
  if (Object.hasOwn(values, 'tools')) {
    const allowed = coordinatorTools[values.agent];
    if (!allowed || parseStringList(values.tools, relative, 'tools').some((tool) => !allowed.includes(tool))) {
      fail(`${relative} tools must not expand ${values.agent} capabilities`);
    }
  }
}

function checkAgentMetadata(relative, values, blocks, agentNames) {
  const name = values.name;
  if (!manualHandoffCoordinators.has(name) && name !== 'Script Runner' && !Object.hasOwn(workerTools, name)) {
    fail(`${relative} has an unrecognized agent role: ${name}; declare its tool and invocation boundary in the checker`);
  }
  if (!manualHandoffCoordinators.has(name) && (Object.hasOwn(values, 'agents') || Object.hasOwn(values, 'handoffs'))) {
    fail(`${relative} non-coordinator must not declare delegation or handoffs`);
  }
  if (manualHandoffCoordinators.has(name)) {
    if (!Object.hasOwn(values, 'tools') || !equal(parseStringList(values.tools, relative, 'tools'), coordinatorTools[name])) {
      fail(`${relative} coordinator tools differ from its declared role boundary`);
    }
    const delegates = parseStringList(values.agents, relative, 'agents');
    if (!equal(delegates, delegateRoutes[name]) || delegates.some((delegate) => !agentNames.has(delegate))) {
      fail(`${relative} delegates differ from its declared role boundary`);
    }
    if (!Object.hasOwn(values, 'handoffs')) fail(`${relative} must declare manual stage handoffs`);
    parseHandoffs(relative, blocks.handoffs, handoffRoutes[name], agentNames);
  }
  if (name === 'Script Runner' && (values['user-invocable'] !== 'false' || Object.hasOwn(values, 'agents') ||
      !equal(parseStringList(values.tools, relative, 'tools'), ['read', 'search', 'runInTerminal']))) {
    fail(`${relative} must remain non-invocable, non-delegating and non-file-authoring with its existing exact tools; bounded Git metadata effects are governed separately`);
  }
  if (Object.hasOwn(workerTools, name) && (values['user-invocable'] !== 'false' ||
      !equal(parseStringList(values.tools, relative, 'tools'), workerTools[name]))) {
    fail(`${relative} worker tools or invocation metadata differ from its declared role boundary`);
  }
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
  return (text.split(`\n# ${role} coordinator\n`)[1] || '').split(/^#{1,2} /m)[0];
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

function checkCompleteArchitectureCoverage(source) {
  const owners = {
    skill: section(source.skill, '## Purpose and consumers'),
    coverage: source.coverage.split('\n| Sample input')[0],
    research: paragraph(coordinatorBody(source.research, 'Research'), 'Explicitly identify architectural choices'),
    researchSkill: section(source.researchSkill, '## Procedure'),
    researchTemplate: section(source.researchTemplate, '### ADR inputs and remaining gaps'),
    plan: paragraph(coordinatorBody(source.plan, 'Plan'), 'Reconcile '),
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

function checkArchitectureDecisionRecordContract(sources = {}) {
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
    planning: '.github/skills/architecture-planning/SKILL.md',
    planTemplate: '.github/skills/architecture-planning/implementation-plan-template.md',
    safe: '.github/skills/safe-implementation/SKILL.md',
    validation: '.github/skills/safe-implementation/validation-checklist.md',
    implementationReport: '.github/skills/safe-implementation/implementation-report-template.md',
    codeReview: '.github/skills/code-review/SKILL.md',
    reviewReport: '.github/skills/code-review/review-report-template.md',
    assuranceSkill: '.github/skills/rpir-stage-assurance/SKILL.md',
    assurance: '.github/skills/rpir-stage-assurance/stage-assurance-checklist.md',
    readme: 'README.md', wikiRpir: 'docs/Wiki/rpir.md',
    wikiEvidence: 'docs/Wiki/lifecycle-evidence-and-authority.md',
    wikiCatalogue: 'docs/Wiki/artifact-catalogue.md'
  };
  const source = Object.fromEntries(Object.entries(paths).map(([key, relative]) => [key, sources[key] ?? readText(relative)]));
  const metadata = parseFrontmatterText(source.skill, paths.skill).values;
  if (metadata.name !== 'architecture-decision-records' || metadata['user-invocable'] !== 'false') {
    fail('ADR Skill must use its directory name and remain non-invocable', 'ADR-CONTRACT-001');
  }
  for (const resource of ['references/research-input-coverage.md', 'templates/adr.md']) {
    if (!source.skill.includes(`](${resource})`)) fail(`ADR Skill must directly link ${resource}`, 'ADR-CONTRACT-001');
  }
  const adrEffects = section(source.skill, '## Authority and effect safeguards');
  requireADRRule(adrEffects, [/Preserve accepted and superseded substantive history\./i],
    'ADR skill must preserve accepted history');
  requireADRRule(adrEffects, [
    /Check each ADR file effect separately for identity, containment, absence\/collision, effective permission, saved result, and readback\./i
  ], 'ADR skill must guard each file effect separately');
  requireADRRule(source.skill, [
    /Research[\s\S]*Plan[\s\S]*Implement[\s\S]*Review/i,
    /not a fifth RPIR phase|not an authority grant/i,
    /only a Proposed ADR directly associated with its active planning objective/i,
    /explicitly engineer-selected, verified contained destination/i,
    /Do not recursively create unselected ancestors/i,
    /absence\/collision[\s\S]*effective permission[\s\S]*readback/i
  ], 'ADR Skill is missing phase, ownership, or effect safeguards');

  checkCompleteArchitectureCoverage(source);

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
  const planADR = coordinatorBody(source.plan, 'Plan').split(/\n\s*\n/)
    .find((paragraph) => paragraph.includes(adrSkillLink)) || '';
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
    /inspect[^.\n]*exact[^.\n]*path\/ID[^.\n]*substantive (?:version|snapshot)/i
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
  requireADRRule(source.review, [
    /independently compare actual delivery\/evidence and governance claims/i,
    /clean Review does not establish enterprise or architectural approval/i,
    /Review remains source-read-only/i
  ], 'Review guidance conflates delivery acceptance or grants ADR authorship');
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
  const loop = text.split('\n').find((line) => line.startsWith(start))?.split('. ')[0] || '';
  requireExecutionRule(loop, [new RegExp([
    'inspect[^→]+→', '(?:make|perform)[^→]+→', 'determine newly supported Step/Task outcomes[^→]+→',
    'inspect the actual Plan preimage[^→]*→', markerRule, '→ handle checkpoint disposition → select the next unit'
  ].join('\\s*'), 'i')], diagnostic);
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
    readme: 'README.md', wikiRpir: 'docs/Wiki/rpir.md', wikiEvidence: 'docs/Wiki/lifecycle-evidence-and-authority.md'
  };
  const source = Object.fromEntries(Object.entries(paths).map(([key, relative]) => [key, sources[key] ?? readText(relative)]));

  const commandEntry = source.repository.match(/^- \*\*Goal-directed Script Runner:\*\*[^\n]*/m)?.[0] || '';
  requireExecutionRule(commandEntry, [/or an explicit bounded phase-record grant/i,
    /not duplicate approval for unchanged Plan-covered effects/i, /same runtime safeguards/i],
  'Repository command entry must preserve separately bounded phase-record checkpoints');

  const policyCheckpoint = source.repository.match(/^- \*\*Conditional local Git checkpoints:\*\*[^\n]*/m)?.[0] || '';
  requireExecutionRule(policyCheckpoint, [
    /explicit approval of an inspected Plan/i, /bounded local staging\/append-only commit strategy/i,
    /after `\/implement`/i, /No separate grant exchange is required/i,
    /current loaded session cannot self-upgrade/i, /effective permission/i
  ], 'Repository policy must bind covered Git authority to Plan approval, phase transition and current-session limits');

  const coreCheckpoint = between(source.core, '## Conditional local Git checkpoints', '\n## Preserve physical lineage');
  requireExecutionRule(coreCheckpoint, [
    /explicit approval of an inspected Plan/i, /no separate grant exchange is required/i,
    /after `\/implement`/i, /silent, prohibiting or unapproved-option Plan/i,
    /editing these rules does not self-upgrade/i, /staged-snapshot validation/i, /effective permission/i
  ], 'Lifecycle core checkpoint authority lacks Plan binding, phase, negative or runtime safeguards');

  const checklistAuthorization = between(source.checklist, '## 3. Bind authorization to the approved Plan', '\n## 4. Inspect and preserve the candidate');
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
    /do not demand an approved implementation Plan or `\/implement` evidence/i,
    /same repository\/worktree\/branch, content\/exclusions, Runner ownership, validation, local-policy\/helper\/permission, validity and revocation safeguards/i,
    /not a duplicate grant for unchanged Plan-covered effects/i,
    /both routes retain the same literal-candidate and runtime checks/i
  ], 'Checkpoint checklist must retain separately bounded phase-record authority with the same safeguards');

  const checklistCadence = between(source.checklist, '## 2. Apply local policy and determine eligible content', '\n## 3. Bind authorization');
  requireExecutionRule(checklistCadence, [
    /after each completed Work Item before unrelated items/i, /earlier coherent, validated Task boundaries/i,
    /explain justified combinations, deferrals, or no-commit outcomes/i,
    /Do not split by file type, elapsed time, line count or checkbox/i,
    /invent a numerical threshold/i
  ], 'Checkpoint checklist must state normal Work Item cadence and bounded earlier Task consideration');

  const planGuidance = between(source.planning, 'Specify the approved outcome', '\n## Limits');
  requireExecutionRule(planGuidance, [
    /bounded local staging\/append-only commit strategy/i,
    /Approval of that inspected Plan includes its covered commits after `\/implement`/i,
    /without a separate grant exchange/i,
    /Normal cadence is a checkpoint after each completed eligible coherent Work Item/i,
    /proactive consideration of earlier coherent validated Task boundaries/i,
    /Silent, prohibited or unapproved-option Plans do not authorize Git/i
  ], 'Planning guidance must require explicit bounded strategy and normal cadence without duplicate approval');

  requireExecutionRule(source.planTemplate, [
    /Local Git checkpoint strategy, when intended/i, /repository\/worktree\/branch selection rule/i,
    /Script Runner ownership/i, /Explicit approval of this inspected Plan authorizes only its covered commits after `\/implement`/i,
    /no separate grant exchange is needed/i, /after each completed Work Item/i,
    /earlier coherent validated Tasks/i, /Plan publication cannot authorize its own checkpoint or earlier Research effects/i
  ], 'Plan template must capture bounded authorization fields, cadence and phase limits');

  // Only the normative opening body, never frontmatter or a historical section.
  const runner = (source.runner.split('\n# Script Runner\n')[1] || '').split(/^## /m)[0];
  const runnerAuthority = runner.split('\n\n').filter((paragraph) => paragraph.trim()).slice(0, 2).join('\n\n');
  requireExecutionRule(runnerAuthority, [
    /inspected approved Plan\/version/i, /explicit bounded commit strategy with approval and `\/implement` evidence/i,
    /literal candidate/i, /no duplicate grant is required/i, /silent\/prohibiting Plan/i,
    /source\/configuration\/customization-read-only/i, /source-mutating hook or helper/i
  ], 'Script Runner summary must consume Plan authority without expanding tools or effects');
  requireExecutionRule(runnerAuthority, [
    /explicit bounded phase-record grant/i,
    /without requiring an approved implementation Plan or `\/implement` evidence/i,
    /both routes retain identical candidate, ownership, validation, helper and permission safeguards/i
  ], 'Script Runner must retain separately bounded phase-record authority with the same safeguards');
  rejectDuplicateGrant(runner, 'Script Runner authority');
  const researchCheckpoint = coordinatorBody(source.researchAgent, 'Research')
    .match(/(?:^|[.!?]\s+)(Script Runner\b[^\n]*?\.(?=\s|$))/i)?.[1] || '';
  requireExecutionRule(researchCheckpoint, [
    /separately (?:granted|authorized) local Git index\/history checkpoint/i,
    /eligible Research brief (?:after|following) physical save\/readback/i
  ], 'Research must retain its separately authorized saved-brief checkpoint route');

  const implement = source.implementAgent.match(/^Own the permitted direct edit[^\n]*/m)?.[0] || '';
  requireExecutionRule(implement, [
    /inspected approved Plan explicitly includes a bounded strategy/i,
    /approval supplies authority for covered commits after `\/implement` without a second grant/i,
    /literal candidate/i, /candidate-relevant validation/i,
    /Silent\/prohibiting Plans, unapproved options, revocation, or material drift do not authorize effects/i,
    /effective permission/i
  ], 'Implement authority summary must bind covered commits and retain runtime candidate checks');

  const reviewAgentCheckpoint = source.reviewAgent.match(/^Review and its Correctness[^\n]*/m)?.[0] || '';
  requireExecutionRule(reviewAgentCheckpoint, [
    /applicable approved Plan explicitly covers that record and phase/i,
    /after physical save\/readback/i,
    /Plan authority does not authorize its own or earlier Research checkpoints/i,
    /candidate state, helpers and permission/i
  ], 'Review checkpoint summary must accept covered Plan authority without expanding Review effects');
  requireExecutionRule(reviewAgentCheckpoint, [/other valid bounded authorization applies/i],
    'Review must retain its separately bounded record-checkpoint route');

  const progress = between(source.safe, '### Incremental Plan progress', '\n## Limits');
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
  const selectiveRecovery = progress.match(/^- On resume,[^\n]*/m)?.[0] || '';
  requireExecutionRule(selectiveRecovery, [
    /reopen only (?:the invalidated|disproved) markers and dependent parent markers whose completion is no longer supported/i,
    /preserve unaffected completed work/i, /record the evidence\/reason/i
  ], 'Safe implementation recovery must selectively reopen disproved completion and preserve unaffected work');

  const implementationCapabilities = between(source.validationChecklist, '## Capabilities and effects', '\n## Evidence, records and independent review');
  requireExecutionRule(implementationCapabilities, [
    /Plan-covered Git-metadata effects/i,
    /verify the inspected approved Plan explicitly covers the bounded effect and phase/i,
    /bind validation to the complete candidate/i,
    /Only Script Runner performs the Git mutation/i
  ], 'Implementation checklist must use Plan-covered authority while retaining candidate and executor safeguards');
  rejectDuplicateGrant(implementationCapabilities, 'Implementation checklist capabilities');

  const implementLoop = source.implementAgent.match(/^The prominent execution loop is:[^\n]*/m)?.[0] || '';
  requireExecutionRule(implementLoop, [
    /determine newly supported Step\/Task outcomes/i, /inspect the actual Plan preimage/i,
    /save eligible existing markers only and read back\/verify preservation/i,
    /handle checkpoint disposition/i, /select the next unit/i,
    /before unrelated later work/i, /disclose affected IDs promptly as unsaved tracking/i
  ], 'Implement summary must preserve the ordered completion/save/checkpoint loop');
  requireOrderedLoop(implementLoop, 'The prominent execution loop is:',
    'save eligible existing markers only and read back/verify preservation\\s*',
    'Implement summary must preserve the ordered completion/save/checkpoint loop');

  const markerReportField = source.implementationReport.match(/^- \*\*Plan marker tracking:\*\*[^\n]*/m)?.[0] || '';
  requireExecutionRule(markerReportField, [
    /completion-to-save\/readback before unrelated later work/i, /observed late reconciliation/i,
    /unverified timing/i, /denied\/failed\/conflicting\/unverified saves as unsaved tracking/i,
  ], 'Implementation report marker field must distinguish completion timing and unsaved tracking');
  const implementationCheckpointField = source.implementationReport.match(/^- \*\*Local Git checkpoint, if relevant:\*\*[^\n]*/m)?.[0] || '';
  requireExecutionRule(implementationCheckpointField, [
    /expected Work Item and earlier coherent Task opportunities/i, /even when no commit occurred/i,
    /missing commit is not by itself a technical delivery defect/i
  ], 'Implementation report checkpoint field must assess opportunities and no-commit paths');

  const reviewCheckpointField = source.reviewTemplate.match(/^- \*\*Implementation range and checkpoint evidence:\*\*[^\n]*/m)?.[0] || '';
  requireExecutionRule(reviewCheckpointField, [
    /inspected Plan strategy\/approval reference/i,
    /expected completed-Work-Item and earlier coherent-Task opportunities/i,
    /including no-commit dispositions|including no-commit paths|even when no commit occurred/i,
    /timely completion-to-save\/readback/i, /observed late\/omitted action/i,
    /unverified timing/i, /silence and final markers do not prove chronology/i,
    /missing commit alone is not defective code/i
  ], 'Review template must assess available chronology and no-commit paths without overclaim');

  const assuranceImplement = source.assurance.match(/^- \*\*Implement:\*\*[^\n]*/m)?.[0] || '';
  requireExecutionRule(assuranceImplement, [
    /completion-to-save\/readback before unrelated later work/i, /observed timely action/i,
    /observed late\/omitted backfill/i, /unverified timing/i,
    /expected checkpoint opportunities/i, /no silence-based pass or commit-count gate/i
  ], 'Stage assurance must distinguish observed timing, unknown evidence and checkpoint exceptions');

  const readmeCheckpointSection = between(source.readme, '### Optional local Git checkpoints', '\nPlan, Implement and Review retain contextual material clarification');
  requireExecutionRule(readmeCheckpointSection, [
    /approving that inspected Plan approves its covered commits after `\/implement`/i,
    /no separate grant exchange is needed/i, /after each completed Work Item/i,
    /earlier coherent validated Task boundaries/i
  ], 'README checkpoint section must explain Plan-approved authority and normal cadence');
  const readmeProgress = source.readme.match(/^During implementation,[^\n]*/m)?.[0] || '';
  requireExecutionRule(readmeProgress, [
    /before moving to unrelated work/i, /affected IDs are disclosed as unsaved/i,
    /a final checked state is not proof of when it was saved/i
  ], 'README progress guidance must explain timely persistence and honest recovery');

  const wikiRpirCheckpoint = between(source.wikiRpir, '## Optional local Git checkpoints', '\n## Canonical references');
  const wikiEvidenceCheckpoint = between(source.wikiEvidence, '### Optional local Git checkpoints', '\n## Canonical references');
  for (const [label, text] of [['RPIR Wiki', wikiRpirCheckpoint], ['lifecycle evidence Wiki', wikiEvidenceCheckpoint]]) {
    requireExecutionRule(text, [
      /after each completed Work Item/i, /earlier coherent validated Task/i,
      /When a Plan includes local commits|(?:explicitly includes a bounded|Plan that states a bounded) local staging\/append-only(?: commit)? strategy/i,
      /no (?:duplicate grant|separate grant exchange)/i, /literal candidate/i, /effective permission/i
    ], `${label} must align user guidance with the canonical checkpoint strategy and cadence`);
  }
  const wikiRpirProgress = source.wikiRpir.match(/^The Implement coordinator's main loop[^\n]*/m)?.[0] || '';
  requireExecutionRule(wikiRpirProgress, [
    /before moving to unrelated work/i, /persists only eligible existing markers/i,
    /disclose affected IDs(?: promptly)? as unsaved tracking/i, /parent-only failure or pause retains supported children/i
  ], 'RPIR Wiki progress summary must preserve completion-boundary tracking and recovery');
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
  const agentNames = new Set(agentPaths.map((relative) => parsedByPath.get(relative).values.name));
  const promptPaths = inventory.chatPromptFiles;
  for (const relative of promptPaths) {
    checkPromptMetadata(relative, parsedByPath.get(relative).values, agentNames);
  }

  for (const relative of agentPaths) {
    const { values, blocks } = parsedByPath.get(relative);
    checkAgentMetadata(relative, values, blocks, agentNames);
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
  checkCustomizationContracts, checkArchitectureDecisionRecordContract, checkIncrementalRpirContract,
  parseFrontmatterText, parseHandoffs, parseStringList
};