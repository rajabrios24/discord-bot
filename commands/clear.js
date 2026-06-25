const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Hapus sejumlah pesan di channel ini')
    .addIntegerOption(option =>
      option.setName('jumlah')
        .setDescription('Jumlah pesan yang ingin dihapus (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('jumlah');

    // Pastikan bot punya permission untuk hapus pesan
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ Bot tidak punya permission **Manage Messages**.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      await interaction.editReply(`✅ Berhasil menghapus **${deleted.size}** pesan.`);
    } catch (err) {
      console.error('[CLEAR] Error:', err);
      await interaction.editReply('❌ Terjadi error saat menghapus pesan. Pastikan pesan tidak lebih dari 14 hari.');
    }
  },
};
