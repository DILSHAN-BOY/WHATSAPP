const { cmd } = require('../command');
const { readEnv } = require('../lib/database');

cmd({
    pattern: "tagall",
    alias: ["everyone", "pingall"],
    desc: "Mention all group members (owner-only via MongoDB)",
    category: "group",
    react: "📣",
    filename: __filename
}, 
async (conn, mek, m, { from, q, reply, react, isGroup, sender }) => {
    try {
        // 🔹 Fetch owners from MongoDB
        const owners = await getOwners();
        const ownerJIDs = owners.map(o => o.jid);

        if (!ownerJIDs.includes(sender)) 
            return reply("⚠️ Only bot owners can use this command.");

        if (!isGroup) return reply("⚠️ This command is only for groups.");

        const text = q || "Hello everyone!"; // default message
        const groupMembers = m.isGroup ? m.participants.map(u => u.jid) : [];

        if (!groupMembers.length) return reply("⚠️ Couldn't fetch group members.");

        let msg = text + "\n\n";
        let mentions = [];

        groupMembers.forEach(member => {
            msg += `@${member.split("@")[0]} `;
            mentions.push(member);
        });

        await conn.sendMessage(from, { text: msg, mentions });
        await react("✅");

    } catch (e) {
        console.error("TagAll Plugin Error:", e);
        await react("⚠️");
        reply("⚠️ Failed to mention all members.");
    }
});
