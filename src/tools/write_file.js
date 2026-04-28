'use strict';
const fs       = require('fs');
const path     = require('path');
const registry = require('./registry');

registry.register('write_file', async ({ filePath, content, append }) => {
  if (!filePath) throw new Error('filePath required');
  if (content === undefined || content === null) throw new Error('content required');

  let fullPath = filePath;
  if (!path.isAbsolute(filePath)) {
    fullPath = path.join(process.cwd(), filePath);
  }

  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (append) {
    fs.appendFileSync(fullPath, content, 'utf8');
  } else {
    fs.writeFileSync(fullPath, content, 'utf8');
  }

  const exists = fs.existsSync(fullPath);
  const size = exists ? fs.statSync(fullPath).size : 0;

  return `written: ${fullPath} (${size} bytes)`;
}, 'write content to a file. args: filePath (required), content (required), append (optional boolean)');

module.exports = {};