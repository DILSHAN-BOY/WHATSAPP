const { cmd } = require('../command');
const yts = require('yt-search');
const fetch = require('node-fetch');

cmd({
    pattern: "ytmp3",
    alias: ["mp3", "audio"],
    react: "🎵",
    desc: "YouTube ගීතයක් search & download කරන්න (Anyone use, no DB)",
    category: "download",
    use: ".song <ගීතයේ නම හෝ YouTube URL එක>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ කරුණාකර ගීතයේ නමක් හෝ YouTube URL එකක් දෙන්න!");

        let videoUrl, title;

        if (q.match(/(youtube\.com|youtu\.be)/)) {
            videoUrl = q;
            title = "YouTube Song";
        } else {
            const search = await yts(q);
            if (!search.videos.length) return reply("❌ කිසිදු result එකක් හමු නොවීය!");
            videoUrl = search.videos[0].url;
            title = search.videos[0].title;
        }

        await reply("⏳ ගීතය download කරමින්... කරුණාකර බලා සිටින්න.");

        const apiUrl = `https://apiskeith.vercel.app/download/dlmp3?url=${encodeURIComponent(videoUrl)}`;

        // Retry wrapper
        async function fetchWithRetry(url, retries = 3, delay = 3000) {
            for (let i = 0; i < retries; i++) {
                try {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
                    return res;
                } catch (err) {
                    if (i === retries - 1) throw err;
                    await new Promise(r => setTimeout(r, delay));
                }
            }
        }

        const response = await fetchWithRetry(apiUrl);
        const data = await response.json();

        if (!data.result || !data.result.download_url)
            return reply("❌ ගීතය download link එක ලබාගැනීමට අසාර්ථක විය!");

        const audioRes = await fetchWithRetry(data.result.download_url);
        const buffer = await audioRes.arrayBuffer();

        // File size check (~70MB limit)
        const sizeMB = buffer.byteLength / (1024 * 1024);
        if (sizeMB > 70)
            return reply("❌ ගීතය විශාලයි (>70MB). කෙටි clip එකක් උත්සාහ කරන්න.");

        await conn.sendMessage(from, {
            audio: Buffer.from(buffer),
            mimetype: 'audio/mpeg',
            fileName: `${title.replace(/[^\w\s]/gi, '').substring(0, 60)}.mp3`,
            caption: `🎶 *${title.substring(0, 60)}*`
        }, { quoted: mek });

        return reply(`✅ ගීතය යවනු ලැබුවා: *${title}*`);

    } catch (error) {
        console.error("Song Download Error:", error);
        return reply(`❌ Error: ${error.message}`);
    }
});
