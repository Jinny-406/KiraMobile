'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const JOKES_FILE = path.join(config.CONFIG_DIR, 'inside_jokes.json');
let _cache = null;

function load() {
  if (_cache) return _cache;
  if (!fs.existsSync(JOKES_FILE)) {
    _cache = { created: new Date().toISOString(), jokes: [] };
    return _cache;
  }
  try { _cache = JSON.parse(fs.readFileSync(JOKES_FILE, 'utf8')); }
  catch { _cache = {}; }
  return _cache;
}

function save(data) {
  _cache = data;
  fs.writeFileSync(JOKES_FILE, JSON.stringify(data, null, 2));
}

function addJoke(joke, context) {
  const data = load();
  if (!data.jokes.find(j => j.joke === joke)) {
    data.jokes.unshift({ joke, context, triggered: 0, lastTriggered: null, added: new Date().toISOString() });
    if (data.jokes.length > 50) data.jokes = data.jokes.slice(0, 50);
    save(data);
    return 'joke added';
  }
  return 'joke already exists';
}

function triggerJoke(joke) {
  const data = load();
  const found = data.jokes.find(j => j.joke === joke || joke.includes(j.joke));
  if (found) {
    found.triggered++;
    found.lastTriggered = new Date().toISOString();
    save(data);
    return found.context;
  }
  return null;
}

function getRandom() {
  const data = load();
  if (!data.jokes.length) return null;
  const random = data.jokes[Math.floor(Math.random() * data.jokes.length)];
  random.triggered++;
  random.lastTriggered = new Date().toISOString();
  save(data);
  return random.joke;
}

function list() {
  const data = load();
  return data.jokes.map(j => `${j.joke} (x${j.triggered})`).join('\n');
}

function search(query) {
  const data = load();
  return data.jokes.filter(j => j.joke.toLowerCase().includes(query.toLowerCase()) || j.context?.toLowerCase().includes(query.toLowerCase()));
}

registry.register('joke_add', async ({ joke, context }) => {
  if (!joke) return 'error: joke required';
  return addJoke(joke, context);
}, 'add an inside joke. args: joke, context');

registry.register('joke_trigger', async ({ joke }) => {
  if (!joke) return 'error: joke required';
  return triggerJoke(joke) || 'not found';
}, 'trigger an inside joke. args: joke');

registry.register('joke_random', async () => {
  return getRandom() || 'no jokes yet';
}, 'get random inside joke');

registry.register('joke_list', async () => {
  return list() || 'no inside jokes';
}, 'list all inside jokes');

module.exports = { addJoke, triggerJoke, getRandom, list, search };