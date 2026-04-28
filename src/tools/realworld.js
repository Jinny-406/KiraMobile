'use strict';
const registry = require('./registry');
const { execSync } = require('child_process');

function run(cmd, timeout = 8000) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout });
  } catch (e) {
    throw new Error(e.message.slice(0, 200));
  }
}

// ─── NOTE: Android-specific features disabled for PC ─────────────────────────

// Contacts, notifications, SMS, and call logs are Android/Termux-specific
// and not available on Windows PC. These tools are intentionally disabled.

registry.register('contacts_list', async ({ search }) => {
  return 'contacts feature not available on this platform';
}, 'list or search contacts (not available on PC)');

registry.register('contact_find', async ({ name }) => {
  return 'contacts feature not available on this platform';
}, 'find a contact by name (not available on PC)');

registry.register('notifications_list', async ({ limit }) => {
  return 'notifications feature not available on this platform';
}, 'list recent notifications (not available on PC)');

registry.register('notifications_watch', async ({ app }) => {
  return 'notifications feature not available on this platform';
}, 'watch notifications from a specific app (not available on PC)');

registry.register('sms_list', async ({ limit, number }) => {
  return 'sms feature not available on this platform';
}, 'list recent SMS messages (not available on PC)');

registry.register('sms_send', async ({ number, message }) => {
  return 'sms feature not available on this platform';
}, 'send an SMS message (not available on PC)');

registry.register('sms_read_from', async ({ name }) => {
  return 'sms feature not available on this platform';
}, 'read SMS conversation with a contact (not available on PC)');

registry.register('call_log', async ({ limit }) => {
  return 'call log feature not available on this platform';
}, 'view recent call log (not available on PC)');

module.exports = {};
