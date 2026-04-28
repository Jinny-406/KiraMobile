'use strict';
const fs = require('fs');
const path = require('path');
const config = require('../config');
const registry = require('./registry');

const SEARCH_FILE = path.join(config.CONFIG_DIR, 'file_search.json');

function loadCache() {
  if (!fs.existsSync(SEARCH_FILE)) return { indexed: [] };
  try { return JSON.parse(fs.readFileSync(SEARCH_FILE, 'utf8')); }
  catch { return { indexed: [] }; }
}

function saveCache(data) {
  fs.writeFileSync(SEARCH_FILE, JSON.stringify(data, null, 2));
}

function search(query, inDir) {
  const results = [];
  const searchDir = inDir || process.cwd();
  
  function walk(dir, depth = 0) {
    if (depth > 3) return;
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        if (item.toLowerCase().includes(query.toLowerCase())) {
          results.push(path.join(dir, item));
          if (results.length >= 20) return;
        }
      }
    } catch {}
  }
  
  walk(searchDir);
  return results.slice(0, 10).join('\n') || 'no matches';
}

function indexFolder(folder) {
  const data = loadCache();
  const files = [];
  
  function walk(dir, depth = 0) {
    if (depth > 2) return;
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          files.push({ name: item, path: fullPath });
        } else if (stat.isDirectory()) {
          walk(fullPath, depth + 1);
        }
      }
    } catch {}
  }
  
  walk(folder);
  data.indexed = files;
  saveCache(data);
  return `indexed ${files.length} files`;
}

function list() {
  const data = loadCache();
  return data.indexed.slice(0, 50).map(f => f.name).join('\n');
}

registry.register('file_search', async ({ query, inFolder }) => {
  if (!query) return 'error: query required';
  return search(query, inFolder);
}, 'search files. args: query, inFolder (optional)');

registry.register('file_index', async ({ folder }) => {
  if (!folder) return 'error: folder required';
  return indexFolder(folder);
}, 'index folder. args: folder');

registry.register('file_list', async () => list(), 'list indexed files');

module.exports = { search, indexFolder };