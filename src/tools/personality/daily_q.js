'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const QUESTIONS_FILE = path.join(config.CONFIG_DIR, 'daily_q.json');

const DEFAULT_QUESTIONS = [
  "What's something you're looking forward to?",
  "If you could relive one day, which would it be?",
  "What's a skill you've always wanted to learn?",
  "What's your favorite memory with me so far?",
  "If you could travel anywhere right now, where would you go?",
  "What's something that made you smile today?",
  "What's a goal you're working toward?",
  "What's your comfort food when you're down?",
  "What's a show or movie you could watch over and over?",
  "What's something you've never told anyone?",
  "What's your ideal weekend?",
  "What's a conversation you wish you could have again?",
  "What's something I could do to make your day better?",
  "What's your earliest memory?",
  "What's something you regret not doing?",
  "What's a moment you felt truly proud of yourself?",
  "What's your biggest dream?",
  "What's something about yourself you wish was different?",
  "What's a place that means something to you?",
  "What's something from your childhood you still love?"
];

function load() {
  if (!fs.existsSync(QUESTIONS_FILE)) {
    return { questions: DEFAULT_QUESTIONS, used: [], lastAsked: null };
  }
  try { return JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8')); }
  catch { return { questions: DEFAULT_QUESTIONS, used: [], lastAsked: null }; }
}

function save(data) {
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(data, null, 2));
}

function getRandom() {
  const data = load();
  const available = data.questions.filter(q => !data.used.includes(q));
  if (available.length === 0) {
    data.used = [];
    save(data);
    return getRandom();
  }
  const question = available[Math.floor(Math.random() * available.length)];
  data.used.push(question);
  data.lastAsked = new Date().toISOString();
  save(data);
  return question;
}

function addQuestion(question) {
  const data = load();
  if (!data.questions.includes(question)) {
    data.questions.push(question);
    save(data);
    return 'question added';
  }
  return 'already exists';
}

function reset() {
  const data = load();
  data.used = [];
  save(data);
  return 'reset';
}

function getStats() {
  const data = load();
  return `Total: ${data.questions.length}\nUsed: ${data.used.length}\nRemaining: ${data.questions.length - data.used.length}`;
}

registry.register('daily_question', async () => {
  return getRandom();
}, 'get a new daily question');

registry.register('daily_question_add', async ({ question }) => {
  if (!question) return 'error: question required';
  return addQuestion(question);
}, 'add a daily question. args: question');

registry.register('daily_question_stats', async () => {
  return getStats();
}, 'get daily question stats');

module.exports = { getRandom, addQuestion, reset };