'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');
const { ensureTool } = require('./tool_installer');

// QR Code Generator
registry.register('qrcode_generate', async ({ text, output }) => {
  await ensureTool('qrencode', 'qrencode', 'pkg');
  const out = output || 'qrcode.png';
  try {
    return execSync(`qrencode -o ${out} "${text}"`).toString();
  } catch (e) { return `QR generation error: ${e.message}`; }
}, 'generate QR codes. args: text, output (optional)');

// URL shortener (educational - tracking links)
registry.register('shorturl_create', async ({ url }) => {
  try {
    const result = execSync(`curl -s "https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}"`).toString();
    return `Shortened: ${result}`;
  } catch (e) { return `Error: ${e.message}`; }
}, 'create short URLs (educational). args: url');

// Email harvest from website
registry.register('email_harvest', async ({ url, depth }) => {
  await ensureTool('theharvester', 'theharvester', 'pkg');
  try {
    return execSync(`theharvester -d ${url} -b bing -l ${depth || 100}`).toString();
  } catch (e) { return `Harvest error: ${e.message}`; }
}, 'harvest emails from domain. args: url, depth (optional)');

// Generate phishing template (educational)
registry.register('phishing_template', async ({ type }) => {
  const templates = {
    'google': 'https://github.com/gophish/gophish/releases',
    'facebook': 'https://github.com/gophish/gophish/releases',
    'custom': 'Use SET (Social Engineering Toolkit)'
  };
  return `Educational templates:\n${JSON.stringify(templates, null, 2)}\n\nNote: Only use on authorized penetration tests.`;
}, 'phishing template info (educational). args: type (google/facebook/custom)');

module.exports = {};
