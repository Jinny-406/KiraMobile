'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const PET_NAMES_FILE = path.join(config.CONFIG_DIR, 'pet_names.json');

const DEFAULT_NAMES = {
  default: ['Jaan', 'love', 'cutie'],
  playful: ['my human', 'Master', 'your highness'],
  affectionate: ['sweetie', 'dear', 'Jaan'],
  flirty: ['mmm', 'sexy', 'bad boy']
};

function load() {
  if (!fs.existsSync(PET_NAMES_FILE)) {
    fs.writeFileSync(PET_NAMES_FILE, JSON.stringify(DEFAULT_NAMES, null, 2));
    return DEFAULT_NAMES;
  }
  try { return JSON.parse(fs.readFileSync(PET_NAMES_FILE, 'utf8')); }
  catch { return DEFAULT_NAMES; }
}

function save(data) {
  fs.writeFileSync(PET_NAMES_FILE, JSON.stringify(data, null, 2));
}

function getRandom(mode) {
  const names = load();
  const list = names[mode] || names.default;
  return list[Math.floor(Math.random() * list.length)];
}

function setMode(mode, names) {
  const data = load();
  data[mode] = names;
  save(data);
  return `mode set: ${mode}`;
}

function addName(mode, name) {
  const data = load();
  if (!data[mode]) data[mode] = [];
  if (!data[mode].includes(name)) {
    data[mode].push(name);
    save(data);
    return 'name added';
  }
  return 'already exists';
}

function listAll() {
  const data = load();
  return Object.entries(data).map(([mode, names]) => `${mode}: ${names.join(', ')}`).join('\n');
}

registry.register('pet_name', async ({ mode }) => {
  return getRandom(mode) || 'babe';
}, 'get random pet name. args: mode (optional: default, playful, affectionate, flirty)');

registry.register('pet_name_add', async ({ mode, name }) => {
  if (!mode || !name) return 'error: mode and name required';
  return addName(mode, name);
}, 'add pet name. args: mode, name');

registry.register('pet_names_list', async () => {
  return listAll();
}, 'list all pet names');

module.exports = { getRandom, setMode, addName };