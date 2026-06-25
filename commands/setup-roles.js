const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const config = require('../config.json');

const styleMap = {
  Primary: ButtonStyle.Primary,
  Secondary: ButtonStyle.Secondary,
  Success: ButtonStyle.Success,
  Danger: ButtonStyle.Danger,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-roles')
    .setDescription('Kirim pesan pemilihan role dengan button (sesuai config.json)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    if (!config.roleButtons || config.roleButtons.length === 0) {
      return interaction.reply({ content: '❌ Belum ada role yang dikonfigurasi di config.json.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🎭 Pilih Role Kamu')
      .setDescription('Klik button di bawah untuk mendapatkan atau melepas role. Klik lagi untuk melepasnya.');

    // Maks 5 button per row, Discord limit
    const rows = [];
    let currentRow = new ActionRowBuilder();

    config.roleButtons.forEach((btn, i) => {
      if (i % 5 === 0 && i !== 0) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder();
      }
      currentRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`role_${btn.roleId}`)
          .setLabel(btn.label)
          .setEmoji(btn.emoji || undefined)
          .setStyle(styleMap[btn.style] || ButtonStyle.Primary)
      );
    });
    rows.push(currentRow);

    await interaction.reply({ embeds: [embed], components: rows });
  },
};
