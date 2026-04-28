'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../config');
const registry = require('./registry');

const CHECKIN_FILE = path.join(config.CONFIG_DIR, 'checkins.json');

const DEFAULT_CHECKINS = [
  "Hey! How are you feeling right now?",
  "Everything okay? Been a while since we talked.",
  "You seem quiet. Everything alright?",
  "What's on your mind?",
  "Need anything from me?"
];

function load() {
  if (!fs.existsSync(CHECKIN_FILE)) {
    return { checkins: DEFAULT_CHECKINS, history: [], enabled: true, interval: 30 };
  }
  try { return JSON.parse(fs.readFileSync(CHECKIN_FILE, 'utf8')); }
  catch { return { checkins: DEFAULT_CHECKINS, history: [], enabled: true, interval: 30 }; }
}

function save(data) {
  fs.writeFileSync(CHECKIN_FILE, JSON.stringify(data, null, 2));
}

function getRandom() {
  const data = load();
  return data.checkins[Math.floor(Math.random() * data.checkins.length)];
}

function recordCheckin(response) {
  const data = load();
  data.history.push({ response, at: new Date().toISOString() });
  if (data.history.length > 50) data.history = data.history.slice(-50);
  save(data);
  return 'check-in recorded';
}

function enable() {
  const data = load(); data.enabled = true; save(data);
  return 'enabled';
}

function disable() {
  const data = load(); data.enabled = false; save(data);
  return 'disabled';
}

function isEnabled() {
  return load().enabled;
}

function getInterval() {
  return load().interval;
}

function getHistory() {
  const data = load();
  return data.history.slice(-10).map(c => `${c.at.slice(0, 16)}: ${c.response}`).join('\n');
}

function addCheckin(text) {
  const data = load();
  if (!data.checkins.includes(text)) {
    data.checkins.push(text);
    save(data);
    return 'added';
  }
  return 'already exists';
}

registry.register('checkin', async () => getRandom(), 'get check-in prompt');

registry.register('checkin_record', async ({ response }) => {
  if (!response) return 'error: response required';
  return recordCheckin(response);
}, 'record check-in response. args: response');

registry.register('checkin_enable', async () => enable(), 'enable auto check-ins');

registry.register('checkin_disable', async () => disable(), 'disable auto check-ins');

registry.register('checkin_add', async ({ text }) => {
  if (!text) return 'error: text required';
  return addCheckin(text);
}, 'add check-in. args: text');

registry.register('checkin_history', async () => getHistory() || 'no history', 'get check-in history');

module.exports = { getRandom, recordCheckin, isEnabled, getInterval };