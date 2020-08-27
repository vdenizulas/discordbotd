const Discord = require('discord.js');
const client = new Discord.Client();

exports.run = (client, message) => {
   message.channel.send('Espri yükleniyor.').then(message => {
      var espriler = ['Maalesef espiriler komutu kalktı.Çünkü bakıma aldık güzel espriler ile yakında karşınızda!!!!'];
      var espri = espriler[Math.floor(Math.random() * espriler.length)];
            message.edit(`${espri}`);
 });
  }

exports.conf = {
  enabled: false,
  guildOnly: false,
  aliases: ['espiri', 'espri-yap', 'yap-espri', 'yapbi-espri'],
  permLevel: 0
};

exports.help = {
  name: 'espri',
  description: 'Espri yapar.',
  usage: 'espri'
};