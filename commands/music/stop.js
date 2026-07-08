const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Menghentikan pemutaran dan membersihkan antrian'),

    async execute(interaction) {
        const musicPlayer = interaction.client.musicPlayer;

        if (!musicPlayer || !musicPlayer.currentSong) {
            return interaction.reply('❌ Tidak ada lagu yang sedang diputar!');
        }

        musicPlayer.stop();
        await interaction.reply('⏹️ **Pemutaran dihentikan!**');
    },
};