const neko = require('nekos.life');
const { sfw } = new neko();

exports.run = async (client, message, args) => {
    let query = args.join(' ');
    if (!query) return message.inlineReply('uh.. what do you want to turn to spoiler? :thinking:')
    let text = await sfw.spoiler({ text: query });
    return message.channel.send(text.owo)
},

exports.help = {
	name: "spoiler",
	description: "deep spoiler your long text :upside_down:",
	usage: "spoiler",
	example: "spoiler"
};
  
exports.conf = {
	aliases: [],
    cooldown: 3,
    guildOnly: true,
};