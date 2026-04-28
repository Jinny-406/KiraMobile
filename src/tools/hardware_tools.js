'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');
const { ensureTool } = require('./tool_installer');

// Bluetooth scanning (needs hardware support)
registry.register('bluetooth_scan', async () => {
  await ensureTool('bluez', 'bluez', 'pkg');
  try {
    return execSync('hcitool scan').toString();
  } catch (e) { return `Bluetooth scan error: ${e.message}`; }
}, 'scan for Bluetooth devices');

// Check Bluetooth status
registry.register('bluetooth_status', async () => {
  try {
    return execSync('hciconfig').toString();
  } catch (e) { return `Bluetooth not available: ${e.message}`; }
}, 'check Bluetooth status');

// NFC tools (needs NFC hardware)
registry.register('nfc_list', async () => {
  await ensureTool('libnfc', 'libnfc', 'pkg');
  try {
    return execSync('nfc-list').toString();
  } catch (e) { return `NFC error: ${e.message}\nNote: Requires NFC hardware`; }
}, 'list NFC devices (needs hardware)');

// Read NFC tag (if hardware present)
registry.register('nfc_read', async () => {
  await ensureTool('libnfc', 'libnfc', 'pkg');
  try {
    return execSync('nfc-poll').toString();
  } catch (e) { return `NFC read error: ${e.message}`; }
}, 'read NFC tag (needs hardware)');

// RF scaling (educational)
registry.register('rfid_frequency', async ({ frequency }) => {
  const freq = frequency || '13.56'; // Standard NFC frequency
  return `RFID/NFC operates at ${freq} MHz\nNote: Requires SDR hardware for transmission`;
}, 'RFID frequency info. args: frequency (optional)');

module.exports = {};
