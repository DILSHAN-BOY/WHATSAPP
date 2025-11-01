const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: "video",
  alias: ["yt", "ytdl", "ytvideo"],
  desc: "Download YouTube video (HD/SD)",
  category: "download",
  react: "📹",
  filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
  try {
    if (!q) return reply("🎥 *Usage:* `.video <YouTube URL>`");

    const url = q.trim();
    if (!/^https?:\/\//i.test(url)) return reply("❌ Invalid YouTube URL!");

    const apiUrl = `https://apiskeith.vercel.app/download/mp4?url=${encodeURIComponent(url)}`;
    await reply("🔎 Fetching YouTube video info...");

    const { data } = await axios.get(apiUrl);
    if (!data || !data.result) return reply("❌ Couldn't fetch video info!");

    const title = data.title || "Untitled Video";
    const thumb = data.thumbnail || null;

    const links = [
      { quality: "SD", url: data.result.sd },
      { quality: "HD", url: data.result.hd },
    ].filter(x => x.url);

    if (!links.length) return reply("⚠️ No downloadable links found!");

    const caption = `
╭─❖━「 *📹 YOUTUBE VIDEO* 」━❖
│ 🎬 Title: ${title}
│ 🪶 Quality: Choose below
╰───────────────────❖`;

    const buttons = links.map(x => ({
      buttonId: `.getvideo ${x.url}`,
      buttonText: { displayText: `🎞️ Download ${x.quality}` },
      type: 1
    }));

    const msg = {
      image: { url: thumb },
      caption,
      footer: "📥 AGNI YT DOWNLOADER\n> Powered by Shashika Dilshan 🍃",
      buttons,
      headerType: 4
    };

    await conn.sendMessage(from, msg, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply("❌ Error: " + err.message);
  }
});

cmd({
  pattern: "getvideo",
  dontAddCommandList: true
},
async (conn, mek, m, { from, args, q, reply }) => {
  try {
    const url = q.trim();
    if (!url) return reply("❌ Invalid video link.");

    await reply("📦 Downloading video... Please wait ⏳");
    await conn.sendMessage(from, {
      video: { url },
      caption: "✅ *Here is your YouTube video!*",
    }, { quoted: mek });

  } catch (e) {
    console.error(e);
    reply("❌ Failed to send video. Try again later.");
  }
});

cmd({
  pattern: "fb2",
  alias: ["facebook", "fbdown"],
  desc: "Download Facebook videos (HD/SD)",
  category: "download",
  react: "📘",
  filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
  try {
    if (!q) return reply("📘 *Usage:* `.fb2 <Facebook URL>`");

    const url = q.trim();
    if (!/^https?:\/\//i.test(url)) return reply("❌ Invalid Facebook URL!");

    const apiUrl = `https://apiskeith.vercel.app/download/fbdown?url=${encodeURIComponent(url)}`;
    await reply("🔎 Fetching Facebook video info...");

    const { data } = await axios.get(apiUrl);
    if (!data || !data.links) return reply("❌ No download data found!");

    const title = data.title || "Facebook Video";
    const thumb = data.thumbnail || null;

    const links = [
      { quality: "SD", url: data.links.sd },
      { quality: "HD", url: data.links.hd },
    ].filter(x => x.url);

    if (!links.length) return reply("⚠️ No downloadable links found!");

    const caption = `
╭─❖━「 *📘 FACEBOOK VIDEO* 」━❖
│ 🎬 Title: ${title}
│ 🪶 Quality: Choose below
╰───────────────────❖`;

    const buttons = links.map(x => ({
      buttonId: `.getvideo ${x.url}`,
      buttonText: { displayText: `🎞️ Download ${x.quality}` },
      type: 1
    }));

    const msg = {
      image: { url: thumb },
      caption,
      footer: "📥 AGNI FB DOWNLOADER\n> Powered by Shashika Dilshan 🍃",
      buttons,
      headerType: 4
    };

    await conn.sendMessage(from, msg, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply("❌ Error: " + err.message);
  }
});   
