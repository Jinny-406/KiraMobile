'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');
const { ensureTool } = require('./tool_installer');

// Radare2 - Analyze
registry.register('r2_analyze', async ({ binaryPath, analysisLevel }) => {
  await ensureTool('r2', 'radare2', 'pkg');
  const level = analysisLevel || 'aa';
  try {
    return execSync(`r2 -q -c '${level}; i; q' ${binaryPath}`).toString();
  } catch (e) { return `Radare2 error: ${e.message}`; }
}, 'analyze binary with radare2. args: binaryPath, analysisLevel (optional: a, aa, aaa)');

// Radare2 - Disassemble
registry.register('r2_disassemble', async ({ binaryPath, func, length }) => {
  await ensureTool('r2', 'radare2', 'pkg');
  const len = length || 100;
  const funcCmd = func ? `s ${func};` : '';
  try {
    return execSync(`r2 -q -c 'afl; ${funcCmd} pd ${len}; q' ${binaryPath}`).toString();
  } catch (e) { return `Radare2 error: ${e.message}`; }
}, 'disassemble function. args: binaryPath, function (optional), length (optional)');

// Radare2 - Decompile (with r2dec)
registry.register('r2_decompile', async ({ binaryPath, func }) => {
  await ensureTool('r2', 'radare2', 'pkg');
  const funcCmd = func ? `s ${func};` : '';
  try {
    return execSync(`r2 -q -c '${funcCmd} pdd; q' ${binaryPath}`).toString();
  } catch (e) { return `Radare2 error: ${e.message}`; }
}, 'decompile with r2dec. args: binaryPath, function (optional)');

// Radare2 - List functions
registry.register('r2_functions', async ({ binaryPath }) => {
  await ensureTool('r2', 'radare2', 'pkg');
  try {
    return execSync(`r2 -q -c 'afl; q' ${binaryPath}`).toString();
  } catch (e) { return `Radare2 error: ${e.message}`; }
}, 'list functions in binary. args: binaryPath');

// Radare2 - Strings
registry.register('r2_strings', async ({ binaryPath }) => {
  await ensureTool('r2', 'radare2', 'pkg');
  try {
    return execSync(`r2 -q -c 'iz; q' ${binaryPath}`).toString();
  } catch (e) { return `Radare2 error: ${e.message}`; }
}, 'extract strings from binary. args: binaryPath');

module.exports = {};
