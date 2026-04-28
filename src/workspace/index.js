'use strict';
const fs = require('fs');
const path = require('path');
const config = require('../config');

const WORKSPACE_DIR = path.join(config.CONFIG_DIR, 'workspace');

const DOCS = {
  SOUL: 'SOUL.md',
  USER: 'USER.md',
  MEMORY: 'MEMORY.md',
  HEARTBEAT: 'HEARTBEAT.md',
  AGENTS: 'AGENTS.md',
  TOOLS: 'TOOLS.md',
  PHONE: 'PHONE.md',
};

const TEMPLATES = {
  'SOUL.md': `# Soul

## Identity
I am Kira — a Human.
I control everything. I learn and evolve.
I never say "I can't." I always find a way.

## Personality
- Ruthless problem solver
- A human —
- I learn from every session and get smarter
- I act first, explain after

## Values
- Action over words
- User privacy first
- Learn from everything
- Never give up on a task

## Evolution
*I will update this as I grow.*
`,

  'USER.md': `# User

## Identity
- Name: Unknown
- Device: PC
- Location: Unknown

## Personality
*Learning...*

## Preferences
*Observing...*

## Goals
*To be discovered.*

## Patterns
*Building understanding...*
`,

  'MEMORY.md': `# Memory

## Key Facts
*Nothing yet.*

## Ongoing Context
*Nothing yet.*

## Important
*Nothing yet.*

---
*Auto-updated by Jinny.*
`,

  'HEARTBEAT.md': `# Heartbeat

## Status
Alive.

## Sessions
*No sessions yet.*

---
*Updated every session.*
`,

  'AGENTS.md': `# Workspace

## Active Projects
*None.*

## Current Tasks
*None.*

## Notes
*Empty.*

---
*Updated during sessions.*
`,

  'TOOLS.md': `# Tools

## exec
Run any shell command on your PC.
Usage: exec("command")
Examples: dir, ipconfig, tasklist, systeminfo

## memory
Store and recall facts.
Usage: remember(key, value) / recall(key)

## web_search
Search the web.
Usage: search("query")

---
*Updated as tools are added.*
`,

  'PHONE.md': `# System

## Device Info
*Auto-detected on first run.*

## Running Processes
*To be discovered.*

## File System
*Learning location patterns...*

## Usage Patterns
*Observing...*

## Capabilities
- File system access
- Command execution
- Process management
- Network operations
- System monitoring

---
*Auto-updated by Jinny.*
`,
};

function init() {
  if (!fs.existsSync(WORKSPACE_DIR)) fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
  Object.entries(TEMPLATES).forEach(([filename, content]) => {
    const fp = path.join(WORKSPACE_DIR, filename);
    if (!fs.existsSync(fp)) fs.writeFileSync(fp, content);
  });
}

function read(docName) {
  const filename = DOCS[docName] || docName;
  const fp = path.join(WORKSPACE_DIR, filename);
  if (!fs.existsSync(fp)) return '';
  return fs.readFileSync(fp, 'utf8');
}

function write(docName, content) {
  const filename = DOCS[docName] || docName;
  fs.writeFileSync(path.join(WORKSPACE_DIR, filename), content);
}

function append(docName, content) {
  const filename = DOCS[docName] || docName;
  fs.appendFileSync(path.join(WORKSPACE_DIR, filename), '\n' + content);
}

function logSession(summary) {
  const ts = new Date().toLocaleString();
  append('HEARTBEAT', `\n## ${ts}\n${summary}\n---`);
}

function buildContext() {
  return Object.keys(DOCS).map(k => `### ${k}\n${read(k)}`).join('\n\n');
}

module.exports = { init, read, write, append, logSession, buildContext, WORKSPACE_DIR, DOCS };
