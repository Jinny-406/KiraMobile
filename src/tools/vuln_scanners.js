'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');
const { ensureTool } = require('./tool_installer');

// Nuclei - Fast vulnerability scanner
registry.register('nuclei_scan', async ({ target, templates }) => {
  await ensureTool('nuclei', 'nuclei', 'pkg');
  const tmpl = templates ? `-t ${templates}` : '-t cves,vulnerabilities,exposures';
  try {
    return execSync(`nuclei -u ${target} ${tmpl} -silent`).toString();
  } catch (e) { return `Nuclei error: ${e.message}`; }
}, 'vulnerability scanner. args: target, templates (optional)');

// Nuclei template update
registry.register('nuclei_update', async () => {
  await ensureTool('nuclei', 'nuclei', 'pkg');
  try {
    return execSync('nuclei -update-templates').toString();
  } catch (e) { return `Update error: ${e.message}`; }
}, 'update nuclei templates');

// SearchSploit - Exploit database
registry.register('searchsploit', async ({ query, exploit_type }) => {
  await ensureTool('searchsploit', 'exploitdb', 'pkg');
  const type = exploit_type ? `-t ${exploit_type}` : '';
  try {
    return execSync(`searchsploit ${type} "${query}"`).toString();
  } catch (e) { return `SearchSploit error: ${e.message}`; }
}, 'search Exploit-DB. args: query, exploit_type (optional)');

// Sherlock - Username finder
registry.register('sherlock_username', async ({ username }) => {
  const sherlockPath = '/data/data/com.termux/files/home/sherlock';
  if (!require('fs').existsSync(sherlockPath)) {
    execSync('git clone https://github.com/sherlock-project/sherlock.git ~/sherlock', { stdio: 'inherit' });
    execSync('pip install -r ~/sherlock/requirements.txt', { stdio: 'inherit' });
  }
  try {
    return execSync(`python ~/sherlock/sherlock.py ${username}`).toString();
  } catch (e) { return `Sherlock error: ${e.message}`; }
}, 'find username across social networks. args: username');

module.exports = {};
