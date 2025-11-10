const { cmd, commands } = require("../command");
const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson
} = require('../lib/functions');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { readEnv } = require("../lib/database");
const fs = require('fs');
const axios = require("axios");
const googleTTS = require("google-tts-api");
const { tmpdir } = require('os');
const translate = require('translate-google-api');
const Crypto = require("crypto");
const fileType = require("file-type");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter")
const crypto = require('crypto');
const webp = require('node-webpmux');
const fse = require('fs-extra');
const { exec } = require('child_process');

async function videoToWebp(videoBuffer) {
  const webpPath = path.join(
    tmpdir(),
    Crypto.randomBytes(6).readUIntLE(0, 6).toString(24) + ".webp"
  );
  const mp4Path = path.join(
    tmpdir(),
    Crypto.randomBytes(6).readUIntLE(0, 6).toString(24) + ".mp4"
  );

  fs.writeFileSync(mp4Path, videoBuffer);

  await new Promise((resolve, reject) => {
    ffmpeg(mp4Path)
      .on("error", reject)
      .on("end", () => resolve(true))
      .addOutputOptions([
        "-vcodec", "libwebp",
        "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
        "-loop", "0",
        "-ss", "00:00:00",
        "-t", "00:00:05",
        "-preset", "default",
        "-an",
        "-vsync", "0"
      ])
      .toFormat("webp")
      .save(webpPath);
  });

  const webpBuffer = fs.readFileSync(webpPath);
  fs.unlinkSync(webpPath);
  fs.unlinkSync(mp4Path);
  return webpBuffer;
}


function toAudio(input, output) {
  return ffmpeg(input, ["-vn", "-ac", "2", "-b:a", "128k", "-ar", "44100", "-f", "mp3"], output, 'mp3');
}
function toPTT(input, output) {
  return ffmpeg(input, ["-vn", "-c:a", "libopus", "-b:a", "128k", "-vbr", "on", "-compression_level", "10"], output, 'opus');
}
function toVideo(input, output) {
  return ffmpeg(input, ["-c:v", "libx264", "-c:a", "aac", "-ab", "128k", "-ar", "44100", "-crf", "32", "-preset", "slow"], output, "mp4");
}

cmd({
  pattern: "tts",
  react: '❄️',
  desc: "text to speech.",
  category: 'convert',
  filename: __filename,
  use: ".tts hi"
}, async (client, quotedMessage, msgObj, {
  from, quoted, body, isCmd, command, args, q, isGroup, sender,
  senderNumber, botNumber2, botNumber, pushname, isMe, isOwner,
  groupMetadata, groupName, participants, groupAdmins, isBotAdmins,
  isAdmins, reply
}) => {
  try {
    if (!q) {
      return quotedMessage.reply("Please give me Sentence to change into audio.");
    }
    const audioUrl = googleTTS.getAudioUrl(q, {
      lang: 'en',
      slow: false,
      host: "https://translate.google.com"
    });

    return client.sendMessage(msgObj.chat, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      fileName: 'ttsCitelVoid.m4a'
    }, { quoted: quotedMessage });
  } catch (err) {
    reply("*Error !!*");
    console.error(err);
  }
});

cmd({
  pattern: "readmore",
  desc: "Readmore message",
  category: "convert",
  use: ".readmore < text >",
  react: '❤️‍🔥',
  filename: __filename
}, async (client, message, msgObj, {
  from, quoted, body, isCmd, command, args, q, isGroup, sender
}) => {
  try {
    const text = q ? q : "No text provided";
    const ZERO_WIDTH_REPEAT = '\u200b'.repeat(4000); // 0xfa0 = 4000
    const out = '' + ZERO_WIDTH_REPEAT + text;
    await client.sendMessage(from, { text: out }, { quoted: message });
    await client.sendMessage(from, { react: { text: '', key: message.key } });
  } catch (err) {
    console.log(err);
    reply("Error: " + err.message);
  }
});


cmd({
  pattern: "translate",
  alias: ['trt'],
  react: '🌐',
  desc: "Translate text to a specified language",
  category: "convert",
  use: ".translate <text> to <language>",
  filename: __filename
}, async (client, message, msgObj, {
  from, reply, q
}) => {
  try {
    const [text, toLang] = q.split(" to ");
    if (!text || !toLang) {
      return await reply(".trt How are you to si");
    }
    const translated = await translate(text, { to: toLang });
    await reply("*😶‍🌫️ TRANSLATED *\n\n" + translated);
  } catch (err) {
    console.error(err);
    reply("An error occurred while translating the text. Please try again later.");
  }
});

/**
 * .gitclone - send GitHub repo zip via URL
 */
cmd({
  pattern: "gitdow",
  alias: ["gitdl"],
  react: '👾',
  desc: "Download git repos",
  category: "convert",
  use: ".gitclone <repo link>",
  filename: __filename
}, async (client, message, msgObj, {
  from, l: logError, quoted, body, isCmd, command, args, q, isGroup,
  sender, senderNumber, botNumber2, botNumber, pushname, isMe,
  isOwner, groupMetadata, groupName, participants, groupAdmins,
  isBotAdmins, isAdmins, reply
}) => {
  try {
    if (!q) return await reply(needus);
    const githubRegex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
    if (!githubRegex.test(q)) {
      return reply("🤨*Please enter a Valid GitHub Repo Link!*");
    }
    let [, owner, repo] = q.match(githubRegex) || [];
    repo = repo.replace(/.git$/, '');
    const zipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball`;
    // HEAD request to get file name from content-disposition
    const head = await fetch(zipUrl, { method: 'HEAD' });
    const contentDisposition = head.headers.get("content-disposition") || "";
    const fileNameMatch = contentDisposition.match(/attachment; filename=(.*)/) || [];
    const fileName = fileNameMatch[1] || `${repo}.zip`;
    const caption = config.FOOTER;
    await client.sendMessage(from, {
      document: { url: zipUrl },
      mimetype: "application/zip",
      fileName,
      caption
    }, { quoted: message });
  } catch (err) {
    reply(cantf);
    console.log(err);
  }
});

/**
 * .npm - search npm registry for package info
 */
cmd({
  pattern: "npm",
  desc: "Search for a package on npm.",
  react: '📦',
  use: ".npm < name >",
  category: "convert",
  filename: __filename
}, async (client, message, msgObj, {
  from, args, reply
}) => {
  if (!args.length) {
    return reply("Please provide the name of the npm package you want to search for. Example: !npm express");
  }
  const pkgName = args.join(" ");
  const url = 'https://registry.npmjs.org/' + encodeURIComponent(pkgName);
  try {
    const config = await readEnv();
    const owner = config.OWNER_NAME || "Shashika Dilshan";
    const botName = config.BOT_NAME || "AGNI";
    let res = await fetch(url);
    if (!res.ok) throw new Error("Package not found or an error occurred.");
    let data = await res.json();
    const latest = data["dist-tags"].latest;
    const description = data.description || "No description available.";
    const npmUrl = "https://www.npmjs.com/package/" + pkgName;
    const license = data.license || "Unknown";
    const repository = data.repository ? data.repository.url || "Not available" : "Not available";

let out = `
*🫣 ${botName} BOT NPM SEARCH*
┌──────────────────
├ 👾 Npm name : ${pkgName}
├ 🔗 Url : ${npmUrl}
├ 💨 Description : ${description}
├ ♻️ Latest version : ${latest}
├ 📄 License : ${license}
├ 🌟 Repository : ${repository}
└──────────────────`;

    await client.sendMessage(from, { text: out }, { quoted: message });
  } catch (err) {
    console.error(err);
    reply("An error occurred: " + err.message);
  }
});

/**
 * .ss - web screenshot (via external API)
 */
cmd({
  pattern: 'ss',
  alias: ["webss"],
  react: '📷',
  desc: "web screenshot",
  category: "convert",
  use: ".ss <query>",
  filename: __filename
}, async (client, message, msgObj, {
  from, reply, q
}) => {
  try {
    const config = await readEnv();
    if (!q) return await reply("Please provide a search q!");
    const res = await axios.get('https://api.pikwy.com/?tkn=125&d=3000&u=' + encodeURIComponent(q) + "&fs=0&w=1280&h=1200&s=100&z=100&f=jpg&rt=jweb");
    await client.sendMessage(from, { image: { url: res.data.iurl }, caption: config.BOT_NAME }, { quoted: message });
  } catch (err) {
    console.error(err);
    reply("An error occurred while processing your request. Please try again later.");
  }
});


//Sticker create 

cmd(
    {
        pattern: 'tosticker',
        alias: ['s', 'stickergif'],
        desc: 'Create a sticker from an image, video, or URL.',
        category: 'convert',
        use: '<reply media or URL>',
        filename: __filename,
    },
    async (conn, mek, m, { quoted, args, q, reply, from }) => {
        if (!mek.quoted) return reply(`*Reply to any Image or Video*`);
        let mime = mek.quoted.mtype;
        const config = await readEnv();
        let pack = config.BOT_NAME || "AGNI";
        
        if (mime === "imageMessage" || mime === "stickerMessage") {
            let media = await mek.quoted.download();
            let sticker = new Sticker(media, {
                pack: pack, 
                type: StickerTypes.FULL,
                categories: ["🥳", "😍"], 
                id: "12345",
                quality: 75, 
                background: 'transparent',
            });
            const buffer = await sticker.toBuffer();
            return conn.sendMessage(mek.chat, { sticker: buffer }, { quoted: mek });
        } else {
            return reply("*Please reply to an image.*");
        }
    }
);
//===============================

cmd(
  {
    pattern: "toimg",
    alias: ["img", "photo"],
    react: "🖼️",
    desc: "Convert a sticker to an image",
    category: "convert",
    filename: __filename,
  },
  async (
    malvin,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      groupMetadata,
      groupName,
      participants,
      reply,
    }
  ) => {
    try {
      // Ensure the message contains a sticker to convert
      if (!quoted || quoted.stickerMessage == null) {
        return reply("Please reply to a sticker to convert it to an image.");
      }

      // Download the sticker from the quoted message
      const stickerBuffer = await downloadMediaMessage(quoted, "stickerInput");
      if (!stickerBuffer)
        return reply("Failed to download the sticker. Try again!");

      // Convert the sticker buffer to an image (using Sticker class)
      const sticker = new Sticker(stickerBuffer, {
        pack: "shashika",
        author: "shashika",
        type: "FULL", // This may not be needed, but ensures we're using the full sticker format
        quality: 100, // Quality of the output image (0-100)
      });

      // Get the image buffer
      const imageBuffer = await sticker.toBuffer({ format: "image/jpeg" });

      // Send the image as a response
      await malvin.sendMessage(
        from,
        {
          image: imageBuffer,
          caption: "Here is your converted image!\n\n 𝗠𝗔𝗗𝗘 𝗕𝗬 𝗠𝗔𝗟𝗨 𝗫𝗗",
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error(e);
      reply(`Error: ${e.message || e}`);
    }
  }
);

