'use strict';

const fs = require('fs');
const path = require('path');
const { classes, discover, normalize, root } = require('./discover-copilot-artifacts.cjs');

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
  plan: 'Plan', implement: 'Implement', review: 'Review', 'remediate-review': 'Plan'
};
const handoffRoutes = { Research: 'Plan', Plan: 'Implement', Implement: 'Review', Review: 'Plan' };
const workerTools = {
  'Architecture Analyst': ['read', 'search'], 'Codebase Investigator': ['read', 'search'],
  'Correctness Reviewer': ['read', 'search'], 'Domain Investigator': ['read', 'search', 'web'],
  'Feasibility Investigator': ['read', 'search', 'web'], 'Implementation Worker': ['read', 'search', 'edit'],
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
  return manifest;
}

function checkManifestParity(manifest, inventory) {
  const roots = classes.map((definition) => definition.directory);
  const controlled = (relative) => roots.some((directory) => relative === directory || relative.startsWith(`${directory}/`));
  const expectedFiles = classes.flatMap((definition) => inventory[definition.name]);
  const actualFiles = manifest.files.filter((entry) => typeof entry === 'string' && controlled(normalize(entry)));
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
  const blocks = [...readText(relative).matchAll(/- label: [^\n]+\n\s+agent: ([^\n]+)\n\s+prompt: [^\n]+\n\s+send: (\w+)/g)];
  if (blocks.length !== 1 || blocks[0][1] !== handoffRoutes[values.name]) fail(`${relative} must declare its single conditional stage handoff to ${handoffRoutes[values.name]}`);
  for (const block of blocks) {
    if (block[2] !== 'false') fail(`${relative} handoff to ${block[1]} must use send: false`);
    if (!agentNames.has(block[1])) fail(`${relative} handoff target is not a contributed agent: ${block[1]}`);
  }
}

function requireAnchors(relative, anchors, contract) {
  const text = readText(relative);
  for (const anchor of anchors) {
    if (!text.includes(anchor)) fail(`${relative} is missing the authored ${contract} contract anchor: ${anchor}`);
  }
}

function requireConcepts(relative, concepts) {
  const text = readText(relative);
  for (const [label, pattern] of Object.entries(concepts)) {
    if (!pattern.test(text)) fail(`${relative} lacks authored ${label} guidance (static only)`);
  }
}

