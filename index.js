require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const MusicPlayer = require('./utils/musicPlayer');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();
client.musicPlayer = new MusicPlayer();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
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
            client.commands.set(command.data.name, command);
        }
    }
    // If the item is a file (e.g., 'clear.js'), load it directly
    else if (stat.isFile() && item.endsWith('.js')) {
        const command = require(itemPath);
        client.commands.set(command.data.name, command);
    }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(process.env.DISCORD_TOKEN);
