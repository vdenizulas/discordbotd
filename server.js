const express = require("express");
const app = express();
const http = require("http");
app.get("/", (request, response) => {
  console.log(
    ` az önce pinglenmedi. Sonra ponglanmadı... ya da başka bir şeyler olmadı.`
  );
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

const Discord = require("discord.js");
const { Client, Util } = require("discord.js");
const PREFIX = ".";
const YouTube = require("simple-youtube-api");
const ytdl = require("ytdl-core");

const client = new Client({ disableEveryone: true });

const youtube = new YouTube("AIzaSyBR3OvFa6U4iVeDW4Wh8YQCloA6dEy6Iso");

const queue = new Map();
const gh = require("gitinfo");
const EncryptorDecryptor = require("encrypt_decrypt");
let tempObj = new EncryptorDecryptor();

client.on("warn", console.warn);

client.on("error", console.error);

client.on("disconnect", () =>
  console.log("Sadece haber emin olarak kesilir, şimdi yeniden bağlanır ...")
);

client.on("reconnecting", () =>
  console.log("Şimdi yeniden bağlanmaya çalışıyorum.")
);

client.on("message", async msg => {
  // eslint-disable-line
  if (msg.author.bot) return undefined;
  if (!msg.content.startsWith(PREFIX)) return undefined;

  const args = msg.content.split(" ");
  let eColor =
    msg.guild.me.displayHexColor !== "#000000"
      ? msg.guild.me.displayHexColor
      : 0xffffff;
  const searchString = args.slice(1).join(" ");
  const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
  const serverQueue = queue.get(msg.guild.id);

  let command = msg.content.toLowerCase().split(" ")[0];
  command = command.slice(PREFIX.length);

  if (command == "encrypt") {
    if (!args[1])
      return msg.channel.send("Please provide something to decrypt.");
    let encryptVal = tempObj.encrypt(args.slice(1).join(" "));
    let embed = new Discord.RichEmbed()
      .setTitle("Encryption")
      .addField("Arguement", args.slice(1).join(" "))
      .addField("Encrypted Arguement", encryptVal);
    msg.channel.send(embed);
  } else if (command == "decrypt") {
    if (!args[1])
      return msg.channel.send("Please provide something to decrypt.");
    let encryptVal = tempObj.decrypt(args.slice(1).join(" "));
    let embed = new Discord.RichEmbed()
      .setTitle("Decryption")
      .addField("Encrypted Arguement", args.slice(1).join(" "))
      .addField("Arguement", encryptVal);
    msg.channel.send(embed);
  }

  if (command === "çal") {
    const voiceChannel = msg.member.voiceChannel;
    if (!voiceChannel)
      return msg.channel.send(
        "Üzgünüm müzik açmam için senin bir sesli kanalda olman gerekli."
      );
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT")) {
      return msg.channel.send(
        "Üzgünüm bu odaya bağlanma yetkim yok sunucu ayarlarından rolümdeki yetkileri arttırmalısın."
      );
    }
    if (!permissions.has("SPEAK")) {
      return msg.channel.send(
        "Üzgünüm bu odada konuşma yetkim yok sunucu ayarlarından rolümdeki yetkileri arttırmalısın."
      );
    }

    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      const playlist = await youtube.getPlaylist(url);
      const videos = await playlist.getVideos();
      for (const video of Object.values(videos)) {
        const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
        await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
      }
      return msg.channel.send({
        embed: new Discord.RichEmbed()
          .setAuthor(
            `You Requested for Music, ` + msg.author.tag,
            msg.author.avatarURL
          )
          .setDescription(
            `:notes: **Sıraya eklendi:**
**»** ${playlist.title}`
          )
          .setColor(eColor)
      });
    } else {
      if (!searchString) {
        msg.channel.send({
          embed: new Discord.RichEmbed()
            .setAuthor(
              `Çal komutu kullanımı &  ` + msg.author.tag,
              msg.author.avatarURL
            )
            .setDescription(
              `**Kullanım:**  >çal <search>
Sizde türkiyenin ilk ve gelişmekte olan
müzik botunu kullanıyorsanız ne mutlu size.`
            )
            .setColor(eColor)
        });
      } else {
        try {
          var video = await youtube.getVideo(url);
        } catch (error) {
          try {
            var videos = await youtube.searchVideos(searchString, 5);
            let index = 0;
            /*  msg.channel.send({embed: new Discord.RichEmbed()
                        .setAuthor(`You Requested for Music, ` + msg.author.tag,msg.author.avatarURL)
                        .setDescription(`<:TubeMusic:413862971865956364>__**Youtube Search Result**__
${videos.map(video2 => `**${++index}.** ${video2.title}`).join(`\n`)}
To select a song, type any number from \`1 - 5\` to choose song!
The search is cancelled in \`10 seconds\` if no number provided.`)
                        .setColor(eColor)
                         
                       }); 
        try {
          var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 6, {
            maxMatches: 1,
            time: 10000,
            errors: ['time']
          });
        } catch (err) {
          console.error(err);
          return msg.channel.send('Invalid numbers inserted or no received numbers. I\'m Cancelling your Search.');
        } */
            // var response = 1;
            //	const videoIndex = parseInt(response.first().content);
            var video = await youtube.getVideoByID(videos[0].id);
          } catch (err) {
            console.error(err);
            return msg.channel.send("Hey! Ben herhangi bir sonuç bulamadım.");
          }
        }
        return handleVideo(video, msg, voiceChannel);
      }
    }
  } else if (command === "geç") {
    if (!msg.member.voiceChannel)
      return msg.channel.send(
        ":red_circle: **Ses kanalında değil, ben seninle konuşuyorum**"
      );
    if (!serverQueue)
      return msg.channel.send(
        ":mailbox_with_no_mail: **Boş bir sırayı nasıl atlayayım.**"
      );
    serverQueue.connection.dispatcher.end("Atla komutu kullanıldı.");
    return undefined;
  } else if (command === "dur") {
    if (!msg.member.voiceChannel)
      return msg.channel.send(
        ":red_circle: **Ses kanalında değil, ben seninle konuşuyorum**"
      );
    if (!serverQueue)
      return msg.channel.send(
        ":mailbox_with_no_mail: **Durmayacak bir şey yok, çünkü müzik yok!**"
      );
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end("Dur komutu kullanıldı.");
    msg.channel.send({
      embed: new Discord.RichEmbed()
        .setAuthor(msg.author.tag, msg.author.avatarURL)
        .setDescription(`Oyuncu müziği durdurdu.`)
        .setColor(eColor)
    });
    return undefined;
  } else if (command === "ses") {
    if (!msg.member.voiceChannel)
      return msg.channel.send("Sesli kanalda değilsiniz!");
    if (!serverQueue)
      return msg.channel.send(
        "Çalan müzik bulunmamakta nasıl sesini düzenleyebilirsin ?"
      );
    if (!args[1])
      return msg.channel.send(`Mevcut ses şiddeti: **${serverQueue.volume}**`);
    serverQueue.volume = args[1];
    serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
    return msg.channel.send(`Ayarlanan ses düzeyi: **${args[1]}**`);
  } else if (command === "çalan" || command === "şimdi-çalan") {
    if (!serverQueue)
      return msg.channel.send(
        ":mailbox_with_no_mail: **Bekle, müzik çalmıyor!**"
      );
    return msg.channel.send({
      embed: new Discord.RichEmbed()
        .setAuthor(msg.author.tag, msg.author.avatarURL)
        .setDescription(
          `:notes: **Çalmakta olan şarkı:**\n${serverQueue.songs[0].title}`
        )
        .setColor(eColor)
        .setThumbnail(
          `https://img.youtube.com/vi/${serverQueue.songs[0].id}/mqdefault.jpg`
        )

        .setTimestamp(new Date())
    });
    //msg.channel.send(`Yo yo! I'm playing :notes: ,**${serverQueue.songs[0].title}**, :notes: currently!`);
  } else if (command === "kuyruk" || command === `k`) {
    if (!serverQueue)
      return msg.channel.send(
        ":mailbox_with_no_mail: **Ne? Hiçbir şey oynamıyor mu ?**"
      );
    return msg.channel.send({
      embed: new Discord.RichEmbed()
        .setAuthor(msg.author.tag, msg.author.avatarURL)
        .setDescription(
          `:notes: **Şarkı Mevcut Sıra:**\n${serverQueue.songs
            .map(song => `**»** ${song.title}`)
            .join("\n")}`
        )
        .setColor(eColor)

        .setTimestamp(new Date())
    });

    msg.channel.send(`
__**Müzik kuyruğu:**__
${serverQueue.songs.map(song => `**-** ${song.title}`).join("\n")}
**Çalınan şarkı:**
:notes: ${serverQueue.songs[0].title} :notes:
  `);
  } else if (command === "duraklat") {
    if (serverQueue && serverQueue.playing) {
      serverQueue.playing = false;
      serverQueue.connection.dispatcher.pause();
      return msg.channel.send(
        ":pause_button: **Başarılı bir şekilde müziği durdurdun.**"
      );
    }
    return msg.channel.send(
      ":mailbox_with_no_mail: **Bu DJ boş şarkıyı nasıl durduracağını bilmiyor!**"
    );
  } else if (command === "devamet") {
    if (serverQueue && !serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      return msg.channel.send(
        ":play_pause: **Kullanıcı şarkıyı tekrardan başlattı.**"
      );
    }
    return msg.channel.send(
      ":mailbox_with_no_mail: **Bu DJ boş şarkıyı nasıl durduracağını bilmiyor!**"
    );
  }

  return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
  let eColor =
    msg.guild.me.displayHexColor !== "#000000"
      ? msg.guild.me.displayHexColor
      : 0xffffff;
  const serverQueue = queue.get(msg.guild.id);
  console.log(video);
  const song = {
    id: video.id,
    title: Discord.escapeMarkdown(video.title),
    url: `https://www.youtube.com/watch?v=${video.id}`
  };
  if (!serverQueue) {
    const queueConstruct = {
      textChannel: msg.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };
    queue.set(msg.guild.id, queueConstruct);

    queueConstruct.songs.push(song);
    msg.channel.send({
      embed: new Discord.RichEmbed()
        .setAuthor(msg.author.tag, msg.author.avatarURL)
        .setDescription(`:notes: **Şuanda çalan şarkı:**\n${video.title}`)
        .setTimestamp(new Date())

        .setThumbnail(`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`)
        .setColor(eColor)
    });

    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      play(msg.guild, queueConstruct.songs[0]);
    } catch (error) {
      console.error(`I could not join the voice channel: ${error}`);
      queue.delete(msg.guild.id);
      return msg.channel.send(`I could not join the voice channel: ${error}`);
    }
  } else {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
    if (playlist) return undefined;
    else
      return msg.channel.send({
        embed: new Discord.RichEmbed()
          .setAuthor(msg.author.tag, msg.author.avatarURL)
          .setDescription(`:notes: **Added Song:**\n${video.title}`)
          .setTimestamp(new Date())
          .setThumbnail(`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`)

          .setColor(eColor)
      });
  }
  return undefined;
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  console.log(serverQueue.songs);

  const dispatcher = serverQueue.connection
    .playStream(ytdl(song.url))
    .on("end", reason => {
      if (reason === "Stream is not generating quickly enough.")
        console.log("Song ended.");
      else console.log(reason);
      serverQueue.songs.shift();
      setTimeout(() => {
        play(guild, serverQueue.songs[0]);
      }, 250);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

//consts (for glitch)
// GEREKLİ YERLER
const express = require("express");
const app = express();
const http = require("http");
app.get("/", (request, response) => {
  console.log(
    ` az önce pinglenmedi. Sonra ponglanmadı... ya da başka bir şeyler olmadı.`
  );
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
// GEREKLİ YERLER
// -------------------------------------------------------------
const Discord = require("discord.js");
const client = new Discord.Client();
const ayarlar = require("./ayarlar.json");
const chalk = require("chalk");
const fs = require("fs");
const moment = require("moment");
const Jimp = require("jimp");
const db = require("quick.db");

var prefix = ayarlar.prefix;

const log = message => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`);
};

//////////////////////////////////
////////////////////////
// Müzik Komutu // // API KODU DC DE //

const { GOOGLE_API_KEY } = require("./anahtarlar.json");
const YouTube = require("simple-youtube-api");
const queue = new Map();
const youtube = new YouTube(GOOGLE_API_KEY);
const ytdl = require("ytdl-core");

client.on("message", async msg => {
  if (msg.author.bot) return undefined;
  if (!msg.content.startsWith(prefix)) return undefined;

  const args = msg.content.split(" ");
  const searchString = args.slice(1).join(" ");
  const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
  const serverQueue = queue.get(msg.guild.id);
  let command = msg.content.toLowerCase().split(" ")[0];
  command = command.slice(prefix.length);

  if (command === "çal") {
    const voiceChannel = msg.member.voiceChannel;
    if (!voiceChannel)
      return msg.channel.sendEmbed(
        new Discord.RichEmbed()
          .setColor("RANDOM")
          .setDescription(
            ":warning: | İlk olarak sesli bir kanala giriş yapmanız gerek."
          )
      );
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT")) {
      return msg.channel.sendEmbed(
        new Discord.RichEmbed()
          .setColor("RANDOM")
          .setTitle(
            ":warning: | İlk olarak sesli bir kanala giriş yapmanız gerek."
          )
      );
    }
    if (!permissions.has("SPEAK")) {
      return msg.channel.sendEmbed(
        new Discord.RichEmbed()
          .setColor("RANDOM")
          .setTitle(
            ":warning: | Şarkı başlatılamıyor. Lütfen mikrofonumu açınız."
          )
      );
    }

    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      const playlist = await youtube.getPlaylist(url);
      const videos = await playlist.getVideos();
      for (const video of Object.values(videos)) {
        const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
        await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
      }
      return msg.channel
        .sendEmbed(new Discord.RichEmbed())
        .setTitle(
          `**✅ | Oynatma Listesi: **${playlist.title}** Kuyruğa Eklendi!**`
        );
    } else {
      try {
        var video = await youtube.getVideo(url);
      } catch (error) {
        try {
          var videos = await youtube.searchVideos(searchString, 10);
          let index = 0;

          msg.channel.sendEmbed(
            new Discord.RichEmbed()
              .setTitle("FaMzik Bot | Şarkı Seçimi")
              .setDescription(
                `${videos
                  .map(video2 => `**${++index} -** ${video2.title}`)
                  .join("\n")}`
              )
              .setFooter(
                "Lütfen 1-10 arasında bir rakam seçiniz 10 saniye içinde liste iptal edilecektir."
              )
              .setColor("0x36393E")
          );
          msg.delete(5000);
          try {
            var response = await msg.channel.awaitMessages(
              msg2 => msg2.content > 0 && msg2.content < 11,
              {
                maxMatches: 1,
                time: 10000,
                errors: ["time"]
              }
            );
          } catch (err) {
            console.error(err);
            return msg.channel.sendEmbed(
              new Discord.RichEmbed()
                .setColor("0x36393E")
                .setDescription(
                  ":warning: | **Şarkı Değeri Belirtmediğiniz İçin Seçim İptal Edilmiştir**."
                )
            );
          }
          const videoIndex = parseInt(response.first().content);
          var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
        } catch (err) {
          console.error(err);
          return msg.channel.sendEmbed(
            new Discord.RichEmbed()
              .setColor("0x36393E")
              .setDescription(":( | **Aradaım Fakat Hiç Bir Sonuç Çıkmadı**")
          );
        }
      }
      return handleVideo(video, msg, voiceChannel);
    }
  } else if (command === "geç") {
    if (!msg.member.voiceChannel)
      if (!msg.member.voiceChannel)
        return msg.channel.sendEmbed(
          new Discord.RichEmbed()
            .setColor("RANDOM")
            .setDescription(
              "<a:frograinbow:488978511474982933> | **Lütfen öncelikle sesli bir kanala katılınız**."
            )
        );
    if (!serverQueue)
      return msg.channel.sendEmbed(
        new Discord.RichEmbed()
          .setColor("RANDOM")
          .setTitle(
            "<a:frograinbow:488978511474982933> | **Hiç Bir Müzik Çalmamakta**"
          )
      );
    serverQueue.connection.dispatcher.end("**Müziği Geçtim!**");
    return undefined;
  } else if (command === "durdur") {
    if (!msg.member.voiceChannel)
      if (!msg.member.voiceChannel)
        return msg.channel.sendEmbed(
          new Discord.RichEmbed()
            .setColor("RANDOM")
            .setDescription(
              "**:warning: | Lütfen öncelikle sesli bir kanala katılınız.**"
            )
        );
    if (!serverQueue)
      return msg.channel.sendEmbed(
        new Discord.RichEmbed()
          .setColor("RANDOM")
          .setTitle(":warning: **| Hiç Bir Müzik Çalmamakta**")
      );
    msg.channel.send(
      `:stop_button: **${serverQueue.songs[0].title}** Adlı Müzik Durduruldu`
    );
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end("**Müzik Bitti**");
    return undefined;
  } else if (command === "ses") {
    if (!msg.member.voiceChannel)
      if (!msg.member.voiceChannel)
        return msg.channel.sendEmbed(
          new Discord.RichEmbed()
            .setColor("RANDOM")
            .setDescription(
              ":warning: **| Lütfen öncelikle sesli bir kanala katılınız.**"
            )
        );
    if (!serverQueue)
      return msg.channel.sendEmbed(
        new Discord.RichEmbed()
          .setColor("RANDOM")
          .setTitle(":warning:| **Hiç Bir Müzik Çalmamakta**")
      );
    if (!args[1])
      return msg.channel.sendEmbed(
        new Discord.RichEmbed()
          .setTitle(`:warning: Şuanki Ses Seviyesi: **${serverQueue.volume}**`)
          .setColor("RANDOM")
      );
    serverQueue.volume = args[1];
    serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
    return msg.channel.sendEmbed(
      new Discord.RichEmbed()
        .setTitle(`:hammer:  Ses Seviyesi Ayarlanıyor: **${args[1]}**`)
        .setColor("RANDOM")
    );
  } else if (command === "çalan") {
    if (!serverQueue)
      return msg.channel.sendEmbed(
        new Discord.RichEmbed()
          .setTitle(":warning: | **Çalan Müzik Bulunmamakta**")
          .setColor("RANDOM")
      );
    return msg.channel.sendEmbed(
      new Discord.RichEmbed()
        .setColor("RANDOM")
        .setTitle("FaMüzik Bot | Çalan")
        .addField(
          "Başlık",
          `[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})`,
          true
        )
        .addField(
          "Süre",
          `${serverQueue.songs[0].durationm}:${serverQueue.songs[0].durations}`,
          true
        )
    );
  } else if (command === "sıra") {
    let index = 0;
    if (!serverQueue)
      return msg.channel.sendEmbed(
        new Discord.RichEmbed()
          .setTitle(":warning: | **Sırada Müzik Bulunmamakta**")
          .setColor("RANDOM")
      );
    return msg.channel
      .sendEmbed(
        new Discord.RichEmbed()
          .setColor("RANDOM")
          .setTitle("FaMüzik Bot | Şarkı Kuyruğu")
          .setDescription(
            `${serverQueue.songs
              .map(song => `**${++index} -** ${song.title}`)
              .join("\n")}`
          )
      )
      .addField("Şu anda çalınan: " + `${serverQueue.songs[0].title}`);
  } else if (command === "duraklat") {
    if (serverQueue && serverQueue.playing) {
      serverQueue.playing = false;
      serverQueue.connection.dispatcher.pause();
      return msg.channel.sendEmbed(
        new Discord.RichEmbed()
          .setTitle("**:pause_button: Müzik Senin İçin Durduruldu!**")
          .setColor("RANDOM")
      );
    }
    return msg.channel.send(":warning: | **Çalan Müzik Bulunmamakta**");
  } else if (command === "devam") {
    if (serverQueue && !serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      return msg.channel.sendEmbed(
        new Discord.RichEmbed()
          .setTitle("**:arrow_forward: Müzik Senin İçin Devam Etmekte!**")
          .setColor("RANDOM")
      );
    }
    return msg.channel.sendEmbed(
      new Discord.RichEmbed()
        .setTitle(":warning: ** | Çalan Müzik Bulunmamakta.**")
        .setColor("RANDOM")
    );
  }

  return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
  const serverQueue = queue.get(msg.guild.id);
  console.log(video);
  const song = {
    id: video.id,
    title: video.title,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    durationh: video.duration.hours,
    durationm: video.duration.minutes,
    durations: video.duration.seconds,
    views: video.views
  };
  if (!serverQueue) {
    const queueConstruct = {
      textChannel: msg.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };
    queue.set(msg.guild.id, queueConstruct);

    queueConstruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      play(msg.guild, queueConstruct.songs[0]);
    } catch (error) {
      console.error(
        `:warning: **Şarkı Sisteminde Problem Var Hata Nedeni: ${error}**`
      );
      queue.delete(msg.guild.id);
      return msg.channel.sendEmbed(
        new Discord.RichEmbed()
          .setTitle(
            `:warning: **Şarkı Sisteminde Problem Var Hata Nedeni: ${error}**`
          )
          .setColor("RANDOM")
      );
    }
  } else {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
    if (playlist) return undefined;
    return msg.channel.sendEmbed(
      new Discord.RichEmbed()
        .setTitle(
          `:arrow_heading_up:  **${song.title}** Adlı Müzik Kuyruğa Eklendi!`
        )
        .setColor("RANDOM")
    );
  }
  return undefined;
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  console.log(serverQueue.songs);

  const dispatcher = serverQueue.connection
    .playStream(ytdl(song.url))
    .on("end", reason => {
      if (reason === " :x:  | **Yayın Akış Hızı Yeterli Değil.**")
        console.log("Müzik Bitti.");
      else console.log(reason);
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

  serverQueue.textChannel.sendEmbed(
    new Discord.RichEmbed()
      .setTitle(
        "**FaMüzik | 🎙 Müzik Başladı**",
        `https://cdn.discordapp.com/avatars/473974675194511361/6bb90de9efe9fb80081b185266bb94a6.png?size=2048`
      )
      .setThumbnail(
        `https://i.ytimg.com/vi/${song.id}/default.jpg?width=80&height=60`
      )
      .addField("\nBaşlık", `[${song.title}](${song.url})`, true)
      .addField("\nSes Seviyesi", `${serverQueue.volume}%`, true)
      .addField("Süre", `${song.durationm}:${song.durations}`, true)
      .setColor("RANDOM")
  );
}

//////////////////
client.elevation = message => {
  if (!message.guild) {
    return;
  }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;

client.on("warn", e => {
  console.log(chalk.bgYellow(e.replace(regToken, "that was redacted")));
});

client.on("error", e => {
  console.log(chalk.bgRed(e.replace(regToken, "that was redacted")));
});

client.login("ayarlar.token");
