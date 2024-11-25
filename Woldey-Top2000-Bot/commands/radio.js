const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioResource, createAudioPlayer } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('radio')
        .setDescription('Speelt live NPO Radio 2 top 2000'),
    async execute(interaction, client) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply({ content: 'Je moet in een spraak kanaal zitten om dit te kunnen doen.', ephemeral: true });
            return;
        }

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer();
            const resource = createAudioResource("http://icecast.omroep.nl/radio2-bb-mp3", { inlineVolume: true });
            resource.volume.setVolume(0.1);
            player.play(resource);
            connection.subscribe(player);

            client.voiceConnections.set(interaction.guild.id, { connection, player, resource });

            await interaction.reply({ content: 'Playing NPO Radio 2!', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Er is een fout opgetreden bij het proberen om verbinding te maken.', ephemeral: true });
        }
    },
};
