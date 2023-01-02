const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");

const top2000 = ("http://icecast.omroep.nl/radio2-bb-mp3")

client.on("ready", async () => {
    console.log(`${client.user.username} is online`);
    client.user.setActivity("NPO Radio 2 | >", { type: "WATCHING" });
});

client.on('message', message => {
  let args = message.content.slice(config.prefix.length).trim().split(/ +/)
  let cmd = args.shift().toLowerCase()


  if (cmd === `radio`) {
      const voiceChannel = message.member.voice.channel;
      if (!voiceChannel) {
        return message.reply('Je moet in een spraakkanaal zijn om live radio te kunnen afspelen.');
      }
  
      voiceChannel.join().then(connection => {
        const radioStream = `${top2000}`;
        const radioDispatcher = connection.play(radioStream);
        radioDispatcher.setVolume(0.05);
  
        radioDispatcher.on('finish', () => {
          voiceChannel.leave();
        });
      }).catch(console.error);
    }
  });
  
client.on('message', message => {
  let args = message.content.slice(config.prefix.length).trim().split(/ +/)
  let cmd = args.shift().toLowerCase()


  if (cmd === `volume`) {
    if (!message.member.roles.cache.get('908466170808639520')) {
      return message.reply('Jij hebt geen rechten. Ga janken....');
    }

    const voiceConnection = message.guild.voice.connection;

    if (!voiceConnection) {
      return message.reply('je moet in een spraak kanaal zitten om dit te kunnen doen!!!');
    }

    const volume = parseFloat(message.content.split(' ')[1]);

    voiceConnection.dispatcher.setVolume(volume / 100);
    message.channel.send(`Volume veranderd naar -> ${volume}`);
  }
});


  client.on("message", async message => {

    if (message.author.bot) return;

    if (message.channel.type == "dm") return;

    if (!message.content.startsWith(config.prefix)) return;

    var prefix = config.prefix;

    var messageArray = message.content.split(" ");

    var command = messageArray[0];

    var arguments = messageArray.slice(1);

    async function promptMessage(message, author, time, reactions) {
        time *= 1000;

        for (const reaction of reactions) {
            await message.react(reaction);
        }
        const filter = (reaction, user) => reactions.includes(reaction.emoji.name) && user.id === author.id;
        return message.awaitReactions(filter, { max: 1, time: time }).then(collected => collected.first() && collected.first().emoji.name);
    }
});

client.login(config.token);
