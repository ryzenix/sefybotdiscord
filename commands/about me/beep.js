exports.run = async (client, message, args) => {
  const blessEmoji = client.customEmojis.get('bless') ? client.customEmojis.get('bless') : '✔️' ;
  const pingMessage = await message.channel.send(`almost there...`);
	const ping = pingMessage.createdTimestamp - message.createdTimestamp;
	return pingMessage.edit(`${blessEmoji} boop! took me roughly ${ping}ms to hit back, and the Discord API has a latency of ${Math.round(client.ws.ping)}ms?`);
};

exports.help = {
  name: "beep",
  description: "very self-explanatory",
  usage: `beep`,
  example: `beep`
}

exports.conf = {
  aliases: [],
  cooldown: 2,
};