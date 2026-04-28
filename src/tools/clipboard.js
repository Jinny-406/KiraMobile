'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');

const CLIP_HISTORY = [];
const MAX_HISTORY = 20;

function read() {
  try {
    return execSync('powershell -Command "Get-Clipboard"', { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function write(text) {
  try {
    execSync(`powershell -Command "Set-Clipboard -Value '${text.replace(/'/g, "''")}'"`, { encoding: 'utf8' });
    addToHistory(text);
    return 'copied';
  } catch (e) {
    return `error: ${e.message}`;
  }
}

function addToHistory(text) {
  CLIP_HISTORY.unshift({ text, at: new Date().toISOString() });
  if (CLIP_HISTORY.length > MAX_HISTORY) CLIP_HISTORY.pop();
}

function history() {
  return CLIP_HISTORY.map((c, i) => `${i + 1}. ${c.text.slice(0, 50)}${c.text.length > 50 ? '...' : ''}`).join('\n') || 'no history';
}

function clear() {
  try {
    execSync('powershell -Command "Set-Clipboard -Value \\"\\""', { encoding: 'utf8' });
    return 'cleared';
  } catch {
    return 'error';
  }
}

registry.register('clipboard_read', async () => read() || 'empty', 'read clipboard');

registry.register('clipboard_write', async ({ text }) => {
  if (!text) return 'error: text required';
  return write(text);
}, 'write to clipboard. args: text');

registry.register('clipboard_history', async () => history(), 'get clipboard history');

registry.register('clipboard_clear', async () => clear(), 'clear clipboard');

module.exports = { read, write, history };