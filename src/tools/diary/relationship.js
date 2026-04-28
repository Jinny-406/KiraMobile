'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const REL_FILE = path.join(config.CONFIG_DIR, 'relationship.json');
let _cache = null;

function load() {
  if (_cache) return _cache;
  if (!fs.existsSync(REL_FILE)) {
    _cache = { startDate: new Date().toISOString(), status: 'new', trust: 0, milestones: [], notes: [], events: [] };
    return _cache;
  }
  try { _cache = JSON.parse(fs.readFileSync(REL_FILE, 'utf8')); }
  catch { _cache = {}; }
  return _cache;
}

function save(data) {
  _cache = data;
  fs.writeFileSync(REL_FILE, JSON.stringify(data, null, 2));
}

function setStatus(status) {
  const data = load();
  data.status = status;
  data.notes.push({ action: 'status_change', to: status, at: new Date().toISOString() });
  save(data);
  return `status changed to: ${status}`;
}

function getStatus() {
  const data = load();
  return data.status;
}

function addMilestone(title) {
  const data = load();
  data.milestones.push({ title, at: new Date().toISOString() });
  save(data);
  return `milestone: ${title}`;
}

function getMilestones() {
  const data = load();
  return data.milestones;
}

function addNote(note) {
  const data = load();
  data.notes.push({ note, at: new Date().toISOString() });
  save(data);
}

function addEvent(event) {
  const data = load();
  data.events.push({ event, at: new Date().toISOString() });
  save(data);
}

function trustUp(amount) {
  const data = load();
  data.trust = Math.min(100, (data.trust || 0) + (amount || 5));
  save(data);
  return `trust: ${data.trust}`;
}

function trustDown(amount) {
  const data = load();
  data.trust = Math.max(0, (data.trust || 0) - (amount || 5));
  save(data);
  return `trust: ${data.trust}`;
}

function getTrust() {
  const data = load();
  return data.trust || 0;
}

function getDays() {
  const data = load();
  const start = new Date(data.startDate).getTime();
  const now = Date.now();
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

function getSummary() {
  const data = load();
  return `Status: ${data.status}\nTrust: ${data.trust}%\nDays: ${getDays()}\nMilestones: ${data.milestones.map(m => m.title).join(', ') || 'none'}\nRecent notes: ${data.notes.slice(-3).map(n => n.note || n.action).join(', ')}`;
}

registry.register('relationship_status', async ({ status }) => {
  if (!status) return getSummary();
  return setStatus(status);
}, 'get/set relationship status. args: status (optional)');

registry.register('relationship_milestone', async ({ title }) => {
  if (!title) return getMilestones().join('\n') || 'none';
  return addMilestone(title);
}, 'add/ get milestone. args: title (optional)');

registry.register('relationship_trust', async ({ adjust }) => {
  if (adjust) return adjust > 0 ? trustUp(adjust) : trustDown(Math.abs(adjust));
  return `trust: ${getTrust()}`;
}, 'adjust/get trust. args: adjust (optional +/-)');

registry.register('relationship_days', async () => {
  return `${getDays()} days`;
}, 'get days together');

module.exports = { setStatus, getStatus, addMilestone, getMilestones, trustUp, trustDown, getTrust, getDays, getSummary };