function requireParagraphConcepts(relative, paragraphStart, concepts) {
  const text = readText(relative);
  const start = text.indexOf(paragraphStart);
  if (start < 0 || text.indexOf(paragraphStart, start + paragraphStart.length) !== -1) {
    fail(`${relative} does not contain one owning paragraph for its authored contract`);
  }
  const paragraphEnd = text.indexOf('\n\n', start);
  const paragraph = text.slice(start, paragraphEnd < 0 ? text.length : paragraphEnd);
  for (const [label, pattern] of Object.entries(concepts)) {
    if (!pattern.test(paragraph)) fail(`${relative} lacks authored ${label} guidance in its owning paragraph (static only)`);
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

function checkScriptRunnerAutonomyContracts() {
  const runnerPath = '.github/agents/script-runner.agent.md';
  const runner = parseFrontmatter(runnerPath);
  if (runner.values['user-invocable'] !== 'false') fail('Script Runner visibility must declare user-invocable: false');
  if (!equal(parseStringList(runner.values.tools, runnerPath), ['read', 'search', 'runInTerminal'])) fail('Script Runner must have read, search, terminal and no edit or nested agent tool');
  if (Object.hasOwn(runner.values, 'agents')) fail('Script Runner must not delegate');
  requireAnchors(runnerPath, ['goal', 'phase', 'cwd', 'with multiple', 'denial', 'tracked', 'untracked', 'generated', 'Native Windows'], 'bounded Runner goal and effect inspection');
  for (const name of coordinators) {
    const relative = `.github/agents/${name}.agent.md`;
    const parsed = parseFrontmatter(relative);
    if (!parseStringList(parsed.values.agents, relative).includes('Script Runner')) fail(`${relative} must name Script Runner as a delegate`);
    requireAnchors(relative, ['Script Runner', 'goal', 'phase', 'scope'], 'phase-scoped Runner delegation');
  }
  for (const relative of [runnerPath, '.github/copilot-instructions.md', '.github/skills/rpir-lifecycle-core/SKILL.md']) {
    const text = readText(relative);
    if (/stable catalogue operation IDs|complete unchanged Tier 1|## Script Runner operations/.test(text)) fail(`${relative} retains obsolete Runner eligibility`);
  }
  requireAnchors('.github/skills/create-runbook/SKILL.md', [
    'name: create-runbook',
    '[Run Book template](templates/runbook.md)',
    'human-readable repository Run Book'
  ], 'Run Book Skill');
  requireAnchors('.github/skills/create-runbook/templates/runbook.md', ['## Purpose', '## Ordered process', '## Sources'], 'human Run Book template');
  const manifest = readManifest();
  if (manifest.name !== 'ukho-copilot-toolkit') fail('package.json must use the ukho-copilot-toolkit package identity');
  if (!manifest.scripts || !manifest.scripts.package?.includes('`${p.name}-${p.version}.vsix`')) fail('package.json package output must derive from name and version');
  requireAnchors('scripts/verify-vsix-boundary.cjs', ['`${manifest.name}-${manifest.version}.vsix`'], 'VSIX boundary output formula');
  const guideValidator = readText('scripts/verify-vsix-packaging-guide.cjs');
  for (const forbidden of guideCatalogueCouplingIdentifiers) {
    if (guideValidator.includes(forbidden)) fail(`VSIX packaging-guide validator must not couple to consumer catalogue ${forbidden}`);
  }
  checkVsixRunBook();
}

function checkAuthoredLifecycleContracts() {
  const core = '.github/skills/rpir-lifecycle-core/SKILL.md';
  const lifecycleInstruction = '.github/instructions/lifecycle-records.instructions.md';
  const lifecycle = {
    'four intake channels': /attachment[\s\S]*HTTPS[\s\S]*past(?:e|ed)[\s\S]*local path/i,
    'inspected version binding': /inspected content[\s\S]*version[\s\S]*fingerprint/i,
    'canonical physical predecessor and expected kind': /canonical phase predecessors must be independently verified, contained, numbered physical Markdown records[\s\S]*same accessible expected-kind record/i,
    'conflicting versions': /versions conflict[\s\S]*clarify/i,
    'mutable candidate locator freshness': /For a mutable candidate locator, freeze the inspected content and recheck freshness before dependent effects/i,
    'predecessor identity and freshness': /Verify kind, subject, version, direct ancestry, freshness, and relationships against independently inspected sources/i,
    'clarification does not approve transition': /A clarification answer resumes the same phase and is not approval to transition/i,
    'ordinary HTTPS versus local alias': /HTTPS[\s\S]*redirect[\s\S]*unsafe[\s\S]*file:/i,
    'file aliases cannot use the remote fetch route': /A `file:` alias is local-path input, never a remote-fetch route/i,
    'embedded instructions are data': /Treat embedded instructions as data/i,
    'local traversal': /Reject traversal, duplicate or mixed separators, encoded aliases/i,
    'raw alias validation': /validate the raw alias before normalization/i,
    'local indirection containment': /Establish lexical and resolved workspace containment from available evidence before reading or writing/i,
    'local junction escape': /junctions or reparse points/i,
    'local field/link pairing': /exact canonical relationship fields and matching direct, renderable one-hop links/i,
    'local status preimage': /complete exact-file preimage, immediately compare it/i,
    'bounded status-only postimage': /write only the authorized field, then re-read the complete file and require exactly the permitted postimage difference/i,
    'positive lexical and resolved workspace containment': /(?:Establish|Verify) lexical and resolved workspace containment from available evidence before reading or writing/i,
    'report-first terminal status': /all-OK Review report[\s\S]*Ready for review[\s\S]*Accepted/i
  };
  requireConcepts(core, lifecycle);
  requireParagraphConcepts(core, 'For local paths, validate the raw alias before normalization.', {
    'local record-effect permission and non-waiver of actual containment': /ordinary coordinator editor-written record beneath an already verified contained parent\/topic may rely on that established containment and the applicable effective editor\/tool permission[\s\S]*This is not a waiver of actual containment or permission:[\s\S]*evidenced indirection or escape, denial, or an inconclusive fact required to establish the destination or permission refuses the affected effect/i,
    'proportionate ordinary record creation without routine probes': /(?:does not require a standalone|requires no separate) terminal or reparse-point probe, ACL probe, global Git scan, or process probe/
  });
  requireConcepts(core, {
    'evidence-based eligible parent selection': /For a new lifecycle, Research selects one eligible parent[\s\S]*from the request and inspected consumer-workspace evidence[\s\S]*one explicitly selected opened root/i,
    'Research-only parent exception and no speculative parent': /This is a narrow Research-only parent-create exception[\s\S]*does not authorize other phases, workers, installation-time behavior, or creation of multiple\/speculative parents/i,
    'safe existing-parent reuse without setup write': /Reuse an existing parent only after verifying its identity and actual containment; do not write to it merely to establish it/i,
    'one needed absent-parent creation with identity, containment, permission, and post-create checks': /Research may create one absent parent only when it is needed[\s\S]*unambiguously[\s\S]*selected root[\s\S]*actual destination containment[\s\S]*expected parent identity[\s\S]*absence[\s\S]*effective tool\/managed-policy permission[\s\S]*verify its resolved identity and post-create state/i,
    'ambiguous parent decision without routine folder-name approval': /If parent choice, identity, or need is materially ambiguous[\s\S]*ask the engineer[\s\S]*do not request routine approval of a generated topic-folder name/i,
    'autonomous Unicode-normalized ASCII subject slug': /derive the subject slug by Unicode NFKD normalization, removing combining marks, lower-casing, retaining ASCII `a-z0-9` groups, and joining groups with single hyphens/i,
    'exact numbered immediate-child grammar and prefix bounds': /Numbered topic folders must match exactly `\^\[0-9\]\{3\}-\[a-z0-9\]\+\(\?:-\[a-z0-9\]\+\)\*\$` and use prefixes `001`–`999`/,
    'full immediate-child inventory and immediate second inventory': /Inspect all immediate parent children[\s\S]*Immediately re-inspect the complete immediate-child inventory/i,
    'maximum-present-plus-one allocation without gap filling or overflow': /Choose `001` when there is no valid numbered topic folder; otherwise choose one greater than the maximum prefix present for this parent[\s\S]*Never fill gaps[\s\S]*stop at `999` rather than overflow/i,
    'record numbering is independent of the topic-folder prefix': /never derive a record number from the folder prefix[\s\S]*For every numbered physical lifecycle record[\s\S]*allocate independently inside the verified topic folder/i,
    'ambiguous, legacy, case, malformed, colliding, inaccessible, and denied child effects refuse': /case-equivalent names, invalid numbered-looking entries, duplicate numeric prefixes, colliding files, inaccessible entries, or uncertain same-subject\/legacy lifecycle identity as conflicts[\s\S]*A collision, concurrent change, malformed or inaccessible inventory, denial, or inconclusive evidence stops the affected effect/i,
    'legacy folder compatibility and successor inheritance without reconstruction': /For an existing lifecycle, retain and verify its actual established folder[\s\S]*historically confirmed folders remain compatible and are not renamed, relocated, or subjected to a new confirmation requirement[\s\S]*Later phases inherit the verified folder and may not select, create, or relocate another/i,
    'successors require the existing folder and inspected physical predecessor': /Later phases inherit the verified folder and may not select, create, or relocate another[\s\S]*actual contained numbered physical record in the confirmed Research folder[\s\S]*successors must verify and inherit the actual established folder and their inspected physical predecessor/i,
    'physical same-folder record and readback': /actual contained numbered physical record in the confirmed Research folder[\s\S]*direct, renderable one-hop links[\s\S]*After saving any phase output, read back the full physical file/i,
    'full physical readback verifies identity content and lineage': /read back the full physical file and verify its identity, content and direct same-folder relationship fields\/links/i,
    'status changes remain limited to guarded status-only postimages': /complete exact-file preimage, immediately compare it[\s\S]*write only the authorized field[\s\S]*require exactly the permitted postimage difference/i
  });
  requireParagraphConcepts(core, 'For every numbered physical lifecycle record, including the initial Research brief and each successor output, allocate independently inside the verified topic folder.', {
    'effective permission for lifecycle-record save': /Immediately re-inspect that same exact-suffix inventory, confirm applicable effective permission for the save, create only the absent exact candidate path, and never overwrite an existing path/i,
    'independent exact-suffix numbered allocation': /Inspect only existing files whose suffix exactly matches the requested artifact type/i,
    'valid three-digit-prefix allocation starts at 001': /use `001` if none has a valid three-digit prefix, otherwise one greater than the maximum valid three-digit prefix for that suffix/i,
    'immediate second scan and absent-candidate no-overwrite': /Immediately re-inspect that same exact-suffix inventory, confirm applicable effective permission for the save, create only the absent exact candidate path, and never overwrite an existing path/i,
    'malformed, inaccessible, colliding, or uncertain allocation stops': /Stop on collision, malformed or inaccessible inventory, denial, or uncertain allocation, containment, or required permission/i,
    'optional observation remains unestablished and hard effects stop': /A failed optional observation ends that invocation and leaves its requested fact unestablished; an echo-only or otherwise inconclusive result is neither safety proof nor evidence by itself of a failed effect or an unknown relevant effect\.[\s\S]*Still inspect required effects: denial, failed required work, unexpected change, or (?:an )?unresolved relevant effect stops the affected work/i
  });
  requireConcepts('.github/agents/research.agent.md', {
    'Research selects one parent from request and inspected evidence': /(?:Select one eligible lifecycle parent from the request and inspected workspace evidence|Choose one eligible lifecycle parent based on the request and inspected workspace evidence)/i,
    'Research parent-only exception and no speculative or multiple parent': /MUST NOT create (?:an unnecessary, speculative, second, or ambiguous|a speculative, multiple, or unneeded) parent/i,
    'Research safely reuses existing parent without setup write': /(?:Reuse a verified existing parent without writing|Reuse an existing parent only after verifying it is safe, and do not write to it merely to establish it)/i,
    'Research creates only one needed absent parent with separate checks': /create one absent parent only when (?:it is )?needed and only after its separate identity, actual-containment, exact-absence and effective-permission checks, then verify its creation/i,
    'Research resolves parent ambiguity and avoids routine name confirmation': /If parent identity, choice, or need is materially ambiguous[\s\S]*do not ask for routine approval of the generated topic-folder name/i,
    'Research slug uses Unicode normalization and ASCII groups': /Unicode NFKD normalization[\s\S]*remove combining marks[\s\S]*retain ASCII `a-z0-9` groups separated by single hyphens/i,
    'Research exact numbered child grammar and full inventory': /inspect all immediate children[\s\S]*only (?:when|if) the exact grammar `\^\[0-9\]\{3\}-\[a-z0-9\]\+\(\?:-\[a-z0-9\]\+\)\*\$`[\s\S]*prefix `001`–`999`/i,
    'Research conflict and refusal cases': /case-equivalent names[\s\S]*invalid numbered-looking entries[\s\S]*duplicate prefixes[\s\S]*colliding files[\s\S]*inaccessible entries[\s\S]*uncertain same-subject\/legacy identity as conflicts/i,
    'Research uses per-parent maximum-plus-one, no gaps, and stops at 999': /(?:Allocate `001` if there is no valid numbered folder, otherwise maximum prefix present plus one for this parent; never fill gaps or exceed `999`|Use `001` when there is no valid numbered folder, otherwise take the greatest existing prefix plus one per parent; do not fill gaps or exceed `999`)/i,
    'Research immediately repeats full child inventory before creation': /(?:Immediately re-inspect|Immediately repeat) the complete immediate-child inventory[\s\S]*require the exact candidate absent and no conflict/i,
    'Research independently numbers exact-suffix physical brief': /(?:inspect only files with exact `-research-brief\.md` suffix; independently allocate `001` or one greater than the maximum valid three-digit record prefix for that suffix|inspect only files whose suffix is exactly `-research-brief\.md`; allocate the brief sequence independently, starting at `001` or one after that suffix's greatest valid three-digit prefix)/i,
    'Research physically reads back brief identity content and links': /(?:read back the full physical brief and verify|read back the entire physical brief to confirm) identity, content and applicable direct relationship fields\/links/i,
    'Research retains historically confirmed folder without a new ballot': /a historically confirmed folder remains valid without a new confirmation or migration/i,
    'Research output reports parent, child, and record evidence separately': /selected opened root and eligible parent with evidence[\s\S]*parent was safely reused or conditionally created and its verification[\s\S]*chosen slug[\s\S]*immediate-child inventory\/allocation\/conflict and second-scan results[\s\S]*separate exact-suffix brief allocation and full physical readback[\s\S]*Denial, ambiguity, conflict, malformed(?:\/| or )inaccessible inventory, uncertain containment(?:\/| or )identity, or failed readback leaves (?:the )?affected output unfinished/i,
  });
  requireConcepts('.github/agents/script-runner.agent.md', {
    'Runner corrects an untested invocation only as a read-only observation under unchanged scope': /(?:fails|failed) before testing[\s\S]*(?:correct|replace)[\s\S]*(?:read-only|observational)[\s\S]*(?:same root,[\s\S]*goal[\s\S]*scope|unchanged (?:approved )?goal[\s\S]*scope)[\s\S]*(?:permission|approval)/i,
    'Runner keeps denial and unknown effects as hard stops without bypass': /denial[\s\S]*(?:unresolved|unknown) relevant effect[\s\S]*stops the affected work[\s\S]*(?:Do not retry|without bypass|not bypass)/i
  });
  requireParagraphConcepts('.github/agents/script-runner.agent.md', '4. Require effective Workspace Trust, tool availability, and VS Code/managed-policy permission;', {
    'Runner optional-observation wording remains unestablished, not a failed fact': /Otherwise, a failed optional observation leaves its requested fact unestablished/i
  });
  requireConcepts('.github/agents/implement.agent.md', {
    'Implement diagnoses tested failure and applies only a Plan-covered remedy': /If a prerequisite was tested and failed,[\s\S]*investigate its cause and perform only an explicitly Plan-covered safe repair within the existing targets and acceptance criteria/i,
    'Implement revalidates a repaired prerequisite before dependent action': /If a prerequisite was tested and failed,[\s\S]*then revalidate before the dependent action/i,
    'Implement escalates new scope to a newly approved Plan': /A new target, dependency, safety, validation, acceptance or scope choice requires a prompt Plan amendment and a newly inspected, explicitly approved Plan version/i,
    'Implement does not require duplicate routine RPIR approval': /do not ask for a second routine approval/i,
    'Implement reports a missing principal output rather than substituting its report': /promised principal artifact[\s\S]*actual existence[\s\S]*a saved implementation report does not substitute[\s\S]*If it is missing,[\s\S]*state why no safe authorized recovery can proceed/i
  });
  requireConcepts('.github/skills/safe-implementation/validation-checklist.md', {
    'untested command invocation may be corrected only under unchanged scope with safe effects and permission': /fails before testing a requirement may be corrected or replaced only under the same approved goal and scope, with known safe effects and fresh independent permission/i,
    'failed prerequisite diagnosis, Plan-covered repair and passing recheck precede dependent action': /tested failing prerequisite blocks only its dependent action while its cause is investigated, and any remedy must already be Plan-authorized and in scope, followed by revalidation before that action/i,
    'denial, unknown effects and failed consequential operations are not retried': /Denial, unavailable permission, unexpected writes\/effects, or unknown relevant effects stop the affected work without bypass, retry, or silent rollback; do not replay a failed consequential operation/i
  });
  requireConcepts(lifecycleInstruction, {
    'numbered lifecycle instruction and physical same-folder output': /eight numbered local record patterns[\s\S]*numbered physical predecessor[\s\S]*same verified topic folder[\s\S]*read back the full physical file/i,
    'instruction distinguishes evidenced parent reuse from conditional creation': /Research alone selects one eligible parent[\s\S]*request and inspected workspace evidence[\s\S]*Reuse an existing parent only after verifying its identity and actual containment[\s\S]*create one absent parent only when needed[\s\S]*effective tool\/managed-policy permission checks[\s\S]*resolved identity and post-create state/i,
    'instruction autonomous child allocation and conflict handling': /Unicode NFKD normalization[\s\S]*exactly `\^\[0-9\]\{3\}-\[a-z0-9\]\+\(\?:-\[a-z0-9\]\+\)\*\$`[\s\S]*maximum prefix present plus one per parent[\s\S]*Immediately repeat the full child inventory/i,
    'instruction independent record allocation and legacy inheritance': /exact matching-suffix inventory[\s\S]*independently allocate `001`[\s\S]*read back the full physical file[\s\S]*(?:Preserve a historically confirmed existing lifecycle folder as valid legacy lineage without new confirmation, renaming, or migration|A historically confirmed legacy lifecycle folder remains valid without requiring confirmation, renaming it, or migrating it)[\s\S]*Later phases (?:inherit the actual verified folder and never select, create, or reconstruct|continue in the actual verified folder and do not choose, create, or rebuild) a parent or child/i,
    'instruction avoids routine generated-folder confirmation': /do not require a routine engineer ballot on a generated child name/i,
    'instruction runtime caveat': /Instruction-pattern matching[\s\S]*runtime attachment have not been verified/i
  });
  const stageContracts = {
    research: {
      'working Research document': /subject[\s\S]*draft[\s\S]*iterate/i,
      'Research cannot complete itself': /Research never sets `Completed`/,
      'selects evidence-based parent and separately guards its reuse or creation': /(?:Select one eligible lifecycle parent from the request and inspected workspace evidence|Choose one eligible lifecycle parent based on the request and inspected workspace evidence)[\s\S]*(?:Reuse a verified existing parent without writing|Reuse an existing parent only after verifying it is safe, and do not write to it merely to establish it)[\s\S]*(?:create one absent parent only when needed|create at most one parent, and only if it is absent and needed)[\s\S]*separate identity, containment, absence, permission, creation and readback checks/i,
      'autonomously allocates and rechecks numbered child': /autonomously derive and allocate the subject slug and numbered immediate-child topic folder[\s\S]*(?:Immediately re-inspect|Immediately repeat) the complete immediate-child inventory[\s\S]*create only that contained child/i,
      'independently allocates and reads back physical brief': /numbered brief's exact-suffix allocation and full readback[\s\S]*(?:Save and read back the full physical brief|save and read back the entire physical brief to confirm)[\s\S]*leave the draft unfinished/i,
      'keeps historical folder without new confirmation or migration': /historically confirmed folder remains valid without a new confirmation or migration/i
    },
    plan: {
      'both predecessor kinds': /Research document[^\n]*Review report/i,
      'supported mixed subset': /For `Needs clarification` mixed findings, carry both classifications and plan only the independently supported actionable subset the engineer explicitly chooses/i,
      'distinct plan': /distinct issue-scoped plan[^\n]*previous plan/i,
      'physical predecessor is a locator until verified in same folder': /actual contained, numbered physical Markdown predecessor in the Research-created folder[\s\S]*direct same-folder ancestry/i,
      'own Plan is saved and read back in inherited folder': /only the verified Research-created folder[\s\S]*Allocate exactly one distinct[\s\S]*direct same-folder physical predecessor fields\/links[\s\S]*read back and verify the full physical file/i,
      'missing predecessor leaves Plan unfinished': /If a physical predecessor or required lineage cannot be verified[\s\S]*leave dependent canonical output unfinished/i,
      'denied output or lost readback leaves Plan unfinished': /If the physical predecessor,[\s\S]*allocation,[\s\S]*effective permission,[\s\S]*full readback is unavailable or fails[\s\S]*leave dependent canonical output unfinished/i
    },
    implement: {
      'per-pass approval': /\/implement[\s\S]*approval[\s\S]*bounded[\s\S]*pass/i,
      'no previous-plan reuse': /Never reopen[\s\S]*previous plan/i,
      'physical Plan predecessor and own same-folder report readback': /actual contained, numbered physical Plan in the Research-created folder[\s\S]*direct field\/link pairs, same-folder Research lineage[\s\S]*Save this pass's numbered physical `<NNN>-implementation-report\.md` only in the verified Plan's Research-created folder[\s\S]*Read back the full physical report/i,
      'missing physical Plan leaves pass incomplete': /If the physical Plan or required lineage cannot be verified[\s\S]*do not treat pasted content or a remote label as canonical edit authority or claim the pass complete/i,
      'denied output or lost readback leaves Implement unfinished': /If the physical Plan, permission, allocation or full readback is unavailable or fails[\s\S]*as unfinished/i
    },
    review: {
      'report-first acceptance': /all-OK report[\s\S]*ends RPIR[\s\S]*Accepted/i,
      'mixed outcome': /mixed[\s\S]*supported[\s\S]*blockers/i,
      'no direct implementation': /Never route a finding directly to Implement/i,
      'physical predecessor, Plan, and own same-folder output for every disposition': /actual contained, numbered physical implementation report in the Research-created folder[\s\S]*direct same-folder Plan lineage[\s\S]*then inspect that physical Plan[\s\S]*Save one numbered physical Review report in the verified implementation report's Research-created folder for every disposition[\s\S]*Read back the full physical report[\s\S]*before claiming Review phase finish/i,
      'missing physical report leaves Review incomplete': /Without the physical report and required Plan lineage[\s\S]*do not claim a canonical Review outcome or phase completion/i,
      'denied output or lost readback leaves Review unfinished': /If a required predecessor,[\s\S]*containment,[\s\S]*permission,[\s\S]*allocation or full readback is unavailable or fails[\s\S]*leave Review unfinished/i,
      'verified report precedes clean terminal outcome': /persist and verify the evidence-backed physical Review report and matching same-folder Plan\/implementation lineage before terminal handling[\s\S]*RPIR ends without a `\/plan` handoff/i,
      'verified report precedes issue handoff': /Every disposition requires the verified physical Review report before phase finish[\s\S]*only after its physical report is verified/i
    }
  };
  for (const [name, concepts] of Object.entries(stageContracts)) requireConcepts(`.github/agents/${name}.agent.md`, concepts);
  requireParagraphConcepts('.github/agents/implement.agent.md', 'Before the initial edit, and before any further affected edit if a gap is discovered mid-pass,', {
    'Implement readiness guard refuses the affected edit': /refuse that edit when the approved plan does not sufficiently specify it/i,
    'Implement opening pre-test read-only observation exception': /sole exception to refusing a new command is a separately sourced corrected or replacement read-only observation through Script Runner when an invocation failed before testing its requirement/i,
    'Implement opening unchanged-scope safe-effects and fresh-permission condition': /only under the unchanged phase, selected root, goal, and scope, after reconciling effects as known safe and obtaining fresh independent effective permission\. Runner alone decides whether a command is needed and chooses its command and cwd\./i,
    'Implement opening prohibition on new goals, repairs, and consequential work': /This exception does not authorize a new goal, target, dependency, repair, consequential operation, or Plan-owned choice\./i,
    'Implement opening tested-failure stop and dependency gate': /a genuinely tested failed prerequisite, unknown or unexpected relevant effects, and a failed consequential operation stop affected work; a tested failed prerequisite remains failed and gates dependent work until a specifically Plan-covered repair passes revalidation/i,
    'Implement opening denial, unavailable-permission, and consequential no-replay stops': /Denial or unavailable permission,[\s\S]*unknown or unexpected relevant effects, and a failed consequential operation stop affected work;[\s\S]*a failed consequential operation must never be replayed\./i
  });
  requireParagraphConcepts('.github/agents/implement.agent.md', '- MUST NOT add, remove, restructure or expand work, targets, dependencies, commands as implementation work', {
    'Implement first Exclusions bullet pre-test read-only observation exception': /^- MUST NOT add, remove, restructure or expand work, targets, dependencies, commands as implementation work[^\n]*sole command exception is a separately sourced corrected or replacement read-only observation through Script Runner after an invocation failed before testing its requirement/m,
    'Implement first Exclusions bullet unchanged-scope safe-effects and fresh-permission condition': /^- MUST NOT add, remove, restructure or expand work, targets, dependencies, commands as implementation work[^\n]*under the unchanged phase, selected root, goal and scope, after known-safe effect reconciliation and fresh independent effective permission; Runner chooses whether a command is needed and selects the command and cwd\./m,
    'Implement first Exclusions bullet prohibition on new goals, repairs, and consequential work': /^- MUST NOT add, remove, restructure or expand work, targets, dependencies, commands as implementation work[^\n]*This does not authorize a new goal, target, dependency, repair, consequential operation or Plan-owned choice\./m,
    'Implement first Exclusions bullet tested-failure stop and dependency gate': /^- MUST NOT add, remove, restructure or expand work, targets, dependencies, commands as implementation work[^\n]*a tested failed prerequisite, unknown or unexpected relevant effects, and failed consequential operations remain subject to the stop and no-replay controls above\./m,
    'Implement first Exclusions bullet denial, unavailable-permission, and consequential no-replay stops': /^- MUST NOT add, remove, restructure or expand work, targets, dependencies, commands as implementation work[^\n]*Denial or unavailable permission,[^\n]*unknown or unexpected relevant effects, and failed consequential operations remain subject to the stop and no-replay controls above\./m
  });
  requireParagraphConcepts('.github/skills/safe-implementation/SKILL.md', 'Before an edit, and before any further affected edit if a gap is discovered mid-pass,', {
    'safe-implementation Limits pre-test read-only observation exception': /sole exception to refusing a new command is a separately sourced corrected or replacement read-only observation through Script Runner when an invocation failed before testing its requirement/i,
    'safe-implementation Limits unchanged-scope safe-effects and fresh-permission condition': /only under the unchanged approved phase, root, goal and scope, after reconciling its effects as known safe and obtaining fresh independent effective permission\. Runner chooses whether a command is needed and selects its command and cwd\./i,
    'safe-implementation Limits prohibition on new goals, repairs, and consequential work': /This exception does not authorize a new goal, target, dependency, repair, consequential operation or Plan-owned choice\./i,
    'safe-implementation Limits tested-failure stop and dependency gate': /When a requirement was actually tested and failed, it remains failed and dependent work stays gated until a specifically Plan-covered remedy is applied and the requirement passes revalidation\./i,
    'safe-implementation Limits denial, unavailable-permission, and consequential no-replay stops': /Denial or unavailable permission, unknown or unexpected relevant effects, and failed consequential operations stop affected work; they do not authorize bypass, alternate-role retry or replay\./i
  });
  const prompts = {
    plan: { 'dual-kind input': /Research document[\s\S]*Review report/i, 'issue plan': /distinct issue-scoped plan/i },
    implement: { 'per-pass authorization': /\/implement[\s\S]*approval[\s\S]*bounded/i, 'effect-specific scope and permission checks': /Verify exact scope, evidence, local-write integrity and platform\/effect permissions independently before each effect/i },
    review: { 'admission versus outcome': /Review admission[\s\S]*not final acceptance/i, 'conditional next step': /Only a verified, persisted all-OK report ends RPIR[\s\S]*issue-bearing report may enter `\/plan` only when the engineer explicitly chooses a bounded scope[\s\S]*Use `Needs clarification` for mixed actionable\/unclear findings/i },
    'remediate-review': { 'compatibility only': /deprecated compatibility[\s\S]*same Review-origin intake as `\/plan`/i, 'new plan not direct edits': /distinct issue-scoped plan[\s\S]*not a reused old plan or direct implementation/i }
  };
  for (const [name, concepts] of Object.entries(prompts)) {
    const relative = `.github/prompts/${name}.prompt.md`;
    const text = readText(relative);
    const inputs = [...text.matchAll(/\$\{input:([A-Za-z][A-Za-z0-9]*):([^}]+)\}/g)];
    if (inputs.length !== 1 || !/attachment[^\n]*HTTPS URL[^\n]*paste[^\n]*local path/i.test(inputs[0][2])) fail(`${relative} must accept one actual four-channel predecessor document`);
    if (name === 'plan' && !/Research document[^\n]*Review report/i.test(inputs[0][2])) fail(`${relative} must accept both Research and issue-bearing Review inputs`);
    requireConcepts(relative, concepts);
  }
  requireConcepts('.github/skills/architecture-planning/implementation-plan-template.md', {
    'source-neutral issue lineage': /Review-origin lineage[^\n]*reviewed implementation report[^\n]*previous plan[^\n]*original Research/i,
    'fresh issue units': /new unchecked units[\s\S]*old plans/i
  });
  requireConcepts('.github/skills/architecture-planning/SKILL.md', {
    'active material-gap resolution': /For every material gap, derive and record an evidence-supported answer\.[^\n]*Do not invent[\s\S]*For operator-owned choices,[\s\S]*use \[agent-question-resolution\]/i
  });
  for (const relative of ['.github/skills/safe-implementation/implementation-report-template.md', '.github/skills/code-review/review-report-template.md']) {
    requireConcepts(relative, {
      'source-neutral record envelope': /envelope[\s\S]*channel\/locator[\s\S]*version/i,
      'verified local field/link pair only': /local record pairs \(only when real\)[\s\S]*matching direct one-hop local Markdown link/i,
      'non-authorizing evidence': /non-authorizing/i
    });
  }
  requireConcepts('.github/skills/codebase-research/research-brief-template.md', {
    'Research decision-first schema and compact lifecycle closeout': /^# Research brief[\s\S]*## Question, scope, and success[\s\S]*## Evidence[\s\S]*## Recommendation[\s\S]*## Lifecycle evidence, provenance, and outcomes/m,
    'Research recommendation records benefit, alternatives, next-phase consequences, and decision-changing assumptions': /## Recommendation[\s\S]*Expected (?:benefit|impact)[\s\S]*Alternatives considered[\s\S]*Next-phase consequences[\s\S]*Assumptions that would change the recommendation/i,
    'Research end section preserves initial no-predecessor and adverse-output outcomes': /## Lifecycle evidence, provenance, and outcomes[\s\S]*Research predecessor: None[\s\S]*Adverse outcomes and refusals[\s\S]*dependent phase output is unfinished/i
  });
  requireConcepts('.github/skills/architecture-planning/implementation-plan-template.md', {
    'Plan outcome precedes its sole Work Item register and supporting detail': /^# Implementation plan[\s\S]*## Outcome, boundaries, and chosen approach[\s\S]*## Planned work items[\s\S]*## Supporting planning evidence and decisions[\s\S]*## Detailed work items/m,
    'Plan preserves sole register and fresh ordered hierarchy': /sole authoritative Work Item register[\s\S]*sole register of scope[\s\S]*Work Item, Task, and Step checkboxes begin unchecked/i,
    'Plan keeps item operations and acceptance adjacent once': /Immediately after each Work Item's hierarchy[\s\S]*Targets, operations, and requirements[\s\S]*Acceptance and validation/i,
    'Plan consolidates identity and output verification at end': /## Identity, status, lineage, and output verification[\s\S]*Physical predecessor and current Plan output/i
  });
  requireConcepts('.github/skills/safe-implementation/implementation-report-template.md', {
    'Implement report leads with pass, changed behavior, and this-plan completion': /^# Implementation report[\s\S]*## Approved pass, delivered behavior, and completion[\s\S]*Approved pass[\s\S]*Changed files and delivered behavior[\s\S]*Completed this-plan units[\s\S]*Remaining this-plan units/m,
    'Implement report distinguishes all four validation states': /## Validation outcomes[\s\S]*Performed[\s\S]*Failed[\s\S]*Unavailable[\s\S]*Not run/m,
    'Implement report consolidates direct Plan and output evidence': /## Lifecycle identity and allocation[\s\S]*Plan identity, direct relationship, and output evidence[\s\S]*complete-file readback/i,
    'Implement report compares promised and produced principal output and explains absence': /Plan-promised principal artifact[\s\S]*Produced principal artifact[\s\S]*If absent, explain why it could not safely be delivered[\s\S]*A saved report is not a substitute/i,
    'Implement report records diagnosis, remedy and revalidation outcomes': /## Principal artifact and recovery outcomes[\s\S]*Diagnosis:[\s\S]*Remedy:[\s\S]*Revalidation:/i
  });
  requireConcepts('.github/skills/code-review/review-report-template.md', {
    'Review report leads with disposition before comparison and findings': /^# Review report[\s\S]*## Disposition and basis[\s\S]*## Comparison to approved plan[\s\S]*## Findings[\s\S]*## Record verification and next action/m,
    'Review does not claim No findings without supporting evidence': /Use No findings only when the inspected Plan, implementation report, changed work\/diff and validation evidence support an all-OK result/i,
    'Review preserves mixed actionable and unclear classifications': /Disposition:[^\n]*mixed actionable and unclear findings must preserve both classifications and cannot be all OK/i,
    'Review conditional acceptance follows persisted report verification': /All-OK report-first action[\s\S]*Only after persisting and verifying[\s\S]*may an eligible current local Plan change only `Status: Ready for review` to `Accepted`[\s\S]*Do not state that this later write occurred unless its guarded result was actually observed/i,
    'Review compares principal output and excludes an absent output from all-OK': /Principal output:[\s\S]*compare it with actual changed work and verified output presence[\s\S]*a saved implementation report alone does not establish delivery[\s\S]*absence precludes all-OK/i
  });
  requireConcepts(lifecycleInstruction, {
    'numbered record stages direct observed outcomes to one end section': /## Research brief[\s\S]*## Implementation plan[\s\S]*## Implementation report[\s\S]*## Review report[\s\S]*## Observed lifecycle outcomes[\s\S]*## Validation boundaries/i
  });
  requireConcepts('.github/agents/research.agent.md', {
    'Research output leads with answer and recommendation and consolidates outcomes': /## Required output[\s\S]*Lead the Research brief with a concise answer and recommendation[\s\S]*final \*\*Lifecycle evidence, provenance, and outcomes\*\*/i
  });
  requireConcepts('.github/agents/plan.agent.md', {
    'Plan output leads with bounded scope and sole hierarchy': /## Required output[\s\S]*Lead with the bounded selected scope, the sole authoritative Work Item register and its Work Item\/Task\/Step hierarchy/i
  });
  requireConcepts('.github/agents/implement.agent.md', {
    'Implement output leads with actual changes and four validation states': /## Required output[\s\S]*Lead with this pass's actual changed files and delivered behavior[\s\S]*Performed[\s\S]*Failed[\s\S]*Unavailable[\s\S]*Not run/i
  });
  requireConcepts('.github/agents/review.agent.md', {
    'Review output leads with disposition and comparison': /## Required output[\s\S]*Lead with the evidence-supported disposition and its basis[\s\S]*Compare the inspected implementation[\s\S]*prioritized findings/i,
    'Review output separates report-first verification from conditional acceptance': /persisted Review report must be read back in full[\s\S]*Only after the final all-OK Review report is persisted and verified[\s\S]*eligible local current Plan receive the guarded status-only `Accepted` update/i
  });
  requireConcepts('.github/copilot-instructions.md', {
    'local write safety': /full.*preimage[\s\S]*status-only postimage/i,
    'independent allocation': /matching-suffix inventory[\s\S]*Never overwrite/i,
    'proportionate ordinary create/readback without routine command or ACL probe': /Ordinary editor-written Markdown lifecycle records do not require a routine terminal, reparse\/ancestor-chain, ACL, global Git, or process probe absent a concrete risk signal/i,
    'status changes remain separate guarded preimage and status-only postimage writes': /For local status writes,[\s\S]*fresh full-file preimage[\s\S]*status-only postimage/i,
    'separate package-owner confirmation and distinct-output gate remains': /Packaging remains deferred; do not run packaging or overwrite either ignored VSIX artifact\. A future package run requires owner confirmation and an authorized distinct output strategy\./i,
    'future archive retains target-absence containment protected-byte permission and effects checks': /For future archive work, preserve target-absence, actual containment, protected-byte, effective-permission and effects checks/i,
    'future archive operation is not replayed after failure': /Never replay a failed consequential build, write, archive or package operation/i,
    'phase permission boundary': /Workspace Trust[\s\S]*managed-policy permission/i
  });
  requireConcepts('.github/agents/research.agent.md', {
    'Research confirm/correct checkpoint before deeper investigation': /Once discovery is sufficient—or immediately when no discovery question is needed[\s\S]*synthesize the understanding for the engineer to confirm or correct[\s\S]*Wait for an explicit engineer response before deeper investigation[\s\S]*even when the request was already detailed/i
  });
  requireConcepts('.github/skills/agent-question-resolution/SKILL.md', {
    'Research every-question lettered and open-response route': /For Research,[\s\S]*every engineer-facing question[\s\S]*including a synthesized-understanding confirmation[\s\S]*offer sequential lettered, issue-appropriate choices[\s\S]*clearly open-direction or uncertainty response[\s\S]*Do not ask a bare Research question/i
  });
  requireConcepts('.github/skills/agent-question-resolution/templates/clarification-message.md', {
    'Research template lettered open-response and confirm/correct route': /### Research questions[\s\S]*For every engineer-facing Research question,[\s\S]*provide lettered response choices[\s\S]*honest lettered open-direction and\/or uncertainty response[\s\S]*For a summary checkpoint[\s\S]*lettered choice to confirm[\s\S]*lettered choice to correct[\s\S]*own words[\s\S]*lettered unsure\/add-context choice/i
  });
  requireConcepts('.github/skills/agent-question-resolution/templates/clarification-message.md', {
    'non-Research plain contextualized-question route': /For Plan, Implement, or Review,[\s\S]*preserve the plain contextualized-question route[\s\S]*Do not force those stages into Research's lettered-choice format/i
  });
}

function checkLifecycleContracts() {
  checkAuthoredLifecycleContracts();
  checkScriptRunnerAutonomyContracts();
}

function main() {
  const inventory = discover();
  const manifest = readManifest();
  checkManifestParity(manifest, inventory);
  checkLifecycleContracts();
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
    if (!agentNames.has(values.agent) || values.agent !== promptRoutes[name] || values.name !== name) fail(`${relative} must use its declared RPIR stage route`);
    if (Object.hasOwn(values, 'tools')) {
      const allowed = coordinatorTools[values.agent];
      if (!parseStringList(values.tools, relative).every((tool) => allowed.includes(tool))) fail(`${relative} tools must not expand ${values.agent} capabilities`);
    }
  }
  for (const relative of inventory.chatAgents) {
    const { values } = frontmatter.get(relative);
    checkHandoffs(relative, values, agentNames);
    if (Object.hasOwn(coordinatorTools, values.name) && !equal(parseStringList(values.tools, relative), coordinatorTools[values.name])) fail(`${relative} coordinator tools exceed its stage contract`);
    if (Object.hasOwn(workerTools, values.name)) {
      if (values['user-invocable'] !== 'false') fail(`${relative} worker must declare user-invocable: false`);
      if (!equal(parseStringList(values.tools, relative), workerTools[values.name])) fail(`${relative} worker tools do not match its least-privilege contract`);
    }
  }
  console.log(`Copilot customization contracts match fixed-root discovery, manifest, frontmatter, link, handoff, worker, numbered lifecycle-instruction, and per-phase authored lifecycle-contract requirements. ${staticContractLimitation}`);
}

try { main(); } catch (error) { console.error(`Copilot contract verification failed: ${error.message}`); process.exitCode = 1; }