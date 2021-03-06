const { MessageEmbed } = require("discord.js")
const neko = require('nekos.life');
const { sfw } = new neko();
const cuddleSchema = require('../../model/cuddle');


exports.run = async (client, message, args) => {
    const member = await getMemberfromMention(args[0], message.guild);

    if (!member) {
      const sedEmoji = client.customEmojis.get('sed') ? client.customEmojis.get('sed') : ':pensive:'
      return message.inlineReply(`you can't just cuddle at the air ${sedEmoji} please mention somebody to cuddle pls`)
    };
    const target = member.user;

    if (target.id === client.user.id) return message.inlineReply('surely, I am being rewarded because i have you :hugging:')
    if (target.bot) return message.inlineReply("you can't cuddle that bot, sorry :(")

    const { guild } = message
    const guildId = guild.id
    const targetId = target.id
    const authorId = message.author.id
    const now = new Date()

    if (targetId === authorId) {
       return message.inlineReply(`is the world too harsh for you? ${sedEmoji}`);
    };

    const result = await cuddleSchema.findOneAndUpdate(
      {
        userId: targetId,
        guildId,
      },
      {
        userId: targetId,
        guildId,
        $inc: {
          received: 1,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
    let data = await sfw.cuddle();
    const amount = result.received;
    const addS = amount === 1 ? '' : 's';
    const embed = new MessageEmbed() 
    .setColor("RANDOM") 
    .setAuthor(`${message.author.username} cuddled ${target.username} ❤️ they was cuddled ${amount} time${addS}!`, message.author.displayAvatarURL()) 
    .setImage(data.url)
    return message.channel.send(embed)
}

exports.help = {
    name: "cuddle",
    description: "cuddle someone with care",
    usage: "cuddle `<@mention>`",
    example: "cuddle `@Somebody`"
};

exports.conf = {
    aliases: [],
    cooldown: 3,
    guildOnly: true,
    
    channelPerms: ["EMBED_LINKS"]
}