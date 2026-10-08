'use strict';

// Bounded checks-only workflow grammar: reject unsupported execution routes rather than guessing YAML semantics.
const fs = require('fs');
const path = require('path');
const requiredFilters = ['.github/copilot-instructions.md', 'scripts/test-copilot-contract-scenarios.cjs'];
const commands = {
  contracts: 'node scripts/verify-copilot-contracts.cjs',
  scenarios: 'node scripts/test-copilot-contract-scenarios.cjs',
  guide: 'node scripts/verify-vsix-packaging-guide.cjs',
  package: 'npm run package'
};
function checkWorkflow(root) {
  const text = fs.readFileSync(path.join(root, '.github/workflows/package.yml'), 'utf8').replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  if (lines.some((line) => /\t|\$\{|<<:|\b(?:continue-on-error|needs|timeout-minutes):/.test(line))) throw new Error('unsupported workflow indirection or failure masking');
  const top = [...text.matchAll(/^([a-z][a-z-]*):(?:.*)$/gm)].map((match) => match[1]);
  if (JSON.stringify(top) !== JSON.stringify(['name', 'on', 'permissions', 'jobs'])) throw new Error('unexpected workflow top-level structure');
  const triggerBlock = text.split(/^on:\s*$/m)[1]?.split(/^permissions:/m)[0];
  const triggers = [...(triggerBlock || '').matchAll(/^  ([a-z_]+):\s*$/gm)];
  if (JSON.stringify(triggers.map((match) => match[1])) !== JSON.stringify(['push', 'pull_request'])) throw new Error('unexpected workflow triggers');
  for (let i = 0; i < triggers.length; i++) {
    const block = triggerBlock.slice(triggers[i].index + triggers[i][0].length, triggers[i + 1]?.index);
    if (!/^\n    paths:\n(?:      - [^\n]+\n)+$/.test(`${block.trimEnd()}\n`)) throw new Error('unsupported trigger filter syntax');
    const filters = [...block.matchAll(/^      - (.+)$/gm)].map((match) => match[1]);
    if (new Set(filters).size !== filters.length || !requiredFilters.every((item) => filters.includes(item))) throw new Error('missing or duplicate CI trigger filters');
  }
  if (!/^permissions:\n  contents: read\n\njobs:\n/m.test(text.slice(text.indexOf('permissions:')))) throw new Error('unexpected workflow permissions');
  const jobsBlock = text.split(/^jobs:\s*$/m)[1] || '';
  const matches = [...jobsBlock.matchAll(/^  ([a-z-]+):(?: ([^\n]+))?$/gm)];
  if (JSON.stringify(matches.map((match) => match[1])) !== JSON.stringify(Object.keys(commands))) throw new Error('unexpected workflow jobs or execution route');
  for (let i = 0; i < matches.length; i++) {
    const name = matches[i][1];
    const block = jobsBlock.slice(matches[i].index + matches[i][0].length, matches[i + 1]?.index).trimEnd();
    const defaults = name === 'contracts' ? '    defaults:\n      run:\n        working-directory: .\n' : '';
    const hold = name === 'package' ? '    if: false # Release hold: future owner confirmation and distinct output strategy required.\n' : '';
    const stepName = { contracts: 'Verify Copilot customization contracts', scenarios: 'Verify Copilot contract scenarios', guide: 'Verify VSIX packaging guide', package: 'Package Toolkit (disabled)' }[name];
    const expected = `\n${hold}    runs-on: ubuntu-latest\n${defaults}    steps:\n      - name: Check out Toolkit\n        uses: actions/checkout@v4\n      - name: Set up Node.js\n        uses: actions/setup-node@v4\n        with:\n          node-version: 22.14.0\n      - name: ${stepName}\n        run: ${commands[name]}`;
    if (block !== expected) throw new Error(`unsupported or unsafe ${name} job/step structure`);
  }
  return true;
}
module.exports = { checkWorkflow };
