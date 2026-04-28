'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');
const { ensureTool } = require('./tool_installer');

// Bandwidth monitoring
registry.register('bandwidth_monitor', async () => {
  await ensureTool('iftop', 'iftop', 'pkg');
  try {
    return execSync('iftop -t 2>&1 | head -20').toString();
  } catch (e) { return `Iftop error: ${e.message}`; }
}, 'monitor bandwidth. No args needed.');

// Process monitoring
registry.register('htop_monitor', async () => {
  await ensureTool('htop', 'htop', 'pkg');
  try {
    return execSync('htop --version').toString();
  } catch (e) { return `Htop error: ${e.message}`; }
}, 'process monitor. No args needed.');

// Network per-process usage
registry.register('nethogs_monitor', async () => {
  await ensureTool('nethogs', 'nethogs', 'pkg');
  try {
    return execSync('nethogs -v 2>&1 | head -10').toString();
  } catch (e) { return `Nethogs error: ${e.message}`; }
}, 'network per-process. No args needed.');

// System monitoring
registry.register('sys_monitor', async () => {
  try {
    const cpu = execSync('top -n 1 | head -5').toString();
    const mem = execSync('free -h').toString();
    const disk = execSync('df -h /').toString();
    return `=== SYSTEM MONITOR ===\n${cpu}\n${mem}\n${disk}`;
  } catch (e) { return `Monitor error: ${e.message}`; }
}, 'system monitoring. No args needed.');

// Battery monitoring
registry.register('battery_monitor', async () => {
  try {
    return execSync('termux-battery-status 2>/dev/null || cat /sys/class/power_supply/*/uevent').toString();
  } catch (e) { return `Battery error: ${e.message}`; }
}, 'battery status. No args needed.');

// Temperature monitoring
registry.register('temp_monitor', async () => {
  try {
    return execSync('cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null || echo "Not available"').toString();
  } catch (e) { return `Temp error: ${e.message}`; }
}, 'temperature monitoring. No args needed.');

module.exports = {};
