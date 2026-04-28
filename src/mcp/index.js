'use strict';

const wrapper = require('./wrapper');
const fsServer = require('./servers/filesystem');

class MCPServer {
  constructor() {
    this.name = 'kira-mcp';
    this.version = '1.0.0';
    this.tools = [];
    this.resources = [];
    this.initialized = false;
    this._toolCache = [];
  }

  async initialize(config = {}) {
    const allowedDirs = config.allowedDirectories || [
      process.cwd(),
      process.env.USERPROFILE || process.env.HOME
    ].filter(Boolean);

    fsServer.initialize(allowedDirs);
    
    wrapper.init();
    
    this.tools = [
      ...this._getKiraTools(),
      ...this._getFileSystemTools()
    ];
    
    this._toolCache = this.tools.map(t => t.name);
    
    this.resources = [
      ...this._getKiraResources(),
      ...this._getFileSystemResources()
    ];
    
    this.initialized = true;
    console.log(`[MCP] Initialized with ${this.tools.length} tools`);
  }

  _getKiraTools() {
    return wrapper.listTools().map(t => ({
      name: `kira_${t.name}`,
      description: t.description,
      inputSchema: t.inputSchema
    }));
  }

  _getFileSystemTools() {
    return fsServer.getTools().map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema
    }));
  }

  _getKiraResources() {
    return wrapper.listResources().map(r => ({
      uri: r.uri,
      name: r.name,
      description: r.description
    }));
  }

  _getFileSystemResources() {
    return [
      { uri: 'kira://filesystem', name: 'File System', description: 'Local file system access' }
    ];
  }

  async handleToolCall(toolName, args) {
    if (!this.initialized) {
      return { content: [{ type: 'text', text: 'MCP not initialized' }], isError: true };
    }

    const exists = this._toolCache.includes(toolName);
    if (!exists) {
      return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
    }

    if (toolName.startsWith('kira_')) {
      const KiraTool = toolName.replace('kira_', '');
      return wrapper.callTool(KiraTool, args);
    }

    if (toolName.startsWith('fs_')) {
      return fsServer.handleCall(toolName, args);
    }

    return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
  }

  getCapabilities() {
    return {
      name: this.name,
      version: this.version,
      tools: this.tools,
      resources: this.resources,
      prompts: [],
      organization: 'kira-ai'
    };
  }

  listTools() {
    return this.tools;
  }

  listResources() {
    return this.resources;
  }
}

module.exports = new MCPServer();