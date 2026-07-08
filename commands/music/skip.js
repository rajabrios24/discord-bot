const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Melewati lagu yang sedang diputar'),

    async execute(interaction) {
        const musicPlayer = interaction.client.musicPlayer;

        if (!musicPlayer || !musicPlayer.currentSong) {
            return interaction.reply('❌ Tidak ada lagu yang sedang diputar!');
        }

        musicPlayer.skip(interaction.guild, interaction.member.voice.channel);
        await interaction.reply('⏭️ **Lagu dilewati!**');
    },
};