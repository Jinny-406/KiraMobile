'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const DREAMS_FILE = path.join(config.CONFIG_DIR, 'dreams.json');
let _cache = null;

function load() {
  if (_cache) return _cache;
  if (!fs.existsSync(DREAMS_FILE)) {
    _cache = { created: new Date().toISOString(), dreams: [] };
    return _cache;
  }
  try { _cache = JSON.parse(fs.readFileSync(DREAMS_FILE, 'utf8')); }
  catch { _cache = {}; }
  return _cache;
}

function save(data) {
  _cache = data;
  fs.writeFileSync(DREAMS_FILE, JSON.stringify(data, null, 2));
}

function record(dream, interpretation) {
  const data = load();
  data.dreams.unshift({ dream, interpretation, recorded: new Date().toISOString() });
  if (data.dreams.length > 100) data.dreams = data.dreams.slice(0, 100);
  save(data);
  return 'dream recorded';
}

function getRecent(limit) {
  const data = load();
  return data.dreams.slice(0, limit || 10).map(d => `${d.recorded.slice(0, 10)}: ${d.dream}`).join('\n');
}

function search(query) {
  const data = load();
  return data.dreams.filter(d => d.dream.toLowerCase().includes(query.toLowerCase()) || d.interpretation?.toLowerCase().includes(query.toLowerCase()));
}

registry.register('dream_record', async ({ dream, interpretation }) => {
  if (!dream) return 'error: dream required';
  return record(dream, interpretation);
}, 'record a dream. args: dream, interpretation (optional)');

registry.register('dream_recent', async ({ limit }) => {
  return getRecent(limit) || 'no dreams recorded';
}, 'get recent dreams. args: limit (optional)');

registry.register('dream_search', async ({ query }) => {
  if (!query) return 'error: query required';
  const results = search(query);
  return results.length ? results.map(d => d.dream).join('\n') : 'no matches';
}, 'search dreams. args: query');

module.exports = { record, getRecent, search };