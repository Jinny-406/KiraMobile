'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const registry = require('./registry');
const { ensureTool, isTermux } = require('./tool_installer');

// Apktool - Decompile
registry.register('apk_decompile', async ({ apkPath, outputDir }) => {
  await ensureTool('apktool', 'apktool', 'pkg');
  const out = outputDir || './decompiled';
  if (fs.existsSync(out)) execSync(`rm -rf ${out}`);
  try {
    return execSync(`apktool d -f -o ${out} ${apkPath}`).toString();
  } catch (e) { return `Apktool error: ${e.message}`; }
}, 'decompile APK. args: apkPath, outputDir (optional)');

// Apktool - Recompile
registry.register('apk_recompile', async ({ inputDir, outputApk }) => {
  await ensureTool('apktool', 'apktool', 'pkg');
  const out = outputApk || './recompiled.apk';
  try {
    return execSync(`apktool b -f -o ${out} ${inputDir}`).toString();
  } catch (e) { return `Apktool error: ${e.message}`; }
}, 'recompile APK. args: inputDir, outputApk (optional)');

// Jadx - Decompile to Java
registry.register('jadx_decompile', async ({ apkPath, outputDir }) => {
  const jadxPath = '/data/data/com.termux/files/home/jadx/bin/jadx';
  if (!fs.existsSync(jadxPath)) {
    console.log('[kira] Installing Jadx...');
    execSync('wget -q https://github.com/skylot/jadx/releases/latest/download/jadx-*-zip -O /tmp/jadx.zip && unzip -q /tmp/jadx.zip -d ~ && rm /tmp/jadx.zip', { stdio: 'inherit' });
  }
  const out = outputDir || './jadx_out';
  try {
    return execSync(`${jadxPath} -d ${out} ${apkPath}`).toString();
  } catch (e) { return `Jadx error: ${e.message}`; }
}, 'decompile APK to Java. args: apkPath, outputDir (optional)');

// Androguard - Full Analysis
registry.register('androguard_analyze', async ({ apkPath }) => {
  await ensureTool('androguard', 'androguard', 'pip');
  try {
    return execSync(`androguard analyze ${apkPath}`).toString();
  } catch (e) { return `Androguard error: ${e.message}`; }
}, 'full APK analysis with androguard. args: apkPath');

// Dex2Jar
registry.register('dex2jar', async ({ dexPath, outputJar }) => {
  await ensureTool('d2j-dex2jar', 'dex2jar', 'pkg');
  const out = outputJar || 'output.jar';
  try {
    return execSync(`d2j-dex2jar -o ${out} ${dexPath}`).toString();
  } catch (e) { return `Dex2Jar error: ${e.message}`; }
}, 'convert DEX to JAR. args: dexPath, outputJar (optional)');

// Smali/Baksmali
registry.register('smali_disassemble', async ({ dexPath, outputDir }) => {
  await ensureTool('baksmali', 'baksmali', 'pkg');
  const out = outputDir || './smali_out';
  try {
    return execSync(`baksmali d -o ${out} ${dexPath}`).toString();
  } catch (e) { return `Baksmali error: ${e.message}`; }
}, 'disassemble DEX to smali. args: dexPath, outputDir (optional)');

registry.register('smali_assemble', async ({ smaliDir, outputDex }) => {
  await ensureTool('smali', 'smali', 'pkg');
  const out = outputDex || './out.dex';
  try {
    return execSync(`smali a -o ${out} ${smaliDir}`).toString();
  } catch (e) { return `Smali error: ${e.message}`; }
}, 'assemble smali to DEX. args: smaliDir, outputDex (optional)');

module.exports = {};
