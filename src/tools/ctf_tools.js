'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');
const { ensureTool } = require('./tool_installer');

// Gobuster - Directory bruteforce
registry.register('gobuster_scan', async ({ url, wordlist }) => {
  await ensureTool('gobuster', 'gobuster', 'pkg');
  const wl = wordlist || '/data/data/com.termux/files/usr/share/wordlists/dirb/common.txt';
  try {
    return execSync(`gobuster dir -u ${url} -w ${wl}`).toString();
  } catch (e) { return `Gobuster error: ${e.message}`; }
}, 'directory bruteforce. args: url, wordlist (optional)');

// Feroxbuster - Fast web fuzzer
registry.register('feroxbuster_scan', async ({ url, wordlist }) => {
  try {
    const result = execSync(`pkg list-installed | grep feroxbuster`).toString();
    if (!result) return 'Feroxbuster not installed. Install from GitHub releases.';
    const wl = wordlist || 'common.txt';
    return execSync(`feroxbuster -u ${url} -w ${wl}`).toString();
  } catch (e) { return `Feroxbuster error: ${e.message}`; }
}, 'fast web fuzzer. args: url, wordlist (optional)');

// SecLists - Wordlist collection
registry.register('seclists_install', async () => {
  const seclistsDir = `${require('os').homedir()}/SecLists`;
  if (require('fs').existsSync(seclistsDir)) return `SecLists already installed at ${seclistsDir}`;
  try {
    return execSync(`git clone --depth 1 https://github.com/danielmiessler/SecLists.git ${seclistsDir}`).toString();
  } catch (e) { return `SecLists error: ${e.message}`; }
}, 'install SecLists wordlists (huge collection)');

// Rustscan - Fast port scanner
registry.register('rustscan_scan', async ({ target }) => {
  try {
    return execSync(`rustscan -a ${target} --ulimit 5000`).toString();
  } catch (e) { return `Rustscan not installed. Install: pkg install rustscan`; }
}, 'fast port scanner in Rust. args: target');

// Whatportis - Common ports lookup
registry.register('whatportis_lookup', async ({ port }) => {
  try {
    const result = execSync(`curl -s "https://whatportis.com/api/port/${port}"`).toString();
    return result;
  } catch (e) { return `Whatportis error: ${e.message}`; }
}, 'lookup common port usage. args: port');

// Cewl - Custom wordlist generator
registry.register('cewl_generate', async ({ url, depth, minLen }) => {
  await ensureTool('cewl', 'cewl', 'pkg');
  const d = depth || 2;
  const min = minLen || 3;
  try {
    return execSync(`cewl -d ${d} -m ${min} -w wordlist.txt "${url}"`).toString();
  } catch (e) { return `Cewl error: ${e.message}`; }
}, 'generate wordlist from website. args: url, depth, minLen');

// Dirsearch - Web path scanner
registry.register('dirsearch_scan', async ({ url, extensions }) => {
  const dirsearchDir = `${require('os').homedir()}/dirsearch`;
  if (!require('fs').existsSync(dirsearchDir)) {
    execSync(`git clone https://github.com/maurosdm/dirsearch.git ${dirsearchDir}`, { stdio: 'inherit' });
    execSync(`pip install -r ${dirsearchDir}/requirements.txt`, { stdio: 'inherit' });
  }
  const ext = extensions ? `-e ${extensions}` : '';
  try {
    return execSync(`python ${dirsearchDir}/dirsearch.py -u ${url} ${ext}`).toString();
  } catch (e) { return `Dirsearch error: ${e.message}`; }
}, 'web path scanner. args: url, extensions (optional)');

module.exports = {};
