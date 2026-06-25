const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`✅ Bot online sebagai ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: 'menjaga server', type: ActivityType.Watching }],
      status: 'online',
    });
  },
};
