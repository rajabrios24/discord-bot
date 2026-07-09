const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Bot meninggalkan voice channel'),

  async execute(interaction) {
    const musicPlayer = interaction.client.musicPlayer;
    const queue = musicPlayer.getQueue(interaction.guildId);

    if (!queue.currentSong && queue.songs.length === 0) {
      return interaction.reply({
        content: '❌ Bot tidak sedang berada di voice channel!',
        ephemeral: true,
      });
    }

    musicPlayer.leave(interaction.guildId);
    await interaction.reply('👋 **Bot meninggalkan voice channel!**');
  },
};
