//all credit belongs to my friend Crocodile#6300

const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");
exports.run = async (client, message, args) => {
	let random =  ["hentai", "ecchi", "ahegao", "yuri"];
	let subreddit = random[Math.floor(Math.random() * random.length)];
	fetch(`https://www.reddit.com/r/${subreddit}/about.json`)
	.then(res => res.json())
	.then(image => {
		if (!image.data.icon_img && !image.data.community_icon) {
			icon = 'https://i.imgur.com/DSBOK0P.png'
		} else {
			icon = image.data.icon_img || image.data.community_icon.replace(/\?.+/, '');
		};
	})
	fetch(`https://www.reddit.com/r/${subreddit}.json?sort=top&t=daily`)
	.then(res => res.json())
	.then(body => {
		if (!body) return message.inlineReply("ouch. i can't find any result. try again please :(");
		const post = body.data.over_18 || body.data.children;
		if (!post.length) return message.inlineReply('hmm looks like an error happened to me... :( try again please!');
		const randomnumber = Math.floor(Math.random() * post.length)
		let url = `https://www.reddit.com${post[randomnumber].data.permalink}`
		const embed = new MessageEmbed()
		.setAuthor(`r/${subreddit}`, icon, `https://reddit.com/r/${subreddit}`)
		.setTitle(post[randomnumber].data.title)
		.setURL(url)
		.setImage(post[randomnumber].data.url)
		.setColor("RANDOM")
		.setTimestamp(post[randomnumber].data.created_utc * 1000)
		.setFooter(`⬆ ${post[randomnumber].data.ups} 💬 ${post[randomnumber].data.num_comments}`)
		return message.channel.send(embed)
	});
}

exports.help = {
	name: "nsfw",
	description: "send some nsfw content fron random sources :cry:",
	usage: "nsfw",
	example: "nsfw"
};
  
exports.conf = {
	aliases: ["anime-nsfw"],
    cooldown: 3,
    guildOnly: true,
	adult: true,
	channelPerms: ["EMBED_LINKS"]
};