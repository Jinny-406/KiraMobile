'use strict';
/**
 * KiraService v2 — DISABLED for PC
 * These tools were Android Accessibility Service only.
 * Replaced with stubs that gracefully indicate unavailability.
 */
const registry = require('./registry');

const UNAVAILABLE = 'This feature is only available on Android with KiraService.';

// ── SCREEN ────────────────────────────────────────────────────────────────────

registry.register('read_screen', () => {
  return UNAVAILABLE;
}, 'read all text and elements on screen (Android only)');

registry.register('find_and_tap', ({ text }) => {
  return UNAVAILABLE;
}, 'find element by text and tap it (Android only)');

registry.register('tap_screen', ({ x, y }) => {
  return UNAVAILABLE;
}, 'tap screen at coordinates (Android only)');

registry.register('long_press', ({ x, y }) => {
  return UNAVAILABLE;
}, 'long press at coordinates (Android only)');

registry.register('swipe_screen', ({ x1, y1, x2, y2 }) => {
  return UNAVAILABLE;
}, 'swipe on screen (Android only)');

registry.register('scroll_screen', ({ direction }) => {
  return UNAVAILABLE;
}, 'scroll screen (Android only)');

registry.register('get_focused', () => {
  return UNAVAILABLE;
}, 'get focused UI element (Android only)');

// ── NAVIGATION ────────────────────────────────────────────────────────────────

registry.register('press_back', () => {
  return UNAVAILABLE;
}, 'press back button (Android only)');

registry.register('press_home', () => {
  return UNAVAILABLE;
}, 'press home button (Android only)');

registry.register('open_app', ({ package: pkg }) => {
  return UNAVAILABLE;
}, 'open Android app by package name (Android only)');

registry.register('installed_apps', () => {
  return UNAVAILABLE;
}, 'list installed apps (Android only)');

registry.register('recent_apps', () => {
  return UNAVAILABLE;
}, 'list recently used apps (Android only)');

// ── INPUT ─────────────────────────────────────────────────────────────────────

registry.register('type_text', ({ text }) => {
  return UNAVAILABLE;
}, 'type text into focused input (Android only)');

registry.register('clipboard_get', () => {
  return UNAVAILABLE;
}, 'read clipboard (limited support on PC)');

registry.register('clipboard_set', ({ text }) => {
  return UNAVAILABLE;
}, 'set clipboard (limited support on PC)');

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────

registry.register('get_notifications', () => {
  return UNAVAILABLE;
}, 'get phone notifications (Android only)');

// ── SYSTEM CONTROLS ───────────────────────────────────────────────────────────

registry.register('set_volume', ({ action }) => {
  return UNAVAILABLE;
}, 'control volume (Android only)');

registry.register('set_brightness', ({ level }) => {
  return UNAVAILABLE;
}, 'set screen brightness (Android only)');

registry.register('torch', ({ on }) => {
  return UNAVAILABLE;
}, 'control flashlight (Android only)');

registry.register('wake_screen', () => {
  return UNAVAILABLE;
}, 'wake phone screen (Android only)');

registry.register('lock_screen', () => {
  return UNAVAILABLE;
}, 'lock phone screen (Android only)');

// ── SENSORS & AUDIO ───────────────────────────────────────────────────────────

registry.register('read_sensors', () => {
  return UNAVAILABLE;
}, 'read phone sensors (Android only)');

registry.register('record_audio', ({ seconds }) => {
  return UNAVAILABLE;
}, 'record audio (Android only)');

registry.register('wifi_scan', () => {
  return UNAVAILABLE;
}, 'scan wifi networks (Android only)');

registry.register('battery_info', () => {
  return UNAVAILABLE;
}, 'get battery details (Android only)');

registry.register('tap_text', async ({ text }) => {
  return UNAVAILABLE;
}, 'find and tap text on screen (Android only)');
