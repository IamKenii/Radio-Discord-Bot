const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Toont de bot latency en uptime informatie'),
    
    async execute(interaction) {
        // Eerst een tijdelijke reply sturen
        const sent = await interaction.reply({ 
            content: '🏓 Pinging...', 
            fetchReply: true 
        });

        // Bereken de verschillende latency waarden
        const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const websocketPing = interaction.client.ws.ping;
        const uptime = Math.round(interaction.client.uptime / 60000);

        // Bepaal de kleur op basis van latency
        let color;
        if (roundtripLatency < 100) {
            color = 0x00FF00; // Groen - Uitstekend
        } else if (roundtripLatency < 200) {
            color = 0xFFFF00; // Geel - Goed
        } else if (roundtripLatency < 300) {
            color = 0xFF8000; // Oranje - Redelijk
        } else {
            color = 0xFF0000; // Rood - Slecht
        }

        // Bepaal status tekst
        let statusText;
        if (roundtripLatency < 100) {
            statusText = "🟢 Uitstekend";
        } else if (roundtripLatency < 200) {
            statusText = "🟡 Goed";
        } else if (roundtripLatency < 300) {
            statusText = "🟠 Redelijk";
        } else {
            statusText = "🔴 Slecht";
        }

        // Maak de embed
        const pingEmbed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setDescription(`**Status:** ${statusText}`)
            .setColor(color)
            .addFields(
                {
                    name: '📡 Roundtrip Latency',
                    value: `\`${roundtripLatency}ms\``,
                    inline: true
                },
                {
                    name: '💖 Websocket Heartbeat',
                    value: `\`${websocketPing}ms\``,
                    inline: true
                },
                {
                    name: '⏱️ Uptime',
                    value: `\`${uptime} minuten\``,
                    inline: true
                }
            )
            .setFooter({ 
                text: `Opgevraagd door ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        // Update de reply met de embed
        await interaction.editReply({ 
            content: null, 
            embeds: [pingEmbed] 
        });
    },
};
