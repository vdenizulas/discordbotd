const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');

var prefix = ayarlar.prefix;

//Bu altyapı sahibi CodeMareFi Kod bot paylaşım sunucusudur.
module.exports = client => {
  console.log(`${client.user.username}FaGame ismi ile giriş yapıldı!`);
  client.user.setStatus("idle");
  //idle = boşta
  //dnd = rahatsız etmeyin
  //online = çevrimiçi
  console.log(`                                                                                                                                                                     `)
  client.user.setActivity(`${prefix}commands | ${client.guilds.size} FaGame sunucu | ${client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} FaGame Kullanıcıyı`, { type: "LISTENING"});
  //LISTENING = DİNLİYOR
  //WATCHING = İZLİYOR
  //PLAYING = OYNUYOR 
  console.log(`${client.user.username}:FaGame Şu an ` + client.channels.size + `FaGame adet kanala, ` + client.guilds.size + `FaGame adet sunucuya ve ` + client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString() + `FaGame kullanıcıya hizmet veriliyor!`);
};
