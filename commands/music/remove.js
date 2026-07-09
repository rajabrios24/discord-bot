const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Menghapus lagu dari antrian')
    .addIntegerOption(option =>
      option.setName('posisi')
        .setDescription('Posisi lagu dalam antrian (dimulai dari 1)')
        .setRequired(true)
        .setMinValue(1)),

  async execute(interaction) {
    const pos = interaction.options.getInteger('posisi');
    const musicPlayer = interaction.client.musicPlayer;
    const queue = musicPlayer.getQueue(interaction.guildId);

    if (queue.songs.length === 0) {
      return interaction.reply({
        content: '❌ Antrian kosong!',
        ephemeral: true,
      });
    }

    if (pos > queue.songs.length) {
      return interaction.reply({
        content: `❌ Posisi ${pos} tidak ada. Antrian hanya berisi ${queue.songs.length} lagu.`,
        ephemeral: true,
      });
    }

    const removed = musicPlayer.removeFromQueue(interaction.guildId, pos - 1);

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Lagu Dihapus dari Antrian')
      .setDescription(`**[${removed.title}](${removed.url})** dihapus dari posisi #${pos}`)
      .setColor('#e74c3c')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
