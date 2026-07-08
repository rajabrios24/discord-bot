const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Mengulang lagu yang sedang diputar'),

    async execute(interaction) {
        const musicPlayer = interaction.client.musicPlayer;

        if (!musicPlayer || !musicPlayer.currentSong) {
            return interaction.reply('❌ Tidak ada lagu yang sedang diputar!');
        }

        musicPlayer.toggleLoop();
        const status = musicPlayer.loop ? '🔁 **Diaktifkan**' : '🔁 **Dimatikan**';
        await interaction.reply(`Loop: ${status}`);
    },
};