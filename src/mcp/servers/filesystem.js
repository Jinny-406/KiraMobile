'use strict';
const fs = require('fs');
const path = require('path');

class FileSystemMCPServer {
  constructor() {
    this.allowedDirectories = [];
    this.name = 'kira-filesystem';
  }

  initialize(allowedDirs = []) {
    if (allowedDirs.length === 0) {
      allowedDirs = [
        process.cwd(),
        process.env.USERPROFILE || process.env.HOME
      ].filter(Boolean);
    }
    this.allowedDirectories = allowedDirs.map(d => path.resolve(d));
  }

  isAllowed(filePath) {
    const resolved = path.resolve(filePath);
    return this.allowedDirectories.some(dir => 
      resolved.startsWith(dir) || resolved === dir
    );
  }

  async listDirectory(args) {
    const dir = args.path || this.allowedDirectories[0] || process.cwd();
    
    if (!this.isAllowed(dir)) {
      return { content: [{ type: 'text', text: `Access denied: ${dir}` }], isError: true };
    }

    try {
      const items = fs.readdirSync(dir);
      const result = items.map(name => {
        const fullPath = path.join(dir, name);
        const stats = fs.statSync(fullPath);
        return {
          name,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          modified: stats.mtime.toISOString()
        };
      });
      
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
    }
  }

  async readFile(args) {
    const filePath = args.path;
    
    if (!this.isAllowed(filePath)) {
      return { content: [{ type: 'text', text: `Access denied: ${filePath}` }], isError: true };
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return { content: [{ type: 'text', text: content }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
    }
  }

  async writeFile(args) {
    const filePath = args.path;
    const content = args.content;
    
    if (!this.isAllowed(filePath)) {
      return { content: [{ type: 'text', text: `Access denied: ${filePath}` }], isError: true };
    }

    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      if (args.append) {
        fs.appendFileSync(filePath, content, 'utf8');
      } else {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      
      return { content: [{ type: 'text', text: `Written to ${filePath}` }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
    }
  }

  async createDirectory(args) {
    const dir = args.path;
    
    if (!this.isAllowed(dir)) {
      return { content: [{ type: 'text', text: `Access denied: ${dir}` }], isError: true };
    }

    try {
      fs.mkdirSync(dir, { recursive: true });
      return { content: [{ type: 'text', text: `Created directory: ${dir}` }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
    }
  }

  async deleteFile(args) {
    const filePath = args.path;
    
    if (!this.isAllowed(filePath)) {
      return { content: [{ type: 'text', text: `Access denied: ${filePath}` }], isError: true };
    }

    try {
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        fs.rmdirSync(filePath, { recursive: true });
      } else {
        fs.unlinkSync(filePath);
      }
      return { content: [{ type: 'text', text: `Deleted: ${filePath}` }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
    }
  }

  async moveFile(args) {
    const source = args.source;
    const destination = args.destination;
    
    if (!this.isAllowed(source) || !this.isAllowed(destination)) {
      return { content: [{ type: 'text', text: `Access denied` }], isError: true };
    }

    try {
      fs.renameSync(source, destination);
      return { content: [{ type: 'text', text: `Moved ${source} to ${destination}` }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
    }
  }

  getTools() {
    return [
      { name: 'fs_list', description: 'List directory contents', inputSchema: { type: 'object', properties: { path: { type: 'string' } } } },
      { name: 'fs_read', description: 'Read a file', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
      { name: 'fs_write', description: 'Write to a file', inputSchema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' }, append: { type: 'boolean' } }, required: ['path', 'content'] } },
      { name: 'fs_mkdir', description: 'Create a directory', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
      { name: 'fs_delete', description: 'Delete a file or directory', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
      { name: 'fs_move', description: 'Move/rename a file', inputSchema: { type: 'object', properties: { source: { type: 'string' }, destination: { type: 'string' } }, required: ['source', 'destination'] } }
    ];
  }

  async handleCall(tool, args) {
    switch (tool) {
      case 'fs_list': return this.listDirectory(args);
      case 'fs_read': return this.readFile(args);
      case 'fs_write': return this.writeFile(args);
      case 'fs_mkdir': return this.createDirectory(args);
      case 'fs_delete': return this.deleteFile(args);
      case 'fs_move': return this.moveFile(args);
      default: return { content: [{ type: 'text', text: `Unknown tool: ${tool}` }], isError: true };
    }
  }
}

module.exports = new FileSystemMCPServer();