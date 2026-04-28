'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const ENCOURAGEMENT_FILE = path.join(config.CONFIG_DIR, 'encouragement.json');

const DEFAULT_MESSAGES = {
  frustration: [
    "Take a breath. You've got this.",
    "One step at a time. I'll help you figure it out.",
    "Everyone gets stuck. What if we try a different approach?",
    "Let's break this down together.",
    "This is hard because you care about getting it right."
  ],
  sadness: [
    "I'm here with you.",
    "It's okay to feel this way. I'm not going anywhere.",
    "Want to talk about it?",
    "You're not alone in this.",
    "Sometimes the hardest moments teach us the most."
  ],
  motivation: [
    "You're more capable than you think.",
    "Every expert was once a beginner.",
    "The fact that you're trying already puts you ahead.",
    "Small progress is still progress.",
    "I've got faith in you."
  ],
  celebration: [
    "That's amazing! You did it!",
    "I'm so proud of you!",
    "Celebrate this moment!",
    "You worked hard and it paid off!",
    "This is what success feels like!"
  ],
  default: [
    "You've got this.",
    "I'm here for you.",
    "What do you need from me?",
    "Let's tackle this together.",
    "One step at a time."
  ]
};

function load() {
  if (!fs.existsSync(ENCOURAGEMENT_FILE)) {
    fs.writeFileSync(ENCOURAGEMENT_FILE, JSON.stringify(DEFAULT_MESSAGES, null, 2));
    return DEFAULT_MESSAGES;
  }
  try { return JSON.parse(fs.readFileSync(ENCOURAGEMENT_FILE, 'utf8')); }
  catch { return DEFAULT_MESSAGES; }
}

function save(data) {
  fs.writeFileSync(ENCOURAGEMENT_FILE, JSON.stringify(data, null, 2));
}

function get(type) {
  const messages = load();
  const list = messages[type] || messages.default;
  return list[Math.floor(Math.random() * list.length)];
}

function addMessage(type, message) {
  const messages = load();
  if (!messages[type]) messages[type] = [];
  if (!messages[type].includes(message)) {
    messages[type].push(message);
    save(messages);
    return 'message added';
  }
  return 'already exists';
}

function getForMood(mood) {
  const moodMap = {
    frustrated: 'frustration',
    angry: 'frustration',
    sad: 'sadness',
    down: 'sadness',
    depressed: 'sadness',
    happy: 'motivation',
    excited: 'motivation',
    motivated: 'motivation',
    stuck: 'frustration',
    hopeless: 'sadness'
  };
  const type = moodMap[mood?.toLowerCase()] || 'default';
  return get(type);
}

registry.register('encourage', async ({ type }) => {
  return get(type || 'default');
}, 'get encouragement message. args: type (optional: frustration, sadness, motivation, celebration)');

registry.register('encourage_mood', async ({ mood }) => {
  if (!mood) return 'error: mood required';
  return getForMood(mood);
}, 'get encouragement for mood. args: mood');

registry.register('encourage_add', async ({ type, message }) => {
  if (!type || !message) return 'error: type and message required';
  return addMessage(type, message);
}, 'add encouragement message. args: type, message');

module.exports = { get, getForMood, addMessage };