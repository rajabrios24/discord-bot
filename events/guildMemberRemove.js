const { Events, EmbedBuilder } = require('discord.js');
const { logMemberLeave } = require('../utils/logger');

module.exports = {
  name: Events.GuildMemberRemove,
  once: false,
  execute(member) {
    // ===== 1. GOODBYE MESSAGE =====
    const channelId = process.env.GOODBYE_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(channelId);

    if (channel) {
      const embed = new EmbedBuilder()
        .setColor(0xed4245) // merah
        .setTitle('👋 Sampai Jumpa')
        .setDescription(`**${member.user.tag}** telah meninggalkan server.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Sisa member', value: `${member.guild.memberCount}`, inline: true },
        )
        .setTimestamp();

      channel.send({ embeds: [embed] }).catch(console.error);
    } else {
      console.warn('[WARN] GOODBYE_CHANNEL_ID tidak ditemukan atau salah di .env');
    }

    // ===== 2. LOGGING (detail lebih lengkap: role, kapan join, dll) =====
    logMemberLeave(member);
  },
};
