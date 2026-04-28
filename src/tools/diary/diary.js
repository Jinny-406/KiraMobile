'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const DIARY_DIR = path.join(config.CONFIG_DIR, 'diary');
const INDEX_FILE = path.join(DIARY_DIR, 'index.json');

function ensureDir() {
  if (!fs.existsSync(DIARY_DIR)) fs.mkdirSync(DIARY_DIR, { recursive: true });
}

function loadIndex() {
  ensureDir();
  if (!fs.existsSync(INDEX_FILE)) {
    return { entries: [], relationships: [], milestones: [] };
  }
  try { return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8')); }
  catch { return { entries: [], relationships: [], milestones: [] }; }
}

function saveIndex(data) {
  fs.writeFileSync(INDEX_FILE, JSON.stringify(data, null, 2));
}

function getEntryPath(date) {
  return path.join(DIARY_DIR, `${date}.txt`);
}

function writeEntry(mood, tags, content) {
  const date = new Date().toISOString().slice(0, 10);
  const entryPath = getEntryPath(date);
  const entry = `=== ${date} ===
Mood: ${mood || 'neutral'}
Tags: ${(tags || []).join(', ')}

${content}

=== Entry End ===

`;

  ensureDir();
  fs.appendFileSync(entryPath, entry, 'utf8');

  const index = loadIndex();
  index.entries.unshift({ date, mood, tags: tags || [], preview: content.slice(0, 100) });
  saveIndex(index);

  return 'entry written';
}

function readEntry(date) {
  const entryPath = getEntryPath(date);
  if (fs.existsSync(entryPath)) {
    return fs.readFileSync(entryPath, 'utf8');
  }
  return null;
}

function readRecent(limit) {
  const index = loadIndex();
  return index.entries.slice(0, limit || 10).map(e => `${e.date} [${e.mood}]: ${e.preview}`).join('\n');
}

function searchByTag(tag) {
  const index = loadIndex();
  return index.entries.filter(e => e.tags.includes(tag));
}

function searchByMood(mood) {
  const index = loadIndex();
  return index.entries.filter(e => e.mood === mood);
}

function getStats() {
  const index = loadIndex();
  const moods = {};
  index.entries.forEach(e => { moods[e.mood] = (moods[e.mood] || 0) + 1; });
  return { total: index.entries.length, moods };
}

function addRelationship(status, note) {
  const index = loadIndex();
  index.relationships.push({ status, note, at: new Date().toISOString() });
  saveIndex(index);
  return 'relationship note added';
}

function getRelationship() {
  const index = loadIndex();
  return index.relationships[0] || null;
}

function addMilestone(title, description) {
  const index = loadIndex();
  index.milestones.unshift({ title, description, at: new Date().toISOString() });
  saveIndex(index);
  return 'milestone added';
}

function getMilestones() {
  const index = loadIndex();
  return index.milestones;
}

registry.register('diary_write', async ({ mood, tags, content }) => {
  if (!content) return 'error: content required';
  return writeEntry(mood, tags ? tags.split(',').map(t => t.trim()) : [], content);
}, 'write diary entry. args: mood (optional), tags (optional comma-separated), content');

registry.register('diary_read', async ({ date }) => {
  const d = date || new Date().toISOString().slice(0, 10);
  const entry = readEntry(d);
  return entry || 'no entry for that date';
}, 'read diary entry. args: date (optional, YYYY-MM-DD)');

registry.register('diary_recent', async ({ limit }) => {
  return readRecent(limit) || 'no entries';
}, 'get recent entries. args: limit (optional)');

registry.register('diary_search_tag', async ({ tag }) => {
  if (!tag) return 'error: tag required';
  return searchByTag(tag).map(e => `${e.date}: ${e.preview}`).join('\n') || 'no matches';
}, 'search by tag. args: tag');

registry.register('diary_milestone_add', async ({ title, description }) => {
  if (!title) return 'error: title required';
  return addMilestone(title, description);
}, 'add milestone. args: title, description');

registry.register('diary_milestones', async () => {
  return getMilestones().map(m => `${m.title}: ${m.description}`).join('\n') || 'no milestones';
}, 'list milestones');

registry.register('diary_stats', async () => {
  const stats = getStats();
  return `Total entries: ${stats.total}\nMoods: ${JSON.stringify(stats.moods)}`;
}, 'get diary stats');

module.exports = { writeEntry, readEntry, readRecent, searchByTag, addMilestone, getMilestones, addRelationship, getRelationship };