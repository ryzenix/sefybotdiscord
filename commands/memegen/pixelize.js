const request = require('node-superfetch');
const { createCanvas, loadImage } = require('canvas');
const { pixelize } = require('../../util/canvas');
const validUrl = require('valid-url');
const fileTypeRe = /\.(jpe?g|png|gif|jfif|bmp)(\?.+)?$/i;

exports.run = async (client, message, args) => {
  let image;
  let attachments = message.attachments.array();
  if (args[0]) {
      if (validUrl.isWebUri(args[0])) {
          image = args[0];
      } else {
          return message.inlineReply("that isn't a correct URL!").then(m => m.delete({ timeout: 5000 }));
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
      else if (attachments.length > 1) return message.inlineReply("i only can process one image at one time!").then(m => m.delete({ timeout: 5000 }));
      else image = attachments[0].url;
  };
  if (!fileTypeRe.test(image)) return message.inlineReply("uh i think that thing you sent me wasn't an image :thinking: i can only read PNG, JPG, BMP, or GIF format images :pensive:")
	try {
    message.channel.startTyping(true); 
    const { body } = await request.get(image);
    const data = await loadImage(body);
    const canvas = createCanvas(data.width, data.height);
    const ctx = canvas.getContext('2d');
    pixelize(ctx, canvas, data, 0.15, 0, 0, canvas.width, canvas.height);
    const attachment = canvas.toBuffer();
    if (Buffer.byteLength(attachment) > 8e+6) {
      await message.channel.stopTyping(true);
      return message.channel.send("the file is over 8MB for me to upload! yknow i don't have nitro");
  };
    await message.channel.stopTyping(true);
    return message.channel.send({ files: [{ attachment, name: 'pixelize.png' }] });
  } catch (err) {
    await message.channel.stopTyping(true);
    return message.channel.send(`sorry :( i got an error. try again later! can you check the image files?`)
  }
};

exports.help = {
  name: "pixelize",
  description: "pixelize your image",
  usage: ["pixelize `[image attachment]`", "pixelize `[URL]`"],
  example: ["pixelize `image attachment`", "pixelize `https://example.com/girl.jpg`", "pixelize"]
};

exports.conf = {
  aliases: ['pixel'],
  cooldown: 5,
  guildOnly: true,
	channelPerms: ["ATTACH_FILES"]
}
