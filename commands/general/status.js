const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getVoiceData } = require('../../functions/voiceEventHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Bekijk uitgebreide bot status informatie'),
    
    async execute(interaction, client) {
        // Defer reply omdat we veel data verzamelen
        await interaction.deferReply();
        
        try {
            // Verzamel basis informatie
            const uptime = Math.floor(client.uptime / 1000);
            const ping = client.ws.ping;
            const guildCount = client.guilds.cache.size;
            const userCount = client.users.cache.size;
            const channelCount = client.channels.cache.size;
            
            // Memory usage
            const memoryUsage = process.memoryUsage();
            const memoryUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024);
            const memoryTotal = Math.round(memoryUsage.heapTotal / 1024 / 1024);
            
            // Voice connections
            const voiceConnections = client.voiceManager.size;
            const voiceData = getVoiceData(interaction.guild.id, client);
            
            // System info
            const nodeVersion = process.version;
            const platform = process.platform;
            const arch = process.arch;
            
            // Maak embed
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('📊 Bot Status')
                .setDescription(`**${client.user.username}** draait soepel!`)
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({ 
                    text: `Opgevraagd door ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                });
            
            // Bot Statistics
            embed.addFields({
                name: '🤖 Bot Statistieken',
                value: [
                    `**Uptime:** ${formatUptime(uptime)}`,
                    `**Ping:** ${ping}ms`,
                    `**Servers:** ${guildCount}`,
                    `**Gebruikers:** ${userCount}`,
                    `**Kanalen:** ${channelCount}`
                ].join('\n'),
                inline: true
            });
            
            // System Information
            embed.addFields({
                name: '⚙️ Systeem',
                value: [
                    `**Node.js:** ${nodeVersion}`,
                    `**Platform:** ${platform}`,
                    `**Architectuur:** ${arch}`,
                    `**Memory:** ${memoryUsed}/${memoryTotal} MB`,
                    `**PID:** ${process.pid}`
                ].join('\n'),
                inline: true
            });
            
            // Voice Status
            const voiceStatus = voiceConnections > 0 ? 
                `**Actieve Verbindingen:** ${voiceConnections}` : 
                '**Status:** Geen actieve verbindingen';
            
            let voiceDetails = voiceStatus;
            if (voiceData) {
                const connectionTime = Math.floor((Date.now() - voiceData.createdAt) / 1000);
                voiceDetails += `\n**Huidige Server:** Verbonden\n**Tijd:** ${formatUptime(connectionTime)}`;
                
                if (voiceData.streamName) {
                    voiceDetails += `\n**Station:** ${voiceData.streamName}`;
                }
                if (voiceData.currentVolume) {
                    voiceDetails += `\n**Volume:** ${voiceData.currentVolume}%`;
                }
            }
            
            embed.addFields({
                name: '🎵 Voice Status',
                value: voiceDetails,
                inline: false
            });
            
            // Performance indicators
            const performance = getPerformanceStatus(ping, memoryUsed, uptime);
            embed.addFields({
                name: '📈 Performance',
                value: [
                    `**Algemeen:** ${performance.overall}`,
                    `**Latency:** ${performance.latency}`,
                    `**Memory:** ${performance.memory}`,
                    `**Stabiliteit:** ${performance.stability}`
                ].join('\n'),
                inline: true
            });
            
            // Commands info
            const commandCount = client.commands.size;
            embed.addFields({
                name: '🔧 Commands',
                value: [
                    `**Geladen:** ${commandCount}`,
                    `**Laatst gebruikt:** ${getLastCommandUsed(client)}`,
                    `**Status:** Alle commands operationeel`
                ].join('\n'),
                inline: true
            });
            
            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('❌ Status command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Fout')
                .setDescription('Er is een fout opgetreden bij het ophalen van de status.')
                .setTimestamp();
            
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};

/**
 * Format uptime naar leesbaar formaat
 * @param {number} seconds - Uptime in seconden
 * @returns {string} Geformatteerde uptime
 */
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}u`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
}

/**
 * Bepaal performance status
 * @param {number} ping - Websocket ping
 * @param {number} memoryUsed - Memory usage in MB
 * @param {number} uptime - Uptime in seconden
 * @returns {Object} Performance status indicators
 */
function getPerformanceStatus(ping, memoryUsed, uptime) {
    const latency = ping < 100 ? '🟢 Uitstekend' : 
                   ping < 200 ? '🟡 Goed' : 
                   ping < 300 ? '🟠 Redelijk' : '🔴 Slecht';
    
    const memory = memoryUsed < 100 ? '🟢 Laag' :
                   memoryUsed < 200 ? '🟡 Normaal' :
                   memoryUsed < 300 ? '🟠 Hoog' : '🔴 Kritiek';
    
    const stability = uptime > 86400 ? '🟢 Zeer stabiel' :
                     uptime > 3600 ? '🟡 Stabiel' :
                     uptime > 300 ? '🟠 Recent herstart' : '🔴 Pas gestart';
    
    const overall = ping < 150 && memoryUsed < 150 && uptime > 3600 ? 
                   '🟢 Uitstekend' : 
                   ping < 250 && memoryUsed < 250 ? 
                   '🟡 Goed' : '🟠 Redelijk';
    
    return { overall, latency, memory, stability };
}

/**
 * Krijg laatste gebruikte command (placeholder)
 * @param {Client} client - Discord client
 * @returns {string} Laatste command info
 */
function getLastCommandUsed(client) {
    // In productie zou je dit in een database/cache bijhouden
    return 'Onbekend';
}
