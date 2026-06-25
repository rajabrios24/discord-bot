const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Atur slowmode di channel ini')
    .addIntegerOption(option =>
      option.setName('detik')
        .setDescription('Durasi slowmode dalam detik (0 untuk nonaktif, maks 21600)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const seconds = interaction.options.getInteger('detik');

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: '❌ Bot tidak punya permission **Manage Channels**.', ephemeral: true });
    }

    try {
      await interaction.channel.setRateLimitPerUser(seconds);

      if (seconds === 0) {
        await interaction.reply(`✅ Slowmode **dinonaktifkan** di channel ini.`);
      } else {
        const format = seconds >= 3600
          ? `${Math.floor(seconds / 3600)} jam ${Math.floor((seconds % 3600) / 60)} menit`
          : seconds >= 60
            ? `${Math.floor(seconds / 60)} menit ${seconds % 60} detik`
            : `${seconds} detik`;
        await interaction.reply(`✅ Slowmode diatur ke **${format}** di channel ini.`);
      }
    } catch (err) {
      console.error('[SLOWMODE] Error:', err);
      await interaction.reply({ content: '❌ Gagal mengatur slowmode.', ephemeral: true });
    }
  },
};
