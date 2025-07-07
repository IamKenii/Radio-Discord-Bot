const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createAudioResource } = require('@discordjs/voice');
const { createVoiceConnection, isInVoiceChannel } = require('../../functions/voiceEventHandler');

// Radio stream configuratie
const RADIO_CONFIG = {
    url: 'http://icecast.omroep.nl/radio2-bb-mp3',
    name: 'NPO Radio 2',
    defaultVolume: 0.1,
    maxRetries: 3,
    retryDelay: 2000
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('radio')
        .setDescription('Speelt live NPO Radio 2')
        .addNumberOption(option =>
            option.setName('volume')
                .setDescription('Start volume (1-100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(false)
        ),
    
    async execute(interaction, client) {
        const voiceChannel = interaction.member.voice.channel;
        const startVolume = interaction.options.getNumber('volume') || (RADIO_CONFIG.defaultVolume * 100);
        
        // Validaties
        if (!voiceChannel) {
            return await interaction.reply({
                embeds: [createErrorEmbed('🔊 Je moet in een spraakkanaal zitten om radio te kunnen starten.')],
                ephemeral: true
            });
        }
        
        if (isInVoiceChannel(interaction.guild.id, client)) {
            return await interaction.reply({
                embeds: [createErrorEmbed('📻 Ik ben al verbonden met een spraakkanaal! Gebruik `/leave` om me te laten vertrekken.')],
                ephemeral: true
            });
        }
        
        // Defer reply voor langdurige operatie
        await interaction.deferReply({ ephemeral: true });
        
        try {
            const voiceData = await startRadioStream(voiceChannel, interaction, client, startVolume);
            
            if (!voiceData) {
                return await interaction.editReply({
                    embeds: [createErrorEmbed('❌ Kon geen verbinding maken met het spraakkanaal.')]
                });
            }
            
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎵 Radio gestart!')
                .setDescription(`**${RADIO_CONFIG.name}** speelt nu in **${voiceChannel.name}**`)
                .addFields(
                    { name: '📊 Volume', value: `${startVolume}%`, inline: true },
                    { name: '🎵 Stream', value: RADIO_CONFIG.name, inline: true },
                    { name: '💡 Tip', value: 'Gebruik `/volume` om het volume aan te passen', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'Radio gestart' });
            
            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('❌ Radio command error:', error);
            await interaction.editReply({
                embeds: [createErrorEmbed('❌ Er is een fout opgetreden bij het starten van de radio.')]
            });
        }
    }
};

/**
 * Start radio stream met retry logica
 * @param {VoiceChannel} voiceChannel - Voice channel om te joinen
 * @param {Interaction} interaction - Discord interaction
 * @param {Client} client - Discord client
 * @param {number} startVolume - Start volume percentage
 * @returns {Object|null} Voice data of null bij fout
 */
async function startRadioStream(voiceChannel, interaction, client, startVolume) {
    let retries = 0;
    
    while (retries < RADIO_CONFIG.maxRetries) {
        try {
            // Maak voice connection
            const voiceData = createVoiceConnection({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator
            }, client);
            
            if (!voiceData) {
                throw new Error('Kon geen voice connection maken');
            }
            
            // Maak audio resource
            const resource = createAudioResource(RADIO_CONFIG.url, {
                inlineVolume: true,
                inputType: 'arbitrary' // Voor betere compatibility
            });
            
            // Stel volume in
            if (resource.volume) {
                resource.volume.setVolume(startVolume / 100);
            }
            
            // Start playback
            voiceData.player.play(resource);
            
            // Voeg resource toe aan voiceData voor volume control
            voiceData.resource = resource;
            voiceData.streamUrl = RADIO_CONFIG.url;
            voiceData.streamName = RADIO_CONFIG.name;
            
            // Update voiceManager
            client.voiceManager.set(interaction.guild.id, voiceData);
            
            console.log(`🎵 Radio gestart in ${voiceChannel.name} (${interaction.guild.name})`);
            return voiceData;
            
        } catch (error) {
            retries++;
            console.error(`❌ Radio start poging ${retries}/${RADIO_CONFIG.maxRetries} gefaald:`, error);
            
            if (retries < RADIO_CONFIG.maxRetries) {
                console.log(`🔄 Opnieuw proberen in ${RADIO_CONFIG.retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, RADIO_CONFIG.retryDelay));
            }
        }
    }
    
    return null;
}

/**
 * Maak error embed
 * @param {string} message - Error message
 * @returns {EmbedBuilder} Error embed
 */
function createErrorEmbed(message) {
    return new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Fout')
        .setDescription(message)
        .setTimestamp();
}
