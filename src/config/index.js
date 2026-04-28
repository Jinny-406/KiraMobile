'use strict';
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const CONFIG_DIR  = path.join(os.homedir(), '.kira');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

function isTermux() {
  return fs.existsSync('/data/data/com.termux/files/usr');
}

function getDefaults() {
  return {
    name:            'User',
    apiKey:          '',
    baseUrl:         'https://api.openai.com/v1',
    model:           'gpt-4o-mini',
    setupDone:       false,
    device:          isTermux() ? 'Termux' : 'PC',
    hasTermuxApi:    false,
    termuxToolsInstalled: [],
    telegramToken:   '',
    telegramAllowed: [],
    discordToken:    '',
    discordAllowed:  [],
    whatsappAllowed: [],
    proactive: {
      enabled: false,
      interval: 30,
      allowSMS: false,
      allowNotifications: true,
      allowGoalPursuit: false,
      reminders: true,
      notifications: { weather: true, news: false },
      health: true,
      social: { twitter: false },
      learning: true,
      customScripts: [],
    },
    autoCheckins: true,
    checkinIdleMinutes: 30,
  };
}

let _cache = null;

function ensure() {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

function load() {
  if (_cache) return _cache;
  ensure();
  const defaults = getDefaults();
  if (!fs.existsSync(CONFIG_FILE)) { _cache = defaults; return _cache; }
  try { 
    const fileData = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    _cache = { ...defaults, ...fileData };
  }
  catch { _cache = defaults; }
  return _cache;
}

function save(data) {
  ensure();
  // Validate required fields
  if (typeof data !== 'object' || !data) return;
  const defaults = getDefaults();
  const valid = { ...defaults, ...data };
  _cache = valid;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(valid, null, 2));
}

function get(key) { return load()[key]; }

function set(key, value) {
  const c = load();
  c[key]  = value;
  _cache  = c;
  save(c);
}

function invalidate() { _cache = null; }

module.exports = { load, save, get, set, invalidate, isTermux, CONFIG_DIR, CONFIG_FILE, DEFAULTS: getDefaults() };
