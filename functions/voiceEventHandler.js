const { VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');

/**
 * Centralized voice event handling
 * @param {Client} client - Discord client instance
 */
function handleVoiceEvents(client) {
    // Cleanup oude connections bij startup
    client.voiceManager.clear();
    
    console.log('🎵 Voice event handlers geïnitialiseerd');
}

/**
 * Configureer events voor een nieuwe voice connection
 * @param {VoiceConnection} connection - Voice connection
 * @param {AudioPlayer} player - Audio player
 * @param {Client} client - Discord client
 * @param {string} guildId - Guild ID
 */
function setupVoiceConnection(connection, player, client, guildId) {
    // Connection events
    connection.on(VoiceConnectionStatus.Ready, () => {
        console.log(`🎵 Voice connection ready voor guild ${guildId}`);
    });
    
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
        console.log(`🔌 Voice connection verbroken voor guild ${guildId}`);
        
        try {
            // Cleanup
            const voiceData = client.voiceManager.get(guildId);
            if (voiceData) {
                if (voiceData.player) {
                    voiceData.player.stop();
                }
                client.voiceManager.delete(guildId);
            }
            
            connection.destroy();
        } catch (error) {
            console.error(`❌ Fout bij cleanup voice connection ${guildId}:`, error);
        }
    });
    
    connection.on('error', (error) => {
        console.error(`❌ Voice connection error voor guild ${guildId}:`, error);
    });
    
    // Player events
    player.on(AudioPlayerStatus.Playing, () => {
        console.log(`▶️ Audio playing voor guild ${guildId}`);
    });
    
    player.on(AudioPlayerStatus.Paused, () => {
        console.log(`⏸️ Audio gepauzeerd voor guild ${guildId}`);
    });
    
    player.on(AudioPlayerStatus.Idle, () => {
        console.log(`⏹️ Audio gestopt voor guild ${guildId}`);
    });
    
    player.on('error', (error) => {
        console.error(`❌ Audio player error voor guild ${guildId}:`, error);
        
        // Probeer te herstellen
        const voiceData = client.voiceManager.get(guildId);
        if (voiceData && voiceData.resource) {
            try {
                setTimeout(() => {
                    player.play(voiceData.resource);
                }, 1000);
            } catch (retryError) {
                console.error(`❌ Herstel poging gefaald voor guild ${guildId}:`, retryError);
            }
        }
    });
}

/**
 * Veilig een voice connection aanmaken
 * @param {Object} options - Connection options
 * @param {Client} client - Discord client
 * @returns {Object|null} Voice connection data of null bij fout
 */
function createVoiceConnection(options, client) {
    const { channelId, guildId, adapterCreator } = options;
    
    try {
        // Check of er al een connection is
        const existingConnection = client.voiceManager.get(guildId);
        if (existingConnection) {
            console.warn(`⚠️ Voice connection bestaat al voor guild ${guildId}`);
            return null;
        }
        
        const { joinVoiceChannel, createAudioPlayer } = require('@discordjs/voice');
        
        const connection = joinVoiceChannel({
            channelId,
            guildId,
            adapterCreator
        });
        
        const player = createAudioPlayer();
        
        // Setup events
        setupVoiceConnection(connection, player, client, guildId);
        
        // Subscribe player to connection
        connection.subscribe(player);
        
        const voiceData = {
            connection,
            player,
            channelId,
            createdAt: Date.now()
        };
        
        client.voiceManager.set(guildId, voiceData);
        
        return voiceData;
        
    } catch (error) {
        console.error(`❌ Fout bij aanmaken voice connection voor guild ${guildId}:`, error);
        return null;
    }
}

/**
 * Veilig een voice connection verbreken
 * @param {string} guildId - Guild ID
 * @param {Client} client - Discord client
 * @returns {boolean} True als succesvol verbroken
 */
function destroyVoiceConnection(guildId, client) {
    try {
        const voiceData = client.voiceManager.get(guildId);
        if (!voiceData) {
            return false;
        }
        
        // Stop player
        if (voiceData.player) {
            voiceData.player.stop();
        }
        
        // Destroy connection
        if (voiceData.connection) {
            voiceData.connection.destroy();
        }
        
        // Remove from manager
        client.voiceManager.delete(guildId);
        
        console.log(`✅ Voice connection verbroken voor guild ${guildId}`);
        return true;
        
    } catch (error) {
        console.error(`❌ Fout bij verbreken voice connection voor guild ${guildId}:`, error);
        return false;
    }
}

/**
 * Check of bot in voice channel zit
 * @param {string} guildId - Guild ID
 * @param {Client} client - Discord client
 * @returns {boolean} True als in voice channel
 */
function isInVoiceChannel(guildId, client) {
    return client.voiceManager.has(guildId);
}

/**
 * Krijg voice connection data
 * @param {string} guildId - Guild ID
 * @param {Client} client - Discord client
 * @returns {Object|null} Voice data of null
 */
function getVoiceData(guildId, client) {
    return client.voiceManager.get(guildId) || null;
}

module.exports = {
    handleVoiceEvents,
    createVoiceConnection,
    destroyVoiceConnection,
    isInVoiceChannel,
    getVoiceData,
    setupVoiceConnection
};
