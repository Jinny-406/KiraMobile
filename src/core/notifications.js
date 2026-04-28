'use strict';
const config = require('../config');
const scheduler = require('./scheduler');

class NotificationSystem {
  constructor() {
    this.notifications = new Map();
  }

  addNotification(type, config) {
    // type: 'weather', 'news', etc.
    const notif = {
      type,
      enabled: config.enabled !== false,
      interval: config.interval || 60, // minutes
      prompt: config.prompt || `Notification: ${type} update.`,
    };

    if (notif.enabled) {
      scheduler.addJob({
        name: `notification_${type}`,
        type: 'interval',
        every: notif.interval,
        prompt: notif.prompt,
        enabled: true,
      });
    }

    this.notifications.set(type, notif);
  }

  removeNotification(type) {
    scheduler.removeJob(`notification_${type}`);
    this.notifications.delete(type);
  }

  // Fetch and return notification content (called by proactive)
  async getNotification(type) {
    try {
      if (type === 'weather') {
        // Placeholder: integrate with weather API
        return 'Weather: Sunny, 75°F';
      } else if (type === 'news') {
        // Placeholder: integrate with news API
        return 'News: AI advances continue.';
      }
    } catch (e) {
      return null;
    }
    return null;
  }
}

module.exports = new NotificationSystem();