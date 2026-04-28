'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const registry = require('./registry');
const { ensureTool } = require('./tool_installer');

// Proot - Run Linux in Termux
registry.register('proot_status', async () => {
  try {
    const result = execSync('proot --version 2>&1 || echo "not installed"').toString();
    return result.includes('not installed') ? 'Proot not installed' : `Proot installed: ${result}`;
  } catch (e) { return `Error: ${e.message}`; }
}, 'check proot status');

// Install Ubuntu chroot
registry.register('ubuntu_install', async ({ outputDir }) => {
  const out = outputDir || '$HOME/ubuntu';
  if (fs.existsSync(out)) return 'Ubuntu already installed at ' + out;
  try {
    execSync(`pkg install -y proot wget`, { stdio: 'inherit' });
    execSync(`mkdir -p ${out} && cd ${out} && wget https://github.com/Neo-Oli/termux-ubuntu/releases/download/v4.0/ubuntu-20.04.tar.gz`, { stdio: 'inherit' });
    execSync(`cd ${out} && tar -xzf ubuntu-20.04.tar.gz && rm ubuntu-20.04.tar.gz`, { stdio: 'inherit' });
    return `Ubuntu installed to ${out}. Launch: bash ${out}/start-ubuntu.sh`;
  } catch (e) { return `Install error: ${e.message}`; }
}, 'install Ubuntu chroot. args: outputDir (optional)');

// List installed Linux distros
registry.register('list_containers', async () => {
  const homedir = require('os').homedir();
  const dirs = ['ubuntu', 'alpine', 'kali', 'parrot'];
  const found = dirs.filter(d => fs.existsSync(`${homedir}/${d}`));
  return found.length > 0 ? `Found: ${found.join(', ')}` : 'No containers found. Install with ubuntu_install';
}, 'list installed containers');

// Run command in Ubuntu chroot
registry.register('ubuntu_exec', async ({ command }) => {
  const ubuntuDir = `${require('os').homedir()}/ubuntu`;
  if (!fs.existsSync(ubuntuDir)) return 'Ubuntu not installed. Run: ubuntu_install';
  try {
    return execSync(`bash ${ubuntuDir}/start-ubuntu.sh -c "${command}"`).toString();
  } catch (e) { return `Exec error: ${e.message}`; }
}, 'run command in Ubuntu chroot. args: command');

// Termux-X11 (for GUI apps)
registry.register('x11_status', async () => {
  try {
    const result = execSync('pkg list-installed | grep x11').toString();
    return result || 'X11 not installed. Install: pkg install x11-repo';
  } catch (e) { return 'X11 not installed'; }
}, 'check X11 availability');

module.exports = {};
