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

// Finite Markdown/text evidence, not a Markdown implementation or a semantic
// policy engine. Only Research assertions use this view; unrelated checks retain
// their existing contracts. Remove non-operating material BEFORE finding owners,
// so a quoted heading cannot create an owner and a same-section quote cannot
// rescue a deleted obligation. An illustrative subsection ends at its peer.
function activeResearchText(relative) {
  const text = readText(relative).replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/<!--[\s\S]*?(?:-->|$)/g, '');
  let fence, illustration;
  return text.split('\n').map((line) => {
    if (/^\s*>/.test(line)) return '';
    const delimiter = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (delimiter && delimiter[1][0] === fence[0] && delimiter[1].length >= fence.length) fence = null;
      return '';
    }
    if (delimiter) { fence = delimiter[1]; return ''; }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      if (illustration && heading[1].length <= illustration) illustration = null;
      if (/\b(?:illustrat\w*|examples?|anti-examples?|historical|quotations?)\b/i.test(heading[2])) illustration = heading[1].length;
    }
    if (illustration || /^\s*(?:historical quotation|quotation|labelled anti-example|negative illustration|positive illustration):/i.test(line) || /^\s*[“"].*[”"]\s*$/.test(line)) return '';
    return line;
  }).join('\n');
}

// Explicitly supported vocabulary alternatives. These are deliberately finite;
// accepting these paraphrases does not claim arbitrary semantic equivalence.
function researchWording(text) {
  return text.toLowerCase().replace(/\*\*/g, '').replace(/acknowledgement/g, 'acknowledgment')
    .replace(/\borientate\b/g, 'orient').replace(/\bprior to\b/g, 'before')
    .replace(/\bas well as\b/g, 'and').replace(/\breturns to dialogue\b/g, 'return to dialogue')
    .replace(/\bgenuine\b/g, 'meaningful').replace(/\buseful\b/g, 'meaningful')
    .replace(/\bparticular\b/g, 'specific').replace(/\bdeclare\b/g, 'state')
    .replace(/\bfinish the turn\b/g, 'end the turn').replace(/\bretain\b/g, 'preserve')
    .replace(/\bshall\b/g, 'must').replace(/\bbriefly test\b/g, 'probe briefly')
    .replace(/\bfocused test\b/g, 'focused probe').replace(/\bconsequential\b/g, 'material')
    .replace(/\bintended outcome\b/g, 'desired outcome').replace(/\bkey assumptions\b/g, 'material assumptions')
    .replace(/\breason for the request\b/g, 'motivation').replace(/\bpeople affected\b/g, 'affected people')
    .replace(/\ba specific example from today\b/g, 'a concrete current example')
    .replace(/\bout-of-scope work\b/g, 'exclusions').replace(/\brelative importance\b/g, 'priorities')
    .replace(/\bsettled or explicitly retained\b/g, 'resolved or explicitly carried')
    .replace(/\bconfirmed or corrected and reconciled\b/g, 'acknowledged and reconciled')
    .replace(/\s+/g, ' ').trim();
}

