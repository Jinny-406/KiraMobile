'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../config');
const registry = require('./registry');

const TRIGGER_FILE = path.join(config.CONFIG_DIR, 'triggers.json');

function load() {
  if (!fs.existsSync(TRIGGER_FILE)) {
    return { triggers: [], history: [], enabled: true };
  }
  try { return JSON.parse(fs.readFileSync(TRIGGER_FILE, 'utf8')); }
  catch { return { triggers: [], history: [], enabled: true }; }
}

function save(data) {
  fs.writeFileSync(TRIGGER_FILE, JSON.stringify(data, null, 2));
}

function add(name, condition, action) {
  const data = load();
  data.triggers.push({ name, condition, action, added: new Date().toISOString(), enabled: true });
  save(data);
  return `trigger added: ${name}`;
}

function list() {
  const data = load();
  return data.triggers.map(t => `${t.name}: ${t.condition} → ${t.action}`).join('\n') || 'no triggers';
}

function enable(name) {
  const data = load();
  const t = data.triggers.find(t => t.name === name);
  if (t) { t.enabled = true; save(data); return 'enabled'; }
  return 'not found';
}

function disable(name) {
  const data = load();
  const t = data.triggers.find(t => t.name === name);
  if (t) { t.enabled = false; save(data); return 'disabled'; }
  return 'not found';
}

function checkAllTriggers(message) {
  const data = load();
  const triggered = [];
  for (const t of data.triggers) {
    if (!t.enabled) continue;
    if (t.condition.type === 'keyword' && message.toLowerCase().includes(t.condition.value)) {
      triggered.push(t);
    } else if (t.condition.type === 'time' && matchesTime(t.condition.value)) {
      triggered.push(t);
    }
  }
  return triggered;
}

function matchesTime(condition) {
  if (condition === 'morning' && new Date().getHours() === 8) return true;
  if (condition === 'night' && new Date().getHours() === 22) return true;
  return false;
}

registry.register('trigger_add', async ({ name, conditionType, conditionValue, action }) => {
  if (!name || !conditionType || !action) return 'error: name, conditionType, action required';
  return add(name, { type: conditionType, value: conditionValue }, action);
}, 'add trigger. args: name, conditionType (keyword/time), conditionValue, action');

registry.register('trigger_list', async () => list(), 'list triggers');

registry.register('trigger_enable', async ({ name }) => {
  if (!name) return 'error: name required';
  return enable(name);
}, 'enable trigger. args: name');

registry.register('trigger_disable', async ({ name }) => {
  if (!name) return 'error: name required';
  return disable(name);
}, 'disable trigger. args: name');

module.exports = { add, list, checkAllTriggers };