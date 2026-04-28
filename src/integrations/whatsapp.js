'use strict';
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const os = require('os');
const loop = require('../core/loop');
const config = require('../config');

class WhatsApp {
  constructor() {
    this.client   = null;
    this.running  = false;
    this.allowed  = [];
    this.busy     = new Set(); // per-chat rate limiting
    this.showQR   = false;
    this.authPath = path.join(os.homedir(), '.kira', 'whatsapp-auth');
  }

  init() {
    const cfg = config.load();
    this.allowed = cfg.whatsappAllowed || [];
    return true; // WhatsApp doesn't need token, uses browser auth
  }

  async start(log, showQR = false) {
    if (!this.init()) return false;

    if (this.running) {
      log && log('whatsapp already running');
      return true;
    }

    this.showQR = showQR;

    if (!showQR && !this._hasAuthData()) {
      log && log('WhatsApp not authenticated. Use /whatsapp generate qr to link your phone.');
      return false;
    }

    try {
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: 'kira',
          dataPath: this.authPath,
        }),
      });

      this.client.on('qr', (qr) => {
        if (!this.showQR) {
          log && log('WhatsApp authentication required. Use /whatsapp generate qr to show the QR code.');
          return;
        }

        log && log('WhatsApp QR Code (scan with phone):');
        qrcode.generate(qr, { small: true });
      });

      this.client.on('ready', () => {
        this.running = true;
        log && log('whatsapp connected');
        log && log(`allowed numbers: ${this.allowed.length > 0 ? this.allowed.join(', ') : 'none (all allowed)'}`);
      });

      this.client.on('message', async msg => {
        log && log(`[WhatsApp Raw Message Event] from: ${msg.from}, isGroup: ${msg.isGroupMsg}, hasBody: ${!!msg.body}`);
        try {
          await this._handle(msg, log);
        } catch (e) {
          log && log('whatsapp message handler error: ' + e.message);
        }
      });
      
      this.client.on('message_create', msg => this._handleOutgoing(msg, log));
      this.client.on('error', err => log && log('whatsapp error: ' + err.message));

      await this.client.initialize();
      return this.running;
    } catch (e) {
      log && log('whatsapp init failed: ' + e.message);
      return false;
    }
  }

  async generateQRCode(log) {
    this.showQR = true;
    return this.start(log, true);
  }

  _hasAuthData() {
    try {
      return fs.existsSync(this.authPath) && fs.readdirSync(this.authPath).length > 0;
    } catch {
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
    try {
      // Ignore group messages and own messages
      if (msg.from === msg.to || msg.isGroupMsg) {
        log && log(`whatsapp: ignoring group/own message from ${msg.from}`);
        return;
      }
      if (!msg.body) {
        log && log(`whatsapp: ignoring empty message from ${msg.from}`);
        return;
      }

      const chatId = msg.chatId;
      const contact = await msg.getContact();
      const userName = contact.name || contact.pushname || msg.from;
      const text = msg.body.trim();

      log && log(`whatsapp: message from ${msg.from} (${userName}): "${text}"`);

      // Auth check - allow if list is empty or sender is in list
      if (this.allowed.length > 0) {
        const isAllowed = this._isAllowed(msg.from);
        log && log(`whatsapp: auth check - from: ${msg.from}, allowed: ${this.allowed.join(', ')}, passed: ${isAllowed}`);
        if (!isAllowed) {
          log && log(`whatsapp auth failed for ${msg.from}`);
          try {
            await msg.reply('you are not authorized.');
          } catch (e) {
            log && log(`whatsapp: failed to send auth rejection: ${e.message}`);
          }
          return;
        }
      } else {
        log && log(`whatsapp: no allowed list set, accepting all messages`);
      }

      // Rate limit
      if (this.busy.has(chatId)) {
        try {
          await msg.reply('still working on that...');
        } catch {}
        return;
      }

      this.busy.add(chatId);
      log && log(`whatsapp processing: ${userName}: ${text}`);

      try {
        let reply = '';
        await loop.run(
          text,
          () => { log && log('whatsapp: agent thinking...'); },
          () => { log && log('whatsapp: executing tool...'); },
          r => { 
            reply = r; 
            log && log(`whatsapp: got reply: ${String(r || '(empty)').slice(0, 100)}`);
          }
        );

        const response = reply || 'done.';
        log && log(`whatsapp: sending response (${response.length} chars)`);

        // WhatsApp doesn't have strict limits, but stay reasonable
        if (response.length > 4000) {
          const chunks = response.match(/(.{1,4000})/g) || [];
          for (const chunk of chunks) {
            await msg.reply(chunk);
            await this._sleep(500);
          }
        } else {
          await msg.reply(response);
        }
        log && log('whatsapp: reply sent successfully');
      } catch (e) {
        log && log(`whatsapp processing error: ${e.message}`);
        try {
          await msg.reply('error: ' + e.message);
        } catch (replyErr) {
          log && log(`whatsapp: failed to send error message: ${replyErr.message}`);
        }
      } finally {
        this.busy.delete(chatId);
      }
    } catch (topLevelErr) {
      log && log(`whatsapp handler top-level error: ${topLevelErr.message}`);
    }
  }

  async _handleOutgoing(msg, log) {
    // Track outgoing messages for context (optional)
    // This can be useful for logging conversations
  }

  _isAllowed(phoneNumber) {
    // Extract number from WhatsApp format (e.g., "1234567890@c.us" -> "1234567890")
    const extractNumber = (num) => {
      const match = String(num).match(/(\d+)/);
      return match ? match[1] : '';
    };
    
    const incomingNumber = extractNumber(phoneNumber);
    if (!incomingNumber) return false;
    
    for (const allowed of this.allowed) {
      const allowedNumber = extractNumber(allowed);
      if (incomingNumber === allowedNumber) {
        return true;
      }
    }
    return false;
  }

  _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

module.exports = new WhatsApp();
