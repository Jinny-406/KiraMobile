'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');
const { ensureTool } = require('./tool_installer');

registry.register('hydra_attack', async ({ target, service, username, wordlist }) => {
  await ensureTool('hydra', 'hydra', 'pkg');
  const list = wordlist || '/data/data/com.termux/files/usr/share/wordlists/rockyou.txt';
  try {
    return execSync(`hydra -l ${username} -P ${list} ${target} ${service}`).toString();
  } catch (e) { return `Hydra error: ${e.message}`; }
}, 'login bruteforce. args: target, service, username, wordlist (optional)');

registry.register('john_crack', async ({ hashfile, wordlist }) => {
  await ensureTool('john', 'john', 'pkg');
  const list = wordlist || '/data/data/com.termux/files/usr/share/wordlists/rockyou.txt';
  try {
    return execSync(`john --wordlist=${list} ${hashfile}`).toString();
  } catch (e) { return `John error: ${e.message}`; }
}, 'password hash cracking. args: hashfile, wordlist (optional)');

registry.register('hash_id', async ({ hash }) => {
  await ensureTool('hashid', 'hashid', 'pkg');
  try {
    return execSync(`hashid "${hash}"`).toString();
  } catch (e) { return `HashID error: ${e.message}`; }
}, 'identify hash type. args: hash');

module.exports = {};
