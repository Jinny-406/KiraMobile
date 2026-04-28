'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const registry = require('../registry');
const brain = require('../../core/brain');
const soul = require('../../core/soul');

const PLUGINS_DIR = path.join(__dirname);
const USER_PLUGINS_DIR = path.join(os.homedir(), '.droidclaw', 'plugins');

if (!fs.existsSync(USER_PLUGINS_DIR)) {
  fs.mkdirSync(USER_PLUGINS_DIR, { recursive: true });
}

const loadedPlugins = new Map();

function loadPlugin(filePath) {
  try {
    const plugin = require(filePath);
    if (!plugin.name) {
      console.error(`[plugins] skipping ${filePath} — missing name`);
      return false;
    }
    
    const instance = {
      name: plugin.name,
      description: plugin.description || '',
      version: plugin.version || '1.0.0',
      enabled: true,
      _plugin: plugin,
      _path: filePath
    };

    if (plugin.onLoad && typeof plugin.onLoad === 'function') {
      plugin.onLoad(getPluginAPI(instance.name));
    }

    if (plugin.tools) {
      for (const [toolName, toolFn] of Object.entries(plugin.tools)) {
        registry.register(`${plugin.name}_${toolName}`, toolFn, `${plugin.description}: ${toolName}`);
      }
      instance._tools = Object.keys(plugin.tools);
    }

    if (plugin.hooks) {
      registerHooks(instance.name, plugin.hooks);
    }

    loadedPlugins.set(plugin.name, instance);
    console.log(`[plugins] loaded: ${plugin.name}`);
    return true;
  } catch (e) {
    console.error(`[plugins] failed to load ${filePath}: ${e.message}`);
    return false;
  }
}

function registerHooks(pluginName, hooks) {
  if (hooks.onMessage && typeof hooks.onMessage === 'function') {
    registry.onMessage(pluginName, hooks.onMessage);
  }
  if (hooks.onToolCall && typeof hooks.onToolCall === 'function') {
    registry.onToolCall(pluginName, hooks.onToolCall);
  }
  if (hooks.onStart && typeof hooks.onStart === 'function') {
    registry.onStart(pluginName, hooks.onStart);
  }
  if (hooks.onStop && typeof hooks.onStop === 'function') {
    registry.onStop(pluginName, hooks.onStop);
  }
  if (hooks.onInterval && typeof hooks.onInterval === 'function') {
    setInterval(() => hooks.onInterval(getPluginAPI(pluginName)), 60000);
  }
}

function getPluginAPI(pluginName) {
  return {
    name: pluginName,
    registry,
    brain,
    soul,
    config: require('../config'),
    workspace: require('../workspace'),
    onMessage: (fn) => registry.onMessage(pluginName, fn),
    onToolCall: (fn) => registry.onToolCall(pluginName, fn),
    broadcast: (msg) => registry.broadcast(pluginName, msg),
    log: (...args) => console.log(`[plugin:${pluginName}]`, ...args)
  };
}

function loadAll() {
  let loaded = 0;
  
  const builtins = fs.readdirSync(PLUGINS_DIR).filter(f =>
    f.endsWith('.js') && f !== 'loader.js' && f !== 'index.js'
  );
  for (const file of builtins) {
    if (loadPlugin(path.join(PLUGINS_DIR, file))) loaded++;
  }
  
  const userDir = fs.existsSync(USER_PLUGINS_DIR) 
    ? fs.readdirSync(USER_PLUGINS_DIR).filter(f => f.endsWith('.js'))
    : [];
  for (const file of userDir) {
    if (loadPlugin(path.join(USER_PLUGINS_DIR, file))) loaded++;
  }
  
  console.log(`[plugins] ${loaded} plugins loaded`);
  return loaded;
}

function get(name) {
  return loadedPlugins.get(name);
}

function list() {
  return Array.from(loadedPlugins.values()).map(p => ({
    name: p.name,
    description: p.description,
    version: p.version,
    enabled: p.enabled
  }));
}

function enable(name) {
  const p = loadedPlugins.get(name);
  if (p) {
    p.enabled = true;
    return true;
  }
  return false;
}

function disable(name) {
  const p = loadedPlugins.get(name);
  if (p) {
    p.enabled = false;
    return true;
  }
  return false;
}

function unload(name) {
  const p = loadedPlugins.get(name);
  if (p) {
    if (p._plugin.onStop) {
      p._plugin.onStop(getPluginAPI(name));
    }
    loadedPlugins.delete(name);
    return true;
  }
  return false;
}

module.exports = { loadAll, get, list, enable, disable, unload };