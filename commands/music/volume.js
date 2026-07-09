const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Mengatur volume pemutaran')
    .addIntegerOption(option =>
      option.setName('volume')
        .setDescription('Volume (0-100)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(100)),

  async execute(interaction) {
    const vol = interaction.options.getInteger('volume');
    const musicPlayer = interaction.client.musicPlayer;
    const queue = musicPlayer.getQueue(interaction.guildId);

    if (!queue.currentSong) {
      return interaction.reply({
        content: '❌ Tidak ada lagu yang sedang diputar!',
        ephemeral: true,
      });
    }

    musicPlayer.setVolume(interaction.guildId, vol);

    const barLength = 10;
    const filledBars = Math.round((vol / 100) * barLength);
    const bar = '█'.repeat(filledBars) + '░'.repeat(barLength - filledBars);

    const embed = new EmbedBuilder()
      .setTitle('🔊 Volume Diubah')
      .setDescription(`${bar} **${vol}%**`)
      .setColor('#9b59b6')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
