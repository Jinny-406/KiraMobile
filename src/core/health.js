'use strict';
const config = require('../config');
const scheduler = require('./scheduler');
const os = require('os');

class HealthSystem {
  constructor() {
    this.lastBreak = Date.now();
    this.sessionStart = Date.now();
  }

  startMonitoring() {
    scheduler.addJob({
      name: 'health_check',
      type: 'interval',
      every: 30, // check every 30 mins
      prompt: 'Health check',
      enabled: true,
    });
  }

  // Called by proactive to get health prompt
  getHealthPrompt() {
    const now = Date.now();
    const sessionDuration = (now - this.sessionStart) / (1000 * 60); // minutes
    const sinceLastBreak = (now - this.lastBreak) / (1000 * 60);

    if (sinceLastBreak > 60) { // 1 hour
      this.lastBreak = now;
      return 'Time for a break! Stretch and hydrate.';
    } else if (sessionDuration > 120) { // 2 hours
      return 'Long session detected. Take a 10-minute walk.';
    }
    return null;
  }
}

module.exports = new HealthSystem();