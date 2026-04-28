'use strict';
const fs = require('fs');
const path = require('path');
const config = require('../config');
const registry = require('./registry');

const BACKUP_FILE = path.join(config.CONFIG_DIR, 'backup.json');

function loadConfig() {
  if (!fs.existsSync(BACKUP_FILE)) return { backups: [], lastRun: null };
  try { return JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8')); }
  catch { return { backups: [], lastRun: null }; }
}

function saveConfig(data) {
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
}

function addBackup(source, destination, schedule) {
  const data = loadConfig();
  data.backups.push({ source, destination, schedule, added: new Date().toISOString() });
  saveConfig(data);
  return 'backup added';
}

function list() {
  const data = loadConfig();
  return data.backups.map(b => `${b.source} → ${b.destination} (${b.schedule || 'manual'})`).join('\n') || 'no backups';
}

function performBackup(source, destination, options = {}) {
  try {
    if (!fs.existsSync(source)) return 'source not found';
    if (!fs.existsSync(destination)) fs.mkdirSync(destination, { recursive: true });
    
    const files = fs.readdirSync(source);
    let count = 0;
    
    for (const file of files) {
      const srcPath = path.join(source, file);
      const destPath = path.join(destination, file + '_' + Date.now());
      try {
        if (fs.statSync(srcPath).isFile()) {
          fs.copyFileSync(srcPath, destPath);
          count++;
        }
      } catch {}
    }
    
    const data = loadConfig();
    data.lastRun = new Date().toISOString();
    saveConfig(data);
    return `backed up ${count} files`;
  } catch (e) {
    return `error: ${e.message}`;
  }
}

registry.register('backup_add', async ({ source, destination, schedule }) => {
  if (!source || !destination) return 'error: source and destination required';
  return addBackup(source, destination, schedule);
}, 'add backup. args: source, destination, schedule (optional)');

registry.register('backup_list', async () => list(), 'list backups');

registry.register('backup_run', async ({ source, destination }) => {
  if (!source || !destination) return 'error: source and destination required';
  return performBackup(source, destination);
}, 'run backup. args: source, destination');

registry.register('backup_status', async () => {
  const data = loadConfig();
  return `Last run: ${data.lastRun || 'never'}\nBackups: ${data.backups.length}`;
}, 'backup status');

module.exports = { addBackup, performBackup };