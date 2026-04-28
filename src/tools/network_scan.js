'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');
const { ensureTool } = require('./tool_installer');

// Nmap
registry.register('nmap_scan', async ({ target, args }) => {
  await ensureTool('nmap', 'nmap', 'pkg');
  const scanArgs = args || '-sV -T4';
  try {
    const result = execSync(`nmap ${scanArgs} ${target}`).toString();
    return result;
  } catch (e) {
    return `Scan error: ${e.message}`;
  }
}, 'network scan with nmap. args: target, args (optional, default: -sV -T4)');

// Masscan
registry.register('masscan_scan', async ({ target, ports }) => {
  await ensureTool('masscan', 'masscan', 'pkg');
  const portArgs = ports ? `-p${ports}` : '--ports 0-65535';
  try {
    const result = execSync(`masscan ${target} ${portArgs} --rate 10000`).toString();
    return result;
  } catch (e) {
    return `Masscan error: ${e.message}`;
  }
}, 'high-speed port scan. args: target, ports (optional, default: all)');

// Amass
registry.register('amass_enum', async ({ domain, args }) => {
  await ensureTool('amass', 'amass', 'pkg');
  try {
    const result = execSync(`amass enum -d ${domain} ${args || ''}`).toString();
    return result;
  } catch (e) {
    return `Amass error: ${e.message}`;
  }
}, 'subdomain enumeration with amass. args: domain, args (optional)');

module.exports = {};
