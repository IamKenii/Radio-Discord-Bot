const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceData } = require('../../functions/voiceEventHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Verander het volume van de radio')
        .addNumberOption(option => 
            option.setName('level')
                .setDescription('Volume level (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        ),
    
    async execute(interaction, client) {
        const volumeLevel = interaction.options.getNumber('level');
        const voiceData = getVoiceData(interaction.guild.id, client);
        
        // Validaties
        if (!voiceData) {
            return await interaction.reply({
                embeds: [createErrorEmbed('❌ Ik ben niet verbonden met een spraakkanaal. Gebruik eerst `/radio`!')],
                ephemeral: true
            });
        }
        
        if (!voiceData.resource || !voiceData.resource.volume) {
            return await interaction.reply({
                embeds: [createErrorEmbed('❌ Geen actieve audio stream gevonden.')],
                ephemeral: true
            });
        }
        
        try {
            // Stel volume in
            const normalizedVolume = volumeLevel / 100;
            voiceData.resource.volume.setVolume(normalizedVolume);
            
            // Update voiceData
            voiceData.currentVolume = volumeLevel;
            client.voiceManager.set(interaction.guild.id, voiceData);
            
            // Maak response embed
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🔊 Volume aangepast')
                .setDescription(`Volume is nu ingesteld op **${volumeLevel}%**`)
                .addFields(
                    { name: '📊 Nieuw volume', value: `${volumeLevel}%`, inline: true },
                    { name: '🎵 Stream', value: voiceData.streamName || 'Onbekend', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Volume aangepast' });
            
            // Visual volume bar
            const volumeBar = createVolumeBar(volumeLevel);
            embed.addFields({ name: '📊 Volume bar', value: volumeBar, inline: false });
            
            await interaction.reply({ embeds: [embed], ephemeral: true });
            
            console.log(`🔊 Volume aangepast naar ${volumeLevel}% in ${interaction.guild.name}`);
            
        } catch (error) {
            console.error('❌ Volume command error:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('❌ Er is een fout opgetreden bij het aanpassen van het volume.')],
                ephemeral: true
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
 * Maak visuele volume bar
 * @param {number} volume - Volume percentage (1-100)
 * @returns {string} Volume bar string
 */
function createVolumeBar(volume) {
    const barLength = 20;
    const filledLength = Math.round((volume / 100) * barLength);
    const emptyLength = barLength - filledLength;
    
    const filledBar = '█'.repeat(filledLength);
    const emptyBar = '░'.repeat(emptyLength);
    
    return `${filledBar}${emptyBar} ${volume}%`;
}
