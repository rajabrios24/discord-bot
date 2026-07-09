const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { play } = require('play-dl');
const { Song } = require('../../utils/musicPlayer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Memutar lagu dari YouTube, SoundCloud, atau Spotify')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('URL atau judul lagu')
        .setRequired(true)),

  async execute(interaction) {
    const query = interaction.options.getString('query');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: '❌ Kamu harus berada di voice channel untuk menggunakan perintah ini!',
        ephemeral: true,
      });
    }

    const musicPlayer = interaction.client.musicPlayer;
    await interaction.deferReply();

    try {
      // Cek apakah URL YouTube playlist
      if (play.is_url(query) && play.yt_validate(query) === 'playlist') {
        const playlistInfo = await play.playlist_info(query, { incomplete: true });
        const playlistSongs = playlistInfo.videos;

        for (const video of playlistSongs) {
          const song = new Song({
            title: video.title,
            url: video.url,
            duration: video.durationRaw || '0:00',
            thumbnail: video.thumbnails[0]?.url || null,
            requestedBy: interaction.user.tag,
          });
          musicPlayer.addToQueue(interaction.guildId, song);
        }

        const queue = musicPlayer.getQueue(interaction.guildId);
        if (!queue.currentSong) {
          const firstSong = queue.songs.shift();
          await musicPlayer.playSong(interaction.guildId, voiceChannel, firstSong);
        }

        return interaction.editReply({
          content: `🎵 **Playlist dimasukkan ke antrian!** (${playlistSongs.length} lagu)`,
        });
      }

      // Play single song
      let songData;
      if (play.is_url(query)) {
        const info = await play.video_basic_info(query);
        songData = info.video_details;
      } else {
        const results = await play.search(query, { limit: 1 });
        if (results.length === 0) {
          return interaction.editReply('❌ Tidak ditemukan lagu dengan pencarian tersebut.');
        }
        songData = results[0];
      }

      const song = new Song({
        title: songData.title,
        url: songData.url,
        duration: songData.durationRaw || '0:00',
        thumbnail: songData.thumbnails[0]?.url || null,
        requestedBy: interaction.user.tag,
      });

      const queue = musicPlayer.getQueue(interaction.guildId);

      if (!queue.currentSong) {
        await musicPlayer.playSong(interaction.guildId, voiceChannel, song);

        const embed = new EmbedBuilder()
          .setTitle('🎶 Sedang Diputar')
          .setDescription(`**[${song.title}](${song.url})**`)
          .addFields(
            { name: '⏱ Durasi', value: song.duration, inline: true },
            { name: '👤 Request', value: song.requestedBy, inline: true },
          )
          .setThumbnail(song.thumbnail)
          .setColor('#2ecc71')
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } else {
        const pos = musicPlayer.addToQueue(interaction.guildId, song);

        const embed = new EmbedBuilder()
          .setTitle('➕ Ditambahkan ke Antrian')
          .setDescription(`**[${song.title}](${song.url})**`)
          .addFields(
            { name: '⏱ Durasi', value: song.duration, inline: true },
            { name: '📍 Posisi', value: `#${pos}`, inline: true },
            { name: '👤 Request', value: song.requestedBy, inline: true },
          )
          .setThumbnail(song.thumbnail)
          .setColor('#3498db')
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Play command error:', error);
      await interaction.editReply('❌ Terjadi kesalahan saat memutar lagu.');
    }
  },
};
