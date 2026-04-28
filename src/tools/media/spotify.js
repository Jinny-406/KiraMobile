'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const SPOTIFY_FILE = path.join(config.CONFIG_DIR, 'spotify.json');

function load() {
  if (!fs.existsSync(SPOTIFY_FILE)) {
    return { accessToken: null, refreshToken: null, deviceId: null, current: null, history: [], liked: [], created: new Date().toISOString() };
  }
  try { return JSON.parse(fs.readFileSync(SPOTIFY_FILE, 'utf8')); }
  catch { return {}; }
}

function save(data) {
  fs.writeFileSync(SPOTIFY_FILE, JSON.stringify(data, null, 2));
}

function setCredentials(accessToken, refreshToken) {
  const data = load();
  data.accessToken = accessToken;
  data.refreshToken = refreshToken;
  save(data);
  return 'credentials set';
}

function setCurrentTrack(track) {
  const data = load();
  data.current = track;
  save(data);
}

function addToHistory(track) {
  const data = load();
  data.history.unshift({ ...track, playedAt: new Date().toISOString() });
  if (data.history.length > 100) data.history = data.history.slice(0, 100);
  save(data);
}

function likeTrack(track) {
  const data = load();
  if (!data.liked.find(t => t.id === track.id)) {
    data.liked.push({ ...track, likedAt: new Date().toISOString() });
    save(data);
  }
  return 'liked';
}

function getHistory(limit) {
  const data = load();
  return data.history.slice(0, limit || 20).map(t => `${t.name} - ${t.artist}`).join('\n') || 'no history';
}

function getLiked(limit) {
  const data = load();
  return data.liked.slice(0, limit || 20).map(t => `${t.name} - ${t.artist}`).join('\n') || 'no liked songs';
}

function getMostPlayed(limit) {
  const data = load();
  const counts = {};
  data.history.forEach(t => {
    const key = `${t.name} - ${t.artist}`;
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit || 10).map(([song, count]) => `${song} (${count}x)`).join('\n');
}

function getFavorites() {
  const data = load();
  return data.liked.slice(0, 10).map(t => `${t.name} - ${t.artist}`).join('\n') || 'no favorites';
}

function isConfigured() {
  const data = load();
  return !!data.accessToken;
}

registry.register('spotify_now', async ({ name, artist }) => {
  if (!name) return JSON.stringify(load().current);
  setCurrentTrack({ name, artist });
  return 'playing';
}, 'set/get current track. args: name, artist');

registry.register('spotify_history', async ({ limit }) => {
  return getHistory(limit) || 'no history';
}, 'get play history. args: limit');

registry.register('spotify_like', async ({ name, artist, id }) => {
  if (!name) return 'error: name required';
  return likeTrack({ name, artist, id });
}, 'like a song. args: name, artist, id (optional)');

registry.register('spotify_liked', async ({ limit }) => {
  return getLiked(limit) || 'no liked songs';
}, 'get liked songs. args: limit');

registry.register('spotify_most_played', async ({ limit }) => {
  return getMostPlayed(limit) || 'no data';
}, 'get most played. args: limit');

registry.register('spotify_favorites', async () => {
  return getFavorites();
}, 'get top favorites');

registry.register('spotify_config', async ({ accessToken, refreshToken }) => {
  if (!accessToken) return isConfigured() ? 'configured' : 'not configured';
  return setCredentials(accessToken, refreshToken);
}, 'configure spotify. args: accessToken, refreshToken');

module.exports = { setCurrentTrack, addToHistory, likeTrack, getHistory, getMostPlayed, isConfigured };