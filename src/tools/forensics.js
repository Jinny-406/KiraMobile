'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');
const { ensureTool } = require('./tool_installer');

// Tcpdump - Packet capture
registry.register('tcpdump_capture', async ({ interface, output, filter }) => {
  await ensureTool('tcpdump', 'tcpdump', 'pkg');
  const out = output || 'capture.pcap';
  const filt = filter ? `"${filter}"` : '';
  try {
    return execSync(`tcpdump -i ${interface || 'wlan0'} -w ${out} ${filt} -c 100`).toString();
  } catch (e) { return `Tcpdump error: ${e.message}`; }
}, 'capture packets. args: interface, output, filter (optional)');

// File recovery (foremost)
registry.register('file_carve', async ({ input, outputDir }) => {
  await ensureTool('foremost', 'foremost', 'pkg');
  const out = outputDir || './recovered';
  try {
    return execSync(`foremost -i ${input} -o ${out}`).toString();
  } catch (e) { return `Foremost error: ${e.message}`; }
}, 'recover deleted files. args: input (device/file), outputDir (optional)');

// Binwalk - Firmware analysis
registry.register('binwalk_scan', async ({ file }) => {
  await ensureTool('binwalk', 'binwalk', 'pkg');
  try {
    return execSync(`binwalk "${file}"`).toString();
  } catch (e) { return `Binwalk error: ${e.message}`; }
}, 'scan file for embedded files. args: file');

// Strings - Extract readable strings
registry.register('strings_extract', async ({ file, minLen }) => {
  try {
    const len = minLen || 6;
    return execSync(`strings -n ${len} "${file}" | head -100`).toString();
  } catch (e) { return `Strings error: ${e.message}`; }
}, 'extract strings from binary. args: file, minLen (optional)');

// MD5/SHA checksum
registry.register('checksum', async ({ file, algorithm }) => {
  const algo = algorithm || 'md5';
  try {
    return execSync(`${algo}sum "${file}"`).toString();
  } catch (e) { return `Checksum error: ${e.message}`; }
}, 'calculate file checksum. args: file, algorithm (md5/sha1/sha256)');

module.exports = {};
