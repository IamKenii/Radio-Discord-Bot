const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave the voice channel.'),
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply({ content: 'Je moet in een spraak kanaal zitten om dit te kunnen uitvoeren.', ephemeral: true });
            return;
        }

        const connection = getVoiceConnection(interaction.guild.id);
        if (connection) {
            connection.destroy();
            await interaction.reply({ content: 'ik heb het kanaal verlaten!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Kan je kijken? Ik zit niet in een spraak kanaal....', ephemeral: true });
        }
    },
};
