# Discord Radio Bot 🎵

Een veelzijdige Discord bot voor het streamen van Nederlandse radiozenders en het volgen van de Radio 2 Top 2000.

## Over het project

Dit project begon als een simpele Discord bot voor de Radio 2 Top 2000, maar is in de loop der jaren uitgegroeid tot een complete radio-bot met ondersteuning voor meerdere populaire Nederlandse radiozenders.

### Ondersteunde radiozenders
- **Radio 2 Top 2000** - Volg de jaarlijkse Top 2000 live
- **Qmusic** - Stream Qmusic 24/7
- **Radio 538** - Luister naar Radio 538
- **Sky Radio** - Geniet van Sky Radio

## Functies

- 🎵 Stream live radio in Discord voice channels
- 📻 Ondersteuning voor meerdere Nederlandse radiozenders
- 🎯 Speciaal gebouwd voor de Radio 2 Top 2000
- 🔊 Hoge kwaliteit audio streaming
- ⚡ Snelle en betrouwbare verbindingen

## Installatie

### Vereisten
- Node.js (versie 16.x of hoger)
- npm of yarn
- Een Discord Bot Token
- FFmpeg (voor audio processing)

### Stappen

1. Clone de repository:
```bash
git clone https://github.com/IamKenii/Radio-Discord-Bot.git
cd Radio-Discord-Bot
```

2. Installeer dependencies:
```bash
npm install
```

3. Configureer je bot:
   - Maak een `config.json` bestand aan in de root directory
   - Voeg je Discord bot token toe (zie Configuratie sectie)

```env
{
	"token": "JOUW DISCORD BOT TOKEN",
 "clientId": "CLIENT ID VAN DE DESBETREFFENDE BOT",
 "guildId": "DISCORD SERVER ID",
 "status": "STATUS VAN DE BOT"
}
```

4. Start de bot:
```bash
npm start
```

### Discord Bot Setup

1. Ga naar de [Discord Developer Portal](https://discord.com/developers/applications)
2. Maak een nieuwe applicatie aan
3. Ga naar de "Bot" sectie en maak een bot aan
4. Kopieer het bot token en voeg het toe aan je `.env` bestand
5. Schakel de volgende Privileged Gateway Intents in:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent
6. Ga naar OAuth2 → URL Generator en selecteer:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Connect`, `Speak`, `Use Voice Activity`
7. Gebruik de gegenereerde URL om de bot aan je server toe te voegen

## Gebruik

### Commando's

De bot gebruikt slash commands. Hier zijn de belangrijkste commando's:

- `/radio` - Start het streamen van een radiozender (Radio 2)
- `/stop` - Stop de huidige stream
- `/join` - Laat de bot je voice channel joinen
- `/leave` - Laat de bot het voice channel verlaten
- `/move` - Verplaats de radio naar een andere channel
- `/stations` - Bekijk alle beschikbare radiostation
- `/switch` - Wissel naar een ander radiostation

### Voorbeelden

```
/play - Stream de Radio 2
/switch qmusic - Stream Qmusic
/switch 538 - Stream Radio 538
/switch skyradio - Stream Sky Radio
```

## Ontwikkeling

### Project structuur

```
Radio-Discord-Bot/
├── commands/         # Slash commands
├── events/          # Discord event handlers
├── utils/           # Helper functies
├── config/          # Configuratie bestanden
└── index.js         # Main bot bestand
```

### Bijdragen

Bijdragen zijn welkom! Voel je vrij om:
- Issues te openen voor bugs of feature requests
- Pull requests in te dienen
- De code te forken voor je eigen projecten

### Development setup

```bash
# Installeer dependencies
npm install

# Run in development mode met hot reload
npm run dev

# Run tests
npm test
```

## Technologieën

- [Discord.js](https://discord.js.org/) - Discord API wrapper
- [Node.js](https://nodejs.org/) - Runtime environment
- [@discordjs/voice](https://discord.js.org/#/docs/voice/main/general/welcome) - Voice connections
- FFmpeg - Audio processing

## Contact & Support

- GitHub: [@IamKenii](https://github.com/IamKenii)
- Issues: [GitHub Issues](https://github.com/IamKenii/Radio-Discord-Bot/issues)

## Disclaimer

Deze bot is gemaakt voor educatieve doeleinden. Zorg ervoor dat je de rechten hebt om audio te streamen en respecteer de terms of service van de radiozenders.

---

**Gemaakt met ❤️ voor de Nederlandse radio liefhebbers**
