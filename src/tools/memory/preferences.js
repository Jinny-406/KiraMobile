'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const PREFS_FILE = path.join(config.CONFIG_DIR, 'preferences.json');
let _cache = null;

function load() {
  if (_cache) return _cache;
  if (!fs.existsSync(PREFS_FILE)) {
    _cache = { created: new Date().toISOString(), updated: null, preferences: {}, learnedPatterns: [] };
    return _cache;
  }
  try { _cache = JSON.parse(fs.readFileSync(PREFS_FILE, 'utf8')); }
  catch { _cache = {}; }
  return _cache;
}

function save(data) {
  data.updated = new Date().toISOString();
  _cache = data;
  fs.writeFileSync(PREFS_FILE, JSON.stringify(data, null, 2));
}

function setPref(key, value) {
  const prefs = load();
  prefs.preferences[key] = { value, at: new Date().toISOString() };
  save(prefs);
  return `preference set: ${key} = ${value}`;
}

function getPref(key) {
  const prefs = load();
  return prefs.preferences[key]?.value || null;
}

function learnPattern(input, behavior) {
  const prefs = load();
  prefs.learnedPatterns.push({ input: input.toLowerCase(), behavior, at: new Date().toISOString() });
  if (prefs.learnedPatterns.length > 50) prefs.learnedPatterns = prefs.learnedPatterns.slice(-50);
  save(prefs);
  return `pattern learned: "${input}" → ${behavior}`;
}

function getMatch(input) {
  const prefs = load();
  const normalized = input.toLowerCase();
  return prefs.learnedPatterns.find(p => normalized.includes(p.input));
}

function getAllPrefs() {
  const prefs = load();
  return JSON.stringify(prefs.preferences, null, 2);
}

registry.register('preference_set', async ({ key, value }) => {
  if (!key || value === undefined) return 'error: key and value required';
  return setPref(key, value);
}, 'set a preference. args: key, value');

registry.register('preference_get', async ({ key }) => {
  if (!key) return 'error: key required';
  const val = getPref(key);
  return val || 'not set';
}, 'get a preference. args: key');

registry.register('preference_learn', async ({ input, behavior }) => {
  if (!input || !behavior) return 'error: input and behavior required';
  return learnPattern(input, behavior);
}, 'learn a behavior pattern. args: input, behavior');

registry.register('preferences_list', async () => {
  return getAllPrefs();
}, 'list all preferences');

module.exports = { load, save, setPref, getPref, learnPattern, getMatch, getAllPrefs };