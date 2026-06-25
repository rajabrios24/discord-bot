const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Buka kunci channel ini (member kembali bisa kirim pesan)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: '❌ Bot tidak punya permission **Manage Channels**.', ephemeral: true });
    }

    const everyoneRole = interaction.guild.roles.everyone;

    try {
      await interaction.channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: null, // null = inherit dari channel settings
      });

      await interaction.reply(`🔓 Channel ini telah **dibuka kembali**.`);
    } catch (err) {
      console.error('[UNLOCK] Error:', err);
      await interaction.reply({ content: '❌ Gagal membuka kunci channel.', ephemeral: true });
    }
  },
};
