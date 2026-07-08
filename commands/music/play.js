const { SlashCommandBuilder } = require('discord.js');
const { play } = require('play-dl');
const MusicPlayer = require('../../utils/musicPlayer');

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
      return interaction.reply('Anda harus berada di voice channel untuk menggunakan perintah ini!');
    }

    const musicPlayer = interaction.client.musicPlayer || new MusicPlayer();
    interaction.client.musicPlayer = musicPlayer;

    await interaction.deferReply();

    try {
      let song;
      if (play.is_url(query)) {
        const info = await play.video_basic_info(query);
        song = {
          title: info.video_details.title,
          url: query,
          duration: info.video_details.durationRaw,
          thumbnail: info.video_details.thumbnails[0].url,
        };
      } else {
        const results = await play.search(query, { limit: 1 });
        song = {
          title: results[0].title,
          url: results[0].url,
          duration: results[0].durationRaw,
          thumbnail: results[0].thumbnails[0],
        };
      }

      if (!musicPlayer.currentSong) {
        await musicPlayer.play(interaction.guild, voiceChannel, song);
        await interaction.editReply(`🎶 **Sedang diputar:** ${song.title}`);
      } else {
        musicPlayer.addToQueue(song);
        await interaction.editReply(`➕ **Ditambahkan ke antrian:** ${song.title}`);
      }
    } catch (error) {
      console.error(error);
      await interaction.editReply('❌ Terjadi kesalahan saat memutar lagu.');
    }
  },
};