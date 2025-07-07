const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { destroyVoiceConnection, isInVoiceChannel } = require('../../functions/voiceEventHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Verlaat het spraakkanaal'),
    
    async execute(interaction, client) {
        const userVoiceChannel = interaction.member.voice.channel;
        
        // Check of bot in voice channel zit
        if (!isInVoiceChannel(interaction.guild.id, client)) {
            return await interaction.reply({
                embeds: [createInfoEmbed('🤔 Ik zit niet in een spraakkanaal.')],
                ephemeral: true
            });
        }
        
        // Optioneel: Check of user in zelfde voice channel zit
        const voiceData = client.voiceManager.get(interaction.guild.id);
        if (voiceData && userVoiceChannel && voiceData.channelId !== userVoiceChannel.id) {
            return await interaction.reply({
                embeds: [createWarningEmbed('⚠️ Je moet in hetzelfde spraakkanaal zitten als de bot.')],
                ephemeral: true
            });
        }
        
        try {
            // Verbreek voice connection
            const success = destroyVoiceConnection(interaction.guild.id, client);
            
            if (success) {
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('👋 Kanaal verlaten')
                    .setDescription('Ik heb het spraakkanaal verlaten!')
                    .setTimestamp()
                    .setFooter({ text: 'Tot ziens!' });
                
                await interaction.reply({ embeds: [embed], ephemeral: true });
                console.log(`👋 Voice channel verlaten in ${interaction.guild.name}`);
            } else {
                await interaction.reply({
                    embeds: [createErrorEmbed('❌ Er is een fout opgetreden bij het verlaten van het kanaal.')],
                    ephemeral: true
                });
            }
            
        } catch (error) {
            console.error('❌ Leave command error:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('❌ Er is een fout opgetreden bij het verlaten van het kanaal.')],
                ephemeral: true
            });
        }
    }
};

function createInfoEmbed(message) {
    return new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('ℹ️ Info')
        .setDescription(message)
        .setTimestamp();
}

function createWarningEmbed(message) {
    return new EmbedBuilder()
        .setColor('#ffaa00')
        .setTitle('⚠️ Waarschuwing')
        .setDescription(message)
        .setTimestamp();
}

function createErrorEmbed(message) {
    return new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Fout')
        .setDescription(message)
        .setTimestamp();
}
