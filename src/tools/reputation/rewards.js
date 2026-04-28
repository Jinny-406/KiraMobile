'use strict';
const fs       = require('fs');
const path     = require('path');
const config = require('../../config');
const registry = require('../registry');

const REWARDS_FILE = path.join(config.CONFIG_DIR, 'rewards.json');

function load() {
  if (!fs.existsSync(REWARDS_FILE)) {
    return { userPoints: 0, kiraPoints: 0, history: [], rewards: [], enabled: true };
  }
  try { return JSON.parse(fs.readFileSync(REWARDS_FILE, 'utf8')); }
  catch { return { userPoints: 0, kiraPoints: 0, history: [], rewards: [], enabled: true }; }
}

function save(data) {
  fs.writeFileSync(REWARDS_FILE, JSON.stringify(data, null, 2));
}

function addPoints(to, amount, reason) {
  const data = load();
  if (to === 'user') {
    data.userPoints += amount;
  } else {
    data.kiraPoints += amount;
  }
  data.history.push({ to, amount, reason, at: new Date().toISOString() });
  if (data.history.length > 30) data.history = data.history.slice(-30);
  save(data);
  return `${to}: ${to === 'user' ? data.userPoints : data.kiraPoints} points`;
}

function addReward(reward, cost) {
  const data = load();
  data.rewards.push({ reward, cost, added: new Date().toISOString() });
  save(data);
  return `reward added: ${reward} (${cost} points)`;
}

function redeemReward(reward) {
  const data = load();
  const r = data.rewards.find(r => r.reward === reward);
  if (r && data.userPoints >= r.cost) {
    data.userPoints -= r.cost;
    data.history.push({ action: 'redeemed', reward, at: new Date().toISOString() });
    save(data);
    return `redeemed: ${reward}`;
  }
  return 'not enough points or reward not found';
}

function getPoints() {
  const data = load();
  return { user: data.userPoints, kira: data.kiraPoints };
}

function getHistory() {
  const data = load();
  return data.history.slice(-10).map(h => `${h.at.slice(11, 16)}: ${h.to || h.action} ${h.amount ? h.amount + 'pts' : ''} (${h.reason || h.reward})`).join('\n');
}

function listRewards() {
  const data = load();
  return data.rewards.map(r => `${r.reward}: ${r.cost}pts`).join('\n') || 'no rewards';
}

function enable() {
  const data = load(); data.enabled = true; save(data);
  return 'enabled';
}

function disable() {
  const data = load(); data.enabled = false; save(data);
  return 'disabled';
}

registry.register('points_add', async ({ to, amount, reason }) => {
  if (!to || !amount) return 'error: to and amount required';
  return addPoints(to, Number(amount), reason);
}, 'add points. args: to (user/kira), amount, reason');

registry.register('points_get', async () => {
  const p = getPoints();
  return `User: ${p.user}\nKira: ${p.kira}`;
}, 'get points');

registry.register('reward_add', async ({ reward, cost }) => {
  if (!reward || !cost) return 'error: reward and cost required';
  return addReward(reward, Number(cost));
}, 'add a reward. args: reward, cost');

registry.register('reward_redeem', async ({ reward }) => {
  if (!reward) return 'error: reward required';
  return redeemReward(reward);
}, 'redeem a reward. args: reward');

registry.register('rewards_list', async () => {
  return listRewards();
}, 'list rewards');

registry.register('rewards_enable', async () => enable(), 'enable rewards');

registry.register('rewards_disable', async () => disable(), 'disable rewards');

module.exports = { addPoints, addReward, redeemReward, getPoints };