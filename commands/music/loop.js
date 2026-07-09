const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Mengulang lagu atau antrian')
    .addStringOption(option =>
      option.setName('mode')
        .setDescription('Pilih mode loop')
        .setRequired(true)
        .addChoices(
          { name: 'Lagu (Loop lagu saat ini)', value: 'song' },
          { name: 'Antrian (Loop semua lagu)', value: 'queue' },
          { name: 'Matikan', value: 'off' },
        )),

  async execute(interaction) {
    const musicPlayer = interaction.client.musicPlayer;
    const queue = musicPlayer.getQueue(interaction.guildId);

    if (!queue.currentSong && queue.songs.length === 0) {
      return interaction.reply({
        content: '❌ Tidak ada lagu yang sedang diputar!',
        ephemeral: true,
      });
    }

    const mode = interaction.options.getString('mode');

    if (mode === 'song') {
      musicPlayer.toggleLoop(interaction.guildId);
      queue.loopQueue = false;
    } else if (mode === 'queue') {
      musicPlayer.toggleLoopQueue(interaction.guildId);
      queue.loop = false;
    } else {
      queue.loop = false;
      queue.loopQueue = false;
    }

    const statusText = queue.loop ? '🔁 Loop Lagu (ON)' :
                       queue.loopQueue ? '🔁 Loop Antrian (ON)' :
                       '🔁 Loop (OFF)';

    const embed = new EmbedBuilder()
      .setTitle(statusText)
      .setColor(queue.loop || queue.loopQueue ? '#2ecc71' : '#e74c3c')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
