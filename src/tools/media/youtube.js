'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const YOUTUBE_FILE = path.join(config.CONFIG_DIR, 'youtube.json');

function load() {
  if (!fs.existsSync(YOUTUBE_FILE)) {
    return { history: [], favorites: [], watchTime: 0, created: new Date().toISOString() };
  }
  try { return JSON.parse(fs.readFileSync(YOUTUBE_FILE, 'utf8')); }
  catch { return {}; }
}

function save(data) {
  fs.writeFileSync(YOUTUBE_FILE, JSON.stringify(data, null, 2));
}

function addToHistory(video) {
  const data = load();
  data.history.unshift({ ...video, watchedAt: new Date().toISOString() });
  if (data.history.length > 100) data.history = data.history.slice(0, 100);
  save(data);
}

function favorite(video) {
  const data = load();
  if (!data.favorites.find(v => v.id === video.id)) {
    data.favorites.push({ ...video, favoritedAt: new Date().toISOString() });
    save(data);
  }
  return 'favorited';
}

function getHistory(limit) {
  const data = load();
  return data.history.slice(0, limit || 20).map(v => `${v.title} (${v.duration || '?'})`).join('\n') || 'no history';
}

function getFavorites(limit) {
  const data = load();
  return data.favorites.slice(0, limit || 20).map(v => v.title).join('\n') || 'no favorites';
}

function getMostWatched(limit) {
  const data = load();
  const counts = {};
  data.history.forEach(v => {
    counts[v.title] = (counts[v.title] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit || 10).map(([title, count]) => `${title} (${count}x)`).join('\n');
}

function getCategories() {
  const data = load();
  const categories = {};
  data.history.forEach(v => {
    const cat = v.category || 'unknown';
    categories[cat] = (categories[cat] || 0) + 1;
  });
  return Object.entries(categories).sort((a, b) => b[1] - a[1]).map(([cat, count]) => `${cat}: ${count}`).join('\n');
}

function getStats() {
  const data = load();
  return `Videos: ${data.history.length}\nFavorites: ${data.favorites.length}`;
}

registry.register('youtube_history', async ({ limit }) => {
  return getHistory(limit) || 'no history';
}, 'get watch history. args: limit');

registry.register('youtube_favorite', async ({ title, id, duration }) => {
  if (!title) return 'error: title required';
  return favorite({ title, id, duration });
}, 'favorite a video. args: title, id, duration (optional)');

registry.register('youtube_favorites', async ({ limit }) => {
  return getFavorites(limit) || 'no favorites';
}, 'get favorites. args: limit');

registry.register('youtube_most_watched', async ({ limit }) => {
  return getMostWatched(limit) || 'no data';
}, 'get most watched. args: limit');

registry.register('youtube_categories', async () => {
  return getCategories() || 'no data';
}, 'get watch categories');

registry.register('youtube_stats', async () => {
  return getStats();
}, 'get youtube stats');

registry.register('youtube_watch', async ({ title, id, duration, category }) => {
  if (!title) return 'error: title required';
  return addToHistory({ title, id, duration, category });
}, 'record video watch. args: title, id, duration, category');

module.exports = { addToHistory, favorite, getHistory, getFavorites, getMostWatched };