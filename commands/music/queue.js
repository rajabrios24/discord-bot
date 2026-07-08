const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Menampilkan antrian lagu'),

    async execute(interaction) {
        const musicPlayer = interaction.client.musicPlayer;

        if (!musicPlayer || musicPlayer.queue.length === 0) {
            return interaction.reply('❌ Antrian kosong!');
        }

        const queueList = musicPlayer.queue.map((song, index) => `${index + 1}. ${song.title} - [32m${song.duration}[0m`).join('\n');
        const embed = new EmbedBuilder()
            .setTitle('🎶 **Antrian Lagu**')
            .setDescription(queueList)
            .setColor('#00ff00');

        await interaction.reply({ embeds: [embed] });
    },
};