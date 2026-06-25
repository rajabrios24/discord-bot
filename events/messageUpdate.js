const { Events } = require('discord.js');
const { logMessageEdit } = require('../utils/logger');

module.exports = {
  name: Events.MessageUpdate,
  once: false,
  execute(oldMessage, newMessage) {
    // Skip pesan dari bot sendiri biar gak spam log
    if (newMessage.author?.bot) return;

    // Skip kalau partial (pesan lama yang gak ke-cache, content-nya gak bisa dibaca)
    if (oldMessage.partial || newMessage.partial) return;

    logMessageEdit(oldMessage, newMessage);
  },
};
