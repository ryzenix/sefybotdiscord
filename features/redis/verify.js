const { MessageEmbed } = require('discord.js');
const ms = require("ms");
module.exports = class VerifyTimer {
	constructor(client) {
		Object.defineProperty(this, 'client', { value: client });
		this.timeouts = new Map();
	}

	async fetchAll() {
		const timers = await this.client.redis.hgetall('verifytimer');
		for (let data of Object.values(timers)) {
			data = JSON.parse(data);
			await this.setTimer(data.guildID, new Date(data.time) - new Date(), data.userID, false);
		}
		return this;
	}

	async setTimer(guildID, time, userID, updateRedis = true) {
		const data = { time: new Date(Date.now() + time).toISOString(), guildID, userID };
		const timeout = setTimeout(async () => {
			try {
                let reason = 'Sefy verification timeout (step 2)';
                const setting = await this.client.dbguilds.findOne({
                    guildID: guildID
                });
                const guild = await this.client.guilds.cache.get(guildID);
                if (!guild) return;
                const member = await guild.members.cache.get(userID);
                if (!member) return;
                const roleExist = guild.roles.cache.get(setting.verifyRole);
                const verifyChannel = guild.channels.cache.find(ch => ch.id === setting.verifyChannelID);
                const verifyRole = member._roles.includes(setting.verifyRole);
                if (verifyRole || !verifyChannel || !roleExist) return;
                const logChannel = await guild.channels.cache.get(setting.logChannelID);
                const logembed = new MessageEmbed()
                .setAuthor(`Verification`, this.client.user.displayAvatarURL())
                .setTitle(`${member.user.tag} was kicked`)
                .addField(`Progress`, `Step 2`)
                .setColor("#ff0000")
                .setThumbnail(member.user.displayAvatarURL({size: 4096, dynamic: true}))
                .addField('Username', member.user.tag)
                .addField('User ID', member.id)
                .addField('Kicked by', this.client.user)
                .addField('Reason', reason)
                .setTimestamp()
                const logerror = new MessageEmbed()
                .setAuthor(`Verification`, this.client.user.displayAvatarURL())
                .setTitle(`Failed while kicking ${member.user.tag}`)
                .addField(`Progress`, `Step 2`)
                .setDescription(`i can't kick that unverified member because critical permission was not met :pensive:`)
                .setColor('#ff0000')
                .setTimestamp()
                .setThumbnail(member.user.displayAvatarURL({size: 4096, dynamic: true}))
                if (!member.kickable) {
                    if (logChannel) return logChannel.send(logerror);
                    else return;
                }
                if (logChannel) await logChannel.send(logembed);
                await member.send(`i have kicked you from **${guild.name}** for not verifying in **${ms(time, {long: true})}** (at verification step 2) :pensive:`).catch(() => {
                    null
                });
                await member.kick(reason);
            } finally {
                await this.client.dbverify.findOneAndDelete({
                    guildID: guildID,
                    userID: userID,
                });
				await this.client.redis.hdel('verifytimer', `${guildID}-${userID}`);
			}
		}, time);
		if (updateRedis) await this.client.redis.hset('verifytimer', { [`${guildID}-${userID}`]: JSON.stringify(data) });
		this.timeouts.set(`${guildID}-${userID}`, timeout);
		return timeout;
	}

	async deleteTimer(guildID, userID) {
		clearTimeout(this.timeouts.get(`${guildID}-${userID}`));
		this.timeouts.delete(`${guildID}-${userID}`);
        await this.client.dbverify.findOneAndDelete({
            guildID: guildID,
            userID: userID,
        });
		return this.client.redis.hdel('verifytimer', `${guildID}-${userID}`);
	}

	exists(guildID, userID) {
		return this.client.redis.hexists('verifytimer', `${guildID}-${userID}`);
	}
};