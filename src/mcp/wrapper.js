'use strict';

const registry = require('../tools/registry');

class MCPWrapper {
  constructor() {
    this.tools = new Map();
    this.resources = new Map();
  }

  init() {
    this._registerKiraTools();
    this._registerResources();
  }

  _registerKiraTools() {
    const registered = registry.listWithDescriptions();
    
    this.tools.set('read_file', {
      name: 'read_file',
      description: 'Read contents of a file',
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to file' },
          limit: { type: 'number', description: 'Lines to read' },
          offset: { type: 'number', description: 'Line offset' }
        },
        required: ['filePath']
      }
    });

    this.tools.set('write_file', {
      name: 'write_file',
      description: 'Write content to a file',
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to file' },
          content: { type: 'string', description: 'Content to write' },
          append: { type: 'boolean', description: 'Append mode' }
        },
        required: ['filePath', 'content']
      }
    });

    this.tools.set('execute', {
      name: 'execute',
      description: 'Execute a shell command',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Command to execute' }
        },
        required: ['command']
      }
    });

    this.tools.set('app_launch', {
      name: 'app_launch',
      description: 'Launch an application',
      inputSchema: {
        type: 'object',
        properties: {
          app: { type: 'string', description: 'App name or path' },
          args: { type: 'string', description: 'Arguments' }
        },
        required: ['app']
      }
    });

    this.tools.set('clipboard_read', {
      name: 'clipboard_read',
      description: 'Read from clipboard',
      inputSchema: { type: 'object', properties: {} }
    });

    this.tools.set('clipboard_write', {
      name: 'clipboard_write',
      description: 'Write to clipboard',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Text to copy' }
        },
        required: ['text']
      }
    });

    this.tools.set('search', {
      name: 'search',
      description: 'Search the web',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          limit: { type: 'number', description: 'Results limit' }
        },
        required: ['query']
      }
    });

    this.tools.set('user_profile_get', {
      name: 'user_profile_get',
      description: 'Get user profile information',
      inputSchema: { type: 'object', properties: {} }
    });

    this.tools.set('diary_write', {
      name: 'diary_write',
      description: 'Write diary entry',
      inputSchema: {
        type: 'object',
        properties: {
          mood: { type: 'string', description: 'Current mood' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Tags' },
          content: { type: 'string', description: 'Diary content' }
        },
        required: ['content']
      }
    });

    this.tools.set('compliment', {
      name: 'compliment',
      description: 'Get a random compliment',
      inputSchema: { type: 'object', properties: {} }
    });

    this.tools.set('encourage', {
      name: 'encourage',
      description: 'Get encouragement message',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', description: 'frustration, sadness, motivation, celebration' }
        }
      }
    });

    this.tools.set('pet_name', {
      name: 'pet_name',
      description: 'Get a pet name',
      inputSchema: {
        type: 'object',
        properties: {
          mode: { type: 'string', description: 'default, playful, affectionate, flirty' }
        }
      }
    });

    this.tools.set('trust_adjust', {
      name: 'trust_adjust',
      description: 'Adjust trust level',
      inputSchema: {
        type: 'object',
        properties: {
          amount: { type: 'number', description: 'Amount to adjust (+/-)' }
        }
      }
    });

    this.tools.set('email_send', {
      name: 'email_send',
      description: 'Send an email',
      inputSchema: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Recipient email' },
          subject: { type: 'string', description: 'Email subject' },
          body: { type: 'string', description: 'Email body' }
        },
        required: ['to', 'subject', 'body']
      }
    });
  }

  _registerResources() {
    this.resources.set('user-profile', {
      uri: 'kira://user-profile',
      name: 'User Profile',
      description: 'About the user'
    });

    this.resources.set('diary-index', {
      uri: 'kira://diary-index',
      name: 'Diary Index',
      description: 'All diary entries'
    });
  }

  async callTool(name, args) {
    try {
      const result = await registry.execute(name, args);
      return { content: [{ type: 'text', text: String(result) }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
    }
  }

  listTools() {
    return Array.from(this.tools.values());
  }

  listResources() {
    return Array.from(this.resources.values());
  }
}

module.exports = new MCPWrapper();