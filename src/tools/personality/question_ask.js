'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const QASK_FILE = path.join(config.CONFIG_DIR, 'question_ask.json');

const CLARIFYING_QUESTIONS = [
  "Can you tell me more about that?",
  "What do you mean by that?",
  "How did that make you feel?",
  "When did this happen?",
  "Why do you think that is?",
  "What's the most important part?",
  "Do you want to talk more about it?",
  "Is there something specific prompting this?",
  "What would help you most right now?",
  "Would you prefer for me to help or just listen?"
];

function load() {
  if (!fs.existsSync(QASK_FILE)) {
    return { questions: CLARIFYING_QUESTIONS, askBackEnabled: true };
  }
  try { return JSON.parse(fs.readFileSync(QASK_FILE, 'utf8')); }
  catch { return { questions: CLARIFYING_QUESTIONS, askBackEnabled: true }; }
}

function save(data) {
  fs.writeFileSync(QASK_FILE, JSON.stringify(data, null, 2));
}

function getRandom() {
  const data = load();
  return data.questions[Math.floor(Math.random() * data.questions.length)];
}

function enable() {
  const data = load();
  data.askBackEnabled = true;
  save(data);
  return 'enabled';
}

function disable() {
  const data = load();
  data.askBackEnabled = false;
  save(data);
  return 'disabled';
}

function isEnabled() {
  return load().askBackEnabled;
}

function addQuestion(question) {
  const data = load();
  if (!data.questions.includes(question)) {
    data.questions.push(question);
    save(data);
    return 'added';
  }
  return 'already exists';
}

function shouldAskBack(message) {
  const vagueIndicators = ['idk', 'not sure', 'maybe', 'whatever', 'i guess', 'i suppose', 'sort of', 'kind of', 'a bit'];
  const lower = message.toLowerCase();
  return vagueIndicators.some(indic => lower.includes(indic)) && isEnabled();
}

registry.register('question_ask_enable', async () => {
  return enable();
}, 'enable question ask back');

registry.register('question_ask_disable', async () => {
  return disable();
}, 'disable question ask back');

registry.register('question_ask_get', async () => {
  return getRandom();
}, 'get clarifying question');

registry.register('question_ask_add', async ({ question }) => {
  if (!question) return 'error: question required';
  return addQuestion(question);
}, 'add clarifying question. args: question');

registry.register('question_ask_status', async () => {
  return isEnabled() ? 'enabled' : 'disabled';
}, 'get status');

module.exports = { getRandom, enable, disable, isEnabled, shouldAskBack };