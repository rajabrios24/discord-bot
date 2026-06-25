const { Events, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { generateWelcomeImage } = require('../utils/welcomeImage');
const { logMemberJoin } = require('../utils/logger');

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member) {
    // ===== 1. WELCOME MESSAGE (dengan custom canvas image) =====
    const channelId = process.env.WELCOME_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(channelId);

    if (channel) {
      try {
        const imageBuffer = await generateWelcomeImage({
          avatarURL: member.user.displayAvatarURL({ extension: 'png', size: 256 }),
          username: member.user.username,
          guildName: member.guild.name,
          memberCount: member.guild.memberCount,
          gradientColors: ['#1f1c2c', '#928dab'], // ganti di sini kalau mau warna lain
        });

        const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome.png' });

        const embed = new EmbedBuilder()
          .setColor(0x57f287)
          .setDescription(`Halo ${member.user}, selamat datang di **${member.guild.name}**! 🎉`)
          .setImage('attachment://welcome.png')
          .setFooter({ text: 'Semoga betah di sini ya!' })
          .setTimestamp();

        await channel.send({ content: `${member.user}`, embeds: [embed], files: [attachment] });
      } catch (err) {
        console.error('[WELCOME] Gagal generate/kirim welcome image:', err);
      }
    } else {
      console.warn('[WARN] WELCOME_CHANNEL_ID tidak ditemukan atau salah di .env');
    }

    // ===== 2. AUTO ROLE =====
    const autoRoleId = process.env.AUTO_ROLE_ID;
    if (autoRoleId) {
      const role = member.guild.roles.cache.get(autoRoleId);
      if (role) {
        try {
          await member.roles.add(role);
          console.log(`[AUTOROLE] Memberikan role "${role.name}" ke ${member.user.tag}`);
        } catch (err) {
          console.error('[AUTOROLE] Gagal memberi role. Cek posisi role bot di server settings:', err.message);
        }
      } else {
        console.warn('[WARN] AUTO_ROLE_ID tidak ditemukan atau salah di .env');
      }
    }

    // ===== 3. LOGGING =====
    logMemberJoin(member);
  },
};
