const { Events } = require('discord.js');
const { logMessageDelete } = require('../utils/logger');

module.exports = {
  name: Events.MessageDelete,
  once: false,
  execute(message) {
    // Skip pesan dari bot sendiri biar gak spam log
    if (message.author?.bot) return;

    // Skip kalau partial (pesan lama yang gak ke-cache, content-nya gak bisa dibaca)
    if (message.partial) return;

    logMessageDelete(message);
  },
};
