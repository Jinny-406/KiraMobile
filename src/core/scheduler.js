'use strict';

class JobScheduler {
  constructor() {
    this.jobs = new Map();
  }

  addJob(config) {
    if (!config.name) throw new Error('Job must have a name');

    const job = {
      name: config.name,
      type: config.type || 'interval',  // 'interval' or 'daily'
      every: config.every || 30,        // minutes for interval
      time: config.time,                // 'HH:MM' for daily
      prompt: config.prompt,
      enabled: config.enabled !== false,
      lastRun: null,
    };

    if (job.enabled && job.type === 'interval') {
      job.intervalId = setInterval(() => {
        this._executeJob(job);
      }, job.every * 60 * 1000);
    }

    job.runs = 0;
    job.next  = job.type === 'interval' ? new Date(Date.now() + job.every * 60 * 1000) : null;
    this.jobs.set(config.name, job);
  }

  removeJob(name) {
    const job = this.jobs.get(name);
    if (!job) return false;
    if (job && job.intervalId) {
      clearInterval(job.intervalId);
    }
    this.jobs.delete(name);
    return true;
  }

  async _executeJob(job) {
    try {
      job.lastRun = new Date();
      job.runs = (job.runs || 0) + 1;
      if (job.type === 'interval') {
        job.next = new Date(Date.now() + job.every * 60 * 1000);
      }
      // Implementation would call AI with job.prompt
    } catch (e) {
      console.error(`[scheduler] job ${job.name} failed:`, e.message);
    }
  }

  start(context) {
    // context: { telegram, loop, tui }
    // Initialize scheduled jobs
  }

  stop() {
    for (const [_, job] of this.jobs) {
      if (job.intervalId) clearInterval(job.intervalId);
    }
    this.jobs.clear();
  }

  listJobs() {
    return Array.from(this.jobs.values()).map(job => ({
      name: job.name,
      type: job.type,
      next: job.next || 'unknown',
      runs: job.runs || 0,
      enabled: job.enabled,
    }));
  }
}

module.exports = new JobScheduler();