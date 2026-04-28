'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const SECRETS_FILE = path.join(config.CONFIG_DIR, 'secrets.json');
let _cache = null;

function load() {
  if (_cache) return _cache;
  if (!fs.existsSync(SECRETS_FILE)) {
    _cache = { created: new Date().toISOString(), secrets: {} };
    return _cache;
  }
  try { _cache = JSON.parse(fs.readFileSync(SECRETS_FILE, 'utf8')); }
  catch { _cache = {}; }
  return _cache;
}

function save(data) {
  _cache = data;
  fs.writeFileSync(SECRETS_FILE, JSON.stringify(data, null, 2));
}

function store(secret, content) {
  const data = load();
  data.secrets[secret] = { content, stored: new Date().toISOString() };
  save(data);
  return `secret stored: ${secret}`;
}

function retrieve(secret) {
  const data = load();
  return data.secrets[secret]?.content || null;
}

function list() {
  const data = load();
  return Object.keys(data.secrets);
}

function remove(secret) {
  const data = load();
  if (data.secrets[secret]) {
    delete data.secrets[secret];
    save(data);
    return `secret removed: ${secret}`;
  }
  return 'not found';
}

registry.register('secret_store', async ({ secret, content }) => {
  if (!secret || !content) return 'error: secret and content required';
  return store(secret, content);
}, 'store a secret. args: secret (name), content');

registry.register('secret_retrieve', async ({ secret }) => {
  if (!secret) return 'error: secret required';
  return retrieve(secret) || 'not found';
}, 'retrieve a secret. args: secret');

registry.register('secret_list', async () => {
  const list = list();
  return list.length ? list.join(', ') : 'no secrets stored';
}, 'list all secrets');

registry.register('secret_remove', async ({ secret }) => {
  if (!secret) return 'error: secret required';
  return remove(secret);
}, 'remove a secret. args: secret');

module.exports = { store, retrieve, list, remove };