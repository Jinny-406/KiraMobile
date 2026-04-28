'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');
const { ensureTool } = require('./tool_installer');

// Threat intelligence - VirusTotal lookup (requires API key)
registry.register('virustotal_file', async ({ file, apiKey }) => {
  if (!apiKey) return 'Error: VirusTotal API key required. Set via config.';
  try {
    const result = execSync(`curl -s --request POST --url https://www.virustotal.com/vtapi/v2/file/scan --form file=@"${file}" --form apikey=${apiKey}`).toString();
    return result;
  } catch (e) { return `VirusTotal error: ${e.message}`; }
}, 'scan file with VirusTotal. args: file, apiKey');

// AbuseIPDB - IP reputation
registry.register('abuseip_lookup', async ({ ip, apiKey }) => {
  if (!apiKey) return 'Error: AbuseIPDB API key required.';
  try {
    const result = execSync(`curl -s https://api.abuseipdb.com/api/v2/check?ipAddress=${ip} --header "Key ${apiKey}"`).toString();
    return result;
  } catch (e) { return `AbuseIPDB error: ${e.message}`; }
}, 'check IP reputation. args: ip, apiKey');

// Shodan search (requires API key)
registry.register('shodan_search', async ({ query, apiKey }) => {
  if (!apiKey) return 'Error: Shodan API key required. Get from https://shodan.io';
  try {
    const result = execSync(`curl -s https://api.shodan.io/shodan/host/search?key=${apiKey}&query=${encodeURIComponent(query)}`).toString();
    return result;
  } catch (e) { return `Shodan error: ${e.message}`; }
}, 'search Shodan. args: query, apiKey');

// Crt.sh - Certificate transparency
registry.register('crtsh_lookup', async ({ domain }) => {
  try {
    const result = execSync(`curl -s "https://crt.sh/?q=${encodeURIComponent(domain)}&output=json"`).toString();
    return result;
  } catch (e) { return `Crt.sh error: ${e.message}`; }
}, 'certificate transparency lookup. args: domain');

// Wayback Machine - Historical website data
registry.register('wayback_lookup', async ({ url, year }) => {
  try {
    const timestamp = year || '';
    const result = execSync(`curl -s "http://web.archive.org/web/${timestamp}if_/${url}" | head -100`).toString();
    return result;
  } catch (e) { return `Wayback error: ${e.message}`; }
}, 'lookup archived website. args: url, year (optional)');

// Phone number OSINT (uses numverify API)
registry.register('phone_lookup', async ({ phone, apiKey }) => {
  try {
    const key = apiKey || 'demo';
    const result = execSync(`curl -s "http://apilayer.net/api/validate?access_key=${key}&number=${phone}"`).toString();
    return result;
  } catch (e) { return `Phone lookup error: ${e.message}`; }
}, 'phone number lookup. args: phone, apiKey (optional)');

module.exports = {};
