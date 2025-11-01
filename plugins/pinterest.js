const { cmd } = require('../command');
const axios = require('axios');
const { getOwners } = require('../lib/database');

cmd({
    pattern: "pinterest",
    alias: ["pin"],
    desc: "Download Pinterest image via API (link or search term) - owner only",
    category: "tools",
    react: "📌",
    filename: __filename
}, 
async (conn, mek, m, { from, q, reply, react, sender }) => {
    try {
        if (!q) return reply("⚠️ Provide a Pinterest link or search keyword.\nExample:\n.pinterest https://pin.it/1zdlg6EPT\n.pinterest nature");

        // 🔹 Fetch owners from MongoDB
        const owners = await getOwners();
        const ownerJIDs = owners.map(o => o.jid);

        if (!ownerJIDs.includes(sender)) 
            return reply("⚠️ Only bot owners can use this command.");

        await react("🔎");

        let apiURL;
        // 🔹 Check if input is link or keyword
        if (q.startsWith("http")) {
            apiURL = `https://apiskeith.vercel.app/download/pinterest?url=${encodeURIComponent(q)}`;
        } else {
            // Treat as search term
            apiURL = `https://apiskeith.vercel.app/download/pinterest?url=${encodeURIComponent("https://www.pinterest.com/search/pins/?q=" + q)}`;
        }

        const { data } = await axios.get(apiURL);

        if (!data || !data.url) return reply("⚠️ Failed to fetch Pinterest image.");

        // 🔹 Send image
        await conn.sendMessage(from, { image: { url: data.url }, caption: `📌 Pinterest result for: ${q}` });
        await react("✅");

    } catch (e) {
        console.error("Pinterest Plugin Error:", e);
        await react("⚠️");
        reply("⚠️ Failed to fetch Pinterest image.");
    }
});
