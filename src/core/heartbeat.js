'use strict';
const workspace = require('../workspace');
const checkins   = require('../tools/checkins');
const greetings  = require('../tools/greetings');
const config    = require('../config');

class Heartbeat {
  constructor() {
    this.startTime = null;
    this.messages = 0;
    this.interval = null;
    this.status  = 'stopped';
    this.lastActivity = Date.now();
    this.checkinInterval = null;
    this.idleMinutes = 30;
  }

  start() {
    this.startTime = new Date();
    this.status = 'alive';
    
    this.interval = setInterval(() => { 
      this.status = 'alive'; 
    }, 5 * 60 * 1000);
    
    this.checkinInterval = setInterval(() => {
      this.checkProactive();
    }, 5 * 60 * 1000);
    
    process.once('SIGINT',  () => this.stop(true));
    process.once('SIGTERM', () => this.stop(true));
  }

  checkProactive() {
    const cfg = config.load();
    const idleMinutes = cfg.checkinIdleMinutes || this.idleMinutes;
    const idle = (Date.now() - this.lastActivity) / 1000 / 60;
    
    if (idle >= idleMinutes && this.shouldCheckIn()) {
      const checkin = checkins.getRandom();
      
      if (this.onCheckin) {
        this.onCheckin(checkin);
      }
    }
    
    const hour = new Date().getHours();
    if (hour === 8 && new Date().getMinutes() < 5) {
      const greeting = greetings.getGreeting('morning');
      if (this.onCheckin) {
        this.onCheckin(greeting);
      }
    }
    
    if (hour === 22 && new Date().getMinutes() < 5) {
      const greeting = greetings.getGreeting('night');
      if (this.onCheckin) {
        this.onCheckin(greeting);
      }
    }
  }

  shouldCheckIn() {
    const cfg = config.load();
    return cfg.autoCheckins !== false;
  }

  tick() { 
    this.lastActivity = Date.now();
    this.messages++; 
  }

  onProactiveCheckin(callback) {
    this.onCheckin = callback;
  }

  stop(graceful = false) {
    if (this.interval) { clearInterval(this.interval); this.interval = null; }
    if (this.checkinInterval) { clearInterval(this.checkinInterval); this.checkinInterval = null; }
    this.status = 'stopped';
    if (graceful && this.startTime) {
      const mins = Math.round((new Date() - this.startTime) / 60000);
      try {
        workspace.logSession(`- duration: ${mins}m\n- messages: ${this.messages}\n- exit: clean`);
      } catch {}
    }
    process.exit(0);
  }

  uptime() {
    if (!this.startTime) return '0s';
    const s = Math.round((new Date() - this.startTime) / 1000);
    if (s < 60)   return `${s}s`;
    if (s < 3600) return `${Math.floor(s/60)}m`;
    return `${Math.floor(s/3600)}h`;
  }

  info() {
    return { status: this.status, uptime: this.uptime(), messages: this.messages };
  }
}

module.exports = new Heartbeat();