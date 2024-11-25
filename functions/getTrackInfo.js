const fetch = require('node-fetch');

async function getTrackInfo() {
    try {
        const response = await fetch('https://www.nporadio2.nl/api/tracks');
        const data = await response.json();

        const title = data.data[0].title;
        const artist = data.data[0].artist;

        return { title, artist };
    } catch (error) {
        console.error('Fout bij het ophalen van de data:', error);
        throw error;
    }
}

module.exports = { getTrackInfo };
