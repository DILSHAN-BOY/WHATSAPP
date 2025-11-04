const { cmd } = require("../command");
const fetch = require("node-fetch");
const yts = require("yt-search");

cmd({
  pattern: "yta",
  alias: ["ytmp3", "song", "audio"],
  react: "🎶",
  desc: "YouTube song search & download (via API)",
  category: "download",
  use: ".yta <song name or YouTube URL>",
  filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply("🎵 *Please provide a YouTube link or song name!*\n\nExample:\n.yta Alan Walker - Faded");

    let videoUrl;
    if (q.match(/(youtube\.com|youtu\.be)/)) {
      videoUrl = q;
    } else {
      const search = await yts(q);
      if (!search.videos.length) return reply("❌ No results found!");
      videoUrl = search.videos[0].url;
    }

    reply("⏳ *Downloading audio... please wait!*");

    // 🔹 API Endpoint (fast & reliable)
    const api = `https://apiskeith.vercel.app/download/yta2?url=${encodeURIComponent(videoUrl)}`;

    const res = await fetch(api);
    const data = await res.json();

    if (!data.result || !data.result.download_url)
      return reply("❌ Failed to fetch download link. Try again later.");

    const { title, download_url, thumbnail } = data.result;

    // 📤 Send thumbnail & caption
    await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption: `🎶 *Title:* ${title}\n🔗 *URL:* ${videoUrl}\n\n🎧 *Uploading MP3...*`
    }, { quoted: mek });

    // 📥 Download and send audio
    const audioRes = await fetch(download_url);
    const buffer = await audioRes.arrayBuffer();

    await conn.sendMessage(from, {
      audio: Buffer.from(buffer),
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`,
      caption: `🎵 *${title}*\n\n✅ Successfully downloaded via API`
    }, { quoted: mek });

  } catch (e) {
    console.error("YTA Plugin Error:", e);
    reply(`❌ *Error:* ${e.message}`);
  }
});
