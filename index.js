'use strict';

const message = "Hi there {nick}, we've moved our communications from this IRC channel to Mattermost, a web based collaboration tool. Please join us: https://chat.mozillafoundation.org/mozilla"
const irc = require('irc');
const format = require("string-template");
const catbox = require('catbox');
const CatboxRedis = require('catbox-redis');
const redisUrl = require('url').parse(process.env.REDIS_URL);
const redisClient = new catbox.Client(
  new CatboxRedis({
    host: redisUrl.hostname,
    port: redisUrl.port,
    password: (redisUrl.auth || '').split(':')[1],
    database: redisUrl.path.length ? redisUrl.path : 0,
    partition: "301-bot"
  })
);
let ircClient;

const ircServer = process.env.IRC_SERVER;
const botNick = process.env.NICK;
const ircClientOptions = {
  channels: process.env.CHANNEL_LIST.split(' '),
  port: process.env.IRC_PORT,
  secure: process.env.SECURE_CONNECTION | false,
  autoRejoin: true,
  floodProtection: true,
  floodProtectionDelay: 1000
};
const oneMonth = 1000 * 60 * 60 * 24 * 30;

function cacheNoticeSent(key) {
  redisClient.set(
    key,
    (new Date()).toUTCString(),
    oneMonth,
    (err) => err && console.error('Error setting key:', err)
  );
}

function sendNotice(channel, nick) {
  ircClient.say(channel, format(message, {nick}));
}

function handleJoin(channel, nick) {
  
  if (nick === botNick) {
    return;
  }

  const key = {
    segment: channel,
    id: nick
  };

  redisClient.get(key, (err, cached) => {
    if (err) {
      return console.error('Error fetching key from redis:', err);
    }

    if (!cached) {
      sendNotice(channel, nick, key);
      cacheNoticeSent(key);
    }
  });
}

function connectToIRC(redisError) {
  if (redisError) {
    console.error('Connection Error: ', redisError);
    process.exit(1);
  }

  ircClient = new irc.Client(ircServer, botNick, ircClientOptions);

  ircClient.addListener('join', handleJoin);

  ircClient.addListener('error', (message) => console.error(message));
}

redisClient.start(connectToIRC);
