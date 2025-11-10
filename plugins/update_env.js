const { updateEnv } = require('../lib/database');
const EnvVar = require('../lib/mongodbenv');
const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "update",
    alias: ["updateenv"],
    category: "owner",
    react: "🔄",
    desc: "Update environment variables from WhatsApp",
    filename: __filename
},
async (conn, mek, m, { reply, q, isOwner }) => {

    if (!isOwner) return reply("⚠️ *Owner Only Command!*");

    if (!q) return reply("📝 Usage: `.update KEY: VALUE`");

    const parts = q.split(":");
    if (parts.length < 2) return reply("❌ *Correct Format:* `.update MODE: public`");

    const key = parts[0].trim().toUpperCase();
    const newValue = parts.slice(1).join(":").trim();

    const exists = await EnvVar.findOne({ key });
    if (!exists) return reply(`❌ Variable *${key}* not found in database.`);

    await updateEnv(key, newValue); // DB Update ✅
    config[key] = newValue; // Runtime Update ✅

    reply(`✅ *Successfully Updated!*\n\n*${key}* → \`${newValue}\``);
});
