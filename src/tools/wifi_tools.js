'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');
const { ensureTool } = require('./tool_installer');

registry.register('airmon_start', async ({ interface }) => {
  await ensureTool('airmon-ng', 'aircrack-ng', 'pkg');
  try {
    return execSync(`airmon-ng start ${interface || 'wlan0'}`).toString();
  } catch (e) { return `Airmon error: ${e.message}`; }
}, 'enable monitor mode. args: interface (optional, default: wlan0)');

registry.register('airodump_scan', async ({ interface, output }) => {
  await ensureTool('airodump-ng', 'aircrack-ng', 'pkg');
  try {
    return execSync(`airodump-ng ${interface || 'wlan0mon'} -w ${output || 'capture'}`).toString();
  } catch (e) { return `Airodump error: ${e.message}`; }
}, 'capture wifi handshakes. args: interface, output (optional)');

registry.register('aircrack_crack', async ({ capture, wordlist }) => {
  await ensureTool('aircrack-ng', 'aircrack-ng', 'pkg');
  const list = wordlist || '/data/data/com.termux/files/usr/share/wordlists/rockyou.txt';
  try {
    return execSync(`aircrack-ng -w ${list} ${capture}`).toString();
  } catch (e) { return `Aircrack error: ${e.message}`; }
}, 'crack WPA handshakes. args: capture file, wordlist (optional)');

module.exports = {};
