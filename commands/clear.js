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

    // Pastikan user yang jalankan command juga punya permission
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ Kamu tidak punya permission **Manage Messages**.', ephemeral: true });
    }

    // Reply dulu sebelum hapus pesan (ephemeral supaya tidak ikut terhapus)
    await interaction.reply({ content: '🗑️ Menghapus pesan...', ephemeral: true });

    try {
      // Parameter ke-2 (true) = filterOld, hanya hapus pesan < 14 hari
      const deleted = await interaction.channel.bulkDelete(amount, true);

      await interaction.editReply(`✅ Berhasil menghapus **${deleted.size}** pesan.`);
    } catch (err) {
      console.error('[CLEAR] Error:', err);

      let errorMsg = '❌ Gagal menghapus pesan.';
      if (err.code === 50013) {
        errorMsg += ' Bot tidak punya permission yang cukup.';
      } else if (err.code === 50034) {
        errorMsg += ' Tidak ada pesan yang bisa dihapus (mungkin semua pesan lebih dari 14 hari).';
      } else {
        errorMsg += ` Error: ${err.message}`;
      }

      await interaction.editReply(errorMsg);
    }
  },
};
