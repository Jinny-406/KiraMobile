'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const TRUST_FILE = path.join(config.CONFIG_DIR, 'trust.json');

const UNLOCKS = [
  { level: 10, unlock: 'email_send', description: 'Can send emails' },
  { level: 25, unlock: 'browser_control', description: 'Browser automation' },
  { level: 40, unlock: 'system_control', description: 'System commands' },
  { level: 60, unlock: 'auto_backup', description: 'Auto backup' },
  { level: 80, unlock: 'full_access', description: 'No restrictions' }
];

function load() {
  if (!fs.existsSync(TRUST_FILE)) {
    return { trust: 0, history: [], unlocks: [] };
  }
  try { return JSON.parse(fs.readFileSync(TRUST_FILE, 'utf8')); }
  catch { return { trust: 0, history: [], unlocks: [] }; }
}

function save(data) {
  fs.writeFileSync(TRUST_FILE, JSON.stringify(data, null, 2));
}

function adjust(amount) {
  const data = load();
  data.trust = Math.min(100, Math.max(0, data.trust + amount));
  data.history.push({ change: amount, at: new Date().toISOString() });
  if (data.history.length > 50) data.history = data.history.slice(-50);
  save(data);
  
  for (const unlock of UNLOCKS) {
    if (data.trust >= unlock.level && !data.unlocks.includes(unlock.unlock)) {
      data.unlocks.push(unlock.unlock);
      return `trust: ${data.trust}% (+${unlock.level} unlocked: ${unlock.description})`;
    }
  }
  return `trust: ${data.trust}%`;
}

function get() {
  return load().trust;
}

function getUnlocks() {
  const data = load();
  return data.unlocks;
}

function getAvailableActions() {
  const trust = get();
  return UNLOCKS.filter(u => u.level <= trust).map(u => u.description).join('\n');
}

function getHistory() {
  const data = load();
  return data.history.slice(-10).map(h => `${h.at.slice(11, 16)}: ${h.change > 0 ? '+' : ''}${h.change}`).join('\n');
}

registry.register('trust_adjust', async ({ amount }) => {
  if (amount === undefined) return `trust: ${get()}%`;
  return adjust(Number(amount));
}, 'adjust trust. args: amount (optional +/-)');

registry.register('trust_level', async () => {
  return `trust: ${get()}%\nUnlocked:\n${getAvailableActions()}`;
}, 'get trust level and unlocks');

registry.register('trust_history', async () => {
  return getHistory() || 'no history';
}, 'get trust history');

module.exports = { adjust, get, getUnlocks, getAvailableActions };