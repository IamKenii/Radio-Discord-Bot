const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Verander de volume van de radio.')
        .addNumberOption(option => option.setName('level').setDescription('Volume level (0-100)').setRequired(true)),
    async execute(interaction, client) {
        const volumeLevel = interaction.options.getNumber('level') / 100;
        if (volumeLevel < 0 || volumeLevel > 1) {
            await interaction.reply({ content: 'Kiets tussen 1 - 100 om het volume aan te passen', ephemeral: true });
            return;
        }

        const connectionDetails = client.voiceConnections.get(interaction.guild.id);
        if (connectionDetails) {
            connectionDetails.resource.volume.setVolume(volumeLevel);
            await interaction.reply({ content: `Volume aangepast naar:  ${volumeLevel * 100}%`, ephemeral: true });
        } else {
            await interaction.reply({ content: 'Volgens mij ben ik niet verbonden met een spraak kanaal', ephemeral: true });
        }
    },
};
