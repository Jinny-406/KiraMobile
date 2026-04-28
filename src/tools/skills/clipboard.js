'use strict';
const { execSync } = require('child_process');
const os = require('os');

module.exports = {
  name: 'clipboard',
  description: 'read or write clipboard. args: action ("read" or "write"), text (for write)',

  async execute({ action = 'read', text }) {
    const isWindows = os.platform() === 'win32';

    if (action === 'read') {
      try {
        let result;
        if (isWindows) {
          result = execSync('powershell -C "Get-Clipboard"', { encoding: 'utf8', timeout: 3000 });
        } else {
          result = execSync('xclip -selection clipboard -o 2>/dev/null || pbpaste', { encoding: 'utf8', timeout: 3000, shell: '/bin/bash' });
        }
        return result.trim() || '(clipboard is empty)';
      } catch {
        return 'error: could not read clipboard';
      }
    }

    if (action === 'write') {
      if (!text) return 'error: need text to write';
      try {
        if (isWindows) {
          execSync(`echo ${JSON.stringify(text)} | clip`, { timeout: 3000 });
        } else {
          execSync(`echo ${JSON.stringify(text)} | xclip -selection clipboard 2>/dev/null || echo ${JSON.stringify(text)} | pbcopy`, { timeout: 3000, shell: '/bin/bash' });
        }
        return `copied to clipboard: "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`;
      } catch {
        return 'error: could not write to clipboard';
      }
    }

    return 'error: action must be "read" or "write"';
  }
};
