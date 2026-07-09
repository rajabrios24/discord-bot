require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_TOKEN;

if (!clientId || !guildId || !token) {
  console.error('❌ Missing CLIENT_ID, GUILD_ID, or DISCORD_TOKEN in .env');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

// Read all files and directories in the commands folder
const commandFilesAndFolders = fs.readdirSync(commandsPath);

for (const item of commandFilesAndFolders) {
    const itemPath = path.join(commandsPath, item);
    const stat = fs.statSync(itemPath);

    // If the item is a directory (e.g., 'music'), read its contents
    if (stat.isDirectory()) {
        const commandFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(itemPath, file);
            const command = require(filePath);
            commands.push(command.data.toJSON());
        }
    }
    // If the item is a file (e.g., 'clear.js'), load it directly
    else if (stat.isFile() && item.endsWith('.js')) {
        const command = require(itemPath);
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands for guild ${guildId}.`);
        console.log('Commands:', commands.map(c => c.name).join(', '));

        // Use guild-level registration for instant updates
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
})();
