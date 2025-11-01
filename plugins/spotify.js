const { cmd } = require('../command');
const axios = require('axios');
const { readEnv } = require('../lib/database');

cmd({
    pattern: "spotify",
    alias: ["sp"],
    desc: "Search & download Spotify track/album (any user, API from DB)",
    category: "tools",
    react: "🎵",
    filename: __filename
}, 
async (conn, mek, m, { from, q, reply, react }) => {
    try {
        if (!q) return reply("⚠️ Provide track/album name or Spotify link.\nExample:\n.spotify Spectre\n.spotify https://open.spotify.com/track/4Nwrh5BlZ8I31znYQULS7G");

        await react("🔎");

        // 🔹 Fetch APIs from DB
        const config = await getBotConfig("spotify_api");
        if (!config) return reply("⚠️ Spotify API not configured in DB.");

        let apiURL;

        if (q.startsWith("http")) {
            if (q.includes("/track/")) {
                apiURL = config.trackApi + encodeURIComponent(q);
            } else if (q.includes("/album/")) {
                apiURL = config.albumApi + encodeURIComponent(q);
            }
        } else {
            apiURL = config.searchApi + encodeURIComponent(q);
        }

        const { data } = await axios.get(apiURL);

        // 🔹 Single track
        if (data.track && data.track.downloadLink) {
            await conn.sendMessage(from, { 
                image: { url: data.track.thumbnail },
                caption: `🎵 ${data.track.title}\nArtist: ${data.track.artist}\nDuration: ${data.track.duration}\nDownload: ${data.track.downloadLink}`
            });
        }
        // 🔹 Album
        else if (data.tracks && Array.isArray(data.tracks)) {
            let msg = `🎵 Album: ${data.name}\nBy: ${data.creator}\nTotal Tracks: ${data.total_tracks}\n\n`;
            data.tracks.slice(0, 10).forEach((t, i) => {
                msg += `${i+1}. ${t.name} → ${t.url}\n`;
            });
            msg += `\nFull Album: ${data.spotify_url}`;
            await conn.sendMessage(from, { text: msg });
        } 
        else {
            return reply("⚠️ Couldn't fetch Spotify data.");
        }

        await react("✅");

    } catch (e) {
        console.error("Spotify Plugin Error:", e);
        await react("⚠️");
        reply("⚠️ Failed to fetch Spotify track/album.");
    }
});
