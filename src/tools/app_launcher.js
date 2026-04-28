'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');

const APPS = {
  notepad: 'notepad.exe',
  calculator: 'calc.exe',
  explorer: 'explorer.exe',
  browser: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  edge: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  vscode: 'C:\\Users\\J1NnY\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe',
  discord: 'C:\\Users\\J1NnY\\AppData\\Local\\Discord\\Update.exe',
  spotify: 'C:\\Users\\J1NnY\\AppData\\Roaming\\Spotify\\Spotify.exe',
  telegram: 'C:\\Users\\J1NnY\\AppData\\Roaming\\Telegram Desktop\\Telegram.exe',
  cmd: 'cmd.exe',
  powershell: 'powershell.exe'
};

function launch(app, args) {
  try {
    if (APPS[app.toLowerCase()]) {
      execSync(`"${APPS[app.toLowerCase()]}" ${args || ''}`, { detached: true, stdio: 'ignore' });
      return `launched: ${app}`;
    }
    
    execSync(`start "" "${app}" ${args || ''}`, { detached: true, stdio: 'ignore' });
    return `started: ${app}`;
  } catch (e) {
    return `error: ${e.message}`;
  }
}

function list() {
  return Object.keys(APPS).join(', ');
}

function search(query) {
  return Object.keys(APPS).filter(a => a.includes(query.toLowerCase())).join(', ') || 'no matches';
}

registry.register('app_launch', async ({ app, args }) => {
  if (!app) return list();
  return launch(app, args);
}, 'launch app. args: app (name), args (optional)');

registry.register('app_list', async () => list(), 'list known apps');

registry.register('app_search', async ({ query }) => {
  if (!query) return 'error: query required';
  return search(query);
}, 'search apps. args: query');

registry.register('app_open', async ({ path }) => {
  if (!path) return 'error: path required';
  try {
    execSync(`"${path}"`, { detached: true, stdio: 'ignore' });
    return `opened: ${path}`;
  } catch (e) {
    return `error: ${e.message}`;
  }
}, 'open app by path. args: path');

module.exports = { launch, list };