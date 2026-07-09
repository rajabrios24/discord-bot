const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Menampilkan lagu yang sedang diputar'),

  async execute(interaction) {
    const musicPlayer = interaction.client.musicPlayer;
    const queue = musicPlayer.getQueue(interaction.guildId);

    if (!queue.currentSong) {
      return interaction.reply({
        content: '❌ Tidak ada lagu yang sedang diputar!',
        ephemeral: true,
      });
    }

    const song = queue.currentSong;
    const queueSize = queue.songs.length;

    const embed = new EmbedBuilder()
      .setTitle('🎵 Sedang Diputar')
      .setDescription(`**[${song.title}](${song.url})**`)
      .addFields(
        { name: '⏱ Durasi', value: song.duration, inline: true },
        { name: '👤 Request', value: song.requestedBy, inline: true },
        { name: '📋 Dalam Antrian', value: `${queueSize} lagu`, inline: true },
      )
      .setThumbnail(song.thumbnail)
      .setColor('#2ecc71')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
