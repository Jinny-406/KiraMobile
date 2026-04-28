'use strict';
const { execSync } = require('child_process');
const registry = require('./registry');
const { ensureTool } = require('./tool_installer');

// Steghide - Hide data in images
registry.register('steghide_embed', async ({ image, data, password }) => {
  await ensureTool('steghide', 'steghide', 'pkg');
  const pass = password ? `-p "${password}"` : '';
  try {
    return execSync(`steghide embed -cf ${image} -ef ${data} ${pass}`).toString();
  } catch (e) { return `Steghide error: ${e.message}`; }
}, 'hide data in image. args: image, data, password (optional)');

registry.register('steghide_extract', async ({ image, password }) => {
  await ensureTool('steghide', 'steghide', 'pkg');
  const pass = password ? `-p "${password}"` : '';
  try {
    return execSync(`steghide extract -sf ${image} ${pass}`).toString();
  } catch (e) { return `Steghide error: ${e.message}`; }
}, 'extract data from image. args: image, password (optional)');

// Zsteg - Detect steganography in PNG/BMP
registry.register('zsteg_check', async ({ image }) => {
  await ensureTool('zsteg', 'zsteg', 'gem install');
  try {
    return execSync(`zsteg "${image}"`).toString();
  } catch (e) { return `Zsteg error: ${e.message}`; }
}, 'check image for steganography. args: image');

// Exiftool - Read metadata
registry.register('exif_read', async ({ file }) => {
  await ensureTool('exiftool', 'exiftool', 'pkg');
  try {
    return execSync(`exiftool "${file}"`).toString();
  } catch (e) { return `Exiftool error: ${e.message}`; }
}, 'read file metadata. args: file');

// File signature analysis
registry.register('file_signature', async ({ file }) => {
  try {
    return execSync(`file "${file}"`).toString();
  } catch (e) { return `Error: ${e.message}`; }
}, 'check file type by signature. args: file');

module.exports = {};
