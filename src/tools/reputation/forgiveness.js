'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const FORGIVE_FILE = path.join(config.CONFIG_DIR, 'forgiveness.json');

const BASE_CHANCE = 0.7;

function load() {
  if (!fs.existsSync(FORGIVE_FILE)) {
    return { grudges: [], forgiven: [], totalForgiven: 0, unforgivable: [] };
  }
  try { return JSON.parse(fs.readFileSync(FORGIVE_FILE, 'utf8')); }
  catch { return { grudges: [], forgiven: [], totalForgiven: 0, unforgivable: [] }; }
}

function save(data) {
  fs.writeFileSync(FORGIVE_FILE, JSON.stringify(data, null, 2));
}

function holdGrudge(against, reason, severity = 1) {
  const data = load();
  data.grudges.push({ against, reason, severity, at: new Date().toISOString() });
  save(data);
  return `grudge held against: ${against}`;
}

function forgive(against) {
  const data = load();
  const idx = data.grudges.findIndex(g => g.against === against);
  if (idx > -1) {
    const grudge = data.grudges.splice(idx, 1)[0];
    data.forgiven.push({ against, at: new Date().toISOString() });
    data.totalForgiven++;
    save(data);
    return `forgiven: ${against}`;
  }
  return 'no grudge found';
}

function checkGrudge(against) {
  const data = load();
  return data.grudges.some(g => g.against === against);
}

function getForgivenessChance(against) {
  const base = BASE_CHANCE;
  if (checkGrudge(against)) {
    return Math.max(0, base - 0.2);
  }
  return base;
}

function listGrudges() {
  const data = load();
  return data.grudges.map(g => `${g.against}: ${g.reason} (severity ${g.severity})`).join('\n') || 'no grudges';
}

function clearGrudges() {
  const data = load();
  data.grudges = [];
  save(data);
  return 'grudges cleared';
}

registry.register('grudge_hold', async ({ against, reason, severity }) => {
  if (!against) return 'error: against required';
  return holdGrudge(against, reason, severity || 1);
}, 'hold a grudge. args: against, reason, severity (optional)');

registry.register('grudge_forgive', async ({ against }) => {
  if (!against) return 'error: against required';
  return forgive(against);
}, 'forgive someone. args: against');

registry.register('grudge_check', async ({ against }) => {
  if (!against) return 'error: against required';
  return checkGrudge(against) ? 'yes' : 'no';
}, 'check if grudge held. args: against');

registry.register('grudge_list', async () => {
  return listGrudges();
}, 'list all grudges');

registry.register('grudge_clear', async () => {
  return clearGrudges();
}, 'clear all grudges (dangerous)');

module.exports = { holdGrudge, forgive, checkGrudge, getForgivenessChance };