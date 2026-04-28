'use strict';
const config = require('../config');
const scheduler = require('./scheduler');

class ReminderSystem {
  constructor() {
    this.activeReminders = new Map();
  }

  addReminder(goal) {
    if (!goal.name || !goal.due) throw new Error('Reminder needs name and due date');

    const reminder = {
      name: goal.name,
      due: new Date(goal.due),
      prompt: goal.prompt || `Reminder: ${goal.name} is due soon.`,
      type: 'reminder',
    };

    // Schedule a job to check every hour if due is approaching
    scheduler.addJob({
      name: `reminder_${goal.name}`,
      type: 'interval',
      every: 60, // check every hour
      prompt: reminder.prompt,
      enabled: true,
    });

    this.activeReminders.set(goal.name, reminder);
  }

  removeReminder(name) {
    scheduler.removeJob(`reminder_${name}`);
    this.activeReminders.delete(name);
  }

  getActiveReminders() {
    return Array.from(this.activeReminders.values());
  }

  // Check if any reminders are due (called by proactive)
  checkDueReminders() {
    const now = new Date();
    for (const [name, reminder] of this.activeReminders) {
      const timeDiff = reminder.due - now;
      if (timeDiff <= 0) {
        // Due now
        return reminder.prompt;
      } else if (timeDiff <= 24 * 60 * 60 * 1000) { // within 24 hours
        return `Upcoming: ${reminder.prompt}`;
      }
    }
    return null;
  }
}

module.exports = new ReminderSystem();