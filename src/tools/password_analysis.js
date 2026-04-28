'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');
const { ensureTool } = require('./tool_installer');

// CrackStation - Online hash lookup (no API key needed for basic)
registry.register('crackstation_lookup', async ({ hash }) => {
  try {
    const result = execSync(`curl -s "https://crackstation.net/crack?hash=${hash}"`).toString();
    return result || 'Hash not found in dictionary';
  } catch (e) { return `CrackStation error: ${e.message}`; }
}, 'lookup hash in online database. args: hash');

// Hashcat benchmark (requires installation)
registry.register('hashcat_benchmark', async () => {
  await ensureTool('hashcat', 'hashcat', 'pkg');
  try {
    return execSync('hashcat --benchmark --force').toString();
  } catch (e) { return `Hashcat error: ${e.message}`; }
}, 'benchmark hashcat performance');

// Generate wordlist from target info
registry.register('cewl_generate', async ({ url, depth, minLen }) => {
  await ensureTool('cewl', 'cewl', 'pkg');
  const d = depth || 2;
  const min = minLen || 3;
  try {
    return execSync(`cewl -d ${d} -m ${min} -w wordlist.txt "${url}"`).toString();
  } catch (e) { return `Cewl error: ${e.message}`; }
}, 'generate wordlist from website. args: url, depth (optional), minLen (optional)');

// Pattern attack generator
registry.register('pattern_generate', async ({ pattern }) => {
  try {
    return execSync(`crunch 6 8 ${pattern || 'abcdef'}`).toString();
  } catch (e) { return `Pattern error: ${e.message}`; }
}, 'generate passwords by pattern. args: pattern (optional, default: abcdef)');

// Keyboard walk detection
registry.register('keyboard_walk', async ({ password }) => {
  const walks = ['qwerty', 'asdf', '123456', 'zxcvb', 'qazwsx'];
  const lower = password.toLowerCase();
  const found = walks.filter(w => lower.includes(w));
  return found.length > 0 ? `Keyboard patterns found: ${found.join(', ')}` : 'No keyboard patterns detected';
}, 'detect keyboard patterns. args: password');

// Rule-based attack generator
registry.register('rules_generate', async ({ base_password, rules }) => {
  const defaultRules = ['capitalize', 'add123', 'add!', 'leet'];
  const activeRules = rules ? rules.split(',') : defaultRules;
  const results = [];
  if (activeRules.includes('capitalize')) results.push(base_password.charAt(0).toUpperCase() + base_password.slice(1));
  if (activeRules.includes('add123')) results.push(base_password + '123');
  if (activeRules.includes('add!')) results.push(base_password + '!');
  if (activeRules.includes('leet')) results.push(base_password.replace(/a/g, '4').replace(/e/g, '3').replace(/i/g, '1'));
  return `Generated variations:\n${results.join('\n')}`;
}, 'generate password variations. args: base_password, rules (optional)');

module.exports = {};
