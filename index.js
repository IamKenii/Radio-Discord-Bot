const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');
const config = require('./config.json');


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const voiceConnections = new Map();

client.once('ready', () => {
    console.log(`${client.user.username} is online`);
    client.user.setActivity("NPO Radio 2 | >", { type: "WATCHING" });

    const commands = [
        new SlashCommandBuilder()
            .setName('radio')
            .setDescription('Play live radio in your voice channel.'),
        new SlashCommandBuilder()
            .setName('volume')
            .setDescription('Adjust the volume of the radio.')
            .addNumberOption(option => option.setName('level').setDescription('Volume level (0-100)').setRequired(true))
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(config.token);
    (async () => {
        try {
            await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });
            console.log('Successfully registered application commands.');
        } catch (error) {
            console.error(error);
        }
    })();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'radio') {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply({ content: 'You need to be in a voice channel to play radio!', ephemeral: true });
            return;
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        const resource = createAudioResource("http://icecast.omroep.nl/radio2-bb-mp3", { inlineVolume: true });
        resource.volume.setVolume(0.1); // Default volume
        player.play(resource);
        connection.subscribe(player);
        voiceConnections.set(interaction.guild.id, { player, resource });

        await interaction.reply({ content: 'Playing NPO Radio 2!', ephemeral: true });
    } else if (interaction.commandName === 'volume') {
        const volumeLevel = interaction.options.getNumber('level') / 100;
        if (volumeLevel < 0 || volumeLevel > 1) {
            await interaction.reply({ content: 'Volume level must be between 0 and 100.', ephemeral: true });
            return;
        }

        const connectionDetails = voiceConnections.get(interaction.guild.id);
        if (connectionDetails) {
            connectionDetails.resource.volume.setVolume(volumeLevel);
            await interaction.reply({ content: `Volume set to ${volumeLevel * 100}%`, ephemeral: true });
        } else {
            await interaction.reply({ content: 'The bot is not playing in any channel.', ephemeral: true });
        }
    }
});

client.login(config.token);