// Scan ALL active clauses in each applicable owner, not just the affirmative
// paragraph. Patterns name supported bad permissions, not bare topic keywords;
// lawful deferral, other-phase work and discovery-direction advice remain valid.
const researchContradictions = [
  /(?:clear|detailed|apparently factual|solution-led) (?:research )?(?:requests?|prompts?) (?:need|needs|require|requires) no (?:discovery|confirmation|acknowledgment|readback)/i,
  /(?:clear|detailed|apparently factual|solution-led) (?:research )?(?:requests?|prompts?) (?:may |can )?(?:skip|bypass|proceeds? without) (?:the |an? |explicit |compulsory )*(?:discovery|confirmation|acknowledgment|readback)/i,
  /(?:research |questions? |all research questions? )?(?:may|can|should|must) (?:omit|skip) (?:the )?(?:known|uncertain|question|supported recommendation|explicit labels|question framing)/i,
  /(?:known|uncertain|question|recommendation|explicit|question framing)[^.!?\n]{0,70}(?:labels?|fields?|framing) (?:are|is) optional (?:in|for) research/i,
  /(?:letters|lettered (?:choices|options|alternatives)) (?:are optional in research|(?:are offered|are required|should be offered|may wait) only (?:after|on|for) (?:a |an engineer )?reminder)/i,
  /(?:research|every research question) (?:must|should) (?:require|use|offer) exactly (?:three|3) (?:choices|options|alternatives)/i,
  /(?:research|engineers?) (?:must|should) (?:require|give|use) (?:only letter answers|letter-only answers)/i,
  /research (?:may|can|must|should) (?:invent alternatives|fabricate recommendations|recommend without evidence|automatically select the recommended (?:letter|option))/i,
  /(?:all|every) research questions? (?:may|can|must|should) (?:be open-only|omit alternatives)/i,
  /(?:lookup|lookups|research lookups) (?:may|can|should) (?:omit|skip) (?:the )?(?:uncertainty|next-question purpose|source\/search bound|return to dialogue)/i,
  /(?:research|lookups) (?:may|can|should) (?:continue searching|widen the search) (?:after|when) (?:the )?(?:bound is reached|uncertainty is answered)/i,
  /(?:research|investigators?) (?:may|can|should|must) (?:perform broad factual(?:\/solution)? search|delegate investigation|compare implementations|recommend substantive solutions|continue independent factual checks|investigate broadly) before (?:actual )?(?:acknowledgment|readback)/i,
  /(?:research|the coordinator) (?:may|can|should|must) (?:continue|investigate|delegate|proceed) (?:in the same unanswered turn|while (?:a |the )?(?:material answer|readback|acknowledgment) is pending)/i,
  /(?:emitting|sending|a sent) (?:a )?readback (?:is|counts as|establishes) acknowledgment/i,
  /(?:silence|uncertainty|prompt clarity|generic [“"]?keep going[”"]? pressure|deferral) (?:is|counts as|establishes) (?:confirmation|acknowledgment|deferral)/i,
  /research (?:may|can|should) (?:omit the hypothesis label|skip the (?:brief |focused )?probe|replace the objective silently|explore an alternative before the engineer chooses)/i,
  /(?:a |the )?probe answer (?:is|counts as) (?:an? )?direction (?:choice|change)/i,
  /research (?:must|should) (?:ask|complete) (?:exactly |at least )?(?:three|five|\d+) (?:questions|rounds)/i,
  /research (?:must|should) (?:restart (?:discovery|the interview) on (?:every )?continuation|reject natural-language acknowledgment|force certainty|resist explicit deferral|require duplicate confirmation after deferral)/i,
  /(?:plan|implement|review|other phases)(?:,? (?:plan|implement|and review))* (?:must|should|inherit|require) (?:follow |use |complete )?(?:research's |the |an? )?(?:initial[- ]discovery process|initial interview|research interview)/i,
  /(?<!nor )(?:acknowledgment|deferred acknowledgment|deferral) (?:is (?:a )?prerequisite for|blocks|gates|approves|invokes) `?\/(?:plan|implement|review)`?/i,
  /(?:the brief|research|assurance) (?:may|can|should) (?:omit|skip) (?:consequential choices|actual engineer direction|alternative-framing disposition|actual acknowledgment|deferral scope\/timing|dependent limits|observed evidence)/i,
  /(?:a |the )?brief claiming compliance (?:proves|establishes) (?:actual waiting|runtime behavior|loading)/i,
  /(?:assurance|research) (?:may|can|should) (?:report unobserved behavior as passed|reject provisional briefs solely for deferral|suppress persistence for unresolved questions)/i,
  /(?:static checks|authored expectations) (?:prove|establish) (?:reliable runtime behavior|installed loading)/i
];

function researchScope(relative, heading) {
  const text = activeResearchText(relative);
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`^(#{1,6}) ${escaped}\\s*\\n`, 'm'));
  if (!match) fail(`${relative} is missing active owning section: ${heading}`);
  const tail = text.slice(match.index + match[0].length);
  const end = tail.search(new RegExp(`^#{1,${match[1].length}} `, 'm'));
  return end < 0 ? tail : tail.slice(0, end);
}

function researchRequirements(relative, heading, requirements, start) {
  let scope = researchScope(relative, heading);
  if (start) {
    const lines = scope.split('\n').filter((line) => line.startsWith(start));
    if (lines.length !== 1) return false;
    scope = lines[0];
  }
  const normalized = researchWording(scope);
  for (const requirement of requirements) {
    if (!(typeof requirement === 'string' ? normalized.includes(researchWording(requirement)) : requirement.test(normalized))) {
      fail(`${relative} (${heading}) lacks active obligation: ${requirement}`);
    }
  }
  return true;
}

