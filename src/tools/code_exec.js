'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');

async function executeJavascript(code) {
  try {
    const result = eval(code);
    return String(result);
  } catch (e) {
    return `error: ${e.message}`;
  }
}

async function executePython(code, timeout = 10000) {
  try {
    const result = execSync(`python -c "${code.replace(/"/g, '\\"')}"`, { encoding: 'utf8', timeout });
    return result.trim() || 'executed';
  } catch (e) {
    return `error: ${e.message}`;
  }
}

async function executeCommand(command) {
  try {
    const result = execSync(command, { encoding: 'utf8', timeout: 10000 });
    return result.trim() || 'executed';
  } catch (e) {
    return `error: ${e.message}`;
  }
}

registry.register('code_exec', async ({ code, language }) => {
  if (!code) return 'error: code required';
  if (language === 'python') return executePython(code);
  if (language === 'js' || language === 'javascript') return executeJavascript(code);
  return executeCommand(code);
}, 'execute code. args: code, language (optional: python, js, shell)');

registry.register('code_eval', async ({ expression }) => {
  if (!expression) return 'error: expression required';
  return executeJavascript(expression);
}, 'eval JS expression. args: expression');

module.exports = { executeJavascript, executePython, executeCommand };