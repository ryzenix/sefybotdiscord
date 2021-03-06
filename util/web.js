const express = require('express');
const helmet = require("helmet");
const compression = require("compression");
const { MessageEmbed } = require("discord.js");
const { stripIndents } = require('common-tags');
module.exports = {
    init: (client) => {
        client.webapp.use(express.json());
        client.webapp.use(helmet());
        client.webapp.use(compression());
        client.webapp.disable("x-powered-by");
        client.webapp.get('/', authenticateToken, (_, res) => res.send('the heck bros'));
        client.webapp.post("/checkVerify", authenticateToken, async (req, res) => {
            if ("userID" in req.query && "guildID" in req.query) {
              await client.verifytimers.deleteTimer(req.query.guildID, req.query.userID);
              const setting = await client.dbguilds.findOne({
                guildID: req.query.guildID
              });
              if (!setting) return res.json({ code: 204, message: 'NO_GUILD_SETTING_FOUND' });
              const guild = client.guilds.cache.get(req.query.guildID);
              if (!guild) return res.json({ code: 204, message: 'NO_GUILD_FOUND' })
              if (!guild.available) return res.json({ code: 204, message: 'GUILD_NOT_AVAILABLE' });
              if (guild.partial) await guild.fetch();
              const member = guild.members.cache.get(req.query.userID);
              if (!member) return res.json({ code: 204, message: 'MEMBER_NOT_FOUND' });
              if (member.partial) await member.fetch();
              const roleExist = member._roles.includes(setting.verifyRole);
              if (roleExist) return res.json({ code: 204, message: 'ALREADY_VERIFIED' });
              const verifyRole = guild.roles.cache.get(setting.verifyRole);
              if (!verifyRole) return res.json({ code: 204, message: 'ROLE_NOT_EXIST' });
              res.json({ code: 200, message: 'SUCCESS' });
              if (!guild.me.hasPermission('MANAGE_ROLES')) {
                try {
                  return member.send(`oof, so mods from **${guild.name}** forgot to give me the role \`MANAGE_ROLES\` to gain you access to the server :pensive: can you ask them to verify you instead?\nyou will not be kicked after this message`);
                } catch (error) {
                  const verifyChannel = guild.channels.cache.get(setting.verifyChannelID);
                  if (!verifyChannel || !verifyChannel.permissionsFor(guild.me).has('SEND_MESSAGES')) return;
                  else return verifyChannel.send(`<@!${member.user.id}>, sorry but mods from **${guild.name}** forgot to give me the role \`MANAGE_ROLES\` to gain you access to the server :pensive: can you ask them to verify you instead?\nyou will not be kicked after this message`).then(m => m.delete({ timeout: 6000 }));
                }
              } else {
                await member.roles.add(setting.verifyRole);
                try {
                  return member.send(`**${member.user.username}**, you have passed my verification! Welcome to ${guild.name}!`);
                } catch (error) {
                  if (!verifyChannel || !verifyChannel.permissionsFor(guild.me).has('SEND_MESSAGES')) return;
                  else return verifyChannel.send(`<@!${member.user.id}>, you have passed my verification! Welcome to ${guild.name}!`).then(m => m.delete({ timeout: 6000 }));
                }
              }
            } else {
              return res.status(400).json({ code: 400, message: 'MISSING_QUERY' })
            }
        });
        client.webapp.post('/vote', authenticateToken, async (req, res) => {
          if ("userID" in req.query) {
            let user;
            try {
              user = await client.users.fetch(req.query.userID);
            } catch (error) {
              return res.status(400).json({ code: 400, message: 'USER_NOT_FOUND' });
            };
            const blush = client.customEmojis.get('blush') ? client.customEmojis.get('blush') : ':blush:';
            const duh = client.customEmojis.get('duh') ? client.customEmojis.get('duh') : ':blush:';
            const embed = new MessageEmbed()
            .setColor('#F4EDB4')
            .setAuthor(`hey ${user.username}, thanks for voting ＼(=^‥^)/’`, client.user.displayAvatarURL())
            .setDescription(stripIndents`
            thank you for being generous and gave me a vote ${blush}

            you was given a 50% bonus on your next daily token collect! type \`>daily\` in any server to collect your token :tada:
            that is the only thing i have to offer right now ${duh} keep voting to explore!

            at the mean time, check out our family: 

            [Sefiria (community server)](https://discord.gg/kJRAjMyEkY)
            [sefy support (support server)](https://discord.gg/D6rWrvS)
            `)
            res.status(200).json({ code: 200 });
            const voteStorage = client.vote;
            const vote = new voteStorage({
              userID: user.id
            });
            await vote.save();
            return user.send(embed).catch(() => null);
          } else {
            return res.status(400).json({ code: 400, message: 'MISSING_QUERY' })
          }
        });
        client.webapp.get('*', authenticateToken, function(req, res) {
            res.status(404).send('wrong call bruh')
        });
        client.webapp.listen(_port);
        console.log(`[WEB] Listening at port ${_port}`);
    }
};
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401);
  if (token !== process.env.apiToken) return res.sendStatus(401);
  next()
};