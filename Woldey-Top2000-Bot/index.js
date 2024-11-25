const { Client, GatewayIntentBits, ActivityType, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const { loadCommands } = require('./functions/loadCommands');
const { updateTrackInfo } = require('./functions/updateTrackInfo');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Map();
client.voiceConnections = new Map();

const commandsDir = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

console.log('Commands::');
const commands = loadCommands(commandFiles, commandsDir, client);
const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands }
        );
        console.log('Slash commands zijn ingeladen');
    } catch (error) {
        console.error(error);
    }
})();

client.on("ready", async () => {
    console.log(`${client.user.username} is online`);
    await updateTrackInfo(client);
    setInterval(() => updateTrackInfo(client), 30000);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client); 
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Er is iets fout gegaan bij het laden van de command. Kijk de error na in het console.', ephemeral: true });
    }
});

client.login(config.token);
