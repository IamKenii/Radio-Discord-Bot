const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createAudioResource } = require('@discordjs/voice');
const { getVoiceData } = require('../../functions/voiceEventHandler');
const { RADIO_STATIONS } = require('./stations');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('switch')
        .setDescription('Wissel naar een ander radiostation')
        .addStringOption(option => {
            const choices = Object.entries(RADIO_STATIONS).map(([key, station]) => ({
                name: `${station.emoji} ${station.name}`,
                value: key
            }));
            
            return option.setName('station')
                .setDescription('Kies een radiostation')
                .setRequired(true)
                .addChoices(...choices);
        })
        .addNumberOption(option =>
            option.setName('volume')
                .setDescription('Start volume voor nieuwe station (1-100)')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(false)
        ),
    
    async execute(interaction, client) {
        const stationKey = interaction.options.getString('station');
        const volume = interaction.options.getNumber('volume') || 10;
        const voiceData = getVoiceData(interaction.guild.id, client);
        
        // Validaties
        if (!voiceData) {
            return await interaction.reply({
                embeds: [createErrorEmbed('❌ Ik ben niet verbonden met een spraakkanaal. Gebruik eerst `/radio`!')],
                ephemeral: true
            });
        }
        
        if (!RADIO_STATIONS[stationKey]) {
            return await interaction.reply({
                embeds: [createErrorEmbed('❌ Onbekend radiostation. Gebruik `/stations` voor een overzicht.')],
                ephemeral: true
            });
        }
        
        const station = RADIO_STATIONS[stationKey];
        
        // Check of we al naar dit station luisteren
        if (voiceData.streamUrl === station.url) {
            return await interaction.reply({
                embeds: [createInfoEmbed(`🎵 We luisteren al naar **${station.name}**!`)],
                ephemeral: true
            });
        }
        
        // Defer reply voor langdurige operatie
        await interaction.deferReply({ ephemeral: true });
        
        try {
            // Maak nieuwe audio resource
            const resource = createAudioResource(station.url, {
                inlineVolume: true,
                inputType: 'arbitrary'
            });
            
            // Stel volume in
            if (resource.volume) {
                resource.volume.setVolume(volume / 100);
            }
            
            // Stop huidige stream en start nieuwe
            voiceData.player.stop();
            voiceData.player.play(resource);
            
            // Update voiceData
            voiceData.resource = resource;
            voiceData.streamUrl = station.url;
            voiceData.streamName = station.name;
            voiceData.currentVolume = volume;
            voiceData.stationKey = stationKey;
            voiceData.switchedAt = Date.now();
            
            // Update in client
            client.voiceManager.set(interaction.guild.id, voiceData);
            
            // Maak success embed
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('📻 Station gewisseld!')
                .setDescription(`Nu aan het luisteren naar **${station.name}**`)
                .addFields(
                    { name: `${station.emoji} Station`, value: station.name, inline: true },
                    { name: '🎵 Genre', value: station.genre, inline: true },
                    { name: '🔊 Volume', value: `${volume}%`, inline: true },
                    { name: '📝 Beschrijving', value: station.description, inline: false }
                )
                .setTimestamp()
                .setFooter({ 
                    text: 'Station gewisseld • Gebruik /volume om volume aan te passen',
                    iconURL: interaction.client.user.displayAvatarURL()
                });
            
            await interaction.editReply({ embeds: [embed] });
            
            console.log(`📻 Station gewisseld naar ${station.name} in ${interaction.guild.name}`);
            
        } catch (error) {
            console.error('❌ Switch command error:', error);
            
            // Probeer terug te vallen op vorige station
            try {
                if (voiceData.resource) {
                    voiceData.player.play(voiceData.resource);
                }
            } catch (fallbackError) {
                console.error('❌ Fallback ook gefaald:', fallbackError);
            }
            
            await interaction.editReply({
                embeds: [createErrorEmbed('❌ Er is een fout opgetreden bij het wisselen van station. Probeer het opnieuw.')]
            });
        }
    }
};

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

/**
 * Maak info embed
 * @param {string} message - Info message
 * @returns {EmbedBuilder} Info embed
 */
function createInfoEmbed(message) {
    return new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('ℹ️ Info')
        .setDescription(message)
        .setTimestamp();
}
