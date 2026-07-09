const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Menjeda lagu yang sedang diputar'),

  async execute(interaction) {
    const musicPlayer = interaction.client.musicPlayer;
    const queue = musicPlayer.getQueue(interaction.guildId);

    if (!queue.currentSong) {
      return interaction.reply({
        content: '❌ Tidak ada lagu yang sedang diputar!',
        ephemeral: true,
      });
    }

    if (queue.paused) {
      return interaction.reply('⏸️ Lagu sudah dijeda!');
    }

    musicPlayer.pause(interaction.guildId);
    await interaction.reply('⏸️ **Lagu dijeda!** Ketik `/resume` untuk melanjutkan.');
  },
};
