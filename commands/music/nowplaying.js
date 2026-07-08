const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Menampilkan lagu yang sedang diputar'),

    async execute(interaction) {
        const musicPlayer = interaction.client.musicPlayer;

        if (!musicPlayer || !musicPlayer.currentSong) {
            return interaction.reply('❌ Tidak ada lagu yang sedang diputar!');
        }

        const song = musicPlayer.currentSong;
        const embed = new EmbedBuilder()
            .setTitle('🎵 **Sedang Diputar**')
            .setDescription(`[${song.title}](${song.url}) - [32m${song.duration}[0m`)
            .setThumbnail(song.thumbnail)
            .setColor('#00ff00');

        await interaction.reply({ embeds: [embed] });
    },
};