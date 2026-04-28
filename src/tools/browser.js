'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');

function getChromePath() {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of paths) {
    try {
      if (require('fs').existsSync(p)) return p;
    } catch {}
  }
  return 'chrome';
}

registry.register('browser_open', async ({ url, incognito }) => {
  if (!url) return 'error: url required';
  const chromePath = getChromePath();
  const args = incognito ? '--incognito' : '';
  try {
    execSync(`"${chromePath}" ${args} "${url}"`, { detached: true, stdio: 'ignore' });
    return `opened: ${url}`;
  } catch (e) {
    return `error: ${e.message}`;
  }
}, 'open browser. args: url (required), incognito (optional)');

registry.register('browser_navigate', async ({ url }) => {
  if (!url) return 'error: url required';
  const chromePath = getChromePath();
  try {
    execSync(`"${chromePath}" "${url}"`, { detached: true, stdio: 'ignore' });
    return `navigated: ${url}`;
  } catch (e) {
    return `error: ${e.message}`;
  }
}, 'navigate browser. args: url');

registry.register('browser_screenshot', async () => {
  return 'use Playwright browser tools for screenshots';
}, 'take screenshot (use playwright)');

registry.register('browser_close', async () => {
  try {
    execSync('taskkill /F /IM chrome.exe', { stdio: 'ignore' });
    return 'closed chrome';
  } catch {
    return 'no chrome process';
  }
}, 'close browser');

module.exports = {};