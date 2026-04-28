'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const PROFILE_FILE = path.join(config.CONFIG_DIR, 'user_profile.json');
let _cache = null;

function load() {
  if (_cache) return _cache;
  if (!fs.existsSync(PROFILE_FILE)) {
    _cache = { name: null, created: new Date().toISOString(), updated: null, facts: [], interests: [], dislikes: [], goals: [], family: {}, work: {}, hobbies: [], about: {} };
    return _cache;
  }
  try { _cache = JSON.parse(fs.readFileSync(PROFILE_FILE, 'utf8')); }
  catch { _cache = {}; }
  return _cache;
}

function save(data) {
  data.updated = new Date().toISOString();
  _cache = data;
  fs.writeFileSync(PROFILE_FILE, JSON.stringify(data, null, 2));
}

function learnFact(key, value, confidence = 0.8) {
  const profile = load();
  const existing = profile.facts.find(f => f.key === key);
  if (existing) {
    existing.value = value;
    existing.confidence = Math.max(existing.confidence, confidence);
    existing.lastSeen = new Date().toISOString();
  } else {
    profile.facts.push({ key, value, confidence, firstSeen: new Date().toISOString(), lastSeen: new Date().toISOString() });
  }
  save(profile);
  return `learned: ${key} = ${value}`;
}

function getFact(key) {
  const profile = load();
  const fact = profile.facts.find(f => f.key === key);
  return fact ? fact.value : null;
}

function getAllFacts() {
  const profile = load();
  return profile.facts.reduce((acc, f) => { acc[f.key] = f.value; return acc; }, {});
}

function learnInterest(interest) {
  const profile = load();
  if (!profile.interests.includes(interest)) {
    profile.interests.push(interest);
  }
  save(profile);
  return `interest added: ${interest}`;
}

function learnDislike(dislike) {
  const profile = load();
  if (!profile.dislikes.includes(dislike)) {
    profile.dislikes.push(dislike);
  }
  save(profile);
  return `dislike added: ${dislike}`;
}

function learnGoal(goal) {
  const profile = load();
  if (!profile.goals.includes(goal)) {
    profile.goals.push(goal);
  }
  save(profile);
  return `goal added: ${goal}`;
}

function learnHobby(hobby) {
  const profile = load();
  if (!profile.hobbies.includes(hobby)) {
    profile.hobbies.push(hobby);
  }
  save(profile);
  return `hobby added: ${hobby}`;
}

function learnAbout(key, value) {
  const profile = load();
  profile.about[key] = value;
  save(profile);
  return `learned about ${key}: ${value}`;
}

function getProfile() {
  const profile = load();
  return `Name: ${profile.name}\nInterests: ${profile.interests.join(', ') || 'unknown'}\nDislikes: ${profile.dislikes.join(', ') || 'unknown'}\nHobbies: ${profile.hobbies.join(', ') || 'unknown'}\nGoals: ${profile.goals.join(', ') || 'unknown'}\nFacts: ${JSON.stringify(profile.about)}`;
}

registry.register('user_profile_get', async () => {
  return getProfile();
}, 'get user profile information');

registry.register('user_profile_learn', async ({ key, value, confidence }) => {
  if (!key || !value) return 'error: key and value required';
  return learnFact(key, value, confidence || 0.8);
}, 'learn a user fact. args: key, value, confidence (optional 0-1)');

registry.register('user_profile_interest', async ({ interest }) => {
  if (!interest) return 'error: interest required';
  return learnInterest(interest);
}, 'add user interest. args: interest');

registry.register('user_profile_dislike', async ({ dislike }) => {
  if (!dislike) return 'error: dislike required';
  return learnDislike(dislike);
}, 'add user dislike. args: dislike');

registry.register('user_profile_hobby', async ({ hobby }) => {
  if (!hobby) return 'error: hobby required';
  return learnHobby(hobby);
}, 'add user hobby. args: hobby');

registry.register('user_profile_goal', async ({ goal }) => {
  if (!goal) return 'error: goal required';
  return learnGoal(goal);
}, 'add user goal. args: goal');

module.exports = { load, save, learnFact, getFact, getAllFacts, learnInterest, learnDislike, learnGoal, learnHobby, learnAbout, getProfile };