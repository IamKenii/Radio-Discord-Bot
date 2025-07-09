const { Client, GatewayIntentBits, ActivityType, REST, Routes } = require('discord.js');
const config = require('./config.json');
const { loadCommands } = require('./functions/loadCommands');
const { handleVoiceEvents } = require('./functions/voiceEventHandler');

// Configuratie validatie.
if (!config.token || !config.clientId || !config.guildId) {
    console.error('❌ Ontbrekende configuratie! Controleer config.json');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Centralized data storage
client.commands = new Map();
client.voiceManager = new Map();

// Laad commands
console.log('🔄 Commands laden...');
const startTime = Date.now();
const commands = loadCommands(client);
const loadTime = Date.now() - startTime;
console.log(`✅ ${commands.length} commands geladen in ${loadTime}ms`);

// Registreer slash commands
async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(config.token);
    
    try {
        console.log('🔄 Slash commands registreren...');
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands }
        );
        console.log('✅ Slash commands geregistreerd');
    } catch (error) {
        console.error('❌ Fout bij registreren commands:', error);
        process.exit(1);
    }
}

// Event handlers
client.once('ready', async () => {
    console.log(`✅ ${client.user.username} is online!`);
    console.log(`📊 Actief in ${client.guilds.cache.size} servers`);

    client.user.setPresence({ activities: [{ name: `${config.status}`, type: ActivityType.Watching }],status: 'dnd' });

    // Voice event handlers instellen
    handleVoiceEvents(client);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    
    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.warn(`⚠️ Onbekende command: ${interaction.commandName}`);
        return;
    }
    
    try {
        console.log(`📝 Command uitgevoerd: ${interaction.commandName} door ${interaction.user.tag}`);
        await command.execute(interaction, client);
    } catch (error) {
        console.error(`❌ Fout bij command ${interaction.commandName}:`, error);
        
        const errorMessage = {
            content: '❌ Er is een fout opgetreden bij het uitvoeren van deze command.',
            ephemeral: true
        };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🔄 Bot wordt afgesloten...');
    
    // Verbreek alle voice connections
    for (const [guildId, voiceData] of client.voiceManager) {
        try {
            if (voiceData.connection) {
                voiceData.connection.destroy();
            }
        } catch (error) {
            console.error(`Fout bij afsluiten voice connection voor guild ${guildId}:`, error);
        }
    }
    
    await client.destroy();
    console.log('✅ Bot afgesloten');
    process.exit(0);
});

// Start de bot
registerCommands().then(() => {
    client.login(config.token);
}).catch(error => {
    console.error('❌ Fout bij starten bot:', error);
    process.exit(1);
});
