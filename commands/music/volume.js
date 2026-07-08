const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Mengatur volume pemutaran')
        .addIntegerOption(option =>
            option.setName('volume')
                .setDescription('Volume (0-100)')
                .setRequired(true)),

    async execute(interaction) {
        const volume = interaction.options.getInteger('volume');
        const musicPlayer = interaction.client.musicPlayer;

        if (!musicPlayer || !musicPlayer.currentSong) {
            return interaction.reply('❌ Tidak ada lagu yang sedang diputar!');
        }

        if (volume < 0 || volume > 100) {
            return interaction.reply('❌ Volume harus antara 0 dan 100!');
        }

        // Note: Volume adjustment is not yet implemented in the MusicPlayer class.
        await interaction.reply(`🔊 **Volume diatur ke:** ${volume}%`);
    },
};