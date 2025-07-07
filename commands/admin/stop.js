const { SlashCommandBuilder } = require('discord.js');

const OWNER_ID = '261554651571159043';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Herstart de bot (alleen voor eigenaar)'),

    /**
     * Voert het restart-commando uit
     * @param {import('discord.js').CommandInteraction} interaction - De Discord interactie
     */
    async execute(interaction) {
        // Check of gebruiker de eigenaar is
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: '⛔ Alleen de bot-eigenaar kan dit commando gebruiken.', ephemeral: true });
        }

        await interaction.reply('♻️ De bot wordt gestopt...');

        // Herstart het proces (werkt alleen als een process manager zoals PM2 of Docker het opnieuw opstart)
        process.exit(0);
    }
};
