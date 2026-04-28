'use strict';
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const loop = require('../core/loop');
const config = require('../config');

class Discord {
  constructor() {
    this.token    = null;
    this.client   = null;
    this.running  = false;
    this.allowed  = [];
    this.busy     = new Set(); // per-user rate limiting
  }

  init(tokenOverride) {
    const cfg    = config.load();
    this.token   = tokenOverride || cfg.discordToken;
    this.allowed = cfg.discordAllowed || [];
    return !!this.token;
  }

  async start(log, tokenOverride) {
    if (!this.init(tokenOverride)) { log && log('discord token not set. use /discord'); return false; }
    
    try {
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.DirectMessages,
          GatewayIntentBits.MessageContent,
        ],
        partials: [Partials.Channel],
      });

      // Wait for ready event
      return new Promise((resolve) => {
        this.client.once('ready', () => {
          this.running = true;
          log && log('discord connected');
          resolve(true);
        });

        this.client.on('messageCreate', msg => this._handle(msg, log));
        this.client.on('error', err => log && log('discord error: ' + err.message));

        this.client.login(this.token).then(() => {
          // resolve is handled by ready event
        }).catch(err => {
          const message = err && err.message ? err.message : 'unknown discord login error';
          log && log('discord login failed: ' + message);
          if (this.client) {
            try { this.client.destroy(); } catch {};
          }
          this.client = null;
          this.running = false;
          resolve(false);
        });
      });
    } catch (e) {
      log && log('discord init failed: ' + e.message);
      return false;
    }
  }

  stop() {
    if (this.client) {
      this.client.destroy();
      this.running = false;
    }
  }

  async _handle(msg, log) {
    // Ignore bot messages and empty text
    if (msg.author.bot || !msg.content) return;

    const userId = msg.author.id;
    const userName = msg.author.username;
    const text = msg.content.trim();
    const isDM = msg.channel.isDMBased();

    log && log(`discord/${userName}${isDM ? ' (DM)' : ''}: ${text}`);

    // Auth check
    if (this.allowed.length && !this.allowed.includes(userId)) {
      try {
        await msg.reply('you are not authorized.');
      } catch (err) {
        log && log(`discord auth reply failed: ${err.message}`);
      }
      return;
    }

    // Ignore if we're already processing
    if (this.busy.has(userId)) {
      try {
        await msg.reply('still working on that...');
      } catch (err) {
        log && log(`discord busy reply failed: ${err.message}`);
      }
      return;
    }

    this.busy.add(userId);

    try {
      // Show typing indicator (skip if it fails)
      try {
        await msg.channel.sendTyping();
      } catch (err) {
        log && log(`discord typing indicator failed: ${err.message}`);
      }

      let reply = '';
      await loop.run(
        text,
        () => {},
        () => {},
        r => { reply = r; }
      );

      const response = reply || 'done.';
      
      // Discord has 2000 char limit per message
      if (response.length > 1900) {
        const chunks = response.match(/(.{1,1900})/g) || [];
        for (const chunk of chunks) {
          await msg.reply(chunk);
          await this._sleep(500);
        }
      } else {
        await msg.reply(response);
      }
    } catch (e) {
      log && log(`discord error: ${e.message}`);
      try {
        await msg.reply('error: ' + e.message);
      } catch (replyErr) {
        log && log(`discord error reply failed: ${replyErr.message}`);
      }
    } finally {
      this.busy.delete(userId);
    }
  }

  _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

module.exports = new Discord();
