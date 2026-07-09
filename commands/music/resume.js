const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Melanjutkan lagu yang dijeda'),

  async execute(interaction) {
    const musicPlayer = interaction.client.musicPlayer;
    const queue = musicPlayer.getQueue(interaction.guildId);

    if (!queue.currentSong) {
      return interaction.reply({
        content: '❌ Tidak ada lagu yang sedang diputar!',
        ephemeral: true,
      });
    }

    if (!queue.paused) {
      return interaction.reply('▶️ Lagu sedang diputar!');
    }

    musicPlayer.resume(interaction.guildId);
    await interaction.reply('▶️ **Lagu dilanjutkan!**');
  },
};
