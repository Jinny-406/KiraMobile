'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const APOLOGY_FILE = path.join(config.CONFIG_DIR, 'apology.json');

function load() {
  if (!fs.existsSync(APOLOGY_FILE)) {
    return { apologiesReceived: [], mistakesLearned: [] };
  }
  try { return JSON.parse(fs.readFileSync(APOLOGY_FILE, 'utf8')); }
  catch { return { apologiesReceived: [], mistakesLearned: [] }; }
}

function save(data) {
  fs.writeFileSync(APOLOGY_FILE, JSON.stringify(data, null, 2));
}

function recordApology(reason) {
  const data = load();
  data.apologiesReceived.push({ reason, at: new Date().toISOString() });
  if (data.apologiesReceived.length > 30) data.apologiesReceived = data.apologiesReceived.slice(-30);
  save(data);
  return 'apology recorded';
}

function learnMistake(mistake, fix) {
  const data = load();
  data.mistakesLearned.push({ mistake, fix, learned: new Date().toISOString() });
  if (data.mistakesLearned.length > 20) data.mistakesLearned = data.mistakesLearned.slice(-20);
  save(data);
  return 'mistake learned';
}

function getApologyCount() {
  return load().apologiesReceived.length;
}

function getMistakes() {
  const data = load();
  return data.mistakesLearned;
}

function searchMistake(query) {
  const data = load();
  return data.mistakesLearned.filter(m => m.mistake.toLowerCase().includes(query.toLowerCase()) || m.fix?.toLowerCase().includes(query.toLowerCase()));
}

registry.register('apology_record', async ({ reason }) => {
  if (!reason) return 'error: reason required';
  return recordApology(reason);
}, 'record an apology. args: reason');

registry.register('apology_count', async () => {
  return `${getApologyCount()} apologies`;
}, 'get apology count');

registry.register('mistake_learn', async ({ mistake, fix }) => {
  if (!mistake) return 'error: mistake required';
  return learnMistake(mistake, fix);
}, 'learn from a mistake. args: mistake, fix');

registry.register('mistake_list', async () => {
  return getMistakes().map(m => `${m.mistake} → ${m.fix || 'avoid'}`).join('\n') || 'none';
}, 'list learned mistakes');

module.exports = { recordApology, learnMistake, getApologyCount, getMistakes };