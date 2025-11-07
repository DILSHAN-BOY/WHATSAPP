const config = require('../config');
const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const fetch = require('node-fetch'); // ✅ REQUIRED FIX

// API Settings
const API_BASE_URL = "https://sadiya-tech-apis.vercel.app/download/ytdl";
const API_KEY = "dinesh-api-key";

// =================================================================
// 🎥 YTMP4 - YouTube Video Downloader
// =================================================================
cmd({
    pattern: "ytmp4",
    alias: ["video", "ytv"],
    react: "🎥",
    desc: "Download YouTube video",
    category: "main",
    use: ".ytmp4 <url or name>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("*Please provide a YouTube link or video name!*");

        const yt = await ytsearch(q);
        if (!yt.results[0]) return reply("No results found!");

        const yts = yt.results[0];
        const apiUrl = `${API_BASE_URL}?url=${encodeURIComponent(yts.url)}&format=mp4&apikey=${API_KEY}`;

        const res = await fetch(apiUrl);
        const json = await res.json();

        if (!json.status) return reply(`API Error: ${json.err || "unknown"}`);

        const download = json.result.download;
        if (!download) return reply("Failed to get download link!");

        const caption = `╔═══〔 *QUEEN-SADU𓆪* 〕═══❒
║ *TITLE:* ${yts.title}
║ *DURATION:* ${yts.timestamp}
║ *VIEWS:* ${yts.views}
║ *AUTHOR:* ${yts.author.name}
║ *LINK:* ${yts.url}
╚══════════════════❒
*Powered by ©SHASHIKA DILSHAN*`;

        await conn.sendMessage(from, { image: { url: yts.thumbnail }, caption }, { quoted: mek });

        await conn.sendMessage(from, {
            video: { url: download },
            mimetype: "video/mp4",
            caption: `*${yts.title}*\n> *© Powered by SHASHIKA*`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Error: Something went wrong.");
    }
});

// =================================================================
// 🎶 YTMP3 - YouTube Audio Downloader
// =================================================================
cmd({
    pattern: "ytmp3",
    alias: ["yta", "play", "song"],
    react: "🎶",
    desc: "Download YouTube Song / Audio",
    category: "main",
    use: ".ytmp3 <url or name>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("*Please provide a YouTube link or song name!*");

        const yt = await ytsearch(q);
        if (!yt.results[0]) return reply("No results found!");

        const yts = yt.results[0];
        const apiUrl = `${API_BASE_URL}?url=${encodeURIComponent(yts.url)}&format=mp3&apikey=${API_KEY}`;

        const res = await fetch(apiUrl);
        const json = await res.json();

        if (!json.status) return reply(`API Error: ${json.err || "unknown"}`);

        const download = json.result.download;
        if (!download) return reply("Failed to get audio link!");

        const caption = `╔═══〔 *QUEEN-SADU𓆪* 〕═══❒
║ *TITLE:* ${yts.title}
║ *DURATION:* ${yts.timestamp}
║ *VIEWS:* ${yts.views}
║ *AUTHOR:* ${yts.author.name}
║ *LINK:* ${yts.url}
╚══════════════════❒
*Powered by ©SHASHIKA DILSHAN*`;

        await conn.sendMessage(from, { image: { url: yts.thumbnail }, caption }, { quoted: mek });

        await conn.sendMessage(from, {
            audio: { url: download },
            mimetype: "audio/mpeg"
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Error: Something went wrong.");
    }
});
