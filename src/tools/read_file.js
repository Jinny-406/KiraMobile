'use strict';
const fs       = require('fs');
const path     = require('path');
const registry = require('./registry');

registry.register('read_file', async ({ filePath, limit, offset }) => {
  if (!filePath) throw new Error('filePath required');

  let fullPath = filePath;
  if (!path.isAbsolute(filePath)) {
    fullPath = path.join(process.cwd(), filePath);
  }

  if (!fs.existsSync(fullPath)) {
    throw new Error(`file not found: ${fullPath}`);
  }

  const stats = fs.statSync(fullPath);
  if (stats.isDirectory()) {
    throw new Error(`is a directory: ${fullPath}`);
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  
  if (offset) {
    const lines = content.split('\n');
    content = lines.slice(offset - 1).join('\n');
  }
  
  if (limit) {
    const lines = content.split('\n');
    content = lines.slice(0, limit).join('\n');
  }

  return content;
}, 'read a file. args: filePath (required), limit (optional lines), offset (optional line start)');

module.exports = {};