
const { readEnv } = require('../lib/database');
const { cmd, commands } = require('../command');
const { fetchJson } = require('../lib/functions');
const axios = require("axios");
const fs = require("fs");


cmd({
  pattern: 'aiimg',
  react: '😵‍💫',
  desc: 'Generate an image using Flux',
  category: 'other',
  filename: __filename
}, async (conn, mek, m, {
  body,
  from,
  quoted,
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
  groupAdmins,
  reply
}) => {
  try {
    const text = body.trim().replace(command, '').trim();
    if (!text) {
      return reply(`*Usage:* ${command} <prompt>\n\n*Example:* ${command} cat`);
    }

    await reply('> *`Processing Image...`*');

    const apiUrl = `https://apis.davidcyriltech.my.id/flux?prompt=${encodeURIComponent(text)}`;

    await conn.sendMessage(m.chat, { image: { url: apiUrl }, caption: `🎨 *Flux Image Generator*\n\n📄 *Prompt:* ${text}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅɪɴᴇꜱʜ` }, { quoted: m });
  } catch (error) {
    console.error('Error in Flux command:', error);
    reply(`*AN ERROR OCCURRED!! MESSAGE :*\n\n> ${error.message}`);
  }
});

cmd({
  pattern: "imgai",
  alias: ["aiimg6", "metaimg"],
  react: "💫",
  desc: "Generate an image using AI.",
  category: "other",
  filename: __filename
}, async (conn, mek, m, { q, reply }) => {
  try {
    if (!q) return reply("Please provide a prompt for the image.");

    await reply("> *creating img.....*");

    const apiUrl = `https://api.siputzx.my.id/api/ai/flux?prompt=${encodeURIComponent(q)}`;

    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    if (!response || !response.data) {
      return reply("Error: The API did not return a valid image. Try again later.");
    }

    const imageBuffer = Buffer.from(response.data, "binary");

    await conn.sendMessage(m.chat, {
      image: imageBuffer,
      caption: `*ᴘʀᴏᴍᴘᴛ : ${q}*\n\n> © *Gᴇɴᴇʀᴀᴛᴇᴅ ʙʏ BOT*`
    });

  } catch (error) {
    console.error("FluxAI Error:", error);
    reply(`An error occurred: ${error.response?.data?.message || error.message || "Unknown error"}`);
  }
});

cmd({
  pattern: "img",
  alias: ["aiimg3", "bingimage"],
  desc: "Search for images using Bing and send 5 results.",
  category: "other",
  use: ".bingimg <query>",
  filename: __filename,
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    const query = args.join(" ");
    if (!query) {
      return reply("❌ Please provide a search query. Example: `.img elephant`");
    }

    // Fetch images from the Bing Image Search API
    const response = await axios.get(`https://api.siputzx.my.id/api/s/bimg?query=${encodeURIComponent(query)}`);
    const { status, data } = response.data;

    if (!status || !data || data.length === 0) {
      return reply("❌ No images found for the specified query. Please try again.");
    }

    // Select the first 5 images
    const images = data.slice(0, 5);

    // Send each image as an attachment
    for (const imageUrl of images) {
      await conn.sendMessage(from, {
        image: { url: imageUrl }, // Attach the image
        caption: `📷 *Image Search*: ${query}`,
      });
    }
  } catch (error) {
    console.error("Error fetching images:", error);
    reply("❌ Unable to fetch images. Please try again later.");
  }
});

