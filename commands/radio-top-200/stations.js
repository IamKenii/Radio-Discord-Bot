const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Radio stations configuratie
const RADIO_STATIONS = {
    'radio2': {
        name: 'NPO Radio 2',
        url: 'http://icecast.omroep.nl/radio2-bb-mp3',
        genre: 'Pop/Rock',
        description: 'De beste pop, rock en alternative hits',
        emoji: '🎵'
    },
    'qmusic': {
        name: 'Qmusic',
        url: 'https://icecast-qmusicnl-cdp.triple-it.nl/Qmusic_nl_live_96.mp3',
        genre: 'Pop/Hits',
        description: 'De grootste hits en nieuwste muziek',
        emoji: '🎤'
    },
    'skyradio': {
        name: 'Sky Radio',
        url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SKYRADIO.mp3',
        genre: 'Nostalgie',
        description: 'De grootste hits voor het hele gezin',
        emoji: '☁️'
    },
    'radio538': {
        name: 'Radio 538',
        url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO538.mp3',
        genre: 'Dance/Pop',
        description: 'Dance, pop en de hits van nu',
        emoji: '🕺'
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stations')
        .setDescription('Bekijk alle beschikbare radiostations')
        .addStringOption(option =>
            option.setName('filter')
                .setDescription('Filter op genre')
                .setRequired(false)
                .addChoices(
                    { name: 'Pop/Rock', value: 'pop' },
                    { name: 'Dance', value: 'dance' },
                    { name: 'Nostalgie', value: 'nostalgia' }
                )
        ),
    
    async execute(interaction) {
        const filter = interaction.options.getString('filter');
        const stations = Object.entries(RADIO_STATIONS);
        
        // Filter stations indien nodig
        let filteredStations = stations;
        if (filter) {
            filteredStations = stations.filter(([key, station]) => {
                const genre = station.genre.toLowerCase();
                switch (filter) {
                    case 'pop': return genre.includes('pop') || genre.includes('rock');
                    case 'news': return genre.includes('nieuws') || genre.includes('praatradio');
                    case 'classical': return genre.includes('klassiek');
                    case 'dance': return genre.includes('dance');
                    case 'nostalgia': return genre.includes('nostalgie');
                    default: return true;
                }
            });
        }
        
        // Maak embed met stations
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📻 Beschikbare Radiostations')
            .setDescription(filter ? `Filter: **${getFilterName(filter)}**` : 'Alle beschikbare radiostations')
            .setTimestamp()
            .setFooter({ 
                text: `${filteredStations.length} station(s) • Gebruik /switch om te wisselen`,
                iconURL: interaction.client.user.displayAvatarURL()
            });
        
        // Voeg stations toe aan embed
        if (filteredStations.length === 0) {
            embed.addFields({
                name: '❌ Geen stations gevonden',
                value: 'Probeer een ander filter of gebruik de command zonder filter.',
                inline: false
            });
        } else {
            // Splits stations in chunks van 3 voor betere formatting
            const chunks = chunkArray(filteredStations, 3);
            
            chunks.forEach((chunk, index) => {
                const stationTexts = chunk.map(([key, station]) => 
                    `${station.emoji} **${station.name}**\n` +
                    `*${station.genre}*\n` +
                    `${station.description}\n` +
                    `\`/switch ${key}\``
                );
                
                embed.addFields({
                    name: index === 0 ? '🎵 Stations' : '\u200b',
                    value: stationTexts.join('\n\n'),
                    inline: true
                });
            });
        }
        
        // Voeg usage tips toe
        embed.addFields({
            name: '💡 Tips',
            value: '• Gebruik `/switch <station>` om te wisselen\n' +
                   '• Gebruik `/radio` om de standaard station te starten\n' +
                   '• Gebruik `/volume <1-100>` om volume aan te passen',
            inline: false
        });
        
        await interaction.reply({ embeds: [embed] });
    }
};

/**
 * Splits array in chunks
 * @param {Array} array - Array om te splitsen
 * @param {number} size - Chunk grootte
 * @returns {Array} Array van chunks
 */
function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Krijg filter naam voor display
 * @param {string} filter - Filter key
 * @returns {string} Display naam
 */
function getFilterName(filter) {
    const names = {
        'pop': 'Pop/Rock',
        'news': 'Nieuws',
        'classical': 'Klassiek',
        'dance': 'Dance',
        'nostalgia': 'Nostalgie'
    };
    return names[filter] || filter;
}

// Export stations voor gebruik in andere commands
module.exports.RADIO_STATIONS = RADIO_STATIONS;
