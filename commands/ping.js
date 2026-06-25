const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Cek apakah bot online dan berapa latency-nya'),

  async execute(interaction) {
    const sent = await interaction.reply({ content: '🏓 Menghitung ping...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`🏓 Pong! Latency: \`${latency}ms\` | WebSocket: \`${interaction.client.ws.ping}ms\``);
  },
};
