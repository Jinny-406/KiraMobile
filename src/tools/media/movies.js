'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const MOVIES_FILE = path.join(config.CONFIG_DIR, 'movies.json');

function load() {
  if (!fs.existsSync(MOVIES_FILE)) {
    return { watched: [], favorites: [], toWatch: [], recommendations: [], created: new Date().toISOString() };
  }
  try { return JSON.parse(fs.readFileSync(MOVIES_FILE, 'utf8')); }
  catch { return {}; }
}

function save(data) {
  fs.writeFileSync(MOVIES_FILE, JSON.stringify(data, null, 2));
}

function addWatched(title, rating, genre) {
  const data = load();
  if (!data.watched.find(m => m.title === title)) {
    data.watched.push({ title, rating, genre, watchedAt: new Date().toISOString() });
    save(data);
  }
  return 'added to watched';
}

function addFavorite(title, genre) {
  const data = load();
  if (!data.favorites.find(m => m.title === title)) {
    data.favorites.push({ title, genre, favoritedAt: new Date().toISOString() });
    save(data);
  }
  return 'added to favorites';
}

function addToWatch(title, genre) {
  const data = load();
  if (!data.toWatch.find(m => m.title === title)) {
    data.toWatch.push({ title, genre, addedAt: new Date().toISOString() });
    save(data);
  }
  return 'added to watch list';
}

function getWatched(limit) {
  const data = load();
  return data.watched.slice(0, limit || 20).map(m => `${m.title} [${m.rating || '?'}]`).join('\n') || 'none';
}

function getFavorites(limit) {
  const data = load();
  return data.favorites.slice(0, limit || 20).map(m => m.title).join('\n') || 'none';
}

function getToWatch(limit) {
  const data = load();
  return data.toWatch.slice(0, limit || 20).map(m => m.title).join('\n') || 'none';
}

function getGenres() {
  const data = load();
  const genres = {};
  data.watched.forEach(m => {
    if (m.genre) genres[m.genre] = (genres[m.genre] || 0) + 1;
  });
  return Object.entries(genres).sort((a, b) => b[1] - a[1]).map(([g, c]) => `${g}: ${c}`).join('\n');
}

function getRecommendation() {
  const genres = getGenres();
  if (!genres) return 'Watch something new!';
  return `Based on your taste: ${genres.split('\n')[0]}`;
}

registry.register('movie_watched', async ({ title, rating, genre }) => {
  if (!title) return 'error: title required';
  return addWatched(title, rating, genre);
}, 'add watched movie. args: title, rating (optional 1-10), genre (optional)');

registry.register('movie_favorite', async ({ title, genre }) => {
  if (!title) return 'error: title required';
  return addFavorite(title, genre);
}, 'add favorite movie. args: title, genre (optional)');

registry.register('movie_towatch', async ({ title, genre }) => {
  if (!title) return 'error: title required';
  return addToWatch(title, genre);
}, 'add to watch list. args: title, genre (optional)');

registry.register('movie_watched_list', async ({ limit }) => {
  return getWatched(limit) || 'none';
}, 'list watched. args: limit');

registry.register('movie_favorites_list', async ({ limit }) => {
  return getFavorites(limit) || 'none';
}, 'list favorites. args: limit');

registry.register('movie_towatch_list', async ({ limit }) => {
  return getToWatch(limit) || 'none';
}, 'list to watch. args: limit');

registry.register('movie_genres', async () => {
  return getGenres() || 'no data';
}, 'get preferred genres');

registry.register('movie_recommend', async () => {
  return getRecommendation();
}, 'get recommendation');

module.exports = { addWatched, addFavorite, addToWatch, getWatched, getFavorites, getRecommendation };