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
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ කරුණාකර ගීතයේ නමක් හෝ YouTube URL එකක් දෙන්න!");

        let videoUrl, title;

        if (q.match(/(youtube\.com|youtu\.be)/)) {
            videoUrl = q;
            title = "YouTube Song";
        } else {
            const search = await yts(q);
            if (!search.videos.length) return await reply("❌ කිසිදු result එකක් හමු නොවීය!");
            videoUrl = search.videos[0].url;
            title = search.videos[0].title;
        }

        await reply("⏳ ගීතය download කරමින්... කරුණාකර බලා සිටින්න.");

        // ─── Inline API URL ──────────────────────────────
        const apiUrl = `https://apiskeith.vercel.app/download/mp3?url=${encodeURIComponent(videoUrl)}`;

        async function fetchWithRetry(url, retries = 3, delay = 3000) {
            for (let i = 0; i < retries; i++) {
                try {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
                    return res;
                } catch (e) {
                    if (i === retries - 1) throw e;
                    await new Promise(r => setTimeout(r, delay));
                }
            }
        }

        const response = await fetchWithRetry(apiUrl);
        const data = await response.json();

        if (!data.result || !data.result.download_url)
            return await reply("❌ ගීතය download link එක ලබාගැනීමට අසාර්ථක විය!");

        const songResp = await fetchWithRetry(data.result.download_url);
        const buffer = await songResp.arrayBuffer();

        // File size check (~60MB)
        const sizeMB = buffer.byteLength / (1024 * 1024);
        if (sizeMB > 700) return await reply("❌ ගීතය විශාලයි (>70MB). කෙටි clip එකක් උත්සාහ කරන්න.");

        await conn.sendMessage(from, {
            audio: Buffer.from(buffer),
            mimetype: 'audio/mpeg',
            fileName: `${title.substring(0, 60)}.mp3`,
            caption: `🎵 *${title.substring(0, 60)}*`
        }, { quoted: mek });

        await reply(`✅ ගීතය යවනු ලැබුනා: ${title}`);

    } catch (error) {
        console.error("Song Download Error:", error);
        await reply(`❌ Error: ${error.message}`);
    }
});
