exports.run = async (client, message, args) => {
	const pingMessage = await message.channel.send(`almost there...`);
	const ping = pingMessage.createdTimestamp - message.createdTimestamp;
	return pingMessage.edit(`pong! took me ${ping}ms, and discord ${Math.round(client.ws.ping)}ms`);
};
exports.help = {
	name: "ping",
	description: "very self-explanatory",
	usage: "ping",
	example: "ping"
};
  
exports.conf = {
	aliases: [],
	cooldown: 2,
};
  
