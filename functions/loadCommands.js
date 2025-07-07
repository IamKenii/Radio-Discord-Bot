const fs = require('fs');
const path = require('path');

/**
 * Laadt alle commands recursief uit de commands directory
 * @param {Client} client - Discord client instance
 * @param {string} commandsDir - Path naar commands directory
 * @returns {Array} Array van command data voor Discord API
 */
function loadCommands(client, commandsDir = path.join(__dirname, '..', 'commands')) {
    const commands = [];
    const loadedCommands = new Set(); // Voorkom duplicaten
    
    /**
     * Recursieve functie om commands te laden
     * @param {string} currentDir - Huidige directory
     */
    function loadCommandsRecursive(currentDir) {
        let items;
        
        try {
            items = fs.readdirSync(currentDir, { withFileTypes: true });
        } catch (error) {
            console.error(`❌ Kan directory niet lezen: ${currentDir}`, error.message);
            return;
        }
        
        for (const item of items) {
            const itemPath = path.join(currentDir, item.name);
            
            if (item.isDirectory()) {
                // Recursief door subdirectories
                loadCommandsRecursive(itemPath);
            } else if (item.isFile() && item.name.endsWith('.js')) {
                loadCommandFile(itemPath, commandsDir, commands, loadedCommands, client);
            }
        }
    }
    
    // Controleer of commands directory bestaat
    if (!fs.existsSync(commandsDir)) {
        console.error(`❌ Commands directory bestaat niet: ${commandsDir}`);
        return commands;
    }
    
    console.log(`📂 Commands laden uit: ${commandsDir}`);
    loadCommandsRecursive(commandsDir);
    
    return commands;
}

/**
 * Laadt een individueel command bestand
 * @param {string} filePath - Path naar command bestand
 * @param {string} commandsDir - Base commands directory
 * @param {Array} commands - Array om commands aan toe te voegen
 * @param {Set} loadedCommands - Set van reeds geladen command namen
 * @param {Client} client - Discord client instance
 */
function loadCommandFile(filePath, commandsDir, commands, loadedCommands, client) {
    try {
        // Clear require cache voor hot reloading tijdens development
        delete require.cache[require.resolve(filePath)];
        
        const command = require(filePath);
        const relativePath = path.relative(commandsDir, filePath);
        
        // Valideer command structuur
        if (!validateCommand(command, relativePath)) {
            return;
        }
        
        const commandName = command.data.name;
        
        // Check voor duplicaten
        if (loadedCommands.has(commandName)) {
            console.warn(`⚠️ Duplicate command naam: ${commandName} in ${relativePath}`);
            return;
        }
        
        // Voeg toe aan client commands
        client.commands.set(commandName, command);
        commands.push(command.data.toJSON());
        loadedCommands.add(commandName);
        
        console.log(`✅ ${relativePath} → /${commandName}`);
        
    } catch (error) {
        const relativePath = path.relative(commandsDir, filePath);
        console.error(`❌ Fout bij laden ${relativePath}:`, error.message);
    }
}

/**
 * Valideer command structuur
 * @param {Object} command - Command object
 * @param {string} filePath - Relatieve file path voor logging
 * @returns {boolean} True als command geldig is
 */
function validateCommand(command, filePath) {
    if (!command) {
        console.warn(`⚠️ ${filePath}: Command is undefined`);
        return false;
    }
    
    if (!command.data) {
        console.warn(`⚠️ ${filePath}: Ontbrekende 'data' property`);
        return false;
    }
    
    if (!command.execute || typeof command.execute !== 'function') {
        console.warn(`⚠️ ${filePath}: Ontbrekende of ongeldige 'execute' functie`);
        return false;
    }
    
    if (!command.data.name) {
        console.warn(`⚠️ ${filePath}: Command heeft geen naam`);
        return false;
    }
    
    return true;
}

/**
 * Reload een specifiek command (voor development)
 * @param {Client} client - Discord client instance
 * @param {string} commandName - Naam van command om te reloaden
 * @param {string} commandsDir - Commands directory
 * @returns {boolean} True als succesvol gereload
 */
function reloadCommand(client, commandName, commandsDir = path.join(__dirname, '..', 'commands')) {
    const command = client.commands.get(commandName);
    if (!command) {
        console.error(`❌ Command '${commandName}' niet gevonden`);
        return false;
    }
    
    try {
        // Vind het command bestand
        const commandFile = findCommandFile(commandName, commandsDir);
        if (!commandFile) {
            console.error(`❌ Command bestand voor '${commandName}' niet gevonden`);
            return false;
        }
        
        // Clear cache en reload
        delete require.cache[require.resolve(commandFile)];
        const newCommand = require(commandFile);
        
        if (!validateCommand(newCommand, commandFile)) {
            return false;
        }
        
        client.commands.set(commandName, newCommand);
        console.log(`✅ Command '${commandName}' gereload`);
        return true;
        
    } catch (error) {
        console.error(`❌ Fout bij reloaden '${commandName}':`, error.message);
        return false;
    }
}

/**
 * Vind command bestand op basis van naam
 * @param {string} commandName - Command naam
 * @param {string} commandsDir - Commands directory
 * @returns {string|null} Path naar command bestand of null
 */
function findCommandFile(commandName, commandsDir) {
    function searchRecursive(dir) {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
            const itemPath = path.join(dir, item.name);
            
            if (item.isDirectory()) {
                const result = searchRecursive(itemPath);
                if (result) return result;
            } else if (item.name === `${commandName}.js`) {
                return itemPath;
            }
        }
        
        return null;
    }
    
    return searchRecursive(commandsDir);
}

module.exports = { 
    loadCommands,
    reloadCommand,
    validateCommand
};