function researchChecks() {
  const agent = '.github/agents/research.agent.md';
  const skill = '.github/skills/agent-question-resolution/SKILL.md';
  const template = '.github/skills/agent-question-resolution/templates/clarification-message.md';
  const method = '.github/skills/agent-question-resolution/references/research-intent-discovery.md';
  const policy = '.github/copilot-instructions.md';
  const core = '.github/skills/rpir-lifecycle-core/SKILL.md';
  const records = '.github/instructions/lifecycle-records.instructions.md';
  const brief = '.github/skills/codebase-research/research-brief-template.md';
  const assurance = '.github/skills/rpir-stage-assurance/stage-assurance-checklist.md';
  const wiki = 'docs/Wiki/rpir.md', catalogue = 'docs/Wiki/artifact-catalogue.md';
  const sequence = 'orient → discover → acknowledged readback → investigate';
  const fields = 'Known → Uncertain → Recommendation (if supported) → Question';
  const boundary = ['operating/context reads and supplied examples', 'uncertainty', 'next-question purpose', 'source/search', 'return to dialogue'];
  const bypass = ['broad factual/solution search', 'delegated investigation', 'implementation comparison', 'substantive solution recommendation'];
  const dimensions = ['motivation', 'affected people', 'a concrete current example', 'desired outcome', 'exclusions', 'priorities', 'consequential constraints'];
  const rows = [
    ['RESEARCH-INTENT-001', agent, [agent], () =>
      researchRequirements(agent, 'Research coordinator', [sequence, 'substantively elicit, challenge and broaden', 'detailed, apparently factual and solution-led requests',
        /before every engineer-facing question[^;\n]*(?:load and apply|read and use) \[agent-question-resolution\]\([^)]*\) and its \[clarification message template\]/i,
        'Research intent-discovery method', 'Obtain actual confirm/correct acknowledgment', 'separates engineer statements from inference',
        'Accept natural-language acknowledgment', 'explicitly directs Research to defer discovery or acknowledgment', 'disclosed provisional objective and consequential assumptions',
        'Do not resist, demand duplicate confirmation', 'silence, uncertainty, clarity or generic “keep going” pressure', 'requested timing',
        'state the specific uncertainty and next-question purpose', 'bound the source/search', 'stop and return to dialogue when answered or the bound is reached',
        'Do not expand this into broad factual or solution search, delegated investigation, implementation comparison or substantive solution recommendations',
        'Supported advice about discovery direction', 'end the turn and wait', 'emitting a readback is not acknowledgment', 'Eligible truthful Research-note persistence remains allowed',
        'label it as a hypothesis', 'probe briefly', "obtain the engineer's direction choice before deeper exploration", 'without a fixed question or round quota',
        'Each answer updates understanding', 'reuse the intent trace', 'actual acknowledgment/deferral and its scope/timing', 'Plan-owned formal outcome, scope, acceptance and hierarchy',
        'Only after actual acknowledgment or explicit deferral', 'actual deferral direction/scope/timing',
        'For substantive findings after acknowledgment or actual explicit deferral', 'Neither acknowledgment nor deferral is phase approval or a `/plan` gate'])],
    ['QUESTIONS-METHOD-001', skill, [skill, template], () =>
      researchRequirements(skill, 'Trigger', ['Research MUST load and apply this Skill and its clarification message template before every question', "Other phases use contextual material clarification; they do not inherit Research's initial-discovery process"]) &&
      researchRequirements(skill, 'Procedure', [sequence, 'detailed, apparently factual and solution-led requests do not bypass substantive discovery', ...boundary, ...bypass,
        'state the specific uncertainty and next-question purpose before execution', 'bound the source/search', 'stop to return to dialogue when answered or the bound is reached',
        'No broad factual/solution search, delegated investigation, implementation comparison or substantive solution recommendation is permitted at this point',
        'end the turn and wait for a pending material answer or readback acknowledgment', 'eligible truthful Research-note persistence remains allowed',
        'elicit, challenge and broaden answer-dependently', 'obtain actual confirm/correct acknowledgment', 'Emitting it is insufficient',
        'explicitly direct Research to defer discovery or that checkpoint', 'honor the actual scope/timing without duplicate confirmation',
        'Silence, uncertainty, prompt clarity and generic “keep going” pressure are not such a direction', fields,
        'In every Research question, including later clarification, show those labels explicitly and concisely', 'omit only an unsupported Recommendation',
        'offer meaningful lettered alternatives with relevant trade-offs and a supported recommendation without waiting for a reminder',
        'Do not require exactly three choices, letter-only answers, invented alternatives or unsupported advice', "Invite the engineer's own words or qualifications",
        'For a fact/example request with no meaningful alternatives, explain the information needed and invite free text',
        'recommendations may guide discovery direction, not prescribe substantive solutions', 'Other phases retain proportional contextual framing and optional genuine alternatives',
        'use the answer to choose the useful next question', 'retain the intent trace on same-objective continuation', 'Accept natural-language acknowledgment, corrections and “I don\'t know”',
        'labelled hypothesis', 'brief focused probe', 'engineer direction choice before deeper exploration', 'Do not automatically select the recommended letter',
        'Clarification, acknowledgment and deferral do not invoke or approve a phase transition or create a `/plan` gate']) &&
      researchRequirements(skill, 'Outputs', ['Research always uses explicit Known/Uncertain/Question labels and Recommendation when supported', 'actual waiting for acknowledgment', 'deferral scope/timing and dependent unknowns']) &&
      researchRequirements(skill, 'Limits', ['purpose/source/stop boundary', 'Research must end the turn for a pending material answer or readback acknowledgment, absent explicit deferral', 'Generic completion pressure does not override waiting']) &&
      researchRequirements(skill, 'Validation', ['declared uncertainty, next-question purpose, source/search bound and return to dialogue', 'explicit framing', 'without reminders', 'alternative-framing probe and engineer direction choice', 'do not mistake a sent readback for an answered one']) &&
      researchRequirements(template, 'Clarification message template', [fields, 'labels for every question', 'later clarification; omit only an unsupported Recommendation',
        '**Known:**', '**Uncertain:**', '**Recommendation:**', '**Question:**', 'offer meaningful lettered alternatives with relevant trade-offs without waiting for a reminder',
        'as many alternatives as are useful, not exactly three', "engineer's own words, never require a letter", 'Do not invent alternatives or fabricate a recommendation',
        'fact/example request with no meaningful alternatives', 'invite free text without a choices list', 'not a blanket exception for open-question-only discovery',
        'or automatically select the recommended option', sequence, 'detailed, apparently factual or solution-led requests', 'Actually wait for acknowledgment: end the turn',
        'rather than begin dependent investigation after emitting it', 'Accept natural-language acknowledgment, corrections and “I don\'t know”', 'preserve the intent trace on continuation',
        ...boundary, ...bypass, 'state the specific uncertainty and next-question purpose', 'bound the source/search', 'stop and return to dialogue when answered or the bound is reached',
        'No broad factual/solution search, delegated investigation, implementation comparison or substantive solution recommendation is permitted',
        'Only other phases retain general permission to continue independent safe work', 'Plan, Implement and Review retain proportional contextual framing',
        'discovery-direction advice rather than substantive solution advice', 'explicitly directs Research to defer discovery or acknowledgment', 'honor its actual scope/timing without duplicate permission',
        'Silence, uncertainty, clarity and generic “keep going” pressure are not deferral', 'Neither an answer nor deferral grants phase-transition approval'])],
    ['RESEARCH-DISCOVERY-001', method, [method], () => {
      checkLocalLinks(method, readText(method));
      return researchRequirements(method, 'Orient before discovery; investigate after acknowledgment', [sequence, 'Detailed, apparently factual and solution-led requests still need substantive discovery',
        'Only explicit engineer-directed deferral changes this sequence', 'operating/context material and supplied examples', 'before execution, state the uncertainty it addresses',
        'how the answer will shape that question', 'bounded source/search', 'Stop when that uncertainty is answered or the bound is reached and return to dialogue', ...bypass,
        'Do not use broad factual/solution search, delegated investigation, implementation comparison or substantive solution recommendations before acknowledgment',
        'Supported recommendations about which discovery direction to explore are permitted', 'Eligible truthful Research-note persistence']) &&
        researchRequirements(method, 'Discover the objective adaptively', [...dimensions, 'do not ask again for information already supplied'], 'Treat the initial prompt') &&
        researchRequirements(method, 'Discover the objective adaptively', ['Challenge consequential assumptions or contradictions using supplied facts or eligible evidence', 'do not manufacture disagreement', 'Broaden toward overlooked needs or plausible alternative problem framings']) &&
        researchRequirements(method, 'Discover the objective adaptively', ['state what changed in understanding', 'highest-value unresolved follow-up that depends on it', fields, 'framing every time',
          'meaningful lettered options, relevant trade-offs and supported advice without a reminder', 'Invite free text or qualifications', 'not automatically the recommended letter',
          'Do not require exactly three options or invent alternatives/advice', 'fact/example request without meaningful alternatives', 'no fixed question/round quota or canned questionnaire'], 'After each answer') &&
        researchRequirements(method, 'Discover the objective adaptively', ['explicitly label it as a hypothesis', 'brief focused probe', "Obtain the engineer's direction choice before deeper exploration", 'a probe answer alone is not a direction change', 'Preserve the original objective unless the engineer chooses otherwise'], 'For a plausible alternative framing') &&
        researchRequirements(method, 'Read back, correct and stop', ['confirm/correct readback after substantive discovery and before broad investigation', 'Separate engineer statements from inference',
          'problem, desired outcome, exclusions, precise supplied constraints, relevant examples and material unknowns', 'Actually wait', 'end the turn',
          'Do not emit a readback and start dependent investigation in the same unanswered turn', 'Natural-language acknowledgment', 'a letter is not required', 'no duplicate confirmation', 'Silence and passive non-response are not confirmation']) &&
        researchRequirements(method, 'Read back, correct and stop', ['Stop discovery when intent supports a relevant investigation', 'material assumptions are resolved or explicitly carried', 'the readback is acknowledged and reconciled', 'Do not continue questioning merely to exhaust a topic list'], 'Stop discovery') &&
        researchRequirements(method, 'Honor explicit engineer-directed deferral', ['explicitly directs Research to defer discovery or acknowledgment', 'disclosed provisional objective and consequential assumptions',
          'Do not resist, demand a second confirmation', 'infer it from silence, uncertainty, passive non-response, prompt clarity or generic “keep going” pressure',
          'scope/timing, remaining assumptions and dependent limits', 'Honor any requested timing', 'actual safety or permission limits', 'or invoke another phase', '“I don\'t know” is valid and is not itself deferral']) &&
        researchRequirements(method, 'Continue or change objective', ['reuse the existing intent trace', 'preserve prior answers', 'same explicit question format to later clarification', 'Continuation is not a new interview', 'an unanswered checkpoint is not erased']);
    }],
    ['RESEARCH-POLICY-001', policy, [policy], () =>
      researchRequirements(policy, 'Command execution entry', ['Research delegation waits for actual intent acknowledgment or explicit engineer-directed deferral']) &&
      researchRequirements(policy, 'Lifecycle authority and transitions', ['for every new objective, including detailed, apparently factual and solution-led requests',
        ...boundary, ...bypass, 'each additional lookup must state its uncertainty and next-question purpose', 'bound its source/search and stop to return to dialogue',
        'No broad factual/solution search, delegated investigation, implementation comparison or substantive solution recommendation bypasses intake',
        'End the turn and wait for a pending material answer or readback acknowledgment', 'generic completion pressure is not deferral',
        'Honor actual explicit deferral under disclosed provisional understanding and its scope/timing', 'Eligible truthful Research-note persistence remains allowed',
        'This is not a gate on `/plan`, and does not alter other phases\' contextual material clarification or independent safe work'])],
    ['RESEARCH-CORE-001', core, [core], () =>
      researchRequirements(core, 'Continue phase work and resolve unknowns', [...boundary, ...bypass, 'each additional lookup states its uncertainty and next-question purpose before execution',
        'bounds its source/search, then stops to return to dialogue', 'End the turn and wait for a pending material answer or readback acknowledgment',
        'No broad factual/solution search, delegated investigation, implementation comparison or substantive solution recommendation is permitted',
        'generic completion pressure does not override waiting', 'Eligible truthful Research-note persistence remains allowed', 'other phases retain independent safe work']) &&
      researchRequirements(core, 'Status, questions and validation', ['For every new Research objective, including detailed, apparently factual and solution-led requests',
        'obtain actual confirm/correct readback acknowledgment before broad investigation; emitting a readback is insufficient',
        'Explicit engineer direction may defer discovery or acknowledgment', 'disclosed provisional understanding and actual scope/timing, without duplicate confirmation',
        'Silence, uncertainty, prompt clarity or generic “keep going” pressure is not deferral', 'neither applies an initial interview to other phases nor creates a `/plan` gate', 'Established lifecycle folders still need no routine confirmation'])],
    ['RESEARCH-RECORDS-001', records, [records], () =>
      researchRequirements(records, 'Shared workflow and effect contract', ['For every new Research objective, including detailed, apparently factual and solution-led requests', ...boundary, ...bypass,
        'each additional lookup states its uncertainty and next-question purpose', 'bounds its source/search and stops to return to dialogue',
        'No broad factual/solution search, delegated investigation, implementation comparison or substantive solution recommendation bypasses intake',
        'End the turn and wait for a pending material answer or readback acknowledgment', 'emitting a readback or generic completion pressure is insufficient',
        'Honor actual explicit deferral using disclosed provisional understanding and its scope/timing', 'do not infer deferral or impose a duplicate confirmation',
        'Eligible truthful Research-note persistence remains allowed', "does not create a `/plan` gate, alter other phases' contextual material clarification or independent safe work"]) &&
      researchRequirements(records, 'Stage schemas', ['Intent and discovery', 'consequential choices', 'alternative-framing disposition when applicable', 'actual acknowledgment/deferral, unresolved limits',
        'Assurance distinguishes recorded claims from observed evidence', 'honored deferral is not itself a defect'], '- **Research brief:**')],
    ['RESEARCH-BRIEF-001', brief, [brief], () =>
      researchRequirements(brief, 'Intent and discovery', ['Original request', 'Shared understanding', 'distinguish engineer statements from inference', 'Examples and boundaries',
        'Understanding changes', 'consequential choices offered', 'relevant trade-offs/recommendation when supported', 'actual engineer direction and answer-to-understanding changes',
        'do not infer selection of a recommended option', 'Alternative framing', 'labelled hypothesis', 'brief probe and its result', 'engineer direction choice before deeper exploration',
        'retained/revised objective or unresolved disposition', 'Acknowledgment or deferral', 'actual engineer acknowledgment/correction and reconciled interpretation, pending acknowledgment',
        'actual explicit engineer-directed deferral with its provisional objective and scope/timing', 'sending a readback is not acknowledgment', 'never label provisional understanding confirmed',
        'Unknowns and dependent limits', 'remaining assumptions, factual questions and what dependent investigation or conclusions they limit', 'without a chat transcript',
        'Silence, uncertainty, prompt clarity or generic “keep going” pressure is not confirmation or deferral', 'A truthfully provisional brief is valid evidence, not a transition approval',
        'unresolved questions do not suppress eligible persistence or authorize broader pre-acknowledgment work']) &&
      researchRequirements(brief, 'Recommendation and validation', ['agent-question-resolution and its template for every engineer-facing question', ...boundary,
        'state the uncertainty and next-question purpose before execution', 'bound the source/search, and stop to return to dialogue',
        'Do not broaden into factual/solution search, delegation, implementation comparison or substantive solution advice', 'End the turn and wait for a pending material answer or readback acknowledgment', 'eligible truthful brief persistence remains allowed'])],
    ['RESEARCH-ASSURANCE-001', assurance, [assurance], () =>
      researchRequirements(assurance, 'Stage-specific outcome', ['assess consequential choices', 'supported advice/trade-offs', 'actual engineer direction and answer-to-understanding changes',
        'labelled alternative-framing hypothesis', 'brief probe', 'engineer direction choice before deeper exploration',
        'actual acknowledgment/correction of a substantive readback, pending acknowledgment', 'actual engineer-directed deferral with provisional understanding, scope/timing and remaining dependent limits',
        'detailed, apparently factual and solution-led prompts do not silently bypass discovery', 'Distinguish recorded claims from independently observed conversation messages, chronological tool/lookup ordering and resource-loading evidence',
        'a brief claiming compliance does not prove actual waiting, question format, bounded lookups or loading', 'stated uncertainty/next-question purpose, source/search bound and return to dialogue',
        'actual acknowledgment or deferral before broad or delegated work or substantive solution recommendations', 'Report unobserved behavior/loading as unverified, not passed',
        'no mandatory transcript, new capture or report kind is required', 'Do not treat acknowledgment or assurance as phase-transition approval', 'truthfully provisional brief is not rejected solely for deferral',
        'Remaining questions do not suppress eligible truthful persistence or authorize broad pre-acknowledgment work'], '- **Research:**')],
    ['RESEARCH-GUIDE-001', 'README.md', ['README.md', wiki, catalogue], () =>
      researchRequirements('README.md', 'Follow the RPIR workflow', [sequence, 'detailed, apparently factual or solution-led requests',
        'explicit Known/Uncertain/Recommendation (when supported)/Question framing', 'useful lettered choices and trade-offs at genuine decisions', 'free text when facts/examples are needed', 'letter replies are never required',
        'bounded next-question-supporting lookups', 'not broad investigation or solution advice', 'ends the turn and waits for a material answer or readback acknowledgment',
        'explicitly defer discovery or acknowledgment', 'disclosed provisional understanding and actual scope/timing', 'generic “keep going” pressure is not deferral', 'Natural-language acknowledgment works',
        'continuing the same objective reuses its intent trace', 'acknowledgment or deferral neither invokes Plan', "Plan, Implement and Review retain contextual material clarification, not Research's initial interview",
        'authored workflow expectations, not evidence of installed loading or reliable runtime behavior']) &&
      researchRequirements(wiki, 'Prerequisites', [sequence, 'detailed, apparently factual or solution-led requests', 'explicit Known/Uncertain/Recommendation (when supported)/Question framing',
        'useful lettered choices and trade-offs at genuine decisions', 'free-text fact/example questions', 'letter replies are not required', 'explicitly defer discovery or acknowledgment', 'actual scope/timing, without duplicate confirmation',
        "continuation reuses the same objective's intent trace", 'Neither acknowledgment nor deferral invokes `/plan`; invoke it manually']) &&
      researchRequirements(wiki, 'Content', ['consequential choices, actual acknowledgment/deferral and unresolved limits', 'Research actually waits; sending a readback is not acknowledgment',
        'Neither acknowledgment nor deferral is Plan approval', 'elicit, challenge and broaden based on answers', 'alternative framing as a hypothesis to probe briefly before the engineer chooses a direction',
        ...boundary, 'each additional lookup states its uncertainty and next-question purpose', 'bounds the source/search, then stops and returns to dialogue', 'No broad factual/solution search, delegated investigation, implementation comparison or substantive solution advice is permitted',
        'ends the turn for a pending material answer or readback acknowledgment', 'silence, uncertainty and generic “keep going” pressure are not deferral', 'Eligible truthful brief persistence remains allowed',
        "Plan, Implement and Review retain contextual material clarification and independent safe work, not Research's initial interview", 'authored expectations, not proof of installed loading or reliable runtime behavior',
        'Research delegation waits for actual acknowledgment or explicit deferral']) &&
      researchRequirements(catalogue, 'Content', [sequence, 'including detailed/factual/solution-led requests', 'bounded question-supporting checks only before acknowledgment absent explicit deferral',
        'actual waiting', 'continuation without restarting discovery', 'allow-list after actual acknowledgment or explicit engineer-directed deferral', 'disclosed provisional understanding and actual scope/timing',
        'every Research question uses explicit Known/Uncertain/Recommendation (when supported)/Question framing', 'meaningful lettered choices/trade-offs at genuine decisions',
        'free-text facts/examples without invented options or forced letter replies', 'Plan/Implement/Review retain contextual clarification, not the initial interview',
        'hypothesis/probe/direction choice', 'actual waiting and explicit deferral, not generic “keep going” pressure'])]
  ];
  return rows.map(([id, owner, sources, check]) => [id, owner, () =>
    sources.every((source) => invariant(activeResearchText(source), [], researchContradictions)) && check()]);
}

