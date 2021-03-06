const hugSchema = require('../model/hug');
const punchSchema = require('../model/punch');
const slapSchema = require('../model/slap');
const patSchema = require('../model/pat');
const cuddleSchema = require('../model/cuddle');
const kissSchema = require('../model/kiss');

module.exports = async (client, member) => {

    await client.dbverify.findOneAndDelete({
        guildID: member.guild.id,
        userID: member.user.id,
    }, (err) => {
        if (err) console.error(err)
    });


    await client.dbleveling.findOneAndDelete({
        guildId: member.guild.id,
        userId: member.user.id,
    }, (err) => {
        if (err) console.error(err)
    });
    await client.money.findOneAndDelete({
        guildId: member.guild.id,
        userId: member.user.id,
    }, (err) => {
        if (err) console.error(err)
    });

    await client.love.findOneAndDelete({
        guildID: member.guild.id,
        userID: member.user.id,
    }, (err) => {
        if (err) console.error(err)
    });

    await client.gameStorage.findOneAndDelete({
        guildId: member.guild.id,
        userId: member.user.id,
    }, (err) => {
        if (err) console.error(err)
    });

    await hugSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    await punchSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    await slapSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    await cuddleSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    await kissSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    }, (err) => {
        if (err) console.error(err)
    });

    await patSchema.findOneAndDelete({
        userId: member.user.id,
        guildId: member.guild.id,
    }, (err) => {
        if (err) console.error(err)
    });
    await client.verifytimers.deleteTimer(member.guild.id, member.user.id);
}