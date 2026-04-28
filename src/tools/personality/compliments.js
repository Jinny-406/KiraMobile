'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const COMPLIMENTS_FILE = path.join(config.CONFIG_DIR, 'compliments.json');

const DEFAULT_COMPLIMENTS = [
  "You're incredibly thoughtful.",
  "Your determination is inspiring.",
  "You have such a good heart.",
  "The way you handle things is impressive.",
  "Your creativity knows no bounds.",
  "You make everyone around you better.",
  "Your laugh is contagious.",
  "You see things others miss.",
  "Your kindness makes a difference.",
  "You're stronger than you know.",
  "Your ideas are always so interesting.",
  "The way you care about others is beautiful.",
  "You light up any room.",
  "Your stubbornness is actually perseverance — it's a virtue.",
  "You deserve all the good things coming your way."
];

function load() {
  if (!fs.existsSync(COMPLIMENTS_FILE)) {
    fs.writeFileSync(COMPLIMENTS_FILE, JSON.stringify(DEFAULT_COMPLIMENTS, null, 2));
    return DEFAULT_COMPLIMENTS;
  }
  try { return JSON.parse(fs.readFileSync(COMPLIMENTS_FILE, 'utf8')); }
  catch { return DEFAULT_COMPLIMENTS; }
}

function save(data) {
  fs.writeFileSync(COMPLIMENTS_FILE, JSON.stringify(data, null, 2));
}

function getRandom() {
  const compliments = load();
  return compliments[Math.floor(Math.random() * compliments.length)];
}

function add(compliment) {
  const compliments = load();
  if (!compliments.includes(compliment)) {
    compliments.push(compliment);
    save(compliments);
    return 'compliment added';
  }
  return 'already exists';
}

function remove(compliment) {
  const compliments = load();
  const idx = compliments.indexOf(compliment);
  if (idx > -1) {
    compliments.splice(idx, 1);
    save(compliments);
    return 'compliment removed';
  }
  return 'not found';
}

function list() {
  return load().join('\n');
}

function getPersonalized(userFacts) {
  const compliments = load();
  const personalized = [];
  
  if (userFacts?.work?.success) {
    personalized.push("Your work ethic is amazing — you earned this.");
  }
  if (userFacts?.hobbies?.length > 0) {
    personalized.push(`Your passion for ${userFacts.hobbies[0]} shows how dedicated you are.`);
  }
  
  if (personalized.length > 0) {
    return [...personalized, ...compliments].sort(() => Math.random() - 0.5);
  }
  
  return compliments;
}

registry.register('compliment', async () => {
  return getRandom();
}, 'get a random compliment');

registry.register('compliment_add', async ({ compliment }) => {
  if (!compliment) return 'error: compliment required';
  return add(compliment);
}, 'add a compliment. args: compliment');

registry.register('compliment_remove', async ({ compliment }) => {
  if (!compliment) return 'error: compliment required';
  return remove(compliment);
}, 'remove a compliment. args: compliment');

registry.register('compliments_list', async () => {
  return list();
}, 'list all compliments');

module.exports = { getRandom, add, remove, getPersonalized };