const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Menampilkan antrian lagu'),

  async execute(interaction) {
    const musicPlayer = interaction.client.musicPlayer;
    const queue = musicPlayer.getQueue(interaction.guildId);

    if (!queue.currentSong && queue.songs.length === 0) {
      return interaction.reply({
        content: '❌ Antrian kosong! Ketik `/play <judul/URL>` untuk memutar lagu.',
        ephemeral: true,
      });
    }

    // Build queue list (max 10 songs displayed)
    const maxSongs = 10;
    const songs = queue.songs.slice(0, maxSongs);
    const queueList = songs.map((song, index) =>
      `${index + 1}. [${song.title}](${song.url}) — \` ${song.duration}\` (req: ${song.requestedBy})`
    ).join('\n');

    const remaining = queue.songs.length - maxSongs;
    const footer = remaining > 0 ? `...dan ${remaining} lagu lainnya` : 'Akhir antrian';

    const nowPlayingText = `**Sedang Diputar:** [${queue.currentSong.title}](${queue.currentSong.url}) — \` ${queue.currentSong.duration}\``;

    const embed = new EmbedBuilder()
      .setTitle('🎵 Antrian Lagu')
      .setDescription(nowPlayingText + '\n\n' + (queueList || 'Antrian kosong'))
      .setFooter({ text: `${footer} | Total: ${queue.songs.length} lagu` })
      .setColor('#3498db')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
