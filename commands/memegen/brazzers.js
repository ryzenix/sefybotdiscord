const { createCanvas, loadImage } = require('canvas');
const request = require('node-superfetch');
const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;
const path = require('path');

exports.run = async (client, message, args) => {
    let image;
    let attachments = message.attachments.array();
    if (args[0]) {
        if (validUrl.isWebUri(args[0])) {
            image = args[0];
        } else {
            return message.inlineReply("that isn't a correct URL!");
        }
    } else {
        if (attachments.length === 0) {
            try {
                const caches = message.channel.messages.cache.filter(msg => msg.attachments.size > 0);
                if (!caches.size) {
                    const fetchs = await message.channel.messages.fetch({ limit: 10 });
                    const fetch = fetchs.filter(msg => msg.attachments.size > 0);
                    const target = fetch.filter(msg => fileTypeRe.test(msg.attachments.first().name));
                    image = target.first().attachments.first().url;
                } else {
                    const cache = caches.filter(msg => fileTypeRe.test(msg.attachments.first().name));
                    image = cache.last().attachments.first().url;
                };
            } catch (error) {
                image = message.author.displayAvatarURL({size: 4096, dynamic: false, format: 'png'});
            }
        }
        else if (attachments.length > 1) return message.inlineReply("i only can process one image at one time!");
        else image = attachments[0].url;
    };
    if (!fileTypeRe.test(image)) return message.inlineReply("uh i think that thing you sent me wasn't an image :thinking: i can only read PNG, JPG, BMP, or GIF format images :pensive:");
    try {
        const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'brazzers.png'));
        const { body } = await request.get(image);
        const data = await loadImage(body);
        const canvas = createCanvas(data.width, data.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(data, 0, 0);
        const ratio = base.width / base.height;
        const width = data.width / 3;
        const height = Math.round(width / ratio);
        ctx.drawImage(base, 0, data.height - height, width, height);
        const attachment = canvas.toBuffer();
        if (Buffer.byteLength(attachment) > 8e+6) {
            await message.channel.stopTyping(true);
            return message.channel.send("the file is over 8MB for me to upload! yknow i don't have nitro");
        };
        await message.channel.stopTyping(true);
        return message.channel.send({files: [{attachment, name: "brazzers.png"}] });
    } catch (error) {
        await message.channel.stopTyping(true);
        return message.inlineReply(`sorry i got an error :pensive: try again later!`)
    };
};

exports.help = {
    name: "brazzers",
    description: "you get the idea :eyes:",
    usage: ["brazzers `[URL]`", "brazzers `[image attachment]`"],
    example:  ["brazzers `image attachment`", "brazzers `https://example.com/girl.jpg`", "brazzers"]
};

exports.conf = {
    aliases: ['brazzer'],
    cooldown: 5,
    guildOnly: true,
	channelPerms: ["ATTACH_FILES"]
};