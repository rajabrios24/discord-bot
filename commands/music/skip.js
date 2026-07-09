const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Melewati lagu yang sedang diputar'),

  async execute(interaction) {
    const musicPlayer = interaction.client.musicPlayer;
    const queue = musicPlayer.getQueue(interaction.guildId);

    if (!queue.currentSong) {
      return interaction.reply({
        content: '❌ Tidak ada lagu yang sedang diputar!',
        ephemeral: true,
      });
    }

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        content: '❌ Kamu harus berada di voice channel!',
        ephemeral: true,
      });
    }

    const skippedSong = queue.currentSong;
    const hasMore = musicPlayer.skip(interaction.guildId, voiceChannel);

    if (hasMore) {
      const nextSong = queue.songs[0];
      const embed = new EmbedBuilder()
        .setTitle('⏭️ Lagu Dilewati')
        .setDescription(`**[${skippedSong.title}](${skippedSong.url})** dilewati`)
        .addFields({ name: '🎶 Selanjutnya', value: nextSong ? nextSong.title : 'Tidak ada' })
        .setColor('#e67e22')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle('⏭️ Lagu Dilewati')
        .setDescription(`**[${skippedSong.title}](${skippedSong.url})** dilewati. Tidak ada lagu selanjutnya, bot meninggalkan voice channel.`)
        .setColor('#e67e22')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  },
};
