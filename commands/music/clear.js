const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearqueue')
    .setDescription('Menghapus semua lagu dari antrian'),

  async execute(interaction) {
    const musicPlayer = interaction.client.musicPlayer;
    const queue = musicPlayer.getQueue(interaction.guildId);

    if (queue.songs.length === 0) {
      return interaction.reply({
        content: '❌ Antrian sudah kosong!',
        ephemeral: true,
      });
    }

    const count = queue.songs.length;
    musicPlayer.clearQueue(interaction.guildId);
    await interaction.reply(`🗑️ **${count} lagu dihapus dari antrian!**`);
  },
};
