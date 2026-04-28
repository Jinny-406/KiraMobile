'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');
const { ensureTool } = require('./tool_installer');

registry.register('theharvester', async ({ domain, sources }) => {
  await ensureTool('theharvester', 'theharvester', 'pkg');
  try {
    return execSync(`theharvester -d ${domain} -b ${sources || 'all'}`).toString();
  } catch (e) { return `theHarvester error: ${e.message}`; }
}, 'email/subdomain harvesting. args: domain, sources (optional)');

registry.register('dnsrecon', async ({ domain }) => {
  await ensureTool('dnsrecon', 'dnsrecon', 'pip');
  try {
    return execSync(`dnsrecon -d ${domain}`).toString();
  } catch (e) { return `DNSRecon error: ${e.message}`; }
}, 'DNS enumeration. args: domain');

registry.register('whois_lookup', async ({ target }) => {
  await ensureTool('whois', 'whois', 'pkg');
  try {
    return execSync(`whois ${target}`).toString();
  } catch (e) { return `Whois error: ${e.message}`; }
}, 'domain registration info. args: target');

module.exports = {};
