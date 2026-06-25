const { Events, MessageFlags } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  async execute(interaction, client) {
    // ===== Handler untuk Slash Command =====
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(err);
        const reply = { content: '❌ Terjadi error saat menjalankan command ini.', flags: MessageFlags.Ephemeral };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
      return;
    }

    // ===== Handler untuk Button Role =====
    if (interaction.isButton() && interaction.customId.startsWith('role_')) {
      const roleId = interaction.customId.replace('role_', '');
      const button = config.roleButtons.find(b => b.roleId === roleId);
      const role = interaction.guild.roles.cache.get(roleId);

      if (!role) {
        return interaction.reply({
          content: '❌ Role tidak ditemukan. Cek kembali ID role di config.json.',
          flags: MessageFlags.Ephemeral,
        });
      }

      const member = interaction.member;

      try {
        if (member.roles.cache.has(roleId)) {
          // sudah punya role -> lepas
          await member.roles.remove(roleId);
          await interaction.reply({
            content: `🔻 Role **${button?.label || role.name}** dilepas dari kamu.`,
            flags: MessageFlags.Ephemeral,
          });
        } else {
          // belum punya role -> kasih
          await member.roles.add(roleId);
          await interaction.reply({
            content: `✅ Role **${button?.label || role.name}** berhasil ditambahkan ke kamu!`,
            flags: MessageFlags.Ephemeral,
          });
        }
      } catch (err) {
        console.error(err);
        await interaction.reply({
          content: '❌ Gagal mengubah role. Pastikan role bot posisinya di atas role yang dimaksud (Server Settings > Roles).',
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