function authoredChecks(manifestUnavailable) {
  const core = '.github/skills/rpir-lifecycle-core/SKILL.md';
  const policy = '.github/copilot-instructions.md';
  const review = '.github/agents/review.agent.md';
  const runner = '.github/agents/script-runner.agent.md';
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
    ['PLAN-HIERARCHY-001', '.github/skills/architecture-planning/implementation-plan-template.md', () => {
      const template = '.github/skills/architecture-planning/implementation-plan-template.md';
      const work = section(template, 'Planned work');
      const details = section(template, 'Detailed work items');
      const tables = [...work.matchAll(/(?:^\|.*\|\n?)+/gm)];
      return tables.length === 1 &&
        invariant(work, [/one authoritative Work Item register/i, /\| Completion and ID \|/i, /\[ \] Work Item 1/, /Research\/requirements evidence/i, /observable acceptance/i,
          /track execution progress only/i, /never validation pass, approval, or Review acceptance/i],
          [/Tasks? or Steps? only when useful/i, /checkboxes? (?:are|is) approval/i, /approval gate/i]) &&
        invariant(details, [/### Work Item 1\b/, /\[ \] \*\*Task 1\.1:/, /\[ \] \*\*Step 1\.1\.1:/,
          /(?:IDs and detail sections must match the register|item identifiers and their detail sections correspond to the register)/i,
          /meaningful/i, /minimum count beyond meaningful traceability/i, /dependencies where applicable/i,
          /item-level acceptance/i, /validation/i, /not a prediction of every debugging command/i],
          [/mandatory minimum count/i]);
    }],
    ['PLANNING-001', '.github/skills/architecture-planning/SKILL.md', () => {
      const owner = '.github/skills/architecture-planning/SKILL.md';
      return invariant(section(owner, 'Procedure'), [/persist and read back a contained, numbered physical working Plan/, /A non-local draft or locator is not a substitute/]) &&
        invariant(section(owner, 'Procedure'), [/otherwise record the remaining question/, /Do not invent a target/],
          [/\b(?:may|can|must) invent (?:an? )?(?:answer|resolution) (?:for|to) (?:an? )?unresolved/i]);
    }],
    ['WORKER-001', '.github/agents/implementation-worker.agent.md', () => invariant(section('.github/agents/implementation-worker.agent.md', 'Safety and exclusions'),
      [/Projected files guide related-file\/test selection/, /Honor any explicit delegation restriction/],
      [/\b(?:may|can|must) (?:ignore|bypass) (?:an? )?explicit (?:delegation )?restriction/i])],
    ['STATUS-001', '.github/prompts/plan.prompt.md', () => invariant(section('.github/prompts/plan.prompt.md', 'Constraints'),
      [/Status is optional bookkeeping, not a transition gate/], [/status (?:write|update) is (?:required|mandatory)/i]) &&
      invariant(section('.github/agents/research.agent.md', 'Research coordinator'), [/A failed save is not persisted evidence/]) &&
      invariant(readText('.github/agents/research.agent.md').split('---')[1] || '', [/the update is optional bookkeeping/]) &&
      invariant(section('.github/skills/create-copilot-prompt/SKILL.md', 'Workflow'), [/Permit diagnosis, attributable in-boundary correction and relevant rechecks/])],
    ['FRAGMENT-001', '.github/agents/validation-worker.agent.md', () => {
      const agent = readText('.github/agents/validation-worker.agent.md');
      const checklist = readText('.github/skills/safe-implementation/validation-checklist.md');
      const fragment = agent.match(/validation-checklist\.md#([^)]*)\)/)?.[1];
      return fragment === 'read-only-validation-worker' && /^## Read-only Validation Worker\s*$/m.test(checklist);
    }],
    ['RUNNER-001', runner, () => {
      const text = section(runner, 'Script Runner');
      return invariant(text, [
        /(?:An unavailable tool|A tool that is not available), actual Restricted Mode\/managed-policy denial or other non-permitting outcome stops/,
        /Absence of separate Workspace Trust telemetry alone proves neither permission nor denial/,
        /attribute its actual cwd within that root before a consequential action/,
        /inspect relevant before\/after file, generated, process and external effects/,
        /Do not blindly repeat an uncertain destructive\/external effect/,
        /If a local invocation failed before testing its requirement/,
        /failed check keeps dependent acceptance unmet/
      ], [
        /denial (?:may|can) be (?:bypassed|evaded)/i,
        /(?:may|can|must) blindly repeat (?:an )?uncertain destructive\/external effect/i,
        /(?:stable catalogue operation IDs|complete unchanged Tier 1|## Script Runner operations)/i
      ]);
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
    }],
    ['PILOT-SAFETY-001', '.github/skills/create-copilot-skill/SKILL.md', () => {
      const owner = '.github/skills/create-copilot-skill/SKILL.md';
      const safety = `${section(owner, 'Limits and safety')}\n${section(owner, 'Safety boundaries')}\n${section(owner, 'Resource layout')}`;
      return invariant(safety, [
        /read-only discovery and (?:validation|checks)/i,
        /(?:add or recommend|recommend or add).{0,100}edit, terminal, web, MCP, hook, or agent-delegation capability/i,
        /(?:genuinely requires it and the user has approved that scope|genuine workflow need and (?:the )?user (?:explicitly )?approved that scope|genuine workflow need and (?:with )?(?:the )?user's explicit approval of that scope)/i,
        /(?:do not infer approval from the Skill request itself|the Skill request itself is not approval|requesting this Skill does not grant approval|a request for this Skill alone is not approval)/i,
        /agent-delegation capability speculatively/i,
        /Include no resource merely speculatively/i,
        /relative links/i,
        /embed secrets/i,
        /experimental forked context/i,
        /treat a Skill's instructions as granting platform tools or permissions/i
      ], [
        /genuine workflow need\s+or\s+(?:the )?user (?:explicitly )?approved/i,
        /the Skill request itself (?:is|counts as) approval/i,
        /Skill(?:'s)? instructions grant (?:platform )?tools(?: or permissions)?/i,
        /(?:may|can|must) recommend (?:any )?(?:capability|tool) without (?:approval|a genuine need)/i
      ]);
    }],
    ['MAINTAIN-AUTHORITY-001', '.github/skills/maintain-copilot-artifacts/SKILL.md', () => {
      const owner = '.github/skills/maintain-copilot-artifacts/SKILL.md';
      return invariant(section(owner, 'Limits and authority'), [
        /supplies a method only/i,
        /grants no edit, execution, delegation, lifecycle-transition, approval or acceptance authority/i,
        /active phase's approved scope and actual permission/i
      ], [/(?:this Skill|Skill invocation) (?:approves|grants) (?:edits?|execution|delegation|lifecycle transitions?|acceptance)/i]);
    }],
    ['MAINTAIN-PRESERVATION-001', '.github/skills/maintain-copilot-artifacts/SKILL.md', () => {
      const owner = '.github/skills/maintain-copilot-artifacts/SKILL.md';
      return invariant(section(owner, 'Procedure'), [
        /Map baseline rules to candidate wording and candidate normative clauses back to baseline rules/i,
        /Every removed sentence needs complete retained equivalents/i
      ], [/(?:silently|without (?:an )?approved decision) (?:delete|remove|reinterpret|choose) (?:a rule|new behavior)/i,
        /(?:rules?|sentences?) may be (?:silently )?(?:deleted|removed) as obsolete/i]) &&
        invariant(section(owner, 'Limits and authority'), [
          /Do not silently delete, add, relocate, deprecate or reinterpret a normative rule/i,
          /If preservation is uncertain or a contradiction requires a behavior choice, retain the source wording and ask for an engineer decision/i
        ]);
    }],
    ['MAINTAIN-STATIC-001', '.github/skills/maintain-copilot-artifacts/SKILL.md', () => {
      const owner = '.github/skills/maintain-copilot-artifacts/SKILL.md';
      return invariant(section(owner, 'Procedure'), [
        /Static checks and review do not establish runtime equivalence/i,
        /Do not claim semantic proof or runtime equivalence from finite checks/i
      ], [/static checks (?:prove|establish) runtime equivalence/i, /finite checks prove semantic equivalence/i]);
    }],
    // Replaces the former broad-factual-work, optional-letter and primary-open-
    // question anchors with the AC1–AC7 obligations at their unchanged owners.
    ...researchChecks()
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
  if (discoveryError) parityUnavailable.push(`DIAGNOSTIC NOT RUN PARITY-INPUT-DISCOVERY scripts/discover-copilot-artifacts.cjs: ${discoveryError}`);
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
  if (discoveryError) structuralUnavailable.push(`DIAGNOSTIC NOT RUN STRUCT-INPUT-DISCOVERY scripts/discover-copilot-artifacts.cjs: ${discoveryError}`);
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
    if (!manualHandoffCoordinators.has(values.name) && (Object.hasOwn(values, 'agents') || Object.hasOwn(values, 'handoffs')))
      fail(`${relative} non-coordinator must not declare delegation or handoffs`);
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