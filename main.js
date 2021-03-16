process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});
global.__baseURL = 'localhost/'
global.__basedir = __dirname;
require('dotenv').config();
global._port = process.env.PORT || 80;
const mongo = require('./util/mongo.js');
const web = require('./util/web.js');
const RedisClient = require('./util/redis');
mongo.init();
RedisClient.start();
const sefy = require("./handler/ClientBuilder.js");
const client = new sefy(({ disableMentions: 'everyone' }), { ws: { properties: { $browser: "Discord Android" }} });
client.loadTopics('./assets/trivia/');
web.init(client);
require("./handler/module.js")(client);
require("./handler/Event.js")(client);
client.package = require("./package.json");
client.on("warn", console.warn); 
client.on("error", console.error);
client.login(process.env.token).catch(console.error);
