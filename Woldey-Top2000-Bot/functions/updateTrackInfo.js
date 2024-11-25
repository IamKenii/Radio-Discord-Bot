const { ActivityType } = require('discord.js');
const { getTrackInfo } = require('./getTrackInfo');

async function updateTrackInfo(client) {
    try {
        const { title, artist } = await getTrackInfo();
        console.log(title + ' : ' + artist);
        client.user.setActivity(title + ' : ' + artist, { type: ActivityType.Listening });
    } catch (error) {
        console.error('Fout bij het ophalen van trackinformatie:', error);
    }
}

module.exports = { updateTrackInfo };
