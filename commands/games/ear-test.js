const path = require('path');
const { stripIndents } = require('common-tags');
const { delay, verify } = require('../../util/util');
const data = require('../../assets/ear-test');


exports.run = async (client, message, args) => {
    const current = client.voicequeue.get(message.guild.id);
	if (current) return message.inlineReply(current.prompt);
    const serverQueue = client.queue.get(message.guild.id);
    if (serverQueue) return message.inlineReply('someone in your server is playing music! please wait until they done first :smiley:')
    if (message.member.voice.channel) {
        if (message.member.voice.channel.joinable) {
            try {
                await client.voicequeue.set(message.guild.id, { prompt: `please wait until **${message.author.username}** finish their hearing test first :(\n*i can only talk in one voice channel at a time, in one server. just like real people :)*` });
                var connection = await message.member.voice.channel.join();
                let age;
                let range;
                let previousAge = 'all';
                let previousRange = 8;
                for (const { age: dataAge, khz, file } of data) {
                    await message.channel.send("playing...")
                    connection.play(path.join(__dirname, '..', '..', 'assets', 'ear-test', file))
                    await delay(3500);
                    await message.inlineReply('did you hear that sound? reply with \`[y]es\` or \`[n]o\`');
                    const heard = await verify(message.channel, message.author);
                    if (!heard || file === data[data.length - 1].file) {
                        age = previousAge;
                        range = previousRange;
                        break;
                    }
                    previousAge = dataAge;
                    previousRange = khz;
                }
                if (age === 'all') {
                    return message.inlineReply('everyone should be able to hear that. there might be a problem with your hearing :pensive:');
                }
                if (age === 'max') {
                    return message.inlineReply(stripIndents`
                        you can hear any frequency of which a human is capable :)
                        the maximum frequency you were able to hear was **${range}000hz**.
                    `);
                }
                return message.inlineReply(stripIndents`
                    you have the hearing of someone ${Number.parseInt(age, 10) + 1} years old or older :)
                    the maximum frequency you were able to hear was **${range}000hz**.
                `);
            
            } catch (error) {
                return message.inlineReply('sorry, i got an error :( try again later!') 
            } finally {
                if (connection) await connection.disconnect();
                return client.voicequeue.delete(message.guild.id);
            }
        } else {
            return message.inlineReply(`i can't join your voice channel. can you check my perms?`)
        }
    } else {
        return message.inlineReply(`you have to join a voice channel first!`)
    }
}
exports.help = {
  name: "ear-test",
  description: "test your hearing :)",
  usage: "ear-test",
  example: "ear-test"
}
exports.conf = {
  aliases: ["listening-test", "hearing-test"],
  cooldown: 5,
  guildOnly: true,
  
  clientPerms: ["CONNECT", "SPEAK"],
}