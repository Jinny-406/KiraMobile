'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');
const { ensureTool } = require('./tool_installer');

// SMS functions
registry.register('termux_sms_send', async ({ number, message }) => {
  await ensureTool('termux-sms-send', 'termux-api', 'pkg');
  return execSync(`termux-sms-send -n ${number} -m "${message}"`).toString();
}, 'send SMS. args: number, message');

registry.register('termux_sms_list', async ({ limit }) => {
  await ensureTool('termux-sms-list', 'termux-api', 'pkg');
  return execSync(`termux-sms-list -l ${limit || 10}`).toString();
}, 'list SMS messages. args: limit (optional)');

// Location
registry.register('termux_location', async () => {
  await ensureTool('termux-location', 'termux-api', 'pkg');
  return execSync('termux-location -p network').toString();
}, 'get GPS location');

// Battery
registry.register('termux_battery', async () => {
  await ensureTool('termux-battery-status', 'termux-api', 'pkg');
  return execSync('termux-battery-status').toString();
}, 'get battery status');

// Clipboard
registry.register('termux_clipboard_get', async () => {
  await ensureTool('termux-clipboard-get', 'termux-api', 'pkg');
  return execSync('termux-clipboard-get').toString();
}, 'get clipboard content');

registry.register('termux_clipboard_set', async ({ text }) => {
  await ensureTool('termux-clipboard-set', 'termux-api', 'pkg');
  return execSync(`echo "${text}" | termux-clipboard-set`).toString();
}, 'set clipboard. args: text');

// Notification
registry.register('termux_notify', async ({ title, content }) => {
  await ensureTool('termux-notification', 'termux-api', 'pkg');
  return execSync(`termux-notification --title "${title}" --content "${content}"`).toString();
}, 'send notification. args: title, content');

// TTS
registry.register('termux_tts', async ({ text, engine }) => {
  await ensureTool('termux-tts-speak', 'termux-api', 'pkg');
  return execSync(`termux-tts-speak "${text}"`).toString();
}, 'text-to-speech. args: text, engine (optional)');

// Vibrate
registry.register('termux_vibrate', async ({ duration }) => {
  await ensureTool('termux-vibrate', 'termux-api', 'pkg');
  return execSync(`termux-vibrate -d ${duration || 1000}`).toString();
}, 'vibrate device. args: duration (ms, optional)');

// Wifi info
registry.register('termux_wifi', async () => {
  await ensureTool('termux-wifi-connectioninfo', 'termux-api', 'pkg');
  return execSync('termux-wifi-connectioninfo').toString();
}, 'get wifi connection info');

// Device info
registry.register('termux_device_info', async () => {
  await ensureTool('termux-telephony-deviceinfo', 'termux-api', 'pkg');
  return execSync('termux-telephony-deviceinfo').toString();
}, 'get device info');

// Camera info
registry.register('termux_camera_info', async () => {
  await ensureTool('termux-camera-info', 'termux-api', 'pkg');
  return execSync('termux-camera-info').toString();
}, 'list available cameras');

module.exports = {};
