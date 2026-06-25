const { EmbedBuilder } = require('discord.js');

const LOG_COLORS = {
  join: 0x57f287,    // hijau
  leave: 0xed4245,   // merah
  edit: 0xfee75c,    // kuning
  delete: 0xed4245,  // merah
};

/**
 * Kirim embed log ke LOG_CHANNEL_ID (kalau diset di .env).
 * @param {import('discord.js').Guild} guild
 * @param {EmbedBuilder} embed
 */
async function sendLog(guild, embed) {
  const logChannelId = process.env.LOG_CHANNEL_ID;
  if (!logChannelId) return; // logging opsional, kalau gak diisi ya skip aja

  const channel = guild.channels.cache.get(logChannelId);
  if (!channel) {
    console.warn('[WARN] LOG_CHANNEL_ID tidak ditemukan atau salah di .env');
    return;
  }

  channel.send({ embeds: [embed] }).catch(err => {
    console.error('[LOGGER] Gagal kirim log:', err.message);
  });
}

function logMemberJoin(member) {
  const accountAge = Math.floor(member.user.createdTimestamp / 1000);
  const embed = new EmbedBuilder()
    .setColor(LOG_COLORS.join)
    .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
    .setTitle('📥 Member Join')
    .addFields(
      { name: 'User', value: `${member.user} (\`${member.user.id}\`)`, inline: false },
      { name: 'Akun dibuat', value: `<t:${accountAge}:R>`, inline: true },
      { name: 'Total member', value: `${member.guild.memberCount}`, inline: true },
    )
    .setTimestamp();
  sendLog(member.guild, embed);
}

function logMemberLeave(member) {
  const roles = member.roles?.cache
    ?.filter(r => r.id !== member.guild.id)
    ?.map(r => r.name)
    ?.join(', ') || 'Tidak ada data role';

  const joinedAt = member.joinedTimestamp
    ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
    : 'Tidak diketahui';

  const embed = new EmbedBuilder()
    .setColor(LOG_COLORS.leave)
    .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
    .setTitle('📤 Member Leave')
    .addFields(
      { name: 'User', value: `${member.user.tag} (\`${member.user.id}\`)`, inline: false },
      { name: 'Bergabung', value: joinedAt, inline: true },
      { name: 'Sisa member', value: `${member.guild.memberCount}`, inline: true },
      { name: 'Role yang dimiliki', value: roles.slice(0, 1000), inline: false },
    )
    .setTimestamp();
  sendLog(member.guild, embed);
}

function logMessageEdit(oldMessage, newMessage) {
  if (oldMessage.content === newMessage.content) return; // skip kalau cuma embed/attachment yang berubah
  if (!oldMessage.guild) return; // skip DM

  const embed = new EmbedBuilder()
    .setColor(LOG_COLORS.edit)
    .setAuthor({ name: newMessage.author?.tag || 'Unknown User', iconURL: newMessage.author?.displayAvatarURL() })
    .setTitle('✏️ Message Edited')
    .addFields(
      { name: 'Channel', value: `${newMessage.channel}`, inline: false },
      { name: 'Sebelum', value: truncate(oldMessage.content || '*(kosong/embed)*'), inline: false },
      { name: 'Sesudah', value: truncate(newMessage.content || '*(kosong/embed)*'), inline: false },
    )
    .addFields({ name: 'Link', value: `[Jump to message](${newMessage.url})` })
    .setFooter({ text: `User ID: ${newMessage.author?.id || 'unknown'}` })
    .setTimestamp();
  sendLog(newMessage.guild, embed);
}

function logMessageDelete(message) {
  if (!message.guild) return; // skip DM

  const embed = new EmbedBuilder()
    .setColor(LOG_COLORS.delete)
    .setAuthor({ name: message.author?.tag || 'Unknown User', iconURL: message.author?.displayAvatarURL() })
    .setTitle('🗑️ Message Deleted')
    .addFields(
      { name: 'Channel', value: `${message.channel}`, inline: false },
      { name: 'Isi pesan', value: truncate(message.content || '*(kosong/embed/attachment)*'), inline: false },
    )
    .setFooter({ text: `User ID: ${message.author?.id || 'unknown'}` })
    .setTimestamp();

  // kalau ada attachment, sebutkan jumlahnya (file aslinya gak bisa di-recover setelah delete)
  if (message.attachments?.size > 0) {
    embed.addFields({ name: 'Attachment', value: `${message.attachments.size} file (tidak bisa ditampilkan ulang)` });
  }

  sendLog(message.guild, embed);
}

function truncate(text, max = 1000) {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + '...';
}

module.exports = {
  logMemberJoin,
  logMemberLeave,
  logMessageEdit,
  logMessageDelete,
};
