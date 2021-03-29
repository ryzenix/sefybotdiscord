require('dotenv').config();
process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

global._port = process.env.PORT || 80;
global.__basedir = __dirname;
global.__baseURL = process.env.baseURL || 'https://sefy.daztopia.xyz/';
const mongo = require('./util/mongo.js');
const RedisClient = require('./util/redis');

mongo.init();
RedisClient.start();
const sefy = require("./handler/ClientBuilder.js");
require('./handler/inlineReply');
const client = new sefy(({ disableMentions: 'everyone',  ws: { properties: { $browser: "Discord Android" }} }));
client.loadTopics('./assets/trivia/');
require("./handler/module.js")(client);
require("./handler/Event.js")(client);
client.package = require("./package.json");
client.on("warn", console.warn); 
client.on("error", console.error);
client.login(process.env.token).catch(console.error);
