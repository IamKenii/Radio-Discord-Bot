const fs = require('fs');
const path = require('path');

function loadCommands(commandFiles, commandsDir, client) {
    const commands = [];
    for (const file of commandFiles) {
        const command = require(path.join(commandsDir, file));
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        console.log(`Commands: ${file}`);
    }
    return commands;
}

module.exports = { loadCommands };
