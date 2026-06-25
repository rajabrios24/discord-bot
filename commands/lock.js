const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Kunci channel ini (member biasa tidak bisa kirim pesan)')
    .addStringOption(option =>
      option.setName('alasan')
        .setDescription('Alasan mengunci channel (opsional)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: '❌ Bot tidak punya permission **Manage Channels**.', ephemeral: true });
    }

    const reason = interaction.options.getString('alasan') || 'Tidak ada alasan';
    const everyoneRole = interaction.guild.roles.everyone;

    try {
      await interaction.channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: false,
      });

      await interaction.reply(`🔒 Channel ini telah **dikunci**.\n**Alasan:** ${reason}`);
    } catch (err) {
      console.error('[LOCK] Error:', err);
      await interaction.reply({ content: '❌ Gagal mengunci channel.', ephemeral: true });
    }
  },
};
