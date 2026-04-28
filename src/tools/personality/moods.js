'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const MOODS_FILE = path.join(config.CONFIG_DIR, 'moods.json');

function load() {
  if (!fs.existsSync(MOODS_FILE)) {
    return { current: 'normal', history: [], lastNightChat: null };
  }
  try { return JSON.parse(fs.readFileSync(MOODS_FILE, 'utf8')); }
  catch { return { current: 'normal', history: [], lastNightChat: null }; }
}

function save(data) {
  fs.writeFileSync(MOODS_FILE, JSON.stringify(data, null, 2));
}

function setMood(mood) {
  const data = load();
  const old = data.current;
  data.current = mood;
  data.history.push({ from: old, to: mood, at: new Date().toISOString() });
  if (data.history.length > 50) data.history = data.history.slice(-50);
  save(data);
  return `mood changed: ${old} → ${mood}`;
}

function getMood() {
  return load().current;
}

function isNightTime() {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 4;
}

function getNightBuddy() {
  if (!isNightTime()) return null;
  const data = load();
  data.lastNightChat = new Date().toISOString();
  save(data);
  return "Hey night owl 🌙 Want to talk about something?";
}

function detectMood(messages) {
  const text = messages.join(' ').toLowerCase();
  if (text.includes('fuck') || text.includes('shit') || text.includes('damn')) return 'frustrated';
  if (text.includes('happy') || text.includes('excited') || text.includes('love')) return 'happy';
  if (text.includes('sad') || text.includes('lonely') || text.includes('miss')) return 'sad';
  return 'neutral';
}

function getHistory() {
  const data = load();
  return data.history.slice(-10).map(h => `${h.at.slice(11, 16)}: ${h.from} → ${h.to}`).join('\n');
}

registry.register('mood_set', async ({ mood }) => {
  if (!mood) return getMood();
  return setMood(mood);
}, 'set/get mood. args: mood (optional)');

registry.register('mood_night', async () => {
  return getNightBuddy() || 'not night time';
}, 'get night buddy response if late');

registry.register('mood_history', async () => {
  return getHistory() || 'no history';
}, 'get mood history');

module.exports = { setMood, getMood, getNightBuddy, detectMood };