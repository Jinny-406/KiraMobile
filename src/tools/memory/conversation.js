'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const CONV_FILE = path.join(config.CONFIG_DIR, 'conversation.json');
let _cache = null;

function load() {
  if (_cache) return _cache;
  if (!fs.existsSync(CONV_FILE)) {
    _cache = { created: new Date().toISOString(), conversations: [], topics: [], userTopics: [] };
    return _cache;
  }
  try { _cache = JSON.parse(fs.readFileSync(CONV_FILE, 'utf8')); }
  catch { _cache = {}; }
  return _cache;
}

function save(data) {
  _cache = data;
  fs.writeFileSync(CONV_FILE, JSON.stringify(data, null, 2));
}

function addConversation(summary, sentiment) {
  const data = load();
  data.conversations.unshift({ summary, sentiment, at: new Date().toISOString() });
  if (data.conversations.length > 50) data.conversations = data.conversations.slice(0, 50);
  save(data);
}

function addTopic(topic, isUser = true) {
  const data = load();
  const list = isUser ? data.userTopics : data.topics;
  if (!list.includes(topic)) {
    list.unshift(topic);
  }
  if (list.length > 30) list.length = 30;
  save(data);
}

function getTopics() {
  const data = load();
  return data.topics;
}

function getUserTopics() {
  const data = load();
  return data.userTopics;
}

function getRecent(limit) {
  const data = load();
  return data.conversations.slice(0, limit || 10).map(c => `${c.at.slice(0, 10)}: ${c.summary}`).join('\n');
}

function findTopic(query) {
  const data = load();
  const all = [...data.topics, ...data.userTopics];
  return all.filter(t => t.toLowerCase().includes(query.toLowerCase()));
}

registry.register('conversation_add', async ({ summary, sentiment }) => {
  if (!summary) return 'error: summary required';
  addConversation(summary, sentiment);
  return 'conversation added';
}, 'add conversation summary. args: summary, sentiment (optional)');

registry.register('topic_add', async ({ topic, isUser }) => {
  if (!topic) return 'error: topic required';
  addTopic(topic, isUser !== false);
  return `topic added to ${isUser === false ? ' Kira' : 'user'}`;
}, 'add a conversation topic. args: topic, isUser (optional, default true)');

registry.register('topic_list', async () => {
  const topics = getTopics();
  const userTopics = getUserTopics();
  return `Kira topics: ${topics.join(', ') || 'none'}\nUser topics: ${userTopics.join(', ') || 'none'}`;
}, 'list all conversation topics');

registry.register('topic_find', async ({ query }) => {
  if (!query) return 'error: query required';
  return findTopic(query).join(', ') || 'no matches';
}, 'find topics. args: query');

registry.register('conversation_recent', async ({ limit }) => {
  return getRecent(limit) || 'no conversations';
}, 'get recent conversation summaries. args: limit (optional)');

module.exports = { addConversation, addTopic, getTopics, getUserTopics, getRecent, findTopic };