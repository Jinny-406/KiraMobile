'use strict';
const { execSync, exec } = require('child_process');
const fs = require('fs');
const registry = require('./registry');
const { ensureTool } = require('./tool_installer');

// Automated reconnaissance workflow
registry.register('auto_recon', async ({ target, outputDir }) => {
  const out = outputDir || './recon_results';
  if (!fs.existsSync(out)) fs.mkdirSync(out, { recursive: true });
  
  const results = [];
  results.push('=== AUTOMATED RECONNAISSANCE ===\n');
  
  // Nmap scan
  try {
    await ensureTool('nmap', 'nmap', 'pkg');
    const nmap = execSync(`nmap -sV -T4 -oN ${out}/nmap.txt ${target}`).toString();
    results.push('[+] Nmap scan completed');
  } catch (e) { results.push(`[-] Nmap failed: ${e.message}`); }
  
  // Whois
  try {
    await ensureTool('whois', 'whois', 'pkg');
    const whois = execSync(`whois ${target} > ${out}/whois.txt`).toString();
    results.push('[+] Whois completed');
  } catch (e) { results.push(`[-] Whois failed: ${e.message}`); }
  
  // theHarvester
  try {
    await ensureTool('theharvester', 'theharvester', 'pkg');
    const harvest = execSync(`theharvester -d ${target} -b all -f ${out}/harvest.html`).toString();
    results.push('[+] theHarvester completed');
  } catch (e) { results.push(`[-] theHarvester failed: ${e.message}`); }
  
  const report = results.join('\n');
  fs.writeFileSync(`${out}/summary.txt`, report);
  return report;
}, 'automated reconnaissance. args: target, outputDir (optional)');

// Generate penetration test report
registry.register('report_generate', async ({ inputDir, outputFile }) => {
  const dir = inputDir || './recon_results';
  const out = outputFile || 'pentest_report.md';
  
  if (!fs.existsSync(dir)) return 'Error: Input directory not found';
  
  let report = '# Penetration Test Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  // Read nmap
  if (fs.existsSync(`${dir}/nmap.txt`)) {
    report += '## Nmap Scan Results\n```\n' + fs.readFileSync(`${dir}/nmap.txt`, 'utf8') + '\n```\n\n';
  }
  
  // Read whois
  if (fs.existsSync(`${dir}/whois.txt`)) {
    report += '## Whois Information\n```\n' + fs.readFileSync(`${dir}/whois.txt`, 'utf8') + '\n```\n\n';
  }
  
  fs.writeFileSync(out, report);
  return `Report generated: ${out}`;
}, 'generate pentest report. args: inputDir (optional), outputFile (optional)');

// Schedule automated scan
registry.register('scan_schedule', async ({ target, interval }) => {
  const minutes = interval || 60;
  try {
    const cronCmd = `echo "${minutes} * * * * cd ${process.cwd()} && node -e \"require('./src/tools/registry').execute('nmap_scan', { target: '${target}' })\" >> scan.log`;`;
    return `Scheduled scan every ${minutes} minutes.\nAdd to crontab: ${cronCmd}`;
  } catch (e) { return `Scheduling error: ${e.message}`; }
}, 'schedule automated scan. args: target, interval minutes (optional)');

// Quick security audit
registry.register('security_audit', async ({ target }) => {
  const checks = [];
  checks.push('=== SECURITY AUDIT ===\n');
  
  // Check open ports
  try {
    const nmap = execSync(`nmap -sT -p 22,80,443,3306,3389 ${target}`).toString();
    checks.push('[+] Port scan: Done');
  } catch (e) { checks.push(`[-] Port scan failed`); }
  
  // Check HTTP headers
  try {
    const headers = execSync(`curl -I http://${target}`).toString();
    checks.push('[+] HTTP headers: Done');
  } catch (e) { checks.push(`[-] HTTP check failed`); }
  
  return checks.join('\n');
}, 'quick security audit. args: target');

module.exports = {};
