const { SlashCommandBuilder } = require('discord.js');

/**
 * Command om de bot naar een opgegeven voice kanaal te verplaatsen
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Verplaats de bot naar een ander voice kanaal')
        .addChannelOption(option =>
            option.setName('kanaal')
                .setDescription('Het voice kanaal om naartoe te verplaatsen')
                .setRequired(true)
        ),

    /**
     * Voert het move-commando uit
     * @param {import('discord.js').CommandInteraction} interaction - De Discord interactie
     */
    async execute(interaction) {
        const targetChannel = interaction.options.getChannel('kanaal');

        // Check of het een voice channel is
        if (targetChannel.type !== 2) { // 2 = GUILD_VOICE
            return interaction.reply({ content: '❌ Dit is geen geldig voice kanaal.', ephemeral: true });
        }

        const botMember = interaction.guild.members.me;

        try {
            await botMember.voice.setChannel(targetChannel);
            await interaction.reply(`✅ Bot is verplaatst naar **${targetChannel.name}**.`);
        } catch (error) {
            console.error('Fout bij verplaatsen:', error);
            await interaction.reply({ content: '❌ Kan de bot niet verplaatsen. Zorg dat ik voldoende permissies heb.', ephemeral: true });
        }
    }
};
