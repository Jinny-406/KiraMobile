'use strict';

const readline = require('readline');

require('../tools/exec');
require('../tools/memory');
require('../tools/realworld');
require('../tools/kiraservice');
require('../tools/clipboard');
require('../tools/search');
require('../tools/write_file');
require('../tools/read_file');
require('../tools/diary/diary');
require('../tools/personality/compliments');
require('../tools/personality/encouragement');
require('../tools/personality/pet_names');
require('../tools/reputation/trust_meter');
require('../tools/email');

const mcpServer = require('./index');

const rl = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let buffer = '';

async function ensureInitialized() {
  if (!mcpServer.initialized) {
    await mcpServer.initialize({});
  }
}

rl.on('line', async (line) => {
  buffer += line;
  try {
    const request = JSON.parse(buffer);
    buffer = '';
    await handleRequest(request);
  } catch (e) {
    if (!buffer.trim().endsWith('}')) return;
    console.error('[mcp-stdio] parse error:', e.message);
    buffer = '';
  }
});

process.stdin.resume();

async function handleRequest(request) {
  const id = request.id;
  const method = request.method;
  const params = request.params || {};

  let result = null;
  let error = null;

  try {
    await ensureInitialized();
    
    switch (method) {
      case 'initialize':
        await mcpServer.initialize({});
        result = mcpServer.getCapabilities();
        break;

      case 'tools/list':
        result = { tools: mcpServer.listTools() };
        break;

      case 'tools/call':
        if (!params.name) {
          throw new Error('missing tool name');
        }
        result = await mcpServer.handleToolCall(params.name, params.arguments || {});
        break;

      case 'resources/list':
        result = { resources: mcpServer.listResources() };
        break;

      case 'resources/read':
        if (!params.uri) {
          throw new Error('missing uri');
        }
        result = { contents: [{ uri: params.uri, text: 'not implemented' }] };
        break;

      default:
        error = { code: -32601, message: `method not found: ${method}` };
    }
  } catch (e) {
    error = { code: -32603, message: e.message };
  }

  const response = { jsonrpc: '2.0', id };
  if (error) {
    response.error = error;
  } else {
    response.result = result;
  }

  console.log(JSON.stringify(response));
}