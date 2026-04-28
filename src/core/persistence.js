'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const HISTORY_FILE = path.join(os.homedir(), '.droidclaw', 'history.json');

function ensureDir() {
  const dir = path.dirname(HISTORY_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadHistory() {
  ensureDir();
  if (!fs.existsSync(HISTORY_FILE)) {
    return [];
  }
  try {
    const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('[persistence] failed to load history:', e.message);
    return [];
  }
}

function saveHistory(history) {
  ensureDir();
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (e) {
    console.error('[persistence] failed to save history:', e.message);
  }
}

function appendMessage(role, content) {
  const history = loadHistory();
  history.push({ role, content, timestamp: new Date().toISOString() });
  saveHistory(history);
}

function clearHistory() {
  ensureDir();
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2));
  } catch (e) {
    console.error('[persistence] failed to clear history:', e.message);
  }
}

module.exports = { loadHistory, saveHistory, appendMessage, clearHistory };
