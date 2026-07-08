const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Mengacak antrian lagu'),

    async execute(interaction) {
        const musicPlayer = interaction.client.musicPlayer;

        if (!musicPlayer || musicPlayer.queue.length === 0) {
            return interaction.reply('❌ Antrian kosong!');
        }

        musicPlayer.toggleShuffle();
        const status = musicPlayer.shuffle ? '🔀 **Diaktifkan**' : '🔀 **Dimatikan**';
        await interaction.reply(`Shuffle: ${status}`);
    },
};