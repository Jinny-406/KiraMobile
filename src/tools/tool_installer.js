'use strict';
const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../config');

function isTermux() {
  return fs.existsSync('/data/data/com.termux/files/usr');
}

function isCommandAvailable(cmd) {
  try {
    execSync(`which ${cmd}`);
    return true;
  } catch { return false; }
}

async function ensureTool(toolName, pkgName, installMethod = 'pkg') {
  if (isCommandAvailable(toolName)) return true;
  
  const termux = isTermux();
  if (!termux) throw new Error(`Tool ${toolName} not found. Install via: ${installMethod} install ${pkgName}`);
  
  try {
    console.log(`[kira] Installing ${toolName}...`);
    if (installMethod === 'pkg') {
      execSync(`pkg install -y ${pkgName}`, { stdio: 'inherit' });
    } else if (installMethod === 'pip') {
      execSync(`pip install ${pkgName}`, { stdio: 'inherit' });
    } else if (installMethod.startsWith('wget')) {
      execSync(installMethod, { stdio: 'inherit' });
    }
    return true;
  } catch (e) {
    throw new Error(`Failed to install ${toolName}: ${e.message}`);
  }
}

module.exports = { isTermux, isCommandAvailable, ensureTool };
