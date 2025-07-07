const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

// Command categorieën
const COMMAND_CATEGORIES = {
    music: {
        name: '🎵 Muziek & Radio',
        emoji: '🎵',
        commands: [
            { name: 'radio', description: 'Start NPO Radio 2 stream', usage: '/radio [volume]' },
            { name: 'stations', description: 'Bekijk alle beschikbare radiostations', usage: '/stations [filter]' },
            { name: 'switch', description: 'Wissel naar een ander radiostation', usage: '/switch <station> [volume]' },
            { name: 'volume', description: 'Verander het volume van de radio', usage: '/volume <1-100>' },
            { name: 'leave', description: 'Verlaat het spraakkanaal', usage: '/leave' }
        ]
    },
    utility: {
        name: '🔧 Hulpprogramma\'s',
        emoji: '🔧',
        commands: [
            { name: 'ping', description: 'Toont bot latency en uptime', usage: '/ping' },
            { name: 'status', description: 'Uitgebreide bot status informatie', usage: '/status' },
            { name: 'help', description: 'Toont dit help menu', usage: '/help [categorie]' },
            { name: 'move', description: 'Verplaats bot naar ander voice channel', usage: '/move' }
        ]
    },
    admin: {
        name: '👑 Admin Commands',
        emoji: '👑',
        commands: [
            { name: 'restart', description: 'Herstart bot components (alleen eigenaar)', usage: '/restart' }
        ]
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Toont help informatie en command overzicht')
        .addStringOption(option =>
            option.setName('categorie')
                .setDescription('Specifieke categorie om te bekijken')
                .setRequired(false)
                .addChoices(
                    { name: '🎵 Muziek & Radio', value: 'music' },
                    { name: '🔧 Hulpprogramma\'s', value: 'utility' },
                    { name: '👑 Admin Commands', value: 'admin' }
                )
        ),

    /**
     * Main execute functie voor de /help command
     * @param {import('discord.js').ChatInputCommandInteraction} interaction
     * @param {import('discord.js').Client} client
     */
    async execute(interaction, client) {
        const category = interaction.options.getString('categorie');
        
        if (category) return showCategoryInfo(interaction, category);
        return showGeneralHelp(interaction, client);
    }
};

/**
 * Toon algemeen help overzicht
 */
async function showGeneralHelp(interaction, client) {
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🤖 Help & Command Overzicht')
        .setDescription(`Welkom bij **${client.user.username}**! Hier is een overzicht van alle beschikbare functies.`)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({
            text: `${client.user.username} • Gebruik /help <categorie> voor meer info`,
            iconURL: client.user.displayAvatarURL()
        });

    for (const [_, category] of Object.entries(COMMAND_CATEGORIES)) {
        const commandList = category.commands.map(cmd => `\`/${cmd.name}\``).join(', ');
        embed.addFields({
            name: `${category.emoji} ${category.name}`,
            value: `${commandList}\n*${category.commands.length} command(s)*`,
            inline: false
        });
    }

    embed.addFields(
        {
            name: '🚀 Quick Start',
            value: [
                '1. Ga naar een voice channel',
                '2. Gebruik `/radio` om radio te starten',
                '3. Gebruik `/stations` voor meer opties',
                '4. Gebruik `/volume` om geluid aan te passen',
                '5. Gebruik `/leave` om te stoppen'
            ].join('\n'),
            inline: true
        },
        {
            name: '💡 Tips',
            value: [
                '• Gebruik `/help <categorie>` voor details',
                '• Alle commands zijn slash commands',
                '• Bot werkt alleen in voice channels',
                '• Gebruik `/status` voor bot informatie'
            ].join('\n'),
            inline: true
        }
    );

    await interaction.reply({ embeds: [embed] });
}

/**
 * Toon informatie over een specifieke categorie
 */
async function showCategoryInfo(interaction, categoryKey) {
    const category = COMMAND_CATEGORIES[categoryKey];

    if (!category) {
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Fout')
            .setDescription('Onbekende categorie.')
            .setTimestamp();

        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${category.emoji} ${category.name}`)
        .setDescription(`Alle commands in de categorie **${category.name}**:`)
        .setTimestamp()
        .setFooter({
            text: `${category.commands.length} command(s) in deze categorie`,
            iconURL: interaction.client.user.displayAvatarURL()
        });

    category.commands.forEach(cmd => {
        embed.addFields({
            name: `/${cmd.name}`,
            value: `**Beschrijving:** ${cmd.description}\n**Gebruik:** \`${cmd.usage}\``,
            inline: false
        });
    });

    await interaction.reply({ embeds: [embed] });
}

/**
 * Toon informatie over een specifieke command
 */
async function showCommandInfo(interaction, client, commandName) {
    let foundCommand = null;
    let foundCategory = null;

    for (const [_, category] of Object.entries(COMMAND_CATEGORIES)) {
        const cmd = category.commands.find(c => c.name === commandName);
        if (cmd) {
            foundCommand = cmd;
            foundCategory = category;
            break;
        }
    }

    if (!foundCommand) {
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Command Niet Gevonden')
            .setDescription(`Er is geen command gevonden met de naam \`${commandName}\`.`)
            .setTimestamp();

        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setColor('#00cc99')
        .setTitle(`📘 Command: /${foundCommand.name}`)
        .setDescription(`Informatie over deze command uit de categorie **${foundCategory.name}**`)
        .addFields(
            { name: '📄 Beschrijving', value: foundCommand.description },
            { name: '💬 Gebruik', value: `\`${foundCommand.usage}\`` }
        )
        .setTimestamp()
        .setFooter({
            text: `${client.user.username} • Command info`,
            iconURL: client.user.displayAvatarURL()
        });

    await interaction.reply({ embeds: [embed] });
}
