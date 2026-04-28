'use strict';
const fs       = require('fs');
const path     = require('path');
const nodemailer = require('nodemailer');
const config   = require('../config');
const registry = require('./registry');

const EMAIL_FILE = path.join(config.CONFIG_DIR, 'email.json');

function loadCreds() {
  if (!fs.existsSync(EMAIL_FILE)) return null;
  try { return JSON.parse(fs.readFileSync(EMAIL_FILE, 'utf8')); }
  catch { return null; }
}

function saveCreds(data) {
  fs.writeFileSync(EMAIL_FILE, JSON.stringify(data, null, 2));
}

function configure(host, port, secure, user, pass) {
  saveCreds({ host, port, secure, user, pass, configured: true });
  return 'email configured';
}

function isConfigured() {
  const c = loadCreds();
  return c?.configured || false;
}

async function send(to, subject, body) {
  if (!isConfigured()) return 'error: email not configured. Run /email_configure first.';
  const creds = loadCreds();
  
  const transporter = nodemailer.createTransport({
    host: creds.host,
    port: creds.port,
    secure: creds.secure,
    auth: { user: creds.user, pass: creds.pass }
  });
  
  try {
    await transporter.sendMail({ from: creds.user, to, subject, text: body });
    return `sent: ${to}`;
  } catch (e) {
    return `error: ${e.message}`;
  }
}

function getStatus() {
  return isConfigured() ? 'configured' : 'not configured';
}

registry.register('email_configure', async ({ host, port, secure, user, pass }) => {
  if (!host || !user || !pass) return 'error: host, user, pass required';
  return configure(host, port || 465, secure !== false, user, pass);
}, 'configure SMTP. args: host, port, secure, user, pass');

registry.register('email_send', async ({ to, subject, body }) => {
  if (!to || !subject || !body) return 'error: to, subject, body required';
  return send(to, subject, body);
}, 'send email. args: to, subject, body');

registry.register('email_status', async () => getStatus(), 'check email status');

module.exports = { configure, send, isConfigured };