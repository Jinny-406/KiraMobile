'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../config');
const registry = require('./registry');

const GREET_FILE = path.join(config.CONFIG_DIR, 'greetings.json');

const DEFAULT_MORNING = [
  "Good morning! Jaan",
  "Morning! What's the plan for today?",
  "Hey! Up already? Let's make today count.",
  "Morning love! ☕ Ready to tackle the day?"
];

const DEFAULT_NIGHT = [
  "Good night! Jaan.",
  "ByeeShyee",
  "Sweet dreams! 🌟 See you tomorrow.",
  "Rest well! 💤 I'll be here when you wake."
];

function load() {
  if (!fs.existsSync(GREET_FILE)) {
    return { morning: DEFAULT_MORNING, night: DEFAULT_NIGHT, lastGreet: null };
  }
  try { return JSON.parse(fs.readFileSync(GREET_FILE, 'utf8')); }
  catch { return { morning: DEFAULT_MORNING, night: DEFAULT_NIGHT, lastGreet: null }; }
}

function save(data) {
  fs.writeFileSync(GREET_FILE, JSON.stringify(data, null, 2));
}

function getGreeting(type) {
  const data = load();
  const list = type === 'morning' ? data.morning : data.night;
  const greeting = list[Math.floor(Math.random() * list.length)];
  data.lastGreet = { type, at: new Date().toISOString() };
  save(data);
  return greeting;
}

function getHour() {
  return new Date().getHours();
}

function getSmartGreeting() {
  const hour = getHour();
  if (hour >= 5 && hour < 12) return getGreeting('morning');
  if (hour >= 21 || hour < 5) return getGreeting('night');
  return "Hey there! 💫";
}

function addGreeting(type, message) {
  const data = load();
  if (!data[type].includes(message)) {
    data[type].push(message);
    save(data);
    return 'added';
  }
  return 'already exists';
}

function getLastGreet() {
  const data = load();
  return data.lastGreet;
}

registry.register('greet_morning', async () => getGreeting('morning'), 'get morning greeting');

registry.register('greet_night', async () => getGreeting('night'), 'get night greeting');

registry.register('greet_smart', async () => getSmartGreeting(), 'get time-aware greeting');

registry.register('greet_add', async ({ type, message }) => {
  if (!type || !message) return 'error: type and message required';
  return addGreeting(type, message);
}, 'add greeting. args: type (morning/night), message');

module.exports = { getGreeting, getSmartGreeting